package com.bhumishield.ar.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bhumishield.ar.ar.TrackingStatus
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.ui.theme.StatusReadyGreen

@Composable
fun ArTopBar(
    selectedParcel: Parcel?,
    trackingStatus: TrackingStatus,
    locationState: LocationState
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(42.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xBB0A192F)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left: Logo & Parcel Badge
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "BHUMI-SHIELD AR",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00E5FF)
                )

                if (selectedParcel != null) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = selectedParcel.parcelId,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        modifier = Modifier
                            .background(Color(0x4400E5FF), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            // Right: Tracking Status Dot & GPS Accuracy
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Tracking status indicator dot
                val trackingColor = when (trackingStatus) {
                    TrackingStatus.TRACKING -> StatusReadyGreen
                    TrackingStatus.PAUSED -> Color(0xFFFFB74D)
                    TrackingStatus.STOPPED -> Color(0xFFE57373)
                }
                Box(
                    modifier = Modifier
                        .width(8.dp)
                        .height(8.dp)
                        .background(trackingColor, CircleShape)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = trackingStatus.name,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = trackingColor
                )

                Spacer(modifier = Modifier.width(8.dp))

                // GPS Accuracy badge
                val gpsText = if (locationState.isLocationAvailable) "GPS ±%.1fm".format(locationState.accuracyMeters) else "GPS ●"
                Text(
                    text = gpsText,
                    fontSize = 10.sp,
                    color = if (locationState.isLocationAvailable) Color.LightGray else Color.Yellow
                )
            }
        }
    }
}
