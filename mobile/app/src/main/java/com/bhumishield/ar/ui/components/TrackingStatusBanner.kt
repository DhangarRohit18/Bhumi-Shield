package com.bhumishield.ar.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TrackingStatusBanner(
    instructionText: String,
    isTrackingPaused: Boolean,
    errorMessage: String?
) {
    val shouldShow = errorMessage != null || isTrackingPaused || instructionText.isNotEmpty()

    AnimatedVisibility(
        visible = shouldShow,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        val backgroundColor = when {
            errorMessage != null -> Color(0xDD990000)
            isTrackingPaused -> Color(0xDDE65100)
            else -> Color(0xAA121212)
        }

        val text = errorMessage ?: if (isTrackingPaused) "⚠ AR tracking paused. Move phone slowly." else instructionText

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = backgroundColor),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = text,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
