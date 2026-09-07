package com.bhumishield.ar.geospatial

/**
 * Local East-North-Up (ENU) tangent plane coordinate relative to a origin GeoCoordinate reference point.
 * Values are in meters.
 * - eastMeters: Positive East, Negative West
 * - northMeters: Positive North, Negative South
 * - upMeters: Positive Altitude / Height, Negative Depth
 */
data class LocalCoordinate(
    val eastMeters: Double,
    val northMeters: Double,
    val upMeters: Double = 0.0
)
