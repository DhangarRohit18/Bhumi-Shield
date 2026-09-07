package com.bhumishield.ar.verification

import com.bhumishield.ar.geospatial.GeoSpatialCalculator
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.verification.repository.VerificationRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.UUID

data class VerificationState(
    val sessionActive: Boolean = false,
    val isPaused: Boolean = false,
    val isCompleted: Boolean = false,
    val currentSessionId: String? = null,
    val currentParcelId: String? = null,
    val selectedPointId: String? = null,
    val points: List<BoundaryPoint> = emptyList(),
    val verifiedCount: Int = 0,
    val flaggedCount: Int = 0,
    val totalCount: Int = 0,
    val progress: Float = 0f,
    val result: VerificationResult = VerificationResult.NOT_STARTED
) {
    val selectedPoint: BoundaryPoint?
        get() = points.firstOrNull { it.id == selectedPointId }

    val remainingCount: Int
        get() = (totalCount - verifiedCount - flaggedCount).coerceAtLeast(0)
}

/**
 * Manager for real-time AR field verification sessions with asynchronous Room DB persistence.
 */
class VerificationManager {

    private val _state = MutableStateFlow(VerificationState())
    val state: StateFlow<VerificationState> = _state.asStateFlow()

    private var repository: VerificationRepository? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    fun setRepository(repo: VerificationRepository) {
        this.repository = repo
    }

    fun startVerificationSession(parcel: Parcel, locationState: LocationState = LocationState()) {
        val currentState = _state.value

        // Prevent duplicate session creation if session is already active for this parcel
        if (currentState.sessionActive && currentState.currentParcelId == parcel.parcelId) {
            Timber.d("Verification session already active for parcel ${parcel.parcelId}")
            return
        }

        val rawCoords = parcel.boundaryCoordinates
        val vertices = if (rawCoords.size > 1 && rawCoords.first() == rawCoords.last()) {
            rawCoords.dropLast(1)
        } else {
            rawCoords
        }

        val boundaryPoints = vertices.mapIndexed { index, geoCoord ->
            val localEnu = GeoSpatialCalculator.toLocalEnu(geoCoord, parcel.referencePoint)
            BoundaryPoint(
                id = "B-%02d".format(index + 1),
                index = index + 1,
                coordinate = geoCoord,
                localCoordinate = localEnu,
                status = BoundaryPointStatus.UNVERIFIED
            )
        }

        val firstPointId = boundaryPoints.firstOrNull()?.id
        val updatedPoints = boundaryPoints.map { pt ->
            if (pt.id == firstPointId) pt.copy(status = BoundaryPointStatus.INSPECTING) else pt
        }

        val newSessionId = UUID.randomUUID().toString()

        val newState = VerificationState(
            sessionActive = true,
            isPaused = false,
            isCompleted = false,
            currentSessionId = newSessionId,
            currentParcelId = parcel.parcelId,
            selectedPointId = firstPointId,
            points = updatedPoints,
            verifiedCount = 0,
            flaggedCount = 0,
            totalCount = updatedPoints.size,
            progress = 0.0f,
            result = VerificationResult.IN_PROGRESS
        )

        _state.value = newState

        // Persist session to Room DB asynchronously
        scope.launch {
            repository?.saveSession(
                sessionId = newSessionId,
                parcel = parcel,
                locationState = locationState,
                points = updatedPoints,
                result = VerificationResult.IN_PROGRESS
            )
        }
        Timber.d("Started and persisted new verification session $newSessionId for parcel ${parcel.parcelId}")
    }

    fun resumeSession(parcel: Parcel) {
        scope.launch {
            val savedState = repository?.getLatestSessionForParcel(parcel)
            if (savedState != null) {
                _state.value = savedState
                Timber.d("Resumed existing session ${savedState.currentSessionId} for parcel ${parcel.parcelId}")
            } else {
                startVerificationSession(parcel)
            }
        }
    }

    fun pauseVerificationSession() {
        if (!_state.value.sessionActive) return
        _state.update { it.copy(isPaused = !it.isPaused) }
    }

    fun resetVerificationSession() {
        val currentState = _state.value
        val currentPoints = currentState.points
        if (currentPoints.isEmpty()) return

        val resetPoints = currentPoints.mapIndexed { idx, pt ->
            pt.copy(
                status = if (idx == 0) BoundaryPointStatus.INSPECTING else BoundaryPointStatus.UNVERIFIED,
                note = null,
                photoUri = null
            )
        }

        val updatedState = currentState.copy(
            isPaused = false,
            isCompleted = false,
            selectedPointId = resetPoints.firstOrNull()?.id,
            points = resetPoints,
            verifiedCount = 0,
            flaggedCount = 0,
            progress = 0.0f,
            result = VerificationResult.IN_PROGRESS
        )

        _state.value = updatedState

        val sessionId = currentState.currentSessionId
        if (sessionId != null) {
            scope.launch {
                resetPoints.forEach { pt -> repository?.updatePoint(sessionId, pt) }
            }
        }
        Timber.d("Verification session reset")
    }

    fun completeVerificationSession() {
        val currentState = _state.value
        if (!currentState.sessionActive && !currentState.isCompleted) return

        val finalResult = evaluateOverallResult(currentState.points)

        _state.update {
            it.copy(
                sessionActive = false,
                isCompleted = true,
                result = finalResult
            )
        }

        val sessionId = currentState.currentSessionId
        if (sessionId != null) {
            scope.launch {
                repository?.updateSessionResult(sessionId, finalResult)
            }
        }
        Timber.d("Verification session completed with result: $finalResult")
    }

    fun stopSession() {
        _state.value = VerificationState()
        Timber.d("Verification session stopped")
    }

    fun selectPoint(pointId: String) {
        val currentState = _state.value
        if (!currentState.sessionActive) return

        val updatedPoints = currentState.points.map { pt ->
            if (pt.id == pointId && pt.status == BoundaryPointStatus.UNVERIFIED) {
                pt.copy(status = BoundaryPointStatus.INSPECTING)
            } else if (pt.status == BoundaryPointStatus.INSPECTING && pt.id != pointId) {
                pt.copy(status = BoundaryPointStatus.UNVERIFIED)
            } else {
                pt
            }
        }

        _state.update {
            it.copy(
                selectedPointId = pointId,
                points = updatedPoints
            )
        }
    }

    fun markPointVerified(pointId: String) {
        updatePointStatus(pointId, BoundaryPointStatus.VERIFIED)
    }

    fun markPointFlagged(pointId: String) {
        updatePointStatus(pointId, BoundaryPointStatus.FLAGGED)
    }

    fun updatePointNote(pointId: String, note: String?) {
        val currentState = _state.value
        val updatedPoints = currentState.points.map { pt ->
            if (pt.id == pointId) pt.copy(note = note?.takeIf { it.isNotBlank() }) else pt
        }

        _state.update { it.copy(points = updatedPoints) }

        val sessionId = currentState.currentSessionId
        val targetPoint = updatedPoints.firstOrNull { it.id == pointId }
        if (sessionId != null && targetPoint != null) {
            scope.launch { repository?.updatePoint(sessionId, targetPoint) }
        }
    }

    fun attachPointPhoto(pointId: String, photoUri: String?) {
        val currentState = _state.value
        val updatedPoints = currentState.points.map { pt ->
            if (pt.id == pointId) pt.copy(photoUri = photoUri) else pt
        }

        _state.update { it.copy(points = updatedPoints) }

        val sessionId = currentState.currentSessionId
        val targetPoint = updatedPoints.firstOrNull { it.id == pointId }
        if (sessionId != null && targetPoint != null) {
            scope.launch { repository?.updatePoint(sessionId, targetPoint) }
        }
    }

    private fun updatePointStatus(pointId: String, newStatus: BoundaryPointStatus) {
        val currentState = _state.value

        val updatedPoints = currentState.points.map { pt ->
            if (pt.id == pointId) pt.copy(status = newStatus) else pt
        }

        val verified = updatedPoints.count { it.status == BoundaryPointStatus.VERIFIED }
        val flagged = updatedPoints.count { it.status == BoundaryPointStatus.FLAGGED }
        val total = updatedPoints.size
        val resolved = verified + flagged
        val progress = if (total > 0) resolved.toFloat() / total.toFloat() else 0.0f

        val evaluatedResult = evaluateOverallResult(updatedPoints)

        _state.update {
            it.copy(
                points = updatedPoints,
                verifiedCount = verified,
                flaggedCount = flagged,
                progress = progress,
                result = evaluatedResult
            )
        }

        val sessionId = currentState.currentSessionId
        val targetPoint = updatedPoints.firstOrNull { it.id == pointId }
        if (sessionId != null && targetPoint != null) {
            scope.launch { repository?.updatePoint(sessionId, targetPoint) }
        }
    }

    private fun evaluateOverallResult(points: List<BoundaryPoint>): VerificationResult {
        if (points.isEmpty()) return VerificationResult.NOT_STARTED

        val flagged = points.any { it.status == BoundaryPointStatus.FLAGGED }
        if (flagged) return VerificationResult.FLAGGED

        val allVerified = points.all { it.status == BoundaryPointStatus.VERIFIED }
        if (allVerified) return VerificationResult.VERIFIED

        val anyInspected = points.any { it.status == BoundaryPointStatus.VERIFIED || it.status == BoundaryPointStatus.INSPECTING || it.note != null || it.photoUri != null }
        return if (anyInspected) VerificationResult.IN_PROGRESS else VerificationResult.NOT_STARTED
    }
}
