package com.bhumishield.ar.verification

import kotlinx.coroutines.flow.Flow

/**
 * Data structures and repository interface for recording field evidence.
 * Captures parcel verification status, GPS snapshot, timestamps, observations, and photo paths.
 * Designed for local Room database persistence and deferred cloud sync.
 */
data class VerificationRecord(
    val id: String,
    val parcelId: String,
    val timestamp: Long,
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float,
    val observationText: String,
    val photoFilePath: String? = null,
    val isSynced: Boolean = false
)

interface VerificationRepository {
    fun getVerificationRecords(): Flow<List<VerificationRecord>>
    suspend fun recordVerification(record: VerificationRecord)
}
