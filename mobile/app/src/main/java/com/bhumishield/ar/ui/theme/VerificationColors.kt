package com.bhumishield.ar.ui.theme

import androidx.compose.ui.graphics.Color
import com.bhumishield.ar.verification.BoundaryPointStatus
import com.bhumishield.ar.verification.VerificationResult

object VerificationColors {
    val UnverifiedColor = Color(0xFF00E5FF)       // Cyan / Aqua neutral
    val InspectingColor = Color(0xFFFFEB3B)       // Bright Yellow highlight
    val VerifiedColor = Color(0xFF4CAF50)         // Vibrant Green
    val FlaggedColor = Color(0xFFF44336)          // Vivid Red

    val StatusTextDark = Color(0xFF1E1E1E)
    val StatusTextLight = Color.White

    fun colorForStatus(status: BoundaryPointStatus): Color = when (status) {
        BoundaryPointStatus.UNVERIFIED -> UnverifiedColor
        BoundaryPointStatus.INSPECTING -> InspectingColor
        BoundaryPointStatus.VERIFIED -> VerifiedColor
        BoundaryPointStatus.FLAGGED -> FlaggedColor
    }

    fun colorForResult(result: VerificationResult): Color = when (result) {
        VerificationResult.NOT_STARTED -> Color.Gray
        VerificationResult.IN_PROGRESS -> InspectingColor
        VerificationResult.VERIFIED -> VerifiedColor
        VerificationResult.FLAGGED -> FlaggedColor
    }
}
