package com.bhumishield.ar.location

import kotlinx.coroutines.flow.StateFlow

/**
 * Position provider interface designed for modularity.
 * Abstracts current Smartphone Fused Location Provider and allows seamless
 * future integration of external GNSS / RTK / DGPS high-accuracy sources from BHUMI-SHIELD FieldKit.
 *
 * NOTE: Smartphone GPS typically yields ~3-10m accuracy. High-precision cadastral surveying
 * will utilize external RTK/GNSS hardware via this interface in Phase 2+.
 */
interface PositionSource {
    val locationStream: StateFlow<LocationData?>

    fun startPositionUpdates()
    fun stopPositionUpdates()
}

data class LocationData(
    val latitude: Double,
    val longitude: Double,
    val altitude: Double? = null,
    val accuracyMeters: Float = 0.0f,
    val provider: String = "Smartphone GPS",
    val timestamp: Long = System.currentTimeMillis()
)
