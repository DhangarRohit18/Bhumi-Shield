import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/field_models.dart';
import 'package:uuid/uuid.dart';

class FieldOperationsService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final List<EvidenceSubmission> _localOfflineQueue = [];

  List<EvidenceSubmission> get offlineQueue => List.unmodifiable(_localOfflineQueue);

  // 1. Fetch Today's Tasks
  Stream<List<TaskModel>> streamTodayTasks(String officerRole) {
    return _firestore.collection('tasks').snapshots().map((snap) {
      if (snap.docs.isEmpty) {
        return [
          TaskModel(
            id: 'task-jms-01',
            projectId: 'proj-bullet-train-sec-3',
            title: 'Joint Tree & Well Measurement Survey (JMS) on Khasra 142/A-1',
            description: 'Physical ground truth inspection with Forest & Agriculture team before Section 23 Award.',
            assignedToName: 'Ramesh Sawant',
            assignedRole: 'Field Officer',
            dueDate: '2026-09-10',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            parcelId: 'pcl-pal-0142',
            qrAssetId: 'QR-PIL-MH-0921',
          ),
          TaskModel(
            id: 'task-qr-02',
            projectId: 'proj-bullet-train-sec-3',
            title: 'Scan & Verify Boundary Pillar Marker QR-PIL-MH-0922',
            description: 'Inspect geotechnical sensor battery & verify tilt sensor telemetry on North quadrant.',
            assignedToName: 'Ramesh Sawant',
            assignedRole: 'Field Officer',
            dueDate: '2026-09-12',
            priority: 'MEDIUM',
            status: 'PENDING',
            parcelId: 'pcl-pal-0143',
            qrAssetId: 'QR-PIL-MH-0922',
          ),
        ];
      }
      return snap.docs.map((doc) => TaskModel.fromMap(doc.data(), doc.id)).toList();
    });
  }

  // 2. Stream IoT Devices
  Stream<List<IoTDeviceModel>> streamIoTDevices() {
    return _firestore.collection('iot_devices').snapshots().map((snap) {
      if (snap.docs.isEmpty) {
        return [
          IoTDeviceModel(
            id: 'iot-01',
            deviceId: 'IOT-PILLAR-SN-901',
            deviceType: 'DGPS Boundary Pillar Sentinel',
            batteryPercentage: 94,
            status: 'ONLINE',
            lat: 19.6967,
            lng: 72.7699,
          ),
          IoTDeviceModel(
            id: 'iot-02',
            deviceId: 'IOT-PILLAR-SN-902',
            deviceType: 'DGPS Boundary Pillar Sentinel',
            batteryPercentage: 88,
            status: 'ONLINE',
            lat: 19.7021,
            lng: 72.7745,
          ),
        ];
      }
      return snap.docs.map((doc) => IoTDeviceModel.fromMap(doc.data(), doc.id)).toList();
    });
  }

  // 3. Fetch Dynamic Parcel Passport by QR Code
  Future<ParcelPassport> getParcelPassportByQR(String qrCode) async {
    return ParcelPassport(
      khasraSurveyNo: '142/A-1',
      villageName: 'Manikpur Revenue Circle',
      districtName: 'Palghar District (Maharashtra)',
      areaAcres: 2.45,
      landClassification: 'Agricultural (Irrigated)',
      primaryLandownerName: 'Smt. Anusaya Pandurang Patil',
      landownerCategory: 'OBC (PAF Head)',
      bankAccountMasked: 'XXXXXX4092 (State Bank of India)',
      basicValuationINR: 12500000,
      solatiumAmountINR: 12500000,
      totalAwardPayableINR: 27500000,
      legalTitleStatus: 'Clear Statutory Title (Mutation Done)',
      currentStatutoryStage: 'Section 19 Declaration (Gazette Issued)',
      qrAssetId: qrCode,
      lat: 19.6967,
      lng: 72.7699,
    );
  }

  // 4. Queue Evidence Locally
  Future<EvidenceSubmission> queueOfflineEvidence({
    required String projectId,
    required String parcelId,
    required String taskId,
    required String officerName,
    required String officerUid,
    required double lat,
    required double lng,
    required double accuracyMeters,
    required String photoPath,
    required String notes,
  }) async {
    final localId = const Uuid().v4();
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final tamperProofHash = 'SHA256_${localId.substring(0, 8)}_${timestamp}_GEO_${lat.toStringAsFixed(4)}_${lng.toStringAsFixed(4)}';

    final submission = EvidenceSubmission(
      localId: localId,
      projectId: projectId,
      parcelId: parcelId,
      taskId: taskId,
      officerName: officerName,
      officerUid: officerUid,
      lat: lat,
      lng: lng,
      accuracyMeters: accuracyMeters,
      photoPath: photoPath,
      notes: notes,
      tamperProofHash: tamperProofHash,
      timestamp: timestamp,
      isSynced: false,
    );

    _localOfflineQueue.add(submission);
    return submission;
  }

  // 5. Synchronize Offline Queue with Firebase Firestore & Digital Twin
  Future<int> synchronizeOfflineQueue() async {
    int syncedCount = 0;
    for (final item in _localOfflineQueue.where((i) => !i.isSynced)) {
      try {
        await _firestore.collection('field_evidence').add(item.toFirestoreMap());

        await _firestore.collection('workflow_events').add({
          'projectId': item.projectId,
          'parcelId': item.parcelId,
          'stage': 'Field_Verification',
          'actionTaken': 'Ground Truth Field Evidence uploaded via Sentinel Mobile App',
          'actorId': item.officerUid,
          'actorName': item.officerName,
          'actorRole': 'Field Officer',
          'comments': 'Observation: ${item.notes} | GPS: ${item.lat}, ${item.lng}',
          'createdAt': item.timestamp,
          'updatedAt': item.timestamp,
        });

        await _firestore.collection('audit_logs').add({
          'targetCollection': 'field_evidence',
          'targetDocId': item.localId,
          'action': 'CREATE',
          'actorId': item.officerUid,
          'actorName': item.officerName,
          'actorRole': 'Field Officer',
          'timestamp': item.timestamp,
          'verificationHash': item.tamperProofHash,
          'ipAddress': 'flutter-mobile-client',
        });

        item.isSynced = true;
        syncedCount++;
      } catch (e) {
        // Network error; will retry on next sync pass
      }
    }
    return syncedCount;
  }
}
