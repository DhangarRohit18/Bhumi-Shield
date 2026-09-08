import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const BhumiShieldApp());
}

class BhumiShieldApp extends StatelessWidget {
  const BhumiShieldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bhumi-Shield AR',
      theme: ThemeData(
        primaryColor: const Color(0xFF0B132B),
        scaffoldBackgroundColor: const Color(0xFFFAF8F5),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BHUMI-SHIELD AR', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0B132B))),
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Field Acquisition Sentinel',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0B132B)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Sub-Meter DGPS & On-Site Evidence Sync',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            _buildCard(
              context,
              '🌾 Landholder Records Directory',
              'View 7/12 records, ULPIN & compensations',
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LandholderDirectoryScreen())),
            ),
            _buildCard(
              context,
              '🔲 QR Digital Passport Scanner',
              'Instant Google Lens & camera QR lookup',
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QrScannerScreen())),
            ),
            _buildCard(
              context,
              '📐 AR Demarcation HUD',
              'Real-time 3D camera boundary pillars',
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ArDemarcationScreen())),
              isDark: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context, String title, String subtitle, VoidCallback onTap, {bool isDark = false}) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      color: isDark ? const Color(0xFF0B132B) : Colors.white,
      elevation: isDark ? 4 : 2,
      child: ListTile(
        title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black)),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFFA0AEC0) : Colors.grey)),
        trailing: Icon(Icons.arrow_forward_ios, size: 16, color: isDark ? Colors.white54 : Colors.black54),
        onTap: onTap,
      ),
    );
  }
}

class QrScannerScreen extends StatelessWidget {
  const QrScannerScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR Passport Scanner'), backgroundColor: Colors.white),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.qr_code_scanner, size: 100, color: Color(0xFF4F46E5)),
            const SizedBox(height: 20),
            const Text('Camera Access Required', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Scan Landholder QR Passport to retrieve records.', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Go Back'),
            )
          ],
        ),
      ),
    );
  }
}

class ArDemarcationScreen extends StatelessWidget {
  const ArDemarcationScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AR Demarcation HUD'), backgroundColor: const Color(0xFF0B132B), foregroundColor: Colors.white),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.view_in_ar, size: 100, color: Color(0xFF059669)),
            const SizedBox(height: 20),
            const Text('ARCore Initialization Pending', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Point camera at field boundaries to view DGPS pillars.', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Go Back'),
            )
          ],
        ),
      ),
    );
  }
}

class LandholderDirectoryScreen extends StatelessWidget {
  const LandholderDirectoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Landholder Records Directory'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('farmers').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          
          final docs = snapshot.data?.docs ?? [];
          final farmers = docs.where((d) {
             final data = d.data() as Map<String, dynamic>;
             return data['isDeleted'] != true;
          }).toList();

          if (farmers.isEmpty) {
            return const Center(child: Text('No landholders found.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: farmers.length,
            itemBuilder: (context, index) {
              final data = farmers[index].data() as Map<String, dynamic>;
              final name = data['farmerName'] ?? 'Unknown';
              final arStatus = data['arVerificationStatus'] ?? 'PENDING';
              final isVerified = arStatus == 'VERIFIED';
              final survey = data['surveyGatNumber'] ?? '';
              final ulpin = data['ulpin'] ?? '';
              final village = data['village'] ?? '';
              final district = data['district'] ?? '';
              final state = data['state'] ?? '';
              final holding = data['totalLandAreaAcres'] ?? 0;
              final award = data['totalCompensationINR'] != null 
                 ? (data['totalCompensationINR'] / 100000).toStringAsFixed(2) 
                 : '0';

              return Card(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 12),
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isVerified ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              isVerified ? '✓ AR Verified' : '⚠ Discrepancy',
                              style: TextStyle(
                                fontSize: 10, 
                                fontWeight: FontWeight.bold,
                                color: isVerified ? const Color(0xFF059669) : const Color(0xFFDC2626)
                              ),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Survey: #$survey • $ulpin', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5))),
                      Text('$village, $district, $state', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Holding: $holding Ac', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          Text('Award: ₹$award L', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                        ],
                      )
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
