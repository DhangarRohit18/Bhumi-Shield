package com.bhumishield.ar

import android.app.Application
import android.util.Log

class BhumiShieldApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Log.i("BhumiShieldApp", "BHUMI-SHIELD AR Application Initialized")
    }
}
