package com.bhumishield.ar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.bhumishield.ar.data.model.Landholder
import com.bhumishield.ar.ui.screens.*
import com.bhumishield.ar.ui.theme.BhumiShieldTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()
        setContent {
            BhumiShieldTheme {
                var currentScreen by remember { mutableStateOf("home") }
                var selectedLandholder by remember { mutableStateOf<Landholder?>(null) }

                when (currentScreen) {
                    "home" -> HomeScreen(
                        onNavigateDirectory = { currentScreen = "directory" },
                        onNavigateQrScanner = { currentScreen = "qr_scanner" },
                        onNavigateAr = { currentScreen = "ar_demarcation" }
                    )
                    "directory" -> LandholderDirectoryScreen(
                        onSelectLandholder = { landholder ->
                            selectedLandholder = landholder
                            currentScreen = "evidence_capture"
                        },
                        onBack = { currentScreen = "home" }
                    )
                    "qr_scanner" -> QrScannerScreen(
                        onBack = { currentScreen = "home" }
                    )
                    "evidence_capture" -> selectedLandholder?.let { landholder ->
                        EvidenceCaptureScreen(
                            landholder = landholder,
                            onBack = { currentScreen = "directory" }
                        )
                    }
                    "ar_demarcation" -> ArDemarcationScreen(
                        onBack = { currentScreen = "home" }
                    )
                }
            }
        }
    }
}
