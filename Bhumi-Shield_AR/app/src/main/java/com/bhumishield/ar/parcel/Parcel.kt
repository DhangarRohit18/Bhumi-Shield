package com.bhumishield.ar.parcel

import com.bhumishield.ar.geospatial.GeoCoordinate

/**
 * Domain model representing a land parcel with WGS84 coordinates.
 */
data class Parcel(
    val parcelId: String,
    val surveyNumber: String,
    val village: String,
    val district: String,
    val referencePoint: GeoCoordinate,
    val boundaryCoordinates: List<GeoCoordinate>,
    val isSynthetic: Boolean = true
) {
    val datasetLabel: String
        get() = if (isSynthetic) "SYNTHETIC DEMO DATA" else "OFFICIAL CADASTRAL DATA"
}
