package com.bhumishield.ar.verification

import com.bhumishield.ar.geospatial.GeoCoordinate
import com.bhumishield.ar.geospatial.LocalCoordinate

/**
 * Domain model representing an individual boundary vertex of a land parcel.
 */
data class BoundaryPoint(
    val id: String,
    val index: Int,
    val coordinate: GeoCoordinate,
    val localCoordinate: LocalCoordinate,
    val status: BoundaryPointStatus = BoundaryPointStatus.UNVERIFIED,
    val note: String? = null,
    val photoUri: String? = null
)
