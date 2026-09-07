package com.bhumishield.ar.verification.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.bhumishield.ar.verification.data.entities.BoundaryPointVerificationEntity
import com.bhumishield.ar.verification.data.entities.VerificationSessionEntity

@Database(
    entities = [
        VerificationSessionEntity::class,
        BoundaryPointVerificationEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class VerificationDatabase : RoomDatabase() {

    abstract fun verificationDao(): VerificationDao

    companion object {
        @Volatile
        private var INSTANCE: VerificationDatabase? = null

        fun getDatabase(context: Context): VerificationDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    VerificationDatabase::class.java,
                    "bhumi_shield_verification_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
