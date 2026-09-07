package com.bhumishield.ar.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bhumishield.ar.geospatial.GeoCoordinate
import com.bhumishield.ar.geospatial.GeoSpatialCalculator
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.ui.theme.VerificationColors
import com.bhumishield.ar.verification.BoundaryPoint

@Composable
fun BoundaryPointPanel(
    selectedPoint: BoundaryPoint?,
    locationState: LocationState,
    onMarkVerified: (String) -> Unit,
    onMarkFlagged: (String) -> Unit,
    onUpdateNote: (String, String?) -> Unit,
    onAttachPhoto: (String, String?) -> Unit
) {
    if (selectedPoint == null) return

    var showNoteDialog by remember { mutableStateOf(false) }
    var noteInputText by remember(selectedPoint) { mutableStateOf(selectedPoint.note ?: "") }

    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            onAttachPhoto(selectedPoint.id, uri.toString())
        }
    }

    val realTimeDistanceMeters = if (locationState.isLocationAvailable) {
        val userGeo = GeoCoordinate(locationState.latitude, locationState.longitude)
        GeoSpatialCalculator.haversineDistanceMeters(userGeo, selectedPoint.coordinate)
    } else null

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp)
        ) {
            // Header Row: Point ID, Status & Distance
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "POINT ${selectedPoint.id}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00E5FF)
                    )

                    val statusColor = VerificationColors.colorForStatus(selectedPoint.status)
                    Text(
                        text = selectedPoint.status.name,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = statusColor,
                        modifier = Modifier
                            .padding(start = 6.dp)
                            .background(statusColor.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Text(
                    text = realTimeDistanceMeters?.let { "Dist: %.1fm".format(it) } ?: "Dist: --",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            // Display Note / Photo summary if attached
            if (!selectedPoint.note.isNullOrBlank() || !selectedPoint.photoUri.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                if (!selectedPoint.note.isNullOrBlank()) {
                    Text("Note: \"${selectedPoint.note}\"", fontSize = 10.sp, color = Color(0xFFFFD54F))
                }
                if (!selectedPoint.photoUri.isNullOrBlank()) {
                    Text("Photo Attached", fontSize = 10.sp, color = Color(0xFF81C784))
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Action Buttons Row 1: VERIFY / FLAG
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Button(
                    onClick = { onMarkVerified(selectedPoint.id) },
                    shape = RoundedCornerShape(6.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF388E3C)),
                    modifier = Modifier
                        .weight(1f)
                        .height(34.dp)
                ) {
                    Text("VERIFY", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }

                Button(
                    onClick = { onMarkFlagged(selectedPoint.id) },
                    shape = RoundedCornerShape(6.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                    modifier = Modifier
                        .weight(1f)
                        .height(34.dp)
                ) {
                    Text("FLAG", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Action Buttons Row 2: ADD NOTE / ADD PHOTO
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                OutlinedButton(
                    onClick = { showNoteDialog = true },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(30.dp)
                ) {
                    Text(if (selectedPoint.note.isNullOrBlank()) "+ ADD NOTE" else "EDIT NOTE", fontSize = 10.sp, color = Color.White)
                }

                OutlinedButton(
                    onClick = { photoPickerLauncher.launch("image/*") },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(30.dp)
                ) {
                    Text(if (selectedPoint.photoUri.isNullOrBlank()) "+ ADD PHOTO" else "PHOTO OK", fontSize = 10.sp, color = Color.White)
                }
            }
        }
    }

    // Note Input Dialog
    if (showNoteDialog) {
        AlertDialog(
            onDismissRequest = { showNoteDialog = false },
            title = { Text("Field Note for Point ${selectedPoint.id}") },
            text = {
                OutlinedTextField(
                    value = noteInputText,
                    onValueChange = { noteInputText = it },
                    label = { Text("Observation Note (Optional)") },
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    onUpdateNote(selectedPoint.id, noteInputText.takeIf { it.isNotBlank() })
                    showNoteDialog = false
                }) {
                    Text("SAVE")
                }
            },
            dismissButton = {
                TextButton(onClick = { showNoteDialog = false }) {
                    Text("CANCEL")
                }
            }
        )
    }
}
