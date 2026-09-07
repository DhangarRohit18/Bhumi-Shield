import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'models/field_models.dart';
import 'services/field_service.dart';
import 'ar_cadastral_hud_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase initialization note: $e');
  }
  runApp(const BhumiShieldMobileApp());
}

class BhumiShieldMobileApp extends StatelessWidget {
  const BhumiShieldMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BHUMI-SHIELD Sentinel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.light().copyWith(
        scaffoldBackgroundColor: const Color(0xFFF0F7FF),
        primaryColor: const Color(0xFFEA580C),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          iconTheme: IconThemeData(color: Color(0xFFEA580C)),
          titleTextStyle: TextStyle(
            color: Color(0xFF0F172A),
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFFEA580C),
          secondary: Color(0xFF0284C7),
          surface: Colors.white,
        ),
      ),
      home: const MobileDashboardRoot(),
    );
  }
}

class MobileDashboardRoot extends StatefulWidget {
  const MobileDashboardRoot({super.key});

  @override
  State<MobileDashboardRoot> createState() => _MobileDashboardRootState();
}

class _MobileDashboardRootState extends State<MobileDashboardRoot> {
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
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEA580C),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'BHUMI-SHIELD',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'Sentinel Mobile',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
              ],
            ),
            const Text(
              'Essential Statutory Operations & Ground Verification',
              style: TextStyle(fontSize: 10, color: Color(0xFF0369A1)),
            ),
          ],
        ),
        actions: [
          DropdownButton<String>(
            value: _activeRole,
            dropdownColor: Colors.white,
            underline: const SizedBox(),
            icon: const Icon(Icons.person_pin, color: Color(0xFFEA580C), size: 18),
            style: const TextStyle(fontSize: 11, color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
            items: _roles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _activeRole = val);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _navIndex == 0
          ? _buildTasksDashboard()
          : _navIndex == 1
              ? _buildParcelsOverviewDashboard()
              : _navIndex == 2
                  ? _buildIoTTelemetryDashboard()
                  : _buildOfflineSyncDashboard(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.white,
        currentIndex: _navIndex,
        selectedItemColor: const Color(0xFFEA580C),
        unselectedItemColor: const Color(0xFF0369A1),
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        onTap: (i) => setState(() => _navIndex = i),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            label: "Tasks",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.map_outlined),
            label: 'Parcels',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.sensors),
            label: 'IoT Sensors',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              label: Text('${_fieldService.offlineQueue.length}'),
              isLabelVisible: _fieldService.offlineQueue.isNotEmpty,
              backgroundColor: const Color(0xFFEA580C),
              child: const Icon(Icons.cloud_sync),
            ),
            label: 'Sync Queue',
          ),
        ],
      ),
    );
  }

  // 1. DASHBOARD 1: ESSENTIAL TASKS & INSPECTIONS
  Widget _buildTasksDashboard() {
    return StreamBuilder<List<TaskModel>>(
      stream: _fieldService.streamTodayTasks(_activeRole),
      builder: (context, snapshot) {
        final tasks = snapshot.data ?? [];
        return ListView(
          padding: const EdgeInsets.all(12),
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.gps_fixed, color: Color(0xFFEA580C), size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Clearance: $_activeRole • DGPS Sentinel Active',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF0369A1), fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Statutory Ground Inspections Queue",
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 8),
            if (tasks.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('No ground inspections pending', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                ),
              )
            else
              ...tasks.map((t) => _buildTaskCard(t)),
          ],
        );
      },
    );
  }

  Widget _buildTaskCard(TaskModel task) {
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFBAE6FD)),
      ),
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFFFFEDD5)),
                  ),
                  child: Text(
                    task.priority,
                    style: const TextStyle(color: Color(0xFFEA580C), fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
                Text('Due: ${task.dueDate}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 6),
            Text(task.title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 2),
            Text(task.description, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF0F7FF),
                  foregroundColor: const Color(0xFF0369A1),
                  elevation: 0,
                  side: const BorderSide(color: Color(0xFFBAE6FD)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
                onPressed: () => _launchFieldMission(task),
                icon: const Icon(Icons.qr_code_scanner, color: Color(0xFFEA580C), size: 16),
                label: const Text('Scan QR & Verify Ground Boundary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 2. DASHBOARD 2: PARCELS & KHASRA PASSPORT DIRECTORY
  Widget _buildParcelsOverviewDashboard() {
    final mockParcels = [
      {
        'khasra': '142/A-1',
        'village': 'Manikpur Circle',
        'area': '2.45 Acres',
        'owner': 'Smt. Anusaya Patil',
        'award': '₹2.75 Cr (Awarded)',
        'stage': 'Sec 19 Verified',
        'qr': 'QR-PIL-MH-0921',
      },
      {
        'khasra': '142/A-2',
        'village': 'Manikpur Circle',
        'area': '1.80 Acres',
        'owner': 'Shri Digambar Mhatre',
        'award': '₹3.96 Cr (Disbursed)',
        'stage': 'Disbursed (PFMS)',
        'qr': 'QR-PIL-MH-0922',
      },
      {
        'khasra': '88/1-C',
        'village': 'Kelve Revenue Circle',
        'area': '4.20 Acres',
        'owner': 'Shri R.K. Sawant',
        'award': '₹3.70 Cr (Inquiry)',
        'stage': 'Sec 15 Objections',
        'qr': 'QR-PIL-MH-0923',
      },
    ];

    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text(
          "Cadastral Khasra Directory",
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 8),
        ...mockParcels.map((p) => Card(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Color(0xFFBAE6FD)),
              ),
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Khasra #${p['khasra']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0F2FE),
                            border: Border.all(color: const Color(0xFFBAE6FD)),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(p['stage']!, style: const TextStyle(color: Color(0xFF0369A1), fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text('${p['village']} • ${p['area']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    Text('Landowner: ${p['owner']}', style: const TextStyle(fontSize: 11, color: Color(0xFF0F172A), fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Statutory Award: ${p['award']}', style: const TextStyle(fontSize: 11, color: Color(0xFFEA580C), fontWeight: FontWeight.bold)),
                        Text('Pillar: ${p['qr']}', style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF0284C7))),
                      ],
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  // 3. DASHBOARD 3: IOT TELEMETRY MONITOR
  Widget _buildIoTTelemetryDashboard() {
    return StreamBuilder<List<IoTDeviceModel>>(
      stream: _fieldService.streamIoTDevices(),
      builder: (context, snapshot) {
        final devices = snapshot.data ?? [];
        return ListView(
          padding: const EdgeInsets.all(12),
          children: [
            const Text('Boundary Pillar IoT Sentinels', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            ...devices.map((d) => Card(
                  color: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: Color(0xFFBAE6FD)),
                  ),
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    leading: const Icon(Icons.router, color: Color(0xFFEA580C), size: 22),
                    title: Text(d.deviceId, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF0F172A))),
                    subtitle: Text('Battery: ${d.batteryPercentage}% • ${d.deviceType}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: d.status == 'ONLINE' ? const Color(0xFFECFDF5) : const Color(0xFFFFF1F2),
                        border: Border.all(color: d.status == 'ONLINE' ? const Color(0xFFA7F3D0) : const Color(0xFFFECDD3)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        d.status,
                        style: TextStyle(
                          color: d.status == 'ONLINE' ? const Color(0xFF047857) : const Color(0xFFDC2626),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                )),
          ],
        );
      },
    );
  }

  // 4. DASHBOARD 4: OFFLINE SYNC QUEUE
  Widget _buildOfflineSyncDashboard() {
    final queue = _fieldService.offlineQueue;

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Pending Sync Queue (${queue.length})', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEA580C),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: queue.isEmpty
                    ? null
                    : () async {
                        await _fieldService.synchronizeOfflineQueue();
                        if (!mounted) return;
                        setState(() {});
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(backgroundColor: Color(0xFF059669), content: Text('All evidence synced to Cloud Firestore & Digital Twin!')),
                        );
                      },
                icon: const Icon(Icons.cloud_upload, size: 14, color: Colors.white),
                label: const Text('1-Tap Cloud Sync', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (queue.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.check_circle_outline, size: 40, color: Color(0xFF059669)),
                    SizedBox(height: 8),
                    Text('All field inspection logs are synced with Cloud Firestore', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: queue.length,
                itemBuilder: (ctx, i) {
                  final item = queue[i];
                  return Card(
                    color: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: Color(0xFFBAE6FD)),
                    ),
                    margin: const EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Parcel ID: ${item.parcelId}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                              const Text('QUEUED', style: TextStyle(color: Color(0xFFEA580C), fontSize: 9, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text('GPS: ${item.lat.toStringAsFixed(4)}°, ${item.lng.toStringAsFixed(4)}° • Accuracy: ±${item.accuracyMeters}m', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                          Text('SHA-256: ${item.tamperProofHash.substring(0, 24)}...', style: const TextStyle(fontSize: 9, fontFamily: 'monospace', color: Color(0xFF0284C7))),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  // MISSION BOTTOM SHEET (QR -> Passport -> AR Viewport -> SHA-256 Geotagged Capture)
  void _launchFieldMission(TaskModel task) async {
    final passport = await _fieldService.getParcelPassportByQR(task.qrAssetId ?? 'QR-PIL-MH-0921');

    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (ctx) => _buildParcelPassportModal(passport, task),
    );
  }

  Widget _buildParcelPassportModal(ParcelPassport passport, TaskModel task) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollController) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: ListView(
            controller: scrollController,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFBAE6FD),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('CADASTRAL PARCEL PASSPORT', style: TextStyle(fontSize: 9, color: Color(0xFFEA580C), fontWeight: FontWeight.bold)),
                      Text('Khasra #${passport.khasraSurveyNo}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F2FE),
                      border: Border.all(color: const Color(0xFFBAE6FD)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('Sec 19 Verified', style: TextStyle(color: Color(0xFF0369A1), fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F7FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFBAE6FD)),
                ),
                child: Column(
                  children: [
                    _infoRow('Revenue Circle:', passport.villageName),
                    const SizedBox(height: 4),
                    _infoRow('District Jurisdiction:', passport.districtName),
                    const SizedBox(height: 4),
                    _infoRow('PAF Landowner:', passport.primaryLandownerName),
                    const SizedBox(height: 4),
                    _infoRow('Bank Account:', passport.bankAccountMasked),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F7FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFBAE6FD)),
                ),
                child: Column(
                  children: [
                    _infoRow('Area / Classification:', '${passport.areaAcres} Ac (${passport.landClassification})'),
                    const SizedBox(height: 4),
                    _infoRow('100% Solatium (Sec 30):', '₹${(passport.solatiumAmountINR / 100000).toStringAsFixed(2)} L'),
                    const SizedBox(height: 4),
                    _infoRow('Total Statutory Award:', '₹${(passport.totalAwardPayableINR / 100000).toStringAsFixed(2)} L', isHighlight: true),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFFBAE6FD)),
                  borderRadius: BorderRadius.circular(10),
                  color: const Color(0xFFF0F7FF),
                ),
                child: Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.view_in_ar, color: Color(0xFFEA580C), size: 18),
                        SizedBox(width: 6),
                        Text('AR Boundary Overlay Ready', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('Overlays Section 19 gazette CAD coordinates over live camera viewport to verify boundary alignment.', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                    const SizedBox(height: 8),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0369A1),
                        elevation: 0,
                        side: const BorderSide(color: Color(0xFFBAE6FD)),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      ),
                      onPressed: () async {
                        final result = await Navigator.push<bool>(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ArCadastralHudScreen(
                              khasraNo: passport.khasraSurveyNo,
                              villageName: passport.villageName,
                              areaAcres: passport.areaAcres,
                              dgpsCoordinates: '19.6967° N, 72.7699° E',
                            ),
                          ),
                        );

                        if (result == true) {
                          _captureAndSubmitEvidence(passport, task);
                        }
                      },
                      icon: const Icon(Icons.visibility, color: Color(0xFFEA580C), size: 14),
                      label: const Text('Open AR Boundary Camera Viewport', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEA580C),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => _captureAndSubmitEvidence(passport, task),
                icon: const Icon(Icons.camera_alt, color: Colors.white, size: 18),
                label: const Text('Capture Geotagged Evidence & Queue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _infoRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF786C5E))),
        Text(
          value,
          style: TextStyle(
            fontSize: isHighlight ? 11 : 10,
            fontWeight: FontWeight.bold,
            color: isHighlight ? const Color(0xFF047857) : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  void _captureAndSubmitEvidence(ParcelPassport passport, TaskModel task) async {
    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Capturing DGPS coordinates (19.6967° N, 72.7699° E) and generating SHA-256 seal...')),
    );

    await _fieldService.queueOfflineEvidence(
      projectId: task.projectId,
      parcelId: task.parcelId ?? 'pcl-pal-0142',
      taskId: task.id,
      officerName: 'Ramesh Sawant (Talathi)',
      officerUid: 'officer-9921',
      lat: 19.6967,
      lng: 72.7699,
      accuracyMeters: 1.8,
      photoPath: 'https://storage.googleapis.com/bhumi-shield/evidence/live_photo.jpg',
      notes: 'Pillar verified intact with DGPS & AR alignment. Solatium calculation accepted.',
    );

    if (!mounted) return;
    setState(() {});

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(backgroundColor: Color(0xFF047857), content: Text('Evidence packaged with SHA-256 seal and queued for synchronization!')),
    );
  }
}
