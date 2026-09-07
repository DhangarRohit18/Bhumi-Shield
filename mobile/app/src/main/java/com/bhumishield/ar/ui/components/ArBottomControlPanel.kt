package com.bhumishield.ar.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bhumishield.ar.ar.AlignmentStatus
import com.bhumishield.ar.ar.ArEngineState
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.parcel.ParcelRepository
import com.bhumishield.ar.ui.theme.StatusReadyGreen
import com.bhumishield.ar.ui.theme.VerificationColors
import com.bhumishield.ar.verification.VerificationState

/**
 * Compact AR-First Bottom Control Panel.
 */
@Composable
fun ArBottomControlPanel(
    arState: ArEngineState,
    locationState: LocationState,
    verificationState: VerificationState,
    availableParcels: List<Parcel>,
    parcelRepository: ParcelRepository,
    onSelectParcel: (Parcel) -> Unit,
    onStartReferenceCalibration: () -> Unit,
    onCalibrateOrientation: () -> Unit,
    onClearAlignment: () -> Unit,
    onStartVerification: () -> Unit,
    onPauseVerification: () -> Unit,
    onResetVerification: () -> Unit,
    onCompleteVerification: () -> Unit,
    onStartNewSession: () -> Unit,
    onClearAnchors: () -> Unit,
    onOpenReport: () -> Unit
) {
    var isExpanded by remember { mutableStateOf(false) }
    var parcelMenuExpanded by remember { mutableStateOf(false) }

    val selectedParcel = arState.selectedParcel
    val isCalibrationReady = arState.isBoundaryReady

    val calculatedDistance = remember(locationState, selectedParcel) {
        if (selectedParcel != null && locationState.isLocationAvailable) {
            parcelRepository.distanceToParcel(
                locationState.latitude,
                locationState.longitude,
                selectedParcel
            ).toInt()
        } else null
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp, bottomStart = 16.dp, bottomEnd = 16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp)
        ) {
            // Summary Header Line
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isExpanded = !isExpanded },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = selectedParcel?.let { "${it.parcelId} • ${it.surveyNumber}" } ?: "No Parcel",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00E5FF)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    val statusText = if (isCalibrationReady) "Ref ✓ | Orien ✓ | Boundary READY" else "Calib Required"
                    Text(
                        text = statusText,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isCalibrationReady) StatusReadyGreen else Color(0xFFFFB74D)
                    )
                }

                Text(
                    text = if (isExpanded) "Details ▼" else "Details ▲",
                    fontSize = 10.sp,
                    color = Color.LightGray
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Action Bar
            if (!verificationState.sessionActive && !verificationState.isCompleted) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (!isCalibrationReady) {
                        Button(
                            onClick = onStartReferenceCalibration,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text(
                                text = if (arState.alignmentStatus == AlignmentStatus.NOT_CALIBRATED) "CALIBRATE REF" else "✓ REF OK",
                                fontSize = 11.sp,
                                color = Color.White
                            )
                        }

                        Button(
                            onClick = onCalibrateOrientation,
                            modifier = Modifier.weight(1.2f),
                            enabled = arState.alignmentStatus == AlignmentStatus.REFERENCE_CALIBRATED || arState.alignmentStatus == AlignmentStatus.READY,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0288D1))
                        ) {
                            Text("CALIBRATE ORIEN", fontSize = 11.sp, color = Color.White)
                        }
                    } else {
                        Button(
                            onClick = onStartVerification,
                            modifier = Modifier.fillMaxWidth(),
                            enabled = arState.trackingStatus == com.bhumishield.ar.ar.TrackingStatus.TRACKING,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("START VERIFICATION", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else if (verificationState.sessionActive) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Verify ${verificationState.verifiedCount + verificationState.flaggedCount}/${verificationState.totalCount} (✓${verificationState.verifiedCount} | ⚠${verificationState.flaggedCount})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        OutlinedButton(
                            onClick = onOpenReport,
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text("REPORT", fontSize = 9.sp, color = Color.White)
                        }

                        Button(
                            onClick = onCompleteVerification,
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF388E3C)),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text("END VERIFY", fontSize = 9.sp, color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else if (verificationState.isCompleted) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Result: ${verificationState.result.name} (${verificationState.verifiedCount}/${verificationState.totalCount})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = VerificationColors.colorForResult(verificationState.result)
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Button(
                            onClick = onOpenReport,
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0288D1)),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text("VIEW REPORT", fontSize = 9.sp, color = Color.White)
                        }

                        Button(
                            onClick = onStartNewSession,
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text("NEW SESSION", fontSize = 9.sp, color = Color.White)
                        }
                    }
                }
            }

            // Expanded Detail View
            AnimatedVisibility(
                visible = isExpanded,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "GPS Coordinates", fontSize = 10.sp, color = Color.Gray)
                            if (locationState.isLocationAvailable) {
                                Text("Lat: %.6f".format(locationState.latitude), fontSize = 11.sp, color = Color.White)
                                Text("Lon: %.6f".format(locationState.longitude), fontSize = 11.sp, color = Color.White)
                            } else {
                                Text(locationState.status.name, fontSize = 11.sp, color = Color.Yellow)
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "Parcel & Proximity", fontSize = 10.sp, color = Color.Gray)
                            Text(calculatedDistance?.let { "$it m away" } ?: "--", fontSize = 11.sp, color = Color.White)

                            Box {
                                OutlinedButton(
                                    onClick = { parcelMenuExpanded = true },
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("SELECT PARCEL", fontSize = 9.sp, color = Color.White)
                                }

                                DropdownMenu(
                                    expanded = parcelMenuExpanded,
                                    onDismissRequest = { parcelMenuExpanded = false }
                                ) {
                                    availableParcels.forEach { parcel ->
                                        DropdownMenuItem(
                                            text = { Text("${parcel.parcelId} - ${parcel.surveyNumber}") },
                                            onClick = {
                                                onSelectParcel(parcel)
                                                parcelMenuExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        OutlinedButton(
                            onClick = onClearAlignment,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFE57373))
                        ) {
                            Text("CLEAR ALIGNMENT", fontSize = 10.sp)
                        }

                        OutlinedButton(
                            onClick = onClearAnchors,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFFB74D))
                        ) {
                            Text("CLEAR ANCHORS", fontSize = 10.sp)
                        }
                    }

                    Text(
                        text = "SYNTHETIC DEMO DATA • Smartphone GPS provides approximate location only. AR boundary alignment uses calibrated local anchors.",
                        fontSize = 9.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
