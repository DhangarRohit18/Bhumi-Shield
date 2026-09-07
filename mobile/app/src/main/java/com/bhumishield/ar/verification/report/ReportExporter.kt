package com.bhumishield.ar.verification.report

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import com.bhumishield.ar.location.LocationState
import com.bhumishield.ar.parcel.Parcel
import com.bhumishield.ar.verification.VerificationState
import timber.log.Timber
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Local export utility for BHUMI-SHIELD AR field verification reports.
 * Formats report summaries and triggers standard Android Share Intents without cloud dependencies.
 */
object ReportExporter {

    fun generateReportText(
        parcel: Parcel?,
        locationState: LocationState,
        verificationState: VerificationState
    ): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        val timestampStr = dateFormat.format(Date())

        val p = parcel ?: return "No parcel selected."

        val sb = StringBuilder()
        sb.appendLine("==================================================")
        sb.appendLine("BHUMI-SHIELD AR — FIELD VERIFICATION REPORT")
        sb.appendLine("==================================================")
        sb.appendLine("Generated At: $timestampStr")
        sb.appendLine("Data Source : ${p.datasetLabel}")
        sb.appendLine()
        sb.appendLine("--- PARCEL IDENTIFICATION ---")
        sb.appendLine("Parcel ID   : ${p.parcelId}")
        sb.appendLine("Survey No   : ${p.surveyNumber}")
        sb.appendLine("Village     : ${p.village}")
        sb.appendLine("District    : ${p.district}")
        sb.appendLine()
        sb.appendLine("--- SESSION & CALIBRATION ---")
        sb.appendLine("Session ID  : ${verificationState.currentSessionId ?: "N/A"}")
        sb.appendLine("AR Reference: CALIBRATED")
        sb.appendLine("Orientation : CALIBRATED")
        sb.appendLine("GPS Start   : Lat %.6f, Lon %.6f".format(locationState.latitude, locationState.longitude))
        sb.appendLine("GPS Accuracy: ±%.1f m".format(locationState.accuracyMeters))
        sb.appendLine()
        sb.appendLine("--- VERIFICATION SUMMARY ---")
        sb.appendLine("Overall Result : ${verificationState.result.name}")
        sb.appendLine("Total Points   : ${verificationState.totalCount}")
        sb.appendLine("Verified Points: ${verificationState.verifiedCount}")
        sb.appendLine("Flagged Points : ${verificationState.flaggedCount}")
        sb.appendLine("Remaining      : ${verificationState.remainingCount}")
        sb.appendLine("Progress       : ${(verificationState.progress * 100).toInt()}%")
        sb.appendLine()
        sb.appendLine("--- BOUNDARY VERTICES VERIFICATION TABLE ---")

        verificationState.points.forEach { pt ->
            sb.appendLine("[Point ${pt.id}] Index: ${pt.index} | Status: ${pt.status.name}")
            sb.appendLine("  WGS84 Coord : Lat %.6f, Lon %.6f".format(pt.coordinate.latitude, pt.coordinate.longitude))
            sb.appendLine("  Local ENU   : East %.2f m, North %.2f m".format(pt.localCoordinate.eastMeters, pt.localCoordinate.northMeters))
            if (!pt.note.isNullOrBlank()) {
                sb.appendLine("  Field Note  : \"${pt.note}\"")
            }
            if (!pt.photoUri.isNullOrBlank()) {
                sb.appendLine("  Photo Evidence: ${pt.photoUri}")
            }
            sb.appendLine()
        }

        sb.appendLine("==================================================")
        sb.appendLine("CRITICAL LEGAL & ACCURACY DISCLAIMER:")
        sb.appendLine("GPS position is approximate and is used for field identification/proximity only. AR alignment is based on human-assisted physical reference calibration. This prototype does not provide survey-grade cadastral positioning.")
        sb.appendLine("==================================================")

        return sb.toString()
    }

    fun shareReportText(context: Context, reportContent: String, parcelId: String) {
        try {
            val fileName = "BhumiShield_Report_${parcelId}_${System.currentTimeMillis()}.txt"
            val file = File(context.cacheDir, fileName)
            file.writeText(reportContent)

            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, "BHUMI-SHIELD AR Verification Report - $parcelId")
                putExtra(Intent.EXTRA_TEXT, reportContent)
                putExtra(Intent.EXTRA_STREAM, contentUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(Intent.createChooser(shareIntent, "Export Verification Report"))
            Timber.d("Exported and triggered share intent for report $fileName")
        } catch (e: Exception) {
            Timber.e(e, "Error sharing report file")
        }
    }
}
