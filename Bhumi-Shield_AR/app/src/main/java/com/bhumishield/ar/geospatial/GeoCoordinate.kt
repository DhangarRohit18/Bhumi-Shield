package com.bhumishield.ar.geospatial

/**
 * Represents a WGS84 Geographic Coordinate.
 */
data class GeoCoordinate(
    val latitude: Double,
    val longitude: Double,
    val altitude: Double = 0.0
)
