import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/models.dart';

class FirebaseMobileService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream active cadastral parcels
  Stream<List<ParcelModel>> streamParcels() {
    return _firestore.collection('parcels').snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => ParcelModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  // Stream grievances
  Stream<List<GrievanceModel>> streamGrievances() {
    return _firestore.collection('grievances').snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => GrievanceModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  // Submit field evidence with GPS metadata and SHA hash
  Future<void> submitFieldEvidence(FieldEvidenceModel evidence) async {
    await _firestore.collection('field_evidence').add(evidence.toMap());
    
    // Also record audit log
    await _firestore.collection('audit_logs').add({
      'targetCollection': 'field_evidence',
      'targetDocId': evidence.parcelId,
      'action': 'CREATE',
      'actorId': 'mobile-field-officer',
      'actorName': evidence.capturedByOfficerName,
      'actorRole': 'Field Officer',
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'verificationHash': evidence.tamperProofHash,
      'ipAddress': 'flutter-mobile-client',
    });
  }

  // File new grievance from citizen or officer
  Future<void> createGrievance(GrievanceModel grv) async {
    await _firestore.collection('grievances').add(grv.toMap());
  }

  // Update parcel status
  Future<void> updateParcelStatus(String parcelId, String status) async {
    await _firestore.collection('parcels').doc(parcelId).update({
      'status': status,
      'updatedAt': DateTime.now().millisecondsSinceEpoch,
    });
  }
}
