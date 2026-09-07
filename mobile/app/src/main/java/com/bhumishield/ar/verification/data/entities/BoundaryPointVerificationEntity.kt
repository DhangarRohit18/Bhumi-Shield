package com.bhumishield.ar.verification.data.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "boundary_point_verifications",
    foreignKeys = [
        ForeignKey(
            entity = VerificationSessionEntity::class,
            parentColumns = ["sessionId"],
            childColumns = ["sessionId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["sessionId"])]
)
data class BoundaryPointVerificationEntity(
    @PrimaryKey
    val id: String, // format: "${sessionId}_${boundaryPointId}"
    val sessionId: String,
    val boundaryPointId: String,
    val index: Int,
    val status: String,
    val note: String? = null,
    val photoUri: String? = null,
    val verifiedAt: Long? = null,
    val distanceFromDeviceWhenVerified: Double? = null,
    val approxLatitude: Double? = null,
    val approxLongitude: Double? = null
)
