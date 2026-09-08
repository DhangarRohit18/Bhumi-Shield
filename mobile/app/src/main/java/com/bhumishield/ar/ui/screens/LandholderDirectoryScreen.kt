package com.bhumishield.ar.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bhumishield.ar.data.model.Landholder

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LandholderDirectoryScreen(
    onSelectLandholder: (Landholder) -> Unit,
    onBack: () -> Unit
) {
    val sampleFarmers = remember {
        listOf(
            Landholder("f-1", "Shri Jagdishprasad R. Sharma", "119/2", "ULPIN-RJ-1192J-2026", "Bassi Rural", "Jaipur", "Rajasthan", 6.2, 5.1, 418.0, "VERIFIED"),
            Landholder("f-2", "Shri Suresh Chandra Verma", "712/4", "ULPIN-UP-7124K-2026", "Araul", "Kanpur Nagar", "Uttar Pradesh", 5.6, 5.6, 704.0, "VERIFIED"),
            Landholder("f-3", "Shri Dattatray B. Patil", "142/A-1", "ULPIN-MH-142A1-2026", "Manikpur", "Palghar", "Maharashtra", 3.45, 2.45, 275.0, "VERIFIED"),
            Landholder("f-4", "Smt. Shakuntala Ramdas Mhatre", "143/2-B", "ULPIN-MH-1432B-2026", "Kelve", "Palghar", "Maharashtra", 4.1, 3.1, 341.0, "DISCREPANCY")
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Landholder Records Directory", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFFAF8F5))
                .padding(16.dp)
        ) {
            items(sampleFarmers) { farmer ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .clickable { onSelectLandholder(farmer) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(farmer.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0B132B))
                            Surface(
                                color = if (farmer.arStatus == "VERIFIED") Color(0xFFECFDF5) else Color(0xFFFEF2F2),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    text = if (farmer.arStatus == "VERIFIED") "✓ AR Verified" else "⚠ Discrepancy",
                                    color = if (farmer.arStatus == "VERIFIED") Color(0xFF059669) else Color(0xFFDC2626),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Survey: #${farmer.surveyNumber} • ${farmer.ulpin}", fontSize = 11.sp, color = Color(0xFF4F46E5), fontWeight = FontWeight.Bold)
                        Text("${farmer.village}, ${farmer.district}, ${farmer.state}", fontSize = 11.sp, color = Color.Gray)

                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Holding: ${farmer.holdingAreaAcres} Ac", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Text("Award: ₹${farmer.totalCompensationLakhs} L", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                        }
                    }
                }
            }
        }
    }
}
