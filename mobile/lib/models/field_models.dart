// BHUMI-SHIELD Domain & Offline Models

class TaskModel {
  final String id;
  final String projectId;
  final String title;
  final String description;
  final String assignedToName;
  final String assignedRole;
  final String dueDate;
  final String priority;
  final String status;
  final String? parcelId;
  final String? qrAssetId;

  TaskModel({
    required this.id,
    required this.projectId,
    required this.title,
    required this.description,
    required this.assignedToName,
    required this.assignedRole,
    required this.dueDate,
    required this.priority,
    required this.status,
    this.parcelId,
    this.qrAssetId,
  });

  factory TaskModel.fromMap(Map<String, dynamic> map, String id) {
    return TaskModel(
      id: id,
      projectId: map['projectId'] ?? 'proj-bullet-train-sec-3',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      assignedToName: map['assignedToName'] ?? 'Ramesh Sawant',
      assignedRole: map['assignedRole'] ?? 'Field Officer',
      dueDate: map['dueDate'] ?? '2026-09-10',
      priority: map['priority'] ?? 'HIGH',
      status: map['status'] ?? 'PENDING',
      parcelId: map['parcelId'] ?? 'pcl-pal-0142',
      qrAssetId: map['qrAssetId'] ?? 'QR-PIL-MH-0921',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'projectId': projectId,
      'title': title,
      'description': description,
      'assignedToName': assignedToName,
      'assignedRole': assignedRole,
      'dueDate': dueDate,
      'priority': priority,
      'status': status,
      'parcelId': parcelId,
      'qrAssetId': qrAssetId,
    };
  }
}

class ParcelPassport {
  final String khasraSurveyNo;
  final String villageName;
  final String districtName;
  final double areaAcres;
  final String landClassification;
  final String primaryLandownerName;
  final String landownerCategory;
  final String bankAccountMasked;
  final double basicValuationINR;
  final double solatiumAmountINR;
  final double totalAwardPayableINR;
  final String legalTitleStatus;
  final String currentStatutoryStage;
  final String qrAssetId;
  final double lat;
  final double lng;

  ParcelPassport({
    required this.khasraSurveyNo,
    required this.villageName,
    required this.districtName,
    required this.areaAcres,
    required this.landClassification,
    required this.primaryLandownerName,
    required this.landownerCategory,
    required this.bankAccountMasked,
    required this.basicValuationINR,
    required this.solatiumAmountINR,
    required this.totalAwardPayableINR,
    required this.legalTitleStatus,
    required this.currentStatutoryStage,
    required this.qrAssetId,
    required this.lat,
    required this.lng,
  });
}

class IoTEventModel {
  final String id;
  final String deviceId;
  final String projectId;
  final String eventType; // LOCATION_UPDATED, MOVEMENT_DETECTED, TAMPER_DETECTED, DEVICE_OFFLINE, FIELD_EVENT
  final String severity;
  final Map<String, dynamic> telemetryPayload;
  final int timestamp;

  IoTEventModel({
    required this.id,
    required this.deviceId,
    required this.projectId,
    required this.eventType,
    required this.severity,
    required this.telemetryPayload,
    required this.timestamp,
  });

  factory IoTEventModel.fromMap(Map<String, dynamic> map, String id) {
    return IoTEventModel(
      id: id,
      deviceId: map['deviceId'] ?? '',
      projectId: map['projectId'] ?? '',
      eventType: map['eventType'] ?? 'FIELD_EVENT',
      severity: map['severity'] ?? 'INFO',
      telemetryPayload: Map<String, dynamic>.from(map['telemetryPayload'] ?? {}),
      timestamp: map['timestamp'] ?? DateTime.now().millisecondsSinceEpoch,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'deviceId': deviceId,
      'projectId': projectId,
      'eventType': eventType,
      'severity': severity,
      'telemetryPayload': telemetryPayload,
      'timestamp': timestamp,
    };
  }
}

class EvidenceSubmission {
  final String localId;
  final String projectId;
  final String parcelId;
  final String taskId;
  final String officerName;
  final String officerUid;
  final double lat;
  final double lng;
  final double accuracyMeters;
  final String photoPath;
  final String notes;
  final String tamperProofHash;
  final int timestamp;
  bool isSynced;

  EvidenceSubmission({
    required this.localId,
    required this.projectId,
    required this.parcelId,
    required this.taskId,
    required this.officerName,
    required this.officerUid,
    required this.lat,
    required this.lng,
    required this.accuracyMeters,
    required this.photoPath,
    required this.notes,
    required this.tamperProofHash,
    required this.timestamp,
    this.isSynced = false,
  });

  Map<String, dynamic> toFirestoreMap() {
    return {
      'projectId': projectId,
      'parcelId': parcelId,
      'taskId': taskId,
      'capturedByOfficerName': officerName,
      'capturedByOfficerUid': officerUid,
      'gpsCoordinates': {'lat': lat, 'lng': lng},
      'accuracyMeters': accuracyMeters,
      'downloadUrl': 'https://storage.googleapis.com/bhumi-shield/evidence/$localId.jpg',
      'notes': notes,
      'tamperProofHash': tamperProofHash,
      'createdAt': timestamp,
      'updatedAt': timestamp,
    };
  }
}
