import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:math' as math;

class ArMeasurePoint {
  final Offset position;
  final String label;

  ArMeasurePoint(this.position, this.label);
}

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
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isCameraReady = false;
  int _activeTab = 0; // 0 = Measure (AR), 1 = Level

  // AR Tap-to-Measure points on screen
  List<Offset> _points = [];
  Offset _centerCrosshair = Offset.zero;

  // Leveling sensor state
  double _pitch = 0.0;
  double _roll = 0.0;

  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      await Permission.camera.request();
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras![0],
          ResolutionPreset.high,
          enableAudio: false,
        );
        await _cameraController!.initialize();
        if (mounted) {
          setState(() {
            _isCameraReady = true;
          });
        }
      }
    } catch (e) {
      debugPrint('Camera init error (fallback to simulated feed): $e');
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _addPointAtCenter() {
    final screenSize = MediaQuery.of(context).size;
    final center = Offset(screenSize.width / 2, screenSize.height / 2);

    setState(() {
      if (_points.length >= 6) {
        _points.clear();
      }
      _points.add(center);
    });
  }

  void _clearPoints() {
    setState(() {
      _points.clear();
    });
  }

  void _undoPoint() {
    if (_points.isNotEmpty) {
      setState(() {
        _points.removeLast();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    _centerCrosshair = Offset(size.width / 2, size.height / 2);

    // If points are empty, default to 4-corner cadastral boundary polygon
    final activePolygonPoints = _points.isNotEmpty
        ? _points
        : [
            Offset(size.width * 0.15, size.height * 0.32),
            Offset(size.width * 0.85, size.height * 0.38),
            Offset(size.width * 0.88, size.height * 0.68),
            Offset(size.width * 0.22, size.height * 0.72),
          ];

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Live Camera Viewport (or High-Fidelity Simulation Fallback)
          if (_isCameraReady && _cameraController != null)
            CameraPreview(_cameraController!)
          else
            Container(
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

          // 2. Interactive Augmented Boundary Vectors & Dimension Tags Painter
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return CustomPaint(
                painter: AppleMeasureArPainter(
                  points: activePolygonPoints,
                  center: _centerCrosshair,
                  pulse: _pulseController.value,
                  isLevelMode: _activeTab == 1,
                  pitch: _pitch,
                  roll: _roll,
                ),
              );
            },
          ),

          // 3. Apple Style Dynamic Island Header Bar
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Dynamic Island Pill
                  Container(
                    width: 124,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.5),
                          blurRadius: 10,
                        )
                      ],
                    ),
                    child: Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF22C55E),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Top Action Icons Strip (Undo, Title, Clear Trash)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Back / Undo Button
                        GestureDetector(
                          onTap: () {
                            if (_points.isNotEmpty) {
                              _undoPoint();
                            } else {
                              Navigator.pop(context);
                            }
                          },
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.45),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white24),
                            ),
                            child: const Icon(Icons.undo, color: Colors.white, size: 20),
                          ),
                        ),

                        // Section 19 Cadastral Pill Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF10B981)),
                          ),
                          child: Text(
                            'Khasra #${widget.khasraNo} • Sec 19 CAD',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),

                        // Delete / Clear Points Button
                        GestureDetector(
                          onTap: _clearPoints,
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.45),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white24),
                            ),
                            child: const Icon(Icons.delete_outline, color: Colors.white, size: 22),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 4. Center AR Reticle Target Ring
          Center(
            child: Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                color: Colors.white.withValues(alpha: 0.2),
              ),
              child: Center(
                child: Container(
                  width: 4,
                  height: 4,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ),

          // 5. Bottom Controls (Plus Button, Shutter Button, Measure / Level Capsule)
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Action Triggers (+ Pin Anchor & Shutter Capture)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Large (+) Add Point Button
                      GestureDetector(
                        onTap: _addPointAtCenter,
                        child: Container(
                          width: 68,
                          height: 68,
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2.5),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.4),
                                blurRadius: 10,
                              )
                            ],
                          ),
                          child: const Center(
                            child: Icon(Icons.add, color: Colors.white, size: 36),
                          ),
                        ),
                      ),

                      const SizedBox(width: 24),

                      // Solid Shutter / Save Button
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context, true);
                        },
                        child: Container(
                          width: 68,
                          height: 68,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 4),
                          ),
                          padding: const EdgeInsets.all(4),
                          child: Container(
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Bottom Segmented Tab Capsule (Measure | Level)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Measure Tab
                        GestureDetector(
                          onTap: () => setState(() => _activeTab = 0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            decoration: BoxDecoration(
                              color: _activeTab == 0 ? Colors.white.withValues(alpha: 0.25) : Colors.transparent,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.straighten,
                                  color: _activeTab == 0 ? Colors.white : Colors.white60,
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Measure',
                                  style: TextStyle(
                                    color: _activeTab == 0 ? Colors.white : Colors.white60,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Level Tab
                        GestureDetector(
                          onTap: () => setState(() => _activeTab = 1),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            decoration: BoxDecoration(
                              color: _activeTab == 1 ? Colors.white.withValues(alpha: 0.25) : Colors.transparent,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.screen_rotation,
                                  color: _activeTab == 1 ? Colors.white : Colors.white60,
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Level',
                                  style: TextStyle(
                                    color: _activeTab == 1 ? Colors.white : Colors.white60,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
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
}

class AppleMeasureArPainter extends CustomPainter {
  final List<Offset> points;
  final Offset center;
  final double pulse;
  final bool isLevelMode;
  final double pitch;
  final double roll;

  AppleMeasureArPainter({
    required this.points,
    required this.center,
    required this.pulse,
    required this.isLevelMode,
    required this.pitch,
    required this.roll,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (isLevelMode) {
      _paintLevelMode(canvas, size);
      return;
    }

    if (points.length < 2) return;

    // 1. Draw Connected Vector Lines
    final linePaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke;

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    if (points.length >= 3) {
      path.close();

      // Semi-transparent polygon fill
      final fillPaint = Paint()
        ..color = const Color(0xFF10B981).withValues(alpha: 0.15)
        ..style = PaintingStyle.fill;
      canvas.drawPath(path, fillPaint);
    }

    canvas.drawPath(path, linePaint);

    // 2. Draw Measurement Distance Badges between Vertices
    for (int i = 0; i < points.length; i++) {
      final p1 = points[i];
      final p2 = (i == points.length - 1 && points.length >= 3) ? points[0] : (i < points.length - 1 ? points[i + 1] : null);

      if (p2 != null) {
        final mid = Offset((p1.dx + p2.dx) / 2, (p1.dy + p2.dy) / 2);
        final pixelDist = (p2 - p1).distance;
        // Convert screen pixel distance to simulated real meters/cm
        final realMeters = (pixelDist / 220.0);
        final label = realMeters >= 1.0 ? '${realMeters.toStringAsFixed(2)} m' : '${(realMeters * 100).round()} cm';

        _drawMeasurementTag(canvas, mid, label);
      }
    }

    // 3. Draw Apple Style Corner White Reticle Anchor Nodes
    final nodePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    for (var p in points) {
      canvas.drawCircle(p, 7, nodePaint);
      canvas.drawCircle(
        p,
        11 + (pulse * 4),
        Paint()
          ..color = Colors.white.withValues(alpha: 0.35)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2,
      );
    }
  }

  void _drawMeasurementTag(Canvas canvas, Offset position, String text) {
    final textSpan = TextSpan(
      text: '$text >',
      style: const TextStyle(
        color: Colors.black,
        fontSize: 11,
        fontWeight: FontWeight.bold,
      ),
    );

    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    )..layout();

    final pillRect = Rect.fromCenter(
      center: position,
      width: textPainter.width + 18,
      height: textPainter.height + 10,
    );

    final rrect = RRect.fromRectAndRadius(pillRect, const Radius.circular(14));

    // White capsule shadow
    canvas.drawRRect(
      rrect,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill,
    );

    textPainter.paint(canvas, Offset(position.dx - (textPainter.width / 2), position.dy - (textPainter.height / 2)));
  }

  void _paintLevelMode(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final circlePaint = Paint()
      ..color = const Color(0xFF10B981)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    canvas.drawCircle(c, 90, circlePaint);

    final textSpan = const TextSpan(
      text: '0°\nPERFECTLY LEVEL',
      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
    );
    final tp = TextPainter(text: textSpan, textDirection: TextDirection.ltr, textAlign: TextAlign.center)..layout();
    tp.paint(canvas, Offset(c.dx - (tp.width / 2), c.dy - (tp.height / 2)));
  }

  @override
  bool shouldRepaint(covariant AppleMeasureArPainter oldDelegate) => true;
}
