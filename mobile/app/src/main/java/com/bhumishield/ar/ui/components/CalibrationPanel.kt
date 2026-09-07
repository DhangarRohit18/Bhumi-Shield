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
import com.bhumishield.ar.ar.AlignmentStatus
import com.bhumishield.ar.ui.theme.StatusReadyGreen

@Composable
fun CalibrationPanel(
    alignmentStatus: AlignmentStatus,
    isBoundaryReady: Boolean,
    onStartReferenceCalibration: () -> Unit,
    onCalibrateOrientation: () -> Unit,
    onClearAlignment: () -> Unit
) {
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
            Text(
                text = "AR REFERENCE & ORIENTATION CALIBRATION",
                style = MaterialTheme.typography.titleMedium,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(8.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0x33000000), RoundedCornerShape(8.dp))
                    .padding(8.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("AR Reference:", fontSize = 12.sp, color = Color.LightGray)
                    Text(
                        text = when (alignmentStatus) {
                            AlignmentStatus.NOT_CALIBRATED -> "NOT CALIBRATED"
                            AlignmentStatus.CALIBRATING_REFERENCE -> "CALIBRATING..."
                            else -> "✓ CALIBRATED"
                        },
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (alignmentStatus == AlignmentStatus.NOT_CALIBRATED || alignmentStatus == AlignmentStatus.CALIBRATING_REFERENCE) Color(0xFFFFB74D) else StatusReadyGreen
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("AR Orientation:", fontSize = 12.sp, color = Color.LightGray)
                    Text(
                        text = if (isBoundaryReady) "✓ CALIBRATED" else "CALIBRATION REQUIRED",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isBoundaryReady) StatusReadyGreen else Color(0xFFFFB74D)
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Boundary Overlay:", fontSize = 12.sp, color = Color.LightGray)
                    Text(
                        text = if (isBoundaryReady) "✓ READY" else "NOT READY",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isBoundaryReady) StatusReadyGreen else Color(0xFFE57373)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Button(
                    onClick = onStartReferenceCalibration,
                    modifier = Modifier.weight(1f),
                    enabled = alignmentStatus != AlignmentStatus.CALIBRATING_REFERENCE,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (alignmentStatus == AlignmentStatus.NOT_CALIBRATED) MaterialTheme.colorScheme.primary else Color(0xFF388E3C)
                    )
                ) {
                    Text(
                        text = if (alignmentStatus == AlignmentStatus.NOT_CALIBRATED) "CALIBRATE REF" else "✓ REF OK",
                        fontSize = 11.sp,
                        color = Color.White
                    )
                }

                Button(
                    onClick = onCalibrateOrientation,
                    modifier = Modifier.weight(1.2f),
                    enabled = alignmentStatus == AlignmentStatus.REFERENCE_CALIBRATED || alignmentStatus == AlignmentStatus.READY,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0288D1))
                ) {
                    Text(
                        text = if (isBoundaryReady) "✓ ORIENTATION OK" else "CALIBRATE ORIENTATION",
                        fontSize = 11.sp,
                        color = Color.White
                    )
                }

                if (alignmentStatus != AlignmentStatus.NOT_CALIBRATED) {
                    OutlinedButton(
                        onClick = onClearAlignment,
                        modifier = Modifier.weight(0.8f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFE57373))
                    ) {
                        Text("CLEAR", fontSize = 11.sp)
                    }
                }
            }
        }
    }
}
