package com.bhumishield.ar.location

enum class LocationStatus {
    PERMISSION_DENIED,
    LOCATION_DISABLED,
    ACQUIRING,
    AVAILABLE,
    POOR_ACCURACY,
    UNAVAILABLE
}

data class LocationState(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val accuracyMeters: Float = 0.0f,
    val altitude: Double? = null,
    val timestamp: Long = 0L,
    val status: LocationStatus = LocationStatus.UNAVAILABLE,
    val errorMessage: String? = null
) {
    val isLocationAvailable: Boolean
        get() = status == LocationStatus.AVAILABLE || status == LocationStatus.POOR_ACCURACY
}
