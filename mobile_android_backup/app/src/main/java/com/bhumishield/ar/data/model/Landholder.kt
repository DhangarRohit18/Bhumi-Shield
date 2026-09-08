package com.bhumishield.ar.data.model

data class Landholder(
    val id: String,
    val name: String,
    val surveyNumber: String,
    val ulpin: String,
    val village: String,
    val district: String,
    val state: String,
    val holdingAreaAcres: Double,
    val acquiredAreaAcres: Double,
    val totalCompensationLakhs: Double,
    val arStatus: String, // "VERIFIED", "PENDING", "DISCREPANCY"
    val photoEvidenceUrl: String? = null
)

data class DgpsPillar(
    val id: String,
    val lat: Double,
    val lng: Double,
    val accuracyCm: Double
)
