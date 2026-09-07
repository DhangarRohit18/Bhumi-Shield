package com.bhumishield.ar.parcel

import com.bhumishield.ar.geospatial.GeoCoordinate
import org.json.JSONObject
import timber.log.Timber
import kotlin.math.abs

/**
 * Parses GeoJSON FeatureCollection into Parcel domain models with strict polygon validation.
 */
class GeoJsonParser {

    fun parseFeatureCollection(jsonString: String): List<Parcel> {
        val parcels = mutableListOf<Parcel>()
        try {
            val root = JSONObject(jsonString)
            val type = root.optString("type", "")
            if (type != "FeatureCollection") {
                Timber.w("GeoJSON root is not FeatureCollection")
                return emptyList()
            }

            val features = root.optJSONArray("features") ?: return emptyList()
            for (i in 0 until features.length()) {
                val featureObj = features.getJSONObject(i)
                val parcel = parseFeature(featureObj)
                if (parcel != null) {
                    parcels.add(parcel)
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Failed to parse GeoJSON FeatureCollection")
        }
        return parcels
    }

    private fun parseFeature(featureObj: JSONObject): Parcel? {
        try {
            val properties = featureObj.optJSONObject("properties") ?: JSONObject()
            val parcelId = properties.optString("parcelId", "P-UNKNOWN")
            val surveyNumber = properties.optString("surveyNumber", "S-UNKNOWN")
            val village = properties.optString("village", "Unknown Village")
            val district = properties.optString("district", "Unknown District")
            val isSynthetic = properties.optBoolean("isSynthetic", true)

            val geometry = featureObj.optJSONObject("geometry") ?: return null
            val geomType = geometry.optString("type", "")
            if (geomType != "Polygon") {
                Timber.w("Skipping non-Polygon feature: $geomType for parcel $parcelId")
                return null
            }

            val coordinatesArray = geometry.optJSONArray("coordinates") ?: return null
            if (coordinatesArray.length() == 0) return null

            // First ring is outer boundary
            val outerRing = coordinatesArray.getJSONArray(0)
            if (outerRing.length() < 4) {
                Timber.w("Parcel $parcelId polygon ring has fewer than 4 coordinates")
                return null
            }

            val coords = mutableListOf<GeoCoordinate>()
            for (j in 0 until outerRing.length()) {
                val coordPair = outerRing.getJSONArray(j)
                val lon = coordPair.getDouble(0)
                val lat = coordPair.getDouble(1)
                val alt = if (coordPair.length() > 2) coordPair.getDouble(2) else 0.0

                // Validate lat/lon range
                if (lat < -90.0 || lat > 90.0 || lon < -180.0 || lon > 180.0) {
                    Timber.e("Invalid coordinate range for parcel $parcelId: ($lat, $lon)")
                    return null
                }

                coords.add(GeoCoordinate(latitude = lat, longitude = lon, altitude = alt))
            }

            // Validate closed polygon (first == last within 1e-6)
            val first = coords.first()
            val last = coords.last()
            if (abs(first.latitude - last.latitude) > 1e-6 || abs(first.longitude - last.longitude) > 1e-6) {
                Timber.w("Parcel $parcelId polygon is not closed. Automatically closing ring.")
                coords.add(first.copy())
            }

            // Reference point is the first boundary coordinate (or vertex)
            val referencePoint = coords.first()

            return Parcel(
                parcelId = parcelId,
                surveyNumber = surveyNumber,
                village = village,
                district = district,
                referencePoint = referencePoint,
                boundaryCoordinates = coords,
                isSynthetic = isSynthetic
            )
        } catch (e: Exception) {
            Timber.e(e, "Error parsing single GeoJSON feature")
            return null
        }
    }
}
