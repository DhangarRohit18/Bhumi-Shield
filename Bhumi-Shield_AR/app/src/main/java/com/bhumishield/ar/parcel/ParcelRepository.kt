package com.bhumishield.ar.parcel

import android.content.Context
import com.bhumishield.ar.geospatial.GeoCoordinate
import com.bhumishield.ar.geospatial.GeoSpatialCalculator
import timber.log.Timber

/**
 * Repository providing access to parcel data loaded from local synthetic GeoJSON asset.
 * Independent of UI, AR rendering, Firebase, or external network calls.
 */
class ParcelRepository(private val context: Context) {

    private val parser = GeoJsonParser()
    private var cachedParcels: List<Parcel> = emptyList()

    fun loadParcels(): List<Parcel> {
        if (cachedParcels.isNotEmpty()) return cachedParcels

        try {
            val jsonString = context.assets.open("synthetic_parcels.json")
                .bufferedReader()
                .use { it.readText() }
            cachedParcels = parser.parseFeatureCollection(jsonString)
            Timber.d("Loaded ${cachedParcels.size} parcels from synthetic GeoJSON asset")
        } catch (e: Exception) {
            Timber.e(e, "Error reading synthetic_parcels.json from assets")
            cachedParcels = emptyList()
        }

        return cachedParcels
    }

    fun getParcels(): List<Parcel> {
        if (cachedParcels.isEmpty()) {
            return loadParcels()
        }
        return cachedParcels
    }

    fun getParcelById(id: String): Parcel? {
        return getParcels().firstOrNull { it.parcelId == id }
    }

    fun findNearestParcel(latitude: Double, longitude: Double): Parcel? {
        val parcels = getParcels()
        if (parcels.isEmpty()) return null

        val userLocation = GeoCoordinate(latitude, longitude)
        return parcels.minByOrNull { parcel ->
            GeoSpatialCalculator.haversineDistanceMeters(userLocation, parcel.referencePoint)
        }
    }

    fun distanceToParcel(latitude: Double, longitude: Double, parcel: Parcel): Double {
        val userLocation = GeoCoordinate(latitude, longitude)
        return GeoSpatialCalculator.haversineDistanceMeters(userLocation, parcel.referencePoint)
    }
}
