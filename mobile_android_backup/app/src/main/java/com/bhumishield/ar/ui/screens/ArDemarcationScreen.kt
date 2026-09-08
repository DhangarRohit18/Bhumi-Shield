package com.bhumishield.ar.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArDemarcationScreen(onBack: () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AR Ground Boundary HUD", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0B132B))
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFF0A192F))
        ) {
            // Simulated 3D AR Camera Overlays
            Box(
                modifier = Modifier
                    .offset(x = 60.dp, y = 140.dp)
                    .size(80.dp)
                    .border(2.dp, Color(0xFF00E5FF), CircleShape)
                    .background(Color(0x3300E5FF), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text("Pillar P-01\n±1.2cm", color = Color(0xFF00E5FF), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            Box(
                modifier = Modifier
                    .offset(x = 220.dp, y = 280.dp)
                    .size(80.dp)
                    .border(2.dp, Color(0xFF00E5FF), CircleShape)
                    .background(Color(0x3300E5FF), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text("Pillar P-02\n±0.8cm", color = Color(0xFF00E5FF), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            // Sub-meter DGPS Live Telemetry Panel
            Surface(
                color = Color(0xDD0B132B),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
                    .fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("📡 Sub-Meter DGPS Lock", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Surface(color = Color(0xFF059669), shape = RoundedCornerShape(8.dp)) {
                            Text("RTK FIXED", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Boundary Polygon: 3.45 Acres Verified", color = Color(0xFFA0AEC0), fontSize = 11.sp)
                    Text("Coordinates: 19.69674° N, 72.76992° E", color = Color(0xFF00E5FF), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
