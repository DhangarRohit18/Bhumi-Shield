package com.bhumishield.ar.verification.data.entities

import androidx.room.Embedded
import androidx.room.Relation

data class SessionWithPoints(
    @Embedded
    val session: VerificationSessionEntity,

    @Relation(
        parentColumn = "sessionId",
        entityColumn = "sessionId"
    )
    val points: List<BoundaryPointVerificationEntity>
)
