package com.bhumishield.ar.ui.screens

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.opengl.GLSurfaceView
import android.view.MotionEvent
import android.view.WindowManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.bhumishield.ar.ar.ArAvailability
import com.bhumishield.ar.ar.ArCoreEngineManager
import com.bhumishield.ar.ar.ArGlRenderer
import com.bhumishield.ar.location.DeviceLocationProvider
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.parcel.ParcelRepository
import com.bhumishield.ar.ui.components.ArBottomControlPanel
import com.bhumishield.ar.ui.components.ArTopBar
import com.bhumishield.ar.ui.components.BoundaryPointPanel
import com.bhumishield.ar.ui.components.TrackingStatusBanner
import com.bhumishield.ar.verification.VerificationManager
import com.bhumishield.ar.verification.repository.VerificationRepository

@Composable
fun ArScreen(arEngineManager: ArCoreEngineManager) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val locationProvider = remember { DeviceLocationProvider(context) }
    val parcelRepository = remember { ParcelRepository(context) }
    val verificationRepository = remember { VerificationRepository(context) }
    val verificationManager = remember { VerificationManager() }

    var showReportScreen by remember { mutableStateOf(false) }

    val state by arEngineManager.state.collectAsState()
    val locationState by locationProvider.locationState.collectAsState()
    val verificationState by verificationManager.state.collectAsState()

    var availableParcels by remember { mutableStateOf(emptyList<Parcel>()) }

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    var hasLocationPermission by remember {
        mutableStateOf(locationProvider.hasLocationPermission())
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        hasLocationPermission = fineGranted || coarseGranted
        if (hasLocationPermission) {
            locationProvider.startLocationUpdates()
        }
    }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (isGranted) {
            arEngineManager.onResume(context)
        }
    }

    // Connect Repository
    LaunchedEffect(Unit) {
        verificationManager.setRepository(verificationRepository)
        availableParcels = parcelRepository.getParcels()

        val initialParcel = availableParcels.firstOrNull()
        if (initialParcel != null && state.selectedParcel == null) {
            arEngineManager.selectParcel(initialParcel)
            verificationManager.resumeSession(initialParcel)
        }

        if (!hasCameraPermission) {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        } else {
            arEngineManager.checkAvailability(context)
        }

        if (!hasLocationPermission) {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        } else {
            locationProvider.startLocationUpdates()
        }
    }

    // Bind Activity Lifecycle
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> {
                    if (hasCameraPermission) arEngineManager.onResume(context)
                    if (hasLocationPermission) locationProvider.startLocationUpdates()
                }
                Lifecycle.Event.ON_PAUSE -> {
                    arEngineManager.onPause()
                    locationProvider.stopLocationUpdates()
                }
                Lifecycle.Event.ON_DESTROY -> {
                    arEngineManager.onDestroy()
                    locationProvider.stopLocationUpdates()
                }
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            locationProvider.stopLocationUpdates()
        }
    }

    if (showReportScreen) {
        VerificationReportScreen(
            parcel = state.selectedParcel,
            locationState = locationState,
            verificationState = verificationState,
            onReturnToAr = { showReportScreen = false }
        )
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            if (!hasCameraPermission) {
                CameraPermissionCard(onRequestPermission = {
                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                })
            } else if (state.availability == ArAvailability.UNSUPPORTED) {
                ArUnsupportedCard(errorMessage = state.errorMessage ?: "Device does not support Google ARCore.")
            } else {
                // 1. Live AR Camera Viewport (Occupies 100% of screen background)
                ArCameraView(
                    arEngineManager = arEngineManager,
                    verificationManager = verificationManager,
                    onTapScreen = { x, y, width, height ->
                        if (verificationState.sessionActive) {
                            val hitVertex = arEngineManager.handleTapForVerification(
                                xPixels = x,
                                yPixels = y,
                                width = width,
                                height = height,
                                verificationManager = verificationManager
                            )
                            if (!hitVertex) {
                                arEngineManager.handleTap(x, y, width, height)
                            }
                        } else {
                            arEngineManager.handleTap(x, y, width, height)
                        }
                    }
                )

                // 2. Compact Translucent Top Status Bar & Contextual Banner
                Column(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 36.dp, start = 12.dp, end = 12.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    ArTopBar(
                        selectedParcel = state.selectedParcel,
                        trackingStatus = state.trackingStatus,
                        locationState = locationState
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    TrackingStatusBanner(
                        instructionText = state.instructionText,
                        isTrackingPaused = state.trackingStatus == com.bhumishield.ar.ar.TrackingStatus.PAUSED,
                        errorMessage = state.errorMessage
                    )
                }

                // 3. Compact Floating Bottom Control Panel & Floating Point Inspector
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 12.dp, start = 10.dp, end = 10.dp)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Floating Boundary Point Inspection Card
                    if (verificationState.sessionActive && verificationState.selectedPoint != null) {
                        BoundaryPointPanel(
                            selectedPoint = verificationState.selectedPoint,
                            locationState = locationState,
                            onMarkVerified = { ptId -> verificationManager.markPointVerified(ptId) },
                            onMarkFlagged = { ptId -> verificationManager.markPointFlagged(ptId) },
                            onUpdateNote = { ptId, note -> verificationManager.updatePointNote(ptId, note) },
                            onAttachPhoto = { ptId, photoUri -> verificationManager.attachPointPhoto(ptId, photoUri) }
                        )
                    }

                    // Compact Bottom Control Panel
                    ArBottomControlPanel(
                        arState = state,
                        locationState = locationState,
                        verificationState = verificationState,
                        availableParcels = availableParcels,
                        parcelRepository = parcelRepository,
                        onSelectParcel = { parcel ->
                            arEngineManager.selectParcel(parcel)
                            verificationManager.resumeSession(parcel)
                        },
                        onStartReferenceCalibration = { arEngineManager.startReferenceCalibration() },
                        onCalibrateOrientation = { arEngineManager.calibrateOrientation(0.0f) },
                        onClearAlignment = {
                            arEngineManager.clearAlignment()
                            verificationManager.stopSession()
                        },
                        onStartVerification = {
                            state.selectedParcel?.let { parcel ->
                                verificationManager.startVerificationSession(parcel, locationState)
                            }
                        },
                        onPauseVerification = { verificationManager.pauseVerificationSession() },
                        onResetVerification = { verificationManager.resetVerificationSession() },
                        onCompleteVerification = {
                            verificationManager.completeVerificationSession()
                            showReportScreen = true
                        },
                        onStartNewSession = {
                            state.selectedParcel?.let { parcel ->
                                verificationManager.startVerificationSession(parcel, locationState)
                            }
                        },
                        onClearAnchors = { arEngineManager.clearAnchors() },
                        onOpenReport = { showReportScreen = true }
                    )
                }
            }
        }
    }
}

@Composable
private fun ArCameraView(
    arEngineManager: ArCoreEngineManager,
    verificationManager: VerificationManager,
    onTapScreen: (x: Float, y: Float, width: Int, height: Int) -> Unit
) {
    val context = LocalContext.current
    val renderer = remember {
        ArGlRenderer(
            getSession = { arEngineManager.getSession() },
            getAnchors = { arEngineManager.getActiveAnchors() },
            getCalibrationAnchor = { arEngineManager.getCalibrationAnchor() },
            getEngineState = { arEngineManager.state.value },
            getVerificationPoints = { verificationManager.state.value.points },
            onFrameUpdate = { frame, session ->
                arEngineManager.onFrameUpdate(frame, session)
            }
        )
    }

    AndroidView(
        factory = { ctx ->
            GLSurfaceView(ctx).apply {
                setEGLContextClientVersion(3)
                setRenderer(renderer)
                renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY

                setOnTouchListener { view, event ->
                    if (event.action == MotionEvent.ACTION_UP) {
                        onTapScreen(event.x, event.y, view.width, view.height)
                    }
                    true
                }
            }
        },
        update = { view ->
            val display = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
                try { context.display } catch (e: Exception) { null }
            } else {
                null
            }
            @Suppress("DEPRECATION")
            val defaultDisplay = (context.getSystemService(Context.WINDOW_SERVICE) as WindowManager).defaultDisplay
            val rotation = display?.rotation ?: defaultDisplay.rotation

            renderer.setDisplayGeometry(rotation, view.width, view.height)
        },
        modifier = Modifier.fillMaxSize()
    )
}

@Composable
private fun CameraPermissionCard(onRequestPermission: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Permissions Required",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "BHUMI-SHIELD AR requires access to your device camera for ARCore spatial tracking and location for parcel identification.",
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onRequestPermission,
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
            Text("Grant Permissions", color = Color.White)
        }
    }
}

@Composable
private fun ArUnsupportedCard(errorMessage: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "ARCore Unsupported",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFD32F2F)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = errorMessage,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}
