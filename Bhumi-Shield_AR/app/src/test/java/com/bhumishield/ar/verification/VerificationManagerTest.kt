package com.bhumishield.ar.verification

import com.bhumishield.ar.geospatial.GeoCoordinate
import com.bhumishield.ar.parcel.Parcel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class VerificationManagerTest {

    private lateinit var verificationManager: VerificationManager
    private lateinit var testParcel: Parcel

    @Before
    fun setUp() {
        verificationManager = VerificationManager()

        val refPoint = GeoCoordinate(19.123456, 73.856789)
        val boundary = listOf(
            refPoint,
            GeoCoordinate(19.123456, 73.856989),
            GeoCoordinate(19.123656, 73.856989),
            GeoCoordinate(19.123656, 73.856789),
            refPoint
        )

        testParcel = Parcel(
            parcelId = "P-1042",
            surveyNumber = "S-1042",
            village = "Demo Village",
            district = "Demo District",
            referencePoint = refPoint,
            boundaryCoordinates = boundary,
            isSynthetic = true
        )
    }

    @Test
    fun startVerificationSession_initializesStateCorrectly() {
        verificationManager.startVerificationSession(testParcel)

        val state = verificationManager.state.value
        assertTrue(state.sessionActive)
        assertEquals("P-1042", state.currentParcelId)
        assertEquals(4, state.totalCount)
        assertEquals(0, state.verifiedCount)
        assertEquals(0, state.flaggedCount)
        assertEquals(4, state.remainingCount)
        assertEquals(0.0f, state.progress, 0.001f)
        assertEquals(VerificationResult.IN_PROGRESS, state.result)
        assertNotNull(state.selectedPointId)
        assertEquals("B-01", state.selectedPointId)
    }

    @Test
    fun updatePointNote_savesNoteToTargetPoint() {
        verificationManager.startVerificationSession(testParcel)

        verificationManager.updatePointNote("B-01", "Physical boundary pillar visible")
        val point = verificationManager.state.value.selectedPoint

        assertNotNull(point)
        assertEquals("Physical boundary pillar visible", point?.note)
    }

    @Test
    fun attachPointPhoto_savesPhotoUriToTargetPoint() {
        verificationManager.startVerificationSession(testParcel)

        val testUri = "content://media/external/images/media/1001"
        verificationManager.attachPointPhoto("B-01", testUri)
        val point = verificationManager.state.value.selectedPoint

        assertNotNull(point)
        assertEquals(testUri, point?.photoUri)
    }

    @Test
    fun markPointVerified_updatesCountsAndResult() {
        verificationManager.startVerificationSession(testParcel)

        verificationManager.markPointVerified("B-01")
        var state = verificationManager.state.value
        assertEquals(1, state.verifiedCount)
        assertEquals(0.25f, state.progress, 0.001f)
        assertEquals(VerificationResult.IN_PROGRESS, state.result)

        verificationManager.markPointVerified("B-02")
        verificationManager.markPointVerified("B-03")
        verificationManager.markPointVerified("B-04")

        state = verificationManager.state.value
        assertEquals(4, state.verifiedCount)
        assertEquals(1.0f, state.progress, 0.001f)
        assertEquals(VerificationResult.VERIFIED, state.result)
    }

    @Test
    fun markPointFlagged_evaluatesResultAsFlagged() {
        verificationManager.startVerificationSession(testParcel)

        verificationManager.markPointVerified("B-01")
        verificationManager.markPointFlagged("B-02")

        val state = verificationManager.state.value
        assertEquals(1, state.verifiedCount)
        assertEquals(1, state.flaggedCount)
        assertEquals(0.50f, state.progress, 0.001f)
        assertEquals(VerificationResult.FLAGGED, state.result)
    }

    @Test
    fun completeVerificationSession_marksSessionCompleted() {
        verificationManager.startVerificationSession(testParcel)
        verificationManager.markPointVerified("B-01")

        verificationManager.completeVerificationSession()

        val state = verificationManager.state.value
        assertTrue(state.isCompleted)
    }
}
