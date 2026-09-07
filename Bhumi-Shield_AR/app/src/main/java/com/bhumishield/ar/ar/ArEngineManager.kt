package com.bhumishield.ar.ar

import android.content.Context
import com.bhumishield.ar.parcel.Parcel
import com.google.ar.core.Anchor
import kotlinx.coroutines.flow.StateFlow

enum class ArAvailability {
    CHECKING,
    SUPPORTED,
    UNSUPPORTED
}

enum class TrackingStatus {
    STOPPED,
    PAUSED,
    TRACKING
}

enum class PlaneFindingModeOption {
    HORIZONTAL,
    VERTICAL,
    HORIZONTAL_AND_VERTICAL,
    DISABLED
}

enum class AlignmentStatus {
    NOT_CALIBRATED,
    CALIBRATING_REFERENCE,
    REFERENCE_CALIBRATED,
    ORIENTATION_CALIBRATED,
    READY
}

data class ArEngineState(
    val availability: ArAvailability = ArAvailability.CHECKING,
    val trackingStatus: TrackingStatus = TrackingStatus.STOPPED,
    val detectedPlanesCount: Int = 0,
    val anchorsCount: Int = 0,
    val instructionText: String = "Initializing AR...",
    val errorMessage: String? = null,

    // Geospatial Calibration State
    val selectedParcel: Parcel? = null,
    val alignmentStatus: AlignmentStatus = AlignmentStatus.NOT_CALIBRATED,
    val headingOffsetDegrees: Float = 0.0f,
    val isBoundaryReady: Boolean = false
)

/**
 * Architectural abstraction for the AR Engine (Google ARCore).
 * Decouples ARCore session management, plane finding, spatial anchoring,
 * hit-testing, and geospatial parcel calibration from UI components.
 */
interface ArEngineManager {
    val state: StateFlow<ArEngineState>

    fun checkAvailability(context: Context)
    fun onResume(context: Context)
    fun onPause()
    fun onDestroy()
    fun handleTap(xPixels: Float, yPixels: Float, width: Int, height: Int)
    fun clearAnchors()
    fun setPlaneFindingMode(mode: PlaneFindingModeOption)

    // Geospatial Parcel Calibration methods
    fun selectParcel(parcel: Parcel)
    fun startReferenceCalibration()
    fun calibrateOrientation(headingOffsetDegrees: Float = 0.0f)
    fun clearAlignment()
    fun getCalibrationAnchor(): Anchor?
}
