package com.bhumishield.ar.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bhumishield.ar.ui.theme.VerificationColors
import com.bhumishield.ar.verification.VerificationResult
import com.bhumishield.ar.verification.VerificationState

@Composable
fun VerificationPanel(
    verificationState: VerificationState,
    isCalibrationReady: Boolean,
    isTrackingActive: Boolean,
    onStartVerification: () -> Unit,
    onPauseVerification: () -> Unit,
    onResetVerification: () -> Unit,
    onCompleteVerification: () -> Unit,
    onStartNewSession: () -> Unit
) {
    val canStartVerification = isCalibrationReady && isTrackingActive

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xEE1E1E1E)),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header Row with Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "FIELD VERIFICATION SESSION",
                    style = MaterialTheme.typography.titleMedium,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                val resultColor = VerificationColors.colorForResult(verificationState.result)
                Text(
                    text = verificationState.result.name,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = resultColor,
                    modifier = Modifier
                        .background(resultColor.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (!verificationState.sessionActive && !verificationState.isCompleted) {
                // Pre-verification State
                Text(
                    text = if (canStartVerification)
                        "AR boundary ready. Tap START VERIFICATION to inspect 3D boundary points."
                    else
                        "⚠ Complete AR Reference & Orientation Calibration first to start field verification.",
                    fontSize = 12.sp,
                    color = if (canStartVerification) Color.LightGray else Color(0xFFFFB74D)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = onStartVerification,
                    modifier = Modifier.fillMaxWidth(),
                    enabled = canStartVerification,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("START VERIFICATION", color = Color.White, fontWeight = FontWeight.Bold)
                }
            } else if (verificationState.isCompleted) {
                // Completed Session State
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0x33000000), RoundedCornerShape(8.dp))
                        .padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "VERIFICATION SESSION COMPLETE",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                    Text(
                        text = "Result: ${verificationState.result.name}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = VerificationColors.colorForResult(verificationState.result)
                    )
                    Text(
                        text = "${verificationState.verifiedCount} / ${verificationState.totalCount} points verified, ${verificationState.flaggedCount} flagged",
                        fontSize = 12.sp,
                        color = Color.LightGray
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = onStartNewSession,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("START NEW SESSION", color = Color.White, fontWeight = FontWeight.Bold)
                }
            } else {
                // Active Session Controls & Progress
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Progress (${(verificationState.progress * 100).toInt()}%)",
                        fontSize = 12.sp,
                        color = Color.LightGray
                    )
                    Text(
                        text = "Verified: ${verificationState.verifiedCount} | Flagged: ${verificationState.flaggedCount} | Rem: ${verificationState.remainingCount}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                LinearProgressIndicator(
                    progress = { verificationState.progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color = if (verificationState.flaggedCount > 0) VerificationColors.FlaggedColor else VerificationColors.VerifiedColor,
                    trackColor = Color(0x44FFFFFF)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    OutlinedButton(
                        onClick = onPauseVerification,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(if (verificationState.isPaused) "RESUME" else "PAUSE", fontSize = 10.sp, color = Color.White)
                    }

                    OutlinedButton(
                        onClick = onResetVerification,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("RESET", fontSize = 10.sp, color = Color(0xFFFFB74D))
                    }

                    Button(
                        onClick = onCompleteVerification,
                        modifier = Modifier.weight(1.4f),
                        shape = RoundedCornerShape(6.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF388E3C))
                    ) {
                        Text("COMPLETE", fontSize = 10.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
