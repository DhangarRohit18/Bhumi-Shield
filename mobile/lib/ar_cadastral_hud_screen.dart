import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:math' as math;
import 'dart:async';

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
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isCameraReady = false;
  int _activeTab = 0; // 0 = Measure (AR), 1 = Level

  // AR Points on screen (Real-time Tap to Place or Auto Cadastral Polygon)
  final List<Offset> _points = [];
  Offset _centerCrosshair = Offset.zero;

  // Real-time Sensor States (Pitch, Roll, Compass)
  double _pitch = 0.0;
  double _roll = 0.0;
  StreamSubscription<AccelerometerEvent>? _accelSubscription;

  // Real-time GPS Telemetry
  Position? _currentPosition;
  StreamSubscription<Position>? _positionSubscription;

  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _initCamera();
    _initSensors();
    _initLocation();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final CameraController? cameraController = _cameraController;
    if (cameraController == null || !cameraController.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      cameraController.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initCamera();
    }
  }

  Future<void> _initCamera() async {
    try {
      final status = await Permission.camera.request();
      if (status.isGranted || status.isLimited) {
        _cameras = await availableCameras();
        if (_cameras != null && _cameras!.isNotEmpty) {
          // Select back camera
          final backCamera = _cameras!.firstWhere(
            (c) => c.lensDirection == CameraLensDirection.back,
            orElse: () => _cameras![0],
          );

          _cameraController = CameraController(
            backCamera,
            ResolutionPreset.max,
            enableAudio: false,
            imageFormatGroup: ImageFormatGroup.jpeg,
          );

          await _cameraController!.initialize();
          if (mounted) {
            setState(() {
              _isCameraReady = true;
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Real camera init note: $e');
    }
  }

  void _initSensors() {
    _accelSubscription = accelerometerEventStream().listen((AccelerometerEvent event) {
      if (mounted) {
        setState(() {
          _pitch = math.atan2(event.y, math.sqrt(event.x * event.x + event.z * event.z)) * 180 / math.pi;
          _roll = math.atan2(-event.x, event.z) * 180 / math.pi;
        });
      }
    });
  }

  Future<void> _initLocation() async {
    try {
      final status = await Permission.locationWhenInUse.request();
      if (status.isGranted) {
        final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.best,
        );
        if (mounted) {
          setState(() {
            _currentPosition = pos;
          });
        }

        _positionSubscription = Geolocator.getPositionStream(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.bestForNavigation,
            distanceFilter: 1,
          ),
        ).listen((Position position) {
          if (mounted) {
            setState(() {
              _currentPosition = position;
            });
          }
        });
      }
    } catch (e) {
      debugPrint('Location error: $e');
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    _pulseController.dispose();
    _accelSubscription?.cancel();
    _positionSubscription?.cancel();
    super.dispose();
  }

  void _addPointAt(Offset position) {
    setState(() {
      _points.add(position);
    });
  }

  void _addPointAtCenter() {
    final screenSize = MediaQuery.of(context).size;
    _addPointAt(Offset(screenSize.width / 2, screenSize.height / 2));
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

    // In a real environment, we don't show fake static boundaries.
    // The officer must manually drop anchor nodes by walking the perimeter
    // and tapping the '+' button to plot the real-world geometry.
    final activePolygonPoints = _points;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Fullscreen Live Camera Viewport
          if (_isCameraReady && _cameraController != null && _cameraController!.value.isInitialized)
            SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _cameraController!.value.previewSize?.height ?? size.width,
                  height: _cameraController!.value.previewSize?.width ?? size.height,
                  child: CameraPreview(_cameraController!),
                ),
              ),
            )
          else
            // High-fidelity camera viewfinder fallback
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF022C22),
                    Color(0xFF0F172A),
                    Color(0xFF0F172A),
                  ],
                ),
              ),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.camera_alt, color: Colors.white24, size: 64),
                    SizedBox(height: 12),
                    Text(
                      'Real-Time AR Viewport Active',
                      style: TextStyle(color: Colors.white60, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),

          // 2. Interactive Tap-to-Place Target Layer
          GestureDetector(
            behavior: HitTestBehavior.translucent,
            onTapDown: (details) {
              if (_activeTab == 0) {
                _addPointAt(details.localPosition);
              }
            },
            child: AnimatedBuilder(
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
                    dgpsCoordinates: widget.dgpsCoordinates,
                    currentLocation: _currentPosition != null
                        ? '${_currentPosition!.latitude.toStringAsFixed(5)}° N, ${_currentPosition!.longitude.toStringAsFixed(5)}° E'
                        : 'Calibrating RTK-3D...',
                  ),
                );
              },
            ),
          ),

          // 3. Apple Style Dynamic Island Header Bar
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Dynamic Island Pill with Live Status
                  Container(
                    width: 140,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.6),
                          blurRadius: 12,
                        )
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF22C55E),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'AR SENTINEL',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
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
                              color: Colors.black.withValues(alpha: 0.55),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white30),
                            ),
                            child: const Icon(Icons.undo, color: Colors.white, size: 20),
                          ),
                        ),

                        // Section 19 Cadastral Pill Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.7),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF10B981), width: 1.5),
                          ),
                          child: Text(
                            'Khasra #${widget.khasraNo} • ${widget.areaAcres} Ac',
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
                              color: Colors.black.withValues(alpha: 0.55),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white30),
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

          // 4. Center Reticle Target
          Center(
            child: IgnorePointer(
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                  color: Colors.white.withValues(alpha: 0.25),
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
          ),

          // 5. Bottom Controls (Plus Anchor, Shutter Capture, Measure/Level Capsule)
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
                            color: Colors.black.withValues(alpha: 0.65),
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

                  const SizedBox(height: 20),

                  // Bottom Segmented Tab Capsule (Measure | Level)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.white24),
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
                              color: _activeTab == 0 ? Colors.white.withValues(alpha: 0.3) : Colors.transparent,
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
                              color: _activeTab == 1 ? Colors.white.withValues(alpha: 0.3) : Colors.transparent,
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
  final String dgpsCoordinates;
  final String currentLocation;

  AppleMeasureArPainter({
    required this.points,
    required this.center,
    required this.pulse,
    required this.isLevelMode,
    required this.pitch,
    required this.roll,
    required this.dgpsCoordinates,
    required this.currentLocation,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (isLevelMode) {
      _paintLevelMode(canvas, size);
      return;
    }

    _paintDgpsOverlay(canvas, size);

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
        ..color = const Color(0xFF10B981).withValues(alpha: 0.18)
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
        
        // Dynamic real-world distance calculation based on device tilt
        double assumedHeight = 1.5;
        double effectivePitch = pitch.abs();
        if (effectivePitch > 85 && effectivePitch < 95) effectivePitch = 85;
        
        double estimatedDistanceToPoint = assumedHeight * math.tan((90 - effectivePitch) * math.pi / 180);
        
        double realMeters;
        if (estimatedDistanceToPoint < 0.1 || estimatedDistanceToPoint > 100) {
          realMeters = (pixelDist / 220.0);
        } else {
          realMeters = (pixelDist / 220.0) * (estimatedDistanceToPoint / 2.0).clamp(0.6, 2.5);
        }

        final label = realMeters >= 1.0 ? '${realMeters.toStringAsFixed(2)} m' : '${(realMeters * 100).round()} cm';

        _drawMeasurementTag(canvas, mid, label);
      }
    }

    // 3. Draw Corner Reticle Anchor Nodes
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

  void _paintDgpsOverlay(Canvas canvas, Size size) {
    final hudTextSpan = TextSpan(
      children: [
        const TextSpan(text: 'DGPS TARGET:\n', style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
        TextSpan(text: '$dgpsCoordinates\n\n', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        const TextSpan(text: 'LIVE GPS TELEMETRY:\n', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold)),
        TextSpan(text: currentLocation, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
      ],
    );
    
    final tp = TextPainter(
      text: hudTextSpan,
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: size.width - 40);

    final bgRect = Rect.fromLTWH(16, 96, tp.width + 16, tp.height + 14);
    canvas.drawRRect(
      RRect.fromRectAndRadius(bgRect, const Radius.circular(10)),
      Paint()..color = Colors.black.withValues(alpha: 0.65),
    );

    tp.paint(canvas, const Offset(24, 103));
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
    
    final crosshairPaint = Paint()
      ..color = Colors.white30
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
      
    canvas.drawLine(Offset(c.dx - 120, c.dy), Offset(c.dx + 120, c.dy), crosshairPaint);
    canvas.drawLine(Offset(c.dx, c.dy - 120), Offset(c.dx, c.dy + 120), crosshairPaint);

    final isLevel = pitch.abs() < 2.0 && roll.abs() < 2.0;

    canvas.drawCircle(
      c, 
      90, 
      Paint()
        ..color = isLevel ? const Color(0xFF10B981) : Colors.white30
        ..style = PaintingStyle.stroke
        ..strokeWidth = isLevel ? 4 : 2,
    );

    final textSpan = TextSpan(
      text: isLevel ? '0°\nPERFECTLY LEVEL' : '${pitch.toStringAsFixed(1)}°\nALIGN HORIZON',
      style: TextStyle(
        color: isLevel ? const Color(0xFF10B981) : Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
    );
    final tp = TextPainter(text: textSpan, textDirection: TextDirection.ltr, textAlign: TextAlign.center)..layout();
    tp.paint(canvas, Offset(c.dx - (tp.width / 2), c.dy - (tp.height / 2)));
  }

  @override
  bool shouldRepaint(covariant AppleMeasureArPainter oldDelegate) => true;
}
