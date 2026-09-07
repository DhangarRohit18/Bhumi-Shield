package com.bhumishield.ar.verification.data.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "verification_sessions")
data class VerificationSessionEntity(
    @PrimaryKey
    val sessionId: String,
    val parcelId: String,
    val surveyNumber: String,
    val village: String,
    val district: String,
    val startedAt: Long,
    val completedAt: Long? = null,
    val result: String,
    val referenceCalibrated: Boolean,
    val orientationCalibrated: Boolean,
    val startLatitude: Double,
    val startLongitude: Double,
    val startAccuracyMeters: Float,
    val isSyntheticData: Boolean = true
)
