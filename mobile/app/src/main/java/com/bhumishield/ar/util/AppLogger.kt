package com.bhumishield.ar.util

import timber.log.Timber

object AppLogger {
    fun init(isReleaseBuild: Boolean = false) {
        if (!isReleaseBuild) {
            Timber.plant(Timber.DebugTree())
        }
    }

    fun d(message: String, vararg args: Any?) = Timber.d(message, *args)
    fun i(message: String, vararg args: Any?) = Timber.i(message, *args)
    fun w(message: String, vararg args: Any?) = Timber.w(message, *args)
    fun e(throwable: Throwable? = null, message: String, vararg args: Any?) {
        if (throwable != null) {
            Timber.e(throwable, message, *args)
        } else {
            Timber.e(message, *args)
        }
    }
}
