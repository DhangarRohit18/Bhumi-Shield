package com.bhumishield.ar.geospatial

import org.junit.Assert.assertEquals
import org.junit.Test

class GeoSpatialCalculatorTest {

    @Test
    fun haversineDistanceMeters_samePoint_returnsZero() {
        val point = GeoCoordinate(19.123456, 73.856789)
        val dist = GeoSpatialCalculator.haversineDistanceMeters(point, point)
        assertEquals(0.0, dist, 0.001)
    }

    @Test
    fun toLocalEnu_referencePoint_returnsZeroCoordinates() {
        val ref = GeoCoordinate(19.123456, 73.856789)
        val enu = GeoSpatialCalculator.toLocalEnu(ref, ref)
        assertEquals(0.0, enu.eastMeters, 0.001)
        assertEquals(0.0, enu.northMeters, 0.001)
        assertEquals(0.0, enu.upMeters, 0.001)
    }

    @Test
    fun toLocalEnu_northOffset_calculatesNorthDisplacement() {
        val ref = GeoCoordinate(19.123456, 73.856789)
        // 0.0001 deg North latitude offset (~ 11.11 meters)
        val target = GeoCoordinate(19.123556, 73.856789)
        val enu = GeoSpatialCalculator.toLocalEnu(target, ref)

        assertEquals(0.0, enu.eastMeters, 0.001)
        assertEquals(11.1139, enu.northMeters, 0.01)
    }
}
