import 'package:flutter/material.dart';

class ArCadastralHudScreen extends StatefulWidget {
  final String khasraNo;
  final String villageName;
  final double areaAcres;
  final String dgpsCoordinates;

  const ArCadastralHudScreen({
    super.key,
    required this.khasraNo,
    required this.villageName,
    required this.areaAcres,
    required this.dgpsCoordinates,
  });

  @override
  State<ArCadastralHudScreen> createState() => _ArCadastralHudScreenState();
}

class _ArCadastralHudScreenState extends State<ArCadastralHudScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  final double _pitch = 2.4;
  final double _roll = -0.8;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Simulated Live Camera Viewport (Deep High-Contrast Field Background)
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF0F172A),
                    Color(0xFF1E293B),
                    Color(0xFF022C22),
                  ],
                ),
              ),
            ),
          ),

          // 2. Interactive Augmented Cadastral Boundary Vectors & HUD Custom Painter
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _animController,
              builder: (context, child) {
                return CustomPaint(
                  painter: CadastralArHudPainter(
                    pulseFactor: _animController.value,
                    khasraNo: widget.khasraNo,
                  ),
                );
              },
            ),
          ),

          // 3. Top Executive Header Bar (Telemetry, Compass & DGPS Accuracy)
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xCC0F172A),
                  border: Border.all(color: const Color(0xFF10B981)),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: const [
                    BoxShadow(color: Color(0x33000000), blurRadius: 10)
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                          onPressed: () => Navigator.pop(context),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF10B981),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'AR CAD HUD • KHASRA #${widget.khasraNo}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${widget.villageName} • ${widget.dgpsCoordinates} (±0.8m)',
                              style: const TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 9,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF064E3B),
                        border: Border.all(color: const Color(0xFF059669)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'SEC 19 ALIGNED',
                        style: TextStyle(
                          color: Color(0xFF34D399),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 4. Center Geofence Status Indicator
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xAA0F172A),
                border: Border.all(color: const Color(0xFF34D399), width: 1.5),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, color: Color(0xFF10B981), size: 16),
                  SizedBox(width: 6),
                  Text(
                    'Cadastral Boundary Aligned (Zero Encroachment)',
                    style: TextStyle(
                      color: Color(0xFF34D399),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 5. Bottom Controls (Level Pitch/Roll, Capture Geotagged Proof)
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xEE0F172A),
                border: Border.all(color: const Color(0xFF334155)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _telemetryItem('PITCH', '$_pitch°'),
                      _telemetryItem('ROLL', '$_roll°'),
                      _telemetryItem('SURVEY AREA', '${widget.areaAcres} Ac'),
                      _telemetryItem('RTK FIX', 'DGPS-3D'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(context, true);
                      },
                      icon: const Icon(Icons.camera_alt, color: Colors.black, size: 18),
                      label: const Text(
                        'Record AR Geotagged Evidence & Seal Hash',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _telemetryItem(String label, String val) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 8, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
      ],
    );
  }
}

class CadastralArHudPainter extends CustomPainter {
  final double pulseFactor;
  final String khasraNo;

  CadastralArHudPainter({required this.pulseFactor, required this.khasraNo});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    // 1. Draw Augmented Gazetted CAD Polygon (Section 19 Boundary)
    final polyPaint = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.85)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    final fillPaint = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.12 + (pulseFactor * 0.08))
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(center.dx - 120, center.dy - 100)
      ..lineTo(center.dx + 130, center.dy - 80)
      ..lineTo(center.dx + 100, center.dy + 120)
      ..lineTo(center.dx - 110, center.dy + 90)
      ..close();

    canvas.drawPath(path, fillPaint);
    canvas.drawPath(path, polyPaint);

    // 2. Draw Corner Pillar Augmented Nodes
    final nodePaint = Paint()..color = const Color(0xFF34D399);
    final points = [
      Offset(center.dx - 120, center.dy - 100),
      Offset(center.dx + 130, center.dy - 80),
      Offset(center.dx + 100, center.dy + 120),
      Offset(center.dx - 110, center.dy + 90),
    ];

    for (int i = 0; i < points.length; i++) {
      canvas.drawCircle(points[i], 6, nodePaint);
      canvas.drawCircle(
        points[i],
        10 + (pulseFactor * 6),
        Paint()
          ..color = const Color(0xFF34D399).withOpacity(0.4)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5,
      );
    }

    // 3. Draw Center Reticle Crosshairs
    final crossPaint = Paint()
      ..color = const Color(0xFF64748B).withOpacity(0.6)
      ..strokeWidth = 1.0;

    canvas.drawLine(Offset(center.dx - 20, center.dy), Offset(center.dx + 20, center.dy), crossPaint);
    canvas.drawLine(Offset(center.dx, center.dy - 20), Offset(center.dx, center.dy + 20), crossPaint);
  }

  @override
  bool shouldRepaint(covariant CadastralArHudPainter oldDelegate) => true;
}
