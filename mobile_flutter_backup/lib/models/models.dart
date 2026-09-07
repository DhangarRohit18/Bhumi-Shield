// BHUMI-SHIELD Domain Models for Flutter Mobile

class ParcelModel {
  final String id;
  final String projectId;
  final String villageId;
  final String khasraSurveyNo;
  final double areaAcres;
  final String landClassification;
  final double estimatedMarketValueINR;
  final double calculatedSolatiumINR;
  final double totalCompensationINR;
  final String status;
  final String? qrAssetId;
  final double? latitude;
  final double? longitude;

  ParcelModel({
    required this.id,
    required this.projectId,
    required this.villageId,
    required this.khasraSurveyNo,
    required this.areaAcres,
    required this.landClassification,
    required this.estimatedMarketValueINR,
    required this.calculatedSolatiumINR,
    required this.totalCompensationINR,
    required this.status,
    this.qrAssetId,
    this.latitude,
    this.longitude,
  });

  factory ParcelModel.fromMap(Map<String, dynamic> map, String id) {
    final geo = map['geoCenter'] as Map<String, dynamic>?;
    return ParcelModel(
      id: id,
      projectId: map['projectId'] ?? '',
      villageId: map['villageId'] ?? '',
      khasraSurveyNo: map['khasraSurveyNo'] ?? '',
      areaAcres: (map['areaAcres'] as num?)?.toDouble() ?? 0.0,
      landClassification: map['landClassification'] ?? 'Agricultural',
      estimatedMarketValueINR: (map['estimatedMarketValueINR'] as num?)?.toDouble() ?? 0.0,
      calculatedSolatiumINR: (map['calculatedSolatiumINR'] as num?)?.toDouble() ?? 0.0,
      totalCompensationINR: (map['totalCompensationINR'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] ?? 'IDENTIFIED',
      qrAssetId: map['qrAssetId'],
      latitude: (geo?['lat'] as num?)?.toDouble(),
      longitude: (geo?['lng'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'projectId': projectId,
      'villageId': villageId,
      'khasraSurveyNo': khasraSurveyNo,
      'areaAcres': areaAcres,
      'landClassification': landClassification,
      'estimatedMarketValueINR': estimatedMarketValueINR,
      'calculatedSolatiumINR': calculatedSolatiumINR,
      'totalCompensationINR': totalCompensationINR,
      'status': status,
      'qrAssetId': qrAssetId,
      'geoCenter': latitude != null && longitude != null
          ? {'lat': latitude, 'lng': longitude}
          : null,
      'updatedAt': DateTime.now().millisecondsSinceEpoch,
    };
  }
}

class GrievanceModel {
  final String id;
  final String trackingToken;
  final String applicantName;
  final String applicantPhone;
  final String category;
  final String subject;
  final String description;
  final String status;
  final String slaDeadline;

  GrievanceModel({
    required this.id,
    required this.trackingToken,
    required this.applicantName,
    required this.applicantPhone,
    required this.category,
    required this.subject,
    required this.description,
    required this.status,
    required this.slaDeadline,
  });

  factory GrievanceModel.fromMap(Map<String, dynamic> map, String id) {
    return GrievanceModel(
      id: id,
      trackingToken: map['trackingToken'] ?? '',
      applicantName: map['applicantName'] ?? '',
      applicantPhone: map['applicantPhone'] ?? '',
      category: map['category'] ?? '',
      subject: map['subject'] ?? '',
      description: map['description'] ?? '',
      status: map['status'] ?? 'OPEN',
      slaDeadline: map['slaDeadline'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'trackingToken': trackingToken,
      'applicantName': applicantName,
      'applicantPhone': applicantPhone,
      'category': category,
      'subject': subject,
      'description': description,
      'status': status,
      'slaDeadline': slaDeadline,
      'createdAt': DateTime.now().millisecondsSinceEpoch,
      'updatedAt': DateTime.now().millisecondsSinceEpoch,
    };
  }
}

class FieldEvidenceModel {
  final String id;
  final String projectId;
  final String parcelId;
  final String evidenceType;
  final String downloadUrl;
  final double lat;
  final double lng;
  final double accuracyMeters;
  final String capturedByOfficerName;
  final String notes;
  final String tamperProofHash;

  FieldEvidenceModel({
    required this.id,
    required this.projectId,
    required this.parcelId,
    required this.evidenceType,
    required this.downloadUrl,
    required this.lat,
    required this.lng,
    required this.accuracyMeters,
    required this.capturedByOfficerName,
    required this.notes,
    required this.tamperProofHash,
  });

  Map<String, dynamic> toMap() {
    return {
      'projectId': projectId,
      'parcelId': parcelId,
      'evidenceType': evidenceType,
      'downloadUrl': downloadUrl,
      'gpsCoordinates': {'lat': lat, 'lng': lng},
      'accuracyMeters': accuracyMeters,
      'capturedByOfficerName': capturedByOfficerName,
      'capturedByOfficerUid': 'officer-mobile-01',
      'tamperProofHash': tamperProofHash,
      'notes': notes,
      'createdAt': DateTime.now().millisecondsSinceEpoch,
      'updatedAt': DateTime.now().millisecondsSinceEpoch,
    };
  }
}
