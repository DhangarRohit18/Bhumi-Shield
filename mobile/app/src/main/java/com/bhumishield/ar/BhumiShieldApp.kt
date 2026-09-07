package com.bhumishield.ar

import android.app.Application
import com.bhumishield.ar.util.AppLogger

class BhumiShieldApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppLogger.init(isReleaseBuild = BuildConfig.DEBUG.not())
        AppLogger.i("BHUMI-SHIELD AR Application Initialized")
    }
}
