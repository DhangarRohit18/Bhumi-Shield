package com.bhumishield.ar.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.border
import androidx.compose.ui.graphics.Brush
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.ui.theme.StatusReadyGreen
import com.bhumishield.ar.ui.theme.VerificationColors
import com.bhumishield.ar.verification.report.ReportExporter
import com.bhumishield.ar.verification.VerificationState

@Composable
fun VerificationReportScreen(
    parcel: Parcel?,
    locationState: LocationState,
    verificationState: VerificationState,
    onReturnToAr: () -> Unit
) {
    val context = LocalContext.current
    val p = parcel ?: return

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF09090B)) // Deeper dark background
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 60.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(Color(0xFF4F46E5), Color(0xFF7C3AED))
                        ),
                        shape = RoundedCornerShape(16.dp)
                    )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "BHUMI-SHIELD AR",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF00E5FF)
                        )

                        Text(
                            text = "SYNTHETIC DEMO DATA",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFFFD54F),
                            modifier = Modifier
                                .background(Color(0x44FFD54F), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "FIELD VERIFICATION REPORT",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                }
            }

            // Parcel & Result Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF27272A), RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Parcel ID: ${p.parcelId}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(text = "Survey No: ${p.surveyNumber}", fontSize = 12.sp, color = Color.LightGray)
                            Text(text = "${p.village}, ${p.district}", fontSize = 12.sp, color = Color.LightGray)
                        }

                        val resultColor = VerificationColors.colorForResult(verificationState.result)
                        Text(
                            text = verificationState.result.name,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = resultColor,
                            modifier = Modifier
                                .border(1.dp, resultColor.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                .background(resultColor.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Verified: ${verificationState.verifiedCount} / ${verificationState.totalCount}", fontSize = 12.sp, color = StatusReadyGreen, fontWeight = FontWeight.Bold)
                        Text("Flagged: ${verificationState.flaggedCount}", fontSize = 12.sp, color = Color(0xFFF44336), fontWeight = FontWeight.Bold)
                        Text("Remaining: ${verificationState.remainingCount}", fontSize = 12.sp, color = Color.LightGray)
                    }
                }
            }

            // GPS & Calibration Details Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF27272A), RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Text("SESSION & CALIBRATION METADATA", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00E5FF))
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Session ID: ${verificationState.currentSessionId ?: "N/A"}", fontSize = 11.sp, color = Color.LightGray)
                    Text("AR Reference: CALIBRATED", fontSize = 11.sp, color = StatusReadyGreen)
                    Text("AR Orientation: CALIBRATED", fontSize = 11.sp, color = StatusReadyGreen)
                    Text("GPS Start: Lat %.6f, Lon %.6f (±%.1fm)".format(locationState.latitude, locationState.longitude, locationState.accuracyMeters), fontSize = 11.sp, color = Color.LightGray)
                }
            }

            // Boundary Points Table Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF27272A), RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Text("BOUNDARY VERTICES DETAILS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00E5FF))
                    Spacer(modifier = Modifier.height(8.dp))

                    verificationState.points.forEach { pt ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .border(1.dp, Color(0xFF27272A), RoundedCornerShape(12.dp))
                                .background(Color(0xFF09090B), RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Point ${pt.id}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.White)
                                val color = VerificationColors.colorForStatus(pt.status)
                                Text(pt.status.name, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = color)
                            }

                            Text("WGS84: %.6f, %.6f".format(pt.coordinate.latitude, pt.coordinate.longitude), fontSize = 11.sp, color = Color.LightGray)
                            Text("ENU: East %.2fm, North %.2fm".format(pt.localCoordinate.eastMeters, pt.localCoordinate.northMeters), fontSize = 11.sp, color = Color.LightGray)

                            if (!pt.note.isNullOrBlank()) {
                                Text("Note: \"${pt.note}\"", fontSize = 11.sp, color = Color(0xFFFFD54F), fontWeight = FontWeight.Medium)
                            }

                            if (!pt.photoUri.isNullOrBlank()) {
                                Text("Photo Attached: Yes", fontSize = 11.sp, color = Color(0xFF81C784))
                            }
                        }
                    }
                }
            }

            // Accuracy Disclaimer Notice
            Text(
                text = "GPS position is approximate and is used for field identification/proximity only. AR alignment is based on human-assisted physical reference calibration. This prototype does not provide survey-grade cadastral positioning.",
                fontSize = 10.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Floating Bottom Action Bar
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onReturnToAr,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
            ) {
                Text("RETURN", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = {
                    val reportText = ReportExporter.generateReportText(parcel, locationState, verificationState)
                    ReportExporter.shareReportText(context, reportText, p.parcelId)
                },
                modifier = Modifier.weight(1.5f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)) // Indigo 600
            ) {
                Text("EXPORT REPORT", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}
