package com.bhumishield.ar.location

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Looper
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import timber.log.Timber

class DeviceLocationProvider(private val context: Context) {

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    private val _locationState = MutableStateFlow(LocationState())
    val locationState: StateFlow<LocationState> = _locationState.asStateFlow()

    private var isListening = false

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val location = result.lastLocation ?: return
            processNewLocation(location)
        }
    }

    fun hasLocationPermission(): Boolean {
        val fineLocationGranted = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val coarseLocationGranted = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        return fineLocationGranted || coarseLocationGranted
    }

    fun isGpsEnabled(): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        return locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
    }

    @SuppressLint("MissingPermission")
    fun startLocationUpdates() {
        if (!hasLocationPermission()) {
            _locationState.value = LocationState(
                status = LocationStatus.PERMISSION_DENIED,
                errorMessage = "Location permission not granted"
            )
            return
        }

        if (!isGpsEnabled()) {
            _locationState.value = LocationState(
                status = LocationStatus.LOCATION_DISABLED,
                errorMessage = "Location services disabled on device"
            )
            return
        }

        if (isListening) return

        _locationState.value = _locationState.value.copy(status = LocationStatus.ACQUIRING)

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            2000L // 2 second interval
        ).setMinUpdateIntervalMillis(1000L)
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            isListening = true

            // Fetch last known location immediately while waiting for fresh updates
            fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
                if (location != null && _locationState.value.status == LocationStatus.ACQUIRING) {
                    processNewLocation(location)
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Error starting location updates")
            _locationState.value = LocationState(
                status = LocationStatus.UNAVAILABLE,
                errorMessage = "Failed to start location updates: ${e.localizedMessage}"
            )
        }
    }

    fun stopLocationUpdates() {
        if (!isListening) return
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            isListening = false
        } catch (e: Exception) {
            Timber.e(e, "Error removing location updates")
        }
    }

    private fun processNewLocation(location: Location) {
        val status = if (location.accuracy > 15.0f) {
            LocationStatus.POOR_ACCURACY
        } else {
            LocationStatus.AVAILABLE
        }

        _locationState.value = LocationState(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyMeters = location.accuracy,
            altitude = if (location.hasAltitude()) location.altitude else null,
            timestamp = location.time,
            status = status,
            errorMessage = if (status == LocationStatus.POOR_ACCURACY) "Location accuracy is currently ±${location.accuracy.toInt()} m. Waiting for a better fix." else null
        )
    }
}
