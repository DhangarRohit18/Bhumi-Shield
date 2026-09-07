package com.bhumishield.ar.verification.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.bhumishield.ar.verification.data.entities.BoundaryPointVerificationEntity
import com.bhumishield.ar.verification.data.entities.SessionWithPoints
import com.bhumishield.ar.verification.data.entities.VerificationSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface VerificationDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: VerificationSessionEntity)

    @Update
    suspend fun updateSession(session: VerificationSessionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPointVerifications(points: List<BoundaryPointVerificationEntity>)

    @Update
    suspend fun updatePointVerification(point: BoundaryPointVerificationEntity)

    @Transaction
    @Query("SELECT * FROM verification_sessions WHERE sessionId = :sessionId")
    fun getSessionWithPoints(sessionId: String): Flow<SessionWithPoints?>

    @Transaction
    @Query("SELECT * FROM verification_sessions WHERE parcelId = :parcelId ORDER BY startedAt DESC LIMIT 1")
    suspend fun getLatestSessionForParcel(parcelId: String): SessionWithPoints?

    @Transaction
    @Query("SELECT * FROM verification_sessions ORDER BY startedAt DESC")
    fun getAllSessionsWithPoints(): Flow<List<SessionWithPoints>>

    @Query("DELETE FROM verification_sessions WHERE sessionId = :sessionId")
    suspend fun deleteSession(sessionId: String)
}
