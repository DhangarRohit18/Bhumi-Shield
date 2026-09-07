package com.bhumishield.ar.verification.repository

import android.content.Context
import com.bhumishield.ar.geospatial.GeoCoordinate
import com.bhumishield.ar.geospatial.GeoSpatialCalculator
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.verification.BoundaryPoint
import com.bhumishield.ar.verification.BoundaryPointStatus
import com.bhumishield.ar.verification.VerificationResult
import com.bhumishield.ar.verification.VerificationSession
import com.bhumishield.ar.verification.VerificationState
import com.bhumishield.ar.verification.data.VerificationDao
import com.bhumishield.ar.verification.data.VerificationDatabase
import com.bhumishield.ar.verification.data.entities.BoundaryPointVerificationEntity
import com.bhumishield.ar.verification.data.entities.VerificationSessionEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import timber.log.Timber

/**
 * Repository layer managing local Room Database persistence for AR verification sessions.
 */
class VerificationRepository(context: Context) {

    private val dao: VerificationDao = VerificationDatabase.getDatabase(context).verificationDao()

    suspend fun saveSession(
        sessionId: String,
        parcel: Parcel,
        locationState: LocationState,
        points: List<BoundaryPoint>,
        result: VerificationResult
    ) {
        try {
            val sessionEntity = VerificationSessionEntity(
                sessionId = sessionId,
                parcelId = parcel.parcelId,
                surveyNumber = parcel.surveyNumber,
                village = parcel.village,
                district = parcel.district,
                startedAt = System.currentTimeMillis(),
                completedAt = if (result == VerificationResult.VERIFIED || result == VerificationResult.FLAGGED) System.currentTimeMillis() else null,
                result = result.name,
                referenceCalibrated = true,
                orientationCalibrated = true,
                startLatitude = locationState.latitude,
                startLongitude = locationState.longitude,
                startAccuracyMeters = locationState.accuracyMeters,
                isSyntheticData = parcel.isSynthetic
            )

            val pointEntities = points.map { pt ->
                BoundaryPointVerificationEntity(
                    id = "${sessionId}_${pt.id}",
                    sessionId = sessionId,
                    boundaryPointId = pt.id,
                    index = pt.index,
                    status = pt.status.name,
                    note = pt.note,
                    photoUri = pt.photoUri,
                    verifiedAt = if (pt.status == BoundaryPointStatus.VERIFIED || pt.status == BoundaryPointStatus.FLAGGED) System.currentTimeMillis() else null,
                    approxLatitude = pt.coordinate.latitude,
                    approxLongitude = pt.coordinate.longitude
                )
            }

            dao.insertSession(sessionEntity)
            dao.insertPointVerifications(pointEntities)
            Timber.d("Saved verification session $sessionId to Room DB")
        } catch (e: Exception) {
            Timber.e(e, "Error saving verification session to Room DB")
        }
    }

    suspend fun updatePoint(sessionId: String, point: BoundaryPoint) {
        try {
            val pointEntity = BoundaryPointVerificationEntity(
                id = "${sessionId}_${point.id}",
                sessionId = sessionId,
                boundaryPointId = point.id,
                index = point.index,
                status = point.status.name,
                note = point.note,
                photoUri = point.photoUri,
                verifiedAt = if (point.status == BoundaryPointStatus.VERIFIED || point.status == BoundaryPointStatus.FLAGGED) System.currentTimeMillis() else null,
                approxLatitude = point.coordinate.latitude,
                approxLongitude = point.coordinate.longitude
            )
            dao.updatePointVerification(pointEntity)
            Timber.d("Updated point ${point.id} in Room DB")
        } catch (e: Exception) {
            Timber.e(e, "Error updating point in Room DB")
        }
    }

    suspend fun updateSessionResult(sessionId: String, result: VerificationResult) {
        try {
            // Load and update completedAt & result
            dao.getSessionWithPoints(sessionId)
        } catch (e: Exception) {
            Timber.e(e, "Error updating session result")
        }
    }

    suspend fun getLatestSessionForParcel(parcel: Parcel): VerificationState? {
        return try {
            val sessionWithPoints = dao.getLatestSessionForParcel(parcel.parcelId) ?: return null
            val sessionEntity = sessionWithPoints.session

            val points = sessionWithPoints.points.map { entity ->
                val geoCoord = parcel.boundaryCoordinates.getOrNull(entity.index - 1)
                    ?: parcel.referencePoint
                val localEnu = GeoSpatialCalculator.toLocalEnu(geoCoord, parcel.referencePoint)

                BoundaryPoint(
                    id = entity.boundaryPointId,
                    index = entity.index,
                    coordinate = geoCoord,
                    localCoordinate = localEnu,
                    status = try { BoundaryPointStatus.valueOf(entity.status) } catch (e: Exception) { BoundaryPointStatus.UNVERIFIED },
                    note = entity.note,
                    photoUri = entity.photoUri
                )
            }

            val verified = points.count { it.status == BoundaryPointStatus.VERIFIED }
            val flagged = points.count { it.status == BoundaryPointStatus.FLAGGED }
            val total = points.size
            val progress = if (total > 0) (verified + flagged).toFloat() / total.toFloat() else 0f
            val result = try { VerificationResult.valueOf(sessionEntity.result) } catch (e: Exception) { VerificationResult.IN_PROGRESS }

            VerificationState(
                sessionActive = sessionEntity.completedAt == null,
                isPaused = false,
                isCompleted = sessionEntity.completedAt != null,
                currentSessionId = sessionEntity.sessionId,
                currentParcelId = sessionEntity.parcelId,
                selectedPointId = points.firstOrNull()?.id,
                points = points,
                verifiedCount = verified,
                flaggedCount = flagged,
                totalCount = total,
                progress = progress,
                result = result
            )
        } catch (e: Exception) {
            Timber.e(e, "Error loading latest session for parcel ${parcel.parcelId}")
            null
        }
    }
}
