package com.bhumishield.ar.ar

import android.content.Context
import android.opengl.Matrix
import android.os.Handler
import android.os.Looper
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.util.AppLogger
import com.bhumishield.ar.verification.VerificationManager
import com.google.ar.core.Anchor
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.Frame
import com.google.ar.core.HitResult
import com.google.ar.core.Plane
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import com.google.ar.core.exceptions.UnavailableException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlin.math.sqrt

/**
 * Concrete ARCore Engine Manager implementing ArEngineManager interface.
 * Manages Google ARCore Session lifecycle, plane finding modes, real-time tracking feedback,
 * screen-tap hit testing, spatial anchor creation/detachment, and geospatial parcel calibration.
 */
class ArCoreEngineManager : ArEngineManager {

    private val _state = MutableStateFlow(ArEngineState())
    override val state: StateFlow<ArEngineState> = _state.asStateFlow()

    private var session: Session? = null
    private var currentFrame: Frame? = null
    private val activeAnchors = mutableListOf<Anchor>()     // Phase 1 Test Pillars / AR Measurement Points
    private var calibrationAnchor: Anchor? = null   // Phase 2 Parcel Reference Calibration Anchor
    private var planeFindingMode = Config.PlaneFindingMode.HORIZONTAL

    // Latest camera matrices for screen projection
    private val latestViewMatrix = FloatArray(16)
    private val latestProjMatrix = FloatArray(16)

    // Main thread handler for UI state updates from OpenGL render thread
    private val mainHandler = Handler(Looper.getMainLooper())

    fun getSession(): Session? = session
    fun getActiveAnchors(): List<Anchor> = activeAnchors
    override fun getCalibrationAnchor(): Anchor? = calibrationAnchor

    override fun checkAvailability(context: Context) {
        val availability = ArCoreApk.getInstance().checkAvailability(context)
        AppLogger.i("ARCore availability check: $availability")

        if (availability.isTransient) {
            _state.update { it.copy(availability = ArAvailability.CHECKING) }
            mainHandler.postDelayed({ checkAvailability(context) }, 200)
            return
        }

        if (availability.isSupported) {
            _state.update { it.copy(availability = ArAvailability.SUPPORTED) }
        } else {
            _state.update {
                it.copy(
                    availability = ArAvailability.UNSUPPORTED,
                    errorMessage = "This device does not support Google ARCore hardware tracking."
                )
            }
        }
    }

    override fun onResume(context: Context) {
        if (_state.value.availability == ArAvailability.UNSUPPORTED) return

        try {
            if (session == null) {
                checkAvailability(context)
                if (_state.value.availability == ArAvailability.UNSUPPORTED) return

                session = Session(context)
                val config = Config(session)
                config.planeFindingMode = planeFindingMode
                config.focusMode = Config.FocusMode.AUTO
                config.lightEstimationMode = Config.LightEstimationMode.DISABLED
                session?.configure(config)
                AppLogger.i("ARCore Session created and configured successfully")
            }

            session?.resume()
            _state.update {
                it.copy(
                    trackingStatus = TrackingStatus.TRACKING,
                    instructionText = if (activeAnchors.isNotEmpty() || calibrationAnchor != null)
                        "Tracking active" else "Move your phone slowly to detect a surface.",
                    errorMessage = null
                )
            }
            AppLogger.i("ARCore Session resumed")
        } catch (e: UnavailableException) {
            AppLogger.e(e, "ARCore Session resume failed: ${e.message}")
            _state.update {
                it.copy(
                    availability = ArAvailability.UNSUPPORTED,
                    trackingStatus = TrackingStatus.STOPPED,
                    errorMessage = "ARCore unavailable: ${e.javaClass.simpleName}"
                )
            }
        } catch (e: Exception) {
            AppLogger.e(e, "Error resuming ARCore Session")
            _state.update {
                it.copy(
                    trackingStatus = TrackingStatus.STOPPED,
                    errorMessage = e.message ?: "Failed to start AR Session"
                )
            }
        }
    }

    override fun onPause() {
        try {
            session?.pause()
            _state.update {
                it.copy(
                    trackingStatus = TrackingStatus.PAUSED,
                    instructionText = "⚠ AR tracking paused. Move phone slowly to resume."
                )
            }
            AppLogger.i("ARCore Session paused")
        } catch (e: Exception) {
            AppLogger.e(e, "Error pausing ARCore session")
        }
    }

    override fun onDestroy() {
        try {
            clearAnchors()
            clearAlignment()
            session?.close()
            session = null
            currentFrame = null
            _state.update {
                it.copy(
                    trackingStatus = TrackingStatus.STOPPED,
                    instructionText = "AR Session Stopped"
                )
            }
            AppLogger.i("ARCore Session closed and resources released")
        } catch (e: Exception) {
            AppLogger.e(e, "Error destroying ARCore session")
        }
    }

    override fun clearAnchors() {
        activeAnchors.forEach { it.detach() }
        activeAnchors.clear()
        _state.update {
            it.copy(
                anchorsCount = if (calibrationAnchor != null) 1 else 0,
                instructionText = "Move your phone slowly to detect a surface."
            )
        }
        AppLogger.i("Active ARCore test pillar anchor cleared")
    }

    override fun setPlaneFindingMode(mode: PlaneFindingModeOption) {
        planeFindingMode = when (mode) {
            PlaneFindingModeOption.HORIZONTAL -> Config.PlaneFindingMode.HORIZONTAL
            PlaneFindingModeOption.VERTICAL -> Config.PlaneFindingMode.VERTICAL
            PlaneFindingModeOption.HORIZONTAL_AND_VERTICAL -> Config.PlaneFindingMode.HORIZONTAL_AND_VERTICAL
            PlaneFindingModeOption.DISABLED -> Config.PlaneFindingMode.DISABLED
        }
        session?.let { s ->
            val config = s.config
            config.planeFindingMode = planeFindingMode
            s.configure(config)
            AppLogger.i("Plane finding mode set to: $mode")
        }
    }

    override fun selectParcel(parcel: Parcel) {
        _state.update {
            it.copy(selectedParcel = parcel)
        }
        AppLogger.i("Parcel selected: ${parcel.parcelId}")
    }

    override fun startReferenceCalibration() {
        if (_state.value.trackingStatus != TrackingStatus.TRACKING) {
            _state.update {
                it.copy(errorMessage = "⚠ AR tracking is paused. Move the phone to resume tracking.")
            }
            return
        }

        if (_state.value.detectedPlanesCount == 0) {
            _state.update {
                it.copy(instructionText = "Move the phone slowly across the floor to detect a surface before calibrating.")
            }
            return
        }

        _state.update {
            it.copy(
                alignmentStatus = AlignmentStatus.CALIBRATING_REFERENCE,
                instructionText = "CALIBRATING... Tap the physical reference point on the detected plane surface.",
                errorMessage = null
            )
        }
        AppLogger.i("AR reference calibration started")
    }

    override fun calibrateOrientation(headingOffsetDegrees: Float) {
        if (_state.value.alignmentStatus == AlignmentStatus.NOT_CALIBRATED || calibrationAnchor == null) {
            _state.update {
                it.copy(errorMessage = "Please calibrate the AR reference point first.")
            }
            return
        }

        _state.update {
            it.copy(
                headingOffsetDegrees = headingOffsetDegrees,
                alignmentStatus = AlignmentStatus.READY,
                isBoundaryReady = true,
                instructionText = "✓ Boundary calibrated and ready in AR viewport.",
                errorMessage = null
            )
        }
        AppLogger.i("AR orientation calibrated with offset: $headingOffsetDegrees deg")
    }

    override fun clearAlignment() {
        calibrationAnchor?.detach()
        calibrationAnchor = null
        _state.update {
            it.copy(
                alignmentStatus = AlignmentStatus.NOT_CALIBRATED,
                headingOffsetDegrees = 0.0f,
                isBoundaryReady = false,
                anchorsCount = activeAnchors.size,
                instructionText = "Alignment cleared.",
                errorMessage = null
            )
        }
        AppLogger.i("AR alignment cleared")
    }

    fun handleTapForVerification(
        xPixels: Float,
        yPixels: Float,
        width: Int,
        height: Int,
        verificationManager: VerificationManager
    ): Boolean {
        val currentState = _state.value
        val parcel = currentState.selectedParcel ?: return false
        val anchor = calibrationAnchor ?: return false

        val arWorldVertices = GeoToArTransformer.transformParcelToArWorld(
            parcel = parcel,
            referenceAnchor = anchor,
            headingOffsetDegrees = currentState.headingOffsetDegrees
        )
        if (arWorldVertices.isEmpty()) return false

        val points = verificationManager.state.value.points
        if (points.isEmpty()) return false

        val vpMatrix = FloatArray(16)
        Matrix.multiplyMM(vpMatrix, 0, latestProjMatrix, 0, latestViewMatrix, 0)

        var nearestPointId: String? = null
        var minDistancePx = Float.MAX_VALUE

        val numVertices = arWorldVertices.size / 3
        for (i in 0 until numVertices) {
            val vx = arWorldVertices[i * 3]
            val vy = arWorldVertices[i * 3 + 1]
            val vz = arWorldVertices[i * 3 + 2]

            val worldVec = floatArrayOf(vx, vy, vz, 1.0f)
            val clipVec = FloatArray(4)
            Matrix.multiplyMV(clipVec, 0, vpMatrix, 0, worldVec, 0)

            if (clipVec[3] > 0.0f) { // Point is in front of camera
                val ndcX = clipVec[0] / clipVec[3]
                val ndcY = clipVec[1] / clipVec[3]

                val screenX = (ndcX + 1.0f) / 2.0f * width
                val screenY = (1.0f - ndcY) / 2.0f * height

                val dx = screenX - xPixels
                val dy = screenY - yPixels
                val dist = sqrt(dx * dx + dy * dy)

                if (dist < minDistancePx) {
                    minDistancePx = dist
                    if (i < points.size) {
                        nearestPointId = points[i].id
                    }
                }
            }
        }

        // Tap selection threshold: 140 screen pixels
        if (nearestPointId != null && minDistancePx < 140.0f) {
            verificationManager.selectPoint(nearestPointId)
            AppLogger.i("Selected boundary vertex $nearestPointId via AR screen tap (dist $minDistancePx px)")
            return true
        }

        return false
    }

    override fun handleTap(xPixels: Float, yPixels: Float, width: Int, height: Int) {
        val frame = currentFrame ?: return
        val currentTracking = frame.camera.trackingState

        if (currentTracking != TrackingState.TRACKING) {
            AppLogger.w("Tap ignored: ARCore camera is not currently TRACKING")
            return
        }

        try {
            val hits = frame.hitTest(xPixels, yPixels)
            var validHit: HitResult? = null

            for (hit in hits) {
                val trackable = hit.trackable
                if (trackable is Plane && trackable.isPoseInPolygon(hit.hitPose)) {
                    if (planeFindingMode == Config.PlaneFindingMode.HORIZONTAL &&
                        trackable.type == Plane.Type.HORIZONTAL_UPWARD_FACING
                    ) {
                        validHit = hit
                        break
                    } else if (planeFindingMode == Config.PlaneFindingMode.HORIZONTAL_AND_VERTICAL) {
                        validHit = hit
                        break
                    }
                }
            }

            if (validHit != null) {
                val newAnchor = validHit.createAnchor()

                if (_state.value.alignmentStatus == AlignmentStatus.CALIBRATING_REFERENCE) {
                    calibrationAnchor?.detach()
                    calibrationAnchor = newAnchor
                    AppLogger.i("Reference Calibration Anchor created at pose: ${newAnchor.pose}")

                    mainHandler.post {
                        _state.update {
                            it.copy(
                                alignmentStatus = AlignmentStatus.REFERENCE_CALIBRATED,
                                anchorsCount = activeAnchors.size + 1,
                                instructionText = "✓ REFERENCE CALIBRATED. Next: Calibrate Orientation.",
                                errorMessage = null
                            )
                        }
                    }
                } else {
                    if (activeAnchors.size >= 4) {
                        // Clear the oldest or all to start a new polygon. We'll clear all for a fresh start.
                        activeAnchors.forEach { it.detach() }
                        activeAnchors.clear()
                    }
                    activeAnchors.add(newAnchor)
                    AppLogger.i("New ARCore Test Pillar Anchor created at pose: ${newAnchor.pose}")

                    mainHandler.post {
                        _state.update {
                            it.copy(
                                anchorsCount = (if (calibrationAnchor != null) 1 else 0) + activeAnchors.size,
                                instructionText = "Marker placed (${activeAnchors.size}/4)"
                            )
                        }
                    }
                }
            } else {
                AppLogger.d("Tap performed but no valid plane surface was hit")
            }
        } catch (e: Exception) {
            AppLogger.e(e, "Error performing ARCore hit test")
        }
    }

    fun onFrameUpdate(frame: Frame, session: Session) {
        currentFrame = frame

        val cameraTracking = frame.camera.trackingState
        val trackingStatus = when (cameraTracking) {
            TrackingState.TRACKING -> TrackingStatus.TRACKING
            TrackingState.PAUSED -> TrackingStatus.PAUSED
            TrackingState.STOPPED -> TrackingStatus.STOPPED
        }

        if (cameraTracking == TrackingState.TRACKING) {
            frame.camera.getViewMatrix(latestViewMatrix, 0)
            frame.camera.getProjectionMatrix(latestProjMatrix, 0, 0.1f, 100.0f)
        }

        val allPlanes = session.getAllTrackables(Plane::class.java)
        val activePlanes = allPlanes.filter { it.trackingState == TrackingState.TRACKING && it.subsumedBy == null }
        val planeCount = activePlanes.size

        var totalAnchors = 0
        totalAnchors += activeAnchors.count { it.trackingState == TrackingState.TRACKING }
        if (calibrationAnchor?.trackingState == TrackingState.TRACKING) totalAnchors++

        val currentState = _state.value
        val instruction = when {
            trackingStatus == TrackingStatus.PAUSED -> "⚠ AR tracking paused. Move phone slowly to resume."
            currentState.alignmentStatus == AlignmentStatus.CALIBRATING_REFERENCE -> "CALIBRATING... Tap physical reference point on detected surface."
            currentState.alignmentStatus == AlignmentStatus.READY -> "✓ Boundary calibrated and ready in AR viewport."
            currentState.alignmentStatus == AlignmentStatus.REFERENCE_CALIBRATED -> "✓ REFERENCE CALIBRATED. Tap Calibrate Orientation."
            activeAnchors.isNotEmpty() -> {
                "Marker placed (${activeAnchors.size}/4). Total Perimeter: %.1fm".format(_state.value.totalPerimeter)
            }
            calibrationAnchor?.trackingState == TrackingState.TRACKING -> "Reference marker placed"
            planeCount > 0 -> "Surface detected — tap to place marker."
            else -> "Move your phone slowly to detect a surface."
        }

        val distances = mutableListOf<Float>()
        var perimeter = 0f
        
        // Only consider tracking anchors
        val validAnchors = activeAnchors.filter { it.trackingState == TrackingState.TRACKING }
        if (validAnchors.size > 1) {
            for (i in 0 until validAnchors.size - 1) {
                val pose1 = validAnchors[i].pose
                val pose2 = validAnchors[i+1].pose
                val dx = pose1.tx() - pose2.tx()
                val dy = pose1.ty() - pose2.ty()
                val dz = pose1.tz() - pose2.tz()
                val dist = kotlin.math.sqrt(dx * dx + dy * dy + dz * dz)
                distances.add(dist)
                perimeter += dist
            }
            // If 4 anchors are placed, close the polygon loop
            if (validAnchors.size == 4) {
                val pose1 = validAnchors[3].pose
                val pose2 = validAnchors[0].pose
                val dx = pose1.tx() - pose2.tx()
                val dy = pose1.ty() - pose2.ty()
                val dz = pose1.tz() - pose2.tz()
                val dist = kotlin.math.sqrt(dx * dx + dy * dy + dz * dz)
                distances.add(dist)
                perimeter += dist
            }
        }

        totalAnchors += validAnchors.size

        mainHandler.post {
            _state.update {
                it.copy(
                    trackingStatus = trackingStatus,
                    detectedPlanesCount = planeCount,
                    anchorsCount = totalAnchors,
                    instructionText = instruction,
                    polygonDistances = distances,
                    totalPerimeter = perimeter
                )
            }
        }
    }
}
