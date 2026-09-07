package com.bhumishield.ar.verification

/**
 * In-memory model representing an active or completed field verification session for a parcel.
 */
data class VerificationSession(
    val sessionId: String,
    val parcelId: String,
    val startedAt: Long = System.currentTimeMillis(),
    val referenceCalibrated: Boolean = false,
    val orientationCalibrated: Boolean = false,
    val boundaryPoints: List<BoundaryPoint> = emptyList(),
    val result: VerificationResult = VerificationResult.NOT_STARTED
)
