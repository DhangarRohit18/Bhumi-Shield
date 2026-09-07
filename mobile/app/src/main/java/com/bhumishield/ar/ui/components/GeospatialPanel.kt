package com.bhumishield.ar.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.parcel.ParcelRepository
import com.bhumishield.ar.ui.theme.StatusReadyGreen

@Composable
fun GeospatialPanel(
    locationState: LocationState,
    selectedParcel: Parcel?,
    availableParcels: List<Parcel>,
    parcelRepository: ParcelRepository,
    onSelectParcel: (Parcel) -> Unit
) {
    var parcelMenuExpanded by remember { mutableStateOf(false) }

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
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xEE1E1E1E)),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "GPS & PARCEL DISCOVERY",
                    style = MaterialTheme.typography.titleMedium,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = "SYNTHETIC DEMO DATA",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFFFFD54F),
                    fontSize = 10.sp,
                    modifier = Modifier
                        .background(Color(0x44FFD54F), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // GPS Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "GPS Location", style = MaterialTheme.typography.bodySmall, color = Color.Gray, fontSize = 11.sp)
                    if (locationState.isLocationAvailable) {
                        Text(
                            text = "Lat: %.6f".format(locationState.latitude),
                            fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Lon: %.6f".format(locationState.longitude),
                            fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Medium
                        )
                    } else {
                        Text(text = locationState.status.name, fontSize = 12.sp, color = Color(0xFFFFB74D))
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "GPS Accuracy", style = MaterialTheme.typography.bodySmall, color = Color.Gray, fontSize = 11.sp)
                    Text(
                        text = if (locationState.isLocationAvailable) "±%.1f m".format(locationState.accuracyMeters) else "Acquiring...",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = when {
                            !locationState.isLocationAvailable -> Color.Yellow
                            locationState.accuracyMeters > 15.0f -> Color(0xFFFFB74D)
                            else -> StatusReadyGreen
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Parcel Info Row & Dropdown
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Selected Parcel", style = MaterialTheme.typography.bodySmall, color = Color.Gray, fontSize = 11.sp)
                    Text(
                        text = selectedParcel?.let { "${it.parcelId} (${it.surveyNumber})" } ?: "None",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00E5FF)
                    )
                    Text(
                        text = selectedParcel?.let { "${it.village}, ${it.district}" } ?: "",
                        fontSize = 11.sp,
                        color = Color.LightGray
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Proximity", style = MaterialTheme.typography.bodySmall, color = Color.Gray, fontSize = 11.sp)
                    Text(
                        text = calculatedDistance?.let { "$it m" } ?: "--",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Box {
                        OutlinedButton(
                            onClick = { parcelMenuExpanded = true },
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("SELECT PARCEL", fontSize = 10.sp, color = Color.White)
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
        }
    }
}
