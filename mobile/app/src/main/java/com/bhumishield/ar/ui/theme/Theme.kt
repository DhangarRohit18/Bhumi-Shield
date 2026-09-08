package com.bhumishield.ar.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val OxlandDark = Color(0xFF0B132B)
val OxlandIndigo = Color(0xFF4F46E5)
val OxlandEmerald = Color(0xFF059669)
val OxlandBg = Color(0xFFFAF8F5)

private val LightColorScheme = lightColorScheme(
    primary = OxlandIndigo,
    secondary = OxlandEmerald,
    background = OxlandBg,
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = OxlandDark,
    onSurface = OxlandDark
)

@Composable
fun BhumiShieldTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
