package com.bhumishield.ar.ar

import com.bhumishield.ar.geospatial.GeoCoordinate
import com.bhumishield.ar.geospatial.GeoSpatialCalculator
import com.bhumishield.ar.parcel.Parcel
import com.google.ar.core.Anchor
import kotlin.math.cos
import kotlin.math.sin

/**
 * Transforms WGS84 GeoJSON parcel boundary coordinates into 3D ARCore local/world space
 * relative to a calibrated physical AR Anchor reference point and heading orientation offset.
 */
object GeoToArTransformer {

    /**
     * Converts a Parcel's geographic boundary coordinates into AR local world coordinates.
     *
     * @param parcel Selected parcel containing WGS84 boundary coordinates and geographic reference point.
     * @param referenceAnchor Physical ARCore Anchor tied to the calibrated reference point.
     * @param headingOffsetDegrees Heading angle offset in degrees between Geographic ENU frame and ARCore local frame.
     * @return FloatArray of flattened 3D AR vertices [x0, y0, z0, x1, y1, z1, ...]
     */
    fun transformParcelToArWorld(
        parcel: Parcel,
        referenceAnchor: Anchor?,
        headingOffsetDegrees: Float
    ): FloatArray {
        if (referenceAnchor == null || parcel.boundaryCoordinates.isEmpty()) {
            return floatArrayOf()
        }

        // Extract AR Anchor translation from Pose
        val anchorPose = referenceAnchor.pose
        val anchorX = anchorPose.tx()
        val anchorY = anchorPose.ty()
        val anchorZ = anchorPose.tz()

        val headingRad = Math.toRadians(headingOffsetDegrees.toDouble())
        val cosH = cos(headingRad)
        val sinH = sin(headingRad)

        val arVertices = FloatArray(parcel.boundaryCoordinates.size * 3)

        for (i in parcel.boundaryCoordinates.indices) {
            val geoPt = parcel.boundaryCoordinates[i]

            // Step 1: Geo WGS84 -> Local ENU relative to parcel geographic reference point
            val enu = GeoSpatialCalculator.toLocalEnu(geoPt, parcel.referencePoint)

            // Step 2: Apply heading/orientation rotation around vertical axis (Y in ARCore)
            // ENU East is +X, ENU North is +Y in 2D, mapped to AR horizontal plane (X, -Z)
            val rotX = enu.eastMeters * cosH - enu.northMeters * sinH
            val rotZ = -(enu.eastMeters * sinH + enu.northMeters * cosH)
            val rotY = enu.upMeters

            // Step 3: Apply AR Anchor translation + 0.02m vertical offset to prevent z-fighting with plane mesh
            val arX = (anchorX + rotX).toFloat()
            val arY = (anchorY + rotY + 0.02).toFloat()
            val arZ = (anchorZ + rotZ).toFloat()

            arVertices[i * 3] = arX
            arVertices[i * 3 + 1] = arY
            arVertices[i * 3 + 2] = arZ
        }

        return arVertices
    }
}
