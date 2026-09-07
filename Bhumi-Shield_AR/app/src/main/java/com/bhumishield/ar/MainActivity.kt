package com.bhumishield.ar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.bhumishield.ar.ar.ArCoreEngineManager
import com.bhumishield.ar.ui.screens.ArScreen
import com.bhumishield.ar.ui.theme.BhumiShieldTheme
import com.bhumishield.ar.util.AppLogger

class MainActivity : ComponentActivity() {

    private lateinit var arEngineManager: ArCoreEngineManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppLogger.i("MainActivity onCreate - Initializing Phase 1 ARCore Engine")

        arEngineManager = ArCoreEngineManager()

        enableEdgeToEdge()
        setContent {
            BhumiShieldTheme {
                ArScreen(arEngineManager = arEngineManager)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        AppLogger.i("MainActivity onResume")
        arEngineManager.onResume(this)
    }

    override fun onPause() {
        super.onPause()
        AppLogger.i("MainActivity onPause")
        arEngineManager.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        AppLogger.i("MainActivity onDestroy")
        arEngineManager.onDestroy()
    }
}
