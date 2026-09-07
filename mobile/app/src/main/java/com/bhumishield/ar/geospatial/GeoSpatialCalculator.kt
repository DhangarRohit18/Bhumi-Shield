package com.bhumishield.ar.geospatial

import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Utility functions for geographic and ENU coordinate computations.
 *
 * NOTE: Local ENU coordinate transformation uses a standard local tangent-plane approximation
 * appropriate for small-scale local parcel boundaries (< 10 km). It is not intended as
 * high-precision geodetic ellipsoid ray-tracing.
 */
object GeoSpatialCalculator {

    private const val EARTH_RADIUS_METERS = 6371000.0
    private const val METERS_PER_DEGREE_LAT = 111139.0

    /**
     * Calculates Haversine distance in meters between two geographic points.
     */
    fun haversineDistanceMeters(point1: GeoCoordinate, point2: GeoCoordinate): Double {
        val lat1Rad = Math.toRadians(point1.latitude)
        val lat2Rad = Math.toRadians(point2.latitude)
        val deltaLatRad = Math.toRadians(point2.latitude - point1.latitude)
        val deltaLonRad = Math.toRadians(point2.longitude - point1.longitude)

        val a = sin(deltaLatRad / 2.0) * sin(deltaLatRad / 2.0) +
                cos(lat1Rad) * cos(lat2Rad) *
                sin(deltaLonRad / 2.0) * sin(deltaLonRad / 2.0)

        val c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))
        return EARTH_RADIUS_METERS * c
    }

    /**
     * Calculates initial bearing in degrees (0..360, 0=North, 90=East) from origin to destination.
     */
    fun initialBearingDegrees(origin: GeoCoordinate, destination: GeoCoordinate): Double {
        val lat1Rad = Math.toRadians(origin.latitude)
        val lat2Rad = Math.toRadians(destination.latitude)
        val deltaLonRad = Math.toRadians(destination.longitude - origin.longitude)

        val y = sin(deltaLonRad) * cos(lat2Rad)
        val x = cos(lat1Rad) * sin(lat2Rad) - sin(lat1Rad) * cos(lat2Rad) * cos(deltaLonRad)

        val bearingRad = atan2(y, x)
        val bearingDeg = Math.toDegrees(bearingRad)
        return (bearingDeg + 360.0) % 360.0
    }

    /**
     * Converts a target geographic WGS84 coordinate to local East-North-Up (ENU) meters relative to an origin reference point.
     *
     * Approximations:
     * - ΔNorth = (target.lat - origin.lat) * 111,139 meters/degree
     * - ΔEast = (target.lon - origin.lon) * 111,139 * cos(origin.lat) meters/degree
     * - ΔUp = target.alt - origin.alt
     */
    fun toLocalEnu(target: GeoCoordinate, originReference: GeoCoordinate): LocalCoordinate {
        val deltaLat = target.latitude - originReference.latitude
        val deltaLon = target.longitude - originReference.longitude

        val northMeters = deltaLat * METERS_PER_DEGREE_LAT
        val avgLatRad = Math.toRadians(originReference.latitude)
        val eastMeters = deltaLon * METERS_PER_DEGREE_LAT * cos(avgLatRad)
        val upMeters = target.altitude - originReference.altitude

        return LocalCoordinate(
            eastMeters = eastMeters,
            northMeters = northMeters,
            upMeters = upMeters
        )
    }
}
