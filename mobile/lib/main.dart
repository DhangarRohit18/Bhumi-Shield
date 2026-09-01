import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'models/field_models.dart';
import 'services/field_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialized in local/offline mode: $e');
  }
  runApp(const BhumiShieldFieldApp());
}

class BhumiShieldFieldApp extends StatelessWidget {
  const BhumiShieldFieldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BHUMI-SHIELD Field Sentinel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF070B14),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF06B6D4),
          surface: Color(0xFF0E1628),
        ),
      ),
      home: const FieldSentinelRoot(),
    );
  }
}

class FieldSentinelRoot extends StatefulWidget {
  const FieldSentinelRoot({super.key});

  @override
  State<FieldSentinelRoot> createState() => _FieldSentinelRootState();
}

class _FieldSentinelRootState extends State<FieldSentinelRoot> {
  final FieldOperationsService _fieldService = FieldOperationsService();
  String _activeRole = 'Field Officer';
  int _navIndex = 0;

  final List<String> _roles = [
    'Field Officer',
    'Field Supervisor',
    'Acquisition Officer (CALA)',
    'Public User',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1527),
        elevation: 4,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF059669), Color(0xFF06B6D4)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.shield, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'BHUMI-SHIELD',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                    color: Color(0xFF34D399),
                  ),
                ),
                Text(
                  'Field Sentinel Mobile',
                  style: TextStyle(fontSize: 10, color: Colors.grey),
                ),
              ],
            ),
          ],
        ),
        actions: [
          DropdownButton<String>(
            value: _activeRole,
            dropdownColor: const Color(0xFF0D1527),
            underline: const SizedBox(),
            icon: const Icon(Icons.person_pin, color: Color(0xFF34D399), size: 18),
            style: const TextStyle(fontSize: 11, color: Colors.white),
            items: _roles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _activeRole = val);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _navIndex == 0
          ? _buildTasksView()
          : _navIndex == 1
              ? _buildIoTTelemetryView()
              : _buildOfflineSyncQueueView(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF090F1D),
        currentIndex: _navIndex,
        selectedItemColor: const Color(0xFF34D399),
        unselectedItemColor: Colors.grey,
        onTap: (i) => setState(() => _navIndex = i),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            label: "Today's Tasks",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.sensors),
            label: 'IoT Sentinel',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              label: Text('${_fieldService.offlineQueue.length}'),
              isLabelVisible: _fieldService.offlineQueue.isNotEmpty,
              child: const Icon(Icons.cloud_sync),
            ),
            label: 'Offline Sync',
          ),
        ],
      ),
    );
  }

  // 1. TODAY'S TASKS LIST VIEW
  Widget _buildTasksView() {
    return StreamBuilder<List<TaskModel>>(
      stream: _fieldService.streamTodayTasks(_activeRole),
      builder: (context, snapshot) {
        final tasks = snapshot.data ?? [];
        return ListView(
          padding: const EdgeInsets.all(14),
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1628),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_user, color: Color(0xFF10B981), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Logged in as $_activeRole • GPS Sentinel Active',
                      style: const TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              "Today's Assigned Field Inspections",
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 10),
            ...tasks.map((t) => _buildTaskCard(t)),
          ],
        );
      },
    );
  }

  Widget _buildTaskCard(TaskModel task) {
    return Card(
      color: const Color(0xFF0E1628),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFF1E293B)),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF064E3B),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    task.priority,
                    style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                Text('Due: ${task.dueDate}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 8),
            Text(task.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(task.description, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => _launchFieldMission(task),
                icon: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 18),
                label: const Text('Start Inspection & Scan QR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 2. LAUNCH FIELD MISSION FLOW (QR -> Passport -> AR -> GPS Photo -> Evidence Queue)
  void _launchFieldMission(TaskModel task) async {
    final passport = await _fieldService.getParcelPassportByQR(task.qrAssetId ?? 'QR-PIL-MH-0921');

    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF070B14),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => _buildParcelPassportModal(passport, task),
    );
  }

  // 3. PARCEL PASSPORT MODAL (QR Result)
  Widget _buildParcelPassportModal(ParcelPassport passport, TaskModel task) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, scrollController) {
        return Container(
          padding: const EdgeInsets.all(18),
          decoration: const BoxDecoration(
            color: Color(0xFF0E1628),
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('PARCEL PASSPORT: Survey #${passport.khasraSurveyNo}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
                      Text('${passport.villageName}, ${passport.districtName}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(context)),
                ],
              ),
              const Divider(color: Color(0xFF1E293B), height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFF090F1D), borderRadius: BorderRadius.circular(12)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Project Affected Landowner (PAF)', style: TextStyle(fontSize: 11, color: Color(0xFF06B6D4), fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(passport.primaryLandownerName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    Text('Category: ${passport.landownerCategory} • Bank: ${passport.bankAccountMasked}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFF090F1D), borderRadius: BorderRadius.circular(12)),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Area / Classification:', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        Text('${passport.areaAcres} Ac (${passport.landClassification})', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('100% Solatium (Sec 30):', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        Text('₹${(passport.solatiumAmountINR / 100000).toStringAsFixed(2)} L', style: const TextStyle(fontSize: 11, color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Statutory Award:', style: TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.bold)),
                        Text('₹${(passport.totalAwardPayableINR / 100000).toStringAsFixed(2)} L', style: const TextStyle(fontSize: 12, color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFF06B6D4)),
                  borderRadius: BorderRadius.circular(12),
                  color: const Color(0xFF06B6D4).withAlpha(15),
                ),
                child: Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.view_in_ar, color: Color(0xFF06B6D4), size: 20),
                        SizedBox(width: 8),
                        Text('AR Boundary Overlay Ready', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF06B6D4))),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text('Overlays Section 19 gazette CAD coordinates over live camera viewport to verify physical boundary marker alignment.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    const SizedBox(height: 10),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0891B2)),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('AR Geofence Viewport Active (Cadastral Boundary 142/A-1 Aligned).')),
                        );
                      },
                      icon: const Icon(Icons.visibility, color: Colors.white, size: 16),
                      label: const Text('Open AR Boundary Camera Viewport', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => _captureAndSubmitEvidence(passport, task),
                icon: const Icon(Icons.camera_alt, color: Colors.white),
                label: const Text('Capture Geotagged Evidence & Queue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  // 4. CAPTURE GPS & SUBMIT TO OFFLINE QUEUE
  void _captureAndSubmitEvidence(ParcelPassport passport, TaskModel task) async {
    Navigator.pop(context);

    final submission = await _fieldService.queueOfflineEvidence(
      projectId: task.projectId,
      parcelId: task.parcelId ?? 'pcl-01',
      taskId: task.id,
      officerName: 'Ramesh Sawant',
      officerUid: 'officer-mobile-01',
      lat: passport.lat,
      lng: passport.lng,
      accuracyMeters: 0.35,
      photoPath: '/local/storage/evidence_${DateTime.now().millisecondsSinceEpoch}.jpg',
      notes: 'Joint physical survey completed; boundary pillar ${passport.qrAssetId} verified intact with zero encroachment.',
    );

    setState(() {});

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF064E3B),
        content: Text('Evidence packaged with ${submission.tamperProofHash.substring(0, 16)}... and added to offline queue!'),
        action: SnackBarAction(
          label: 'SYNC NOW',
          textColor: const Color(0xFF34D399),
          onPressed: _syncOfflineEvidence,
        ),
      ),
    );
  }

  // 5. IOT SENTINEL TELEMETRY VIEW
  Widget _buildIoTTelemetryView() {
    return StreamBuilder<List<IoTEventModel>>(
      stream: _fieldService.streamIoTEvents('proj-bullet-train-sec-3'),
      builder: (context, snapshot) {
        final events = snapshot.data ?? [];
        return ListView(
          padding: const EdgeInsets.all(14),
          children: [
            const Text(
              'IoT Boundary Pillar Sentinel Telemetry',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 4),
            const Text(
              'Real-time geotechnical tilt, vibration & displacement events from physical boundary pillars.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 14),
            ...events.map((e) {
              final isWarning = e.severity == 'WARNING';
              return Card(
                color: const Color(0xFF0E1628),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: isWarning ? Colors.amber.withAlpha(128) : const Color(0xFF1E293B)),
                ),
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: Icon(
                    isWarning ? Icons.warning_amber_rounded : Icons.radio_button_checked,
                    color: isWarning ? Colors.amber : const Color(0xFF06B6D4),
                  ),
                  title: Text('${e.eventType} • ${e.deviceId}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  subtitle: Text('Telemetry: ${e.telemetryPayload}', style: const TextStyle(fontSize: 10, color: Colors.grey, fontFamily: 'monospace')),
                  trailing: Text(e.severity, style: TextStyle(color: isWarning ? Colors.amber : const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              );
            }),
          ],
        );
      },
    );
  }

  // 6. OFFLINE SYNC QUEUE VIEW
  Widget _buildOfflineSyncQueueView() {
    final queue = _fieldService.offlineQueue;
    return Padding(
      padding: const EdgeInsets.all(14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Offline Evidence & Sync Manager', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Local queue preserves high-res evidence when field network connectivity is degraded.', style: TextStyle(fontSize: 11, color: Colors.grey)),
          const SizedBox(height: 16),
          Expanded(
            child: queue.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.cloud_done, size: 48, color: Color(0xFF10B981)),
                        SizedBox(height: 10),
                        Text('All evidence synchronized with Firebase & Digital Twin.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: queue.length,
                    itemBuilder: (ctx, idx) {
                      final item = queue[idx];
                      return Card(
                        color: const Color(0xFF0E1628),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          title: Text('Task: ${item.taskId}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          subtitle: Text('Hash: ${item.tamperProofHash}\nGPS: ${item.lat}, ${item.lng}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          trailing: Icon(
                            item.isSynced ? Icons.check_circle : Icons.sync,
                            color: item.isSynced ? const Color(0xFF10B981) : Colors.amber,
                          ),
                        ),
                      );
                    },
                  ),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _syncOfflineEvidence,
            icon: const Icon(Icons.cloud_upload, color: Colors.white),
            label: const Text('Synchronize Offline Evidence to Firebase', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _syncOfflineEvidence() async {
    final count = await _fieldService.synchronizeOfflineQueue();
    setState(() {});
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF064E3B),
        content: Text('Successfully synchronized $count field records with Firebase & updated Project Digital Twin!'),
      ),
    );
  }
}
