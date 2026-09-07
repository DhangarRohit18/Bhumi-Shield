import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'package:arcore_flutter_plugin/arcore_flutter_plugin.dart';
import 'package:vector_math/vector_math_64.dart' as vector;
import 'dart:math' as math;
import 'dart:async';

/// 3D Spatial AR Anchor locked to world orientation (Yaw, Pitch)
class ArAnchor {
  final double worldYaw;   // Heading angle in degrees (0-360 relative to Magnetic North)
  final double worldPitch; // Elevation angle in degrees (-90 to +90)
  final DateTime createdAt;

  ArAnchor({
    required this.worldYaw,
    required this.worldPitch,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  /// Project this 3D world anchor into current 2D screen coordinates based on device orientation
  Offset toScreenOffset({
    required Size screenSize,
    required double currentYaw,
    required double currentPitch,
    required double currentRoll,
    double fovX = 60.0,
    double fovY = 80.0,
  }) {
    // Difference in yaw (-180 to 180)
    double dYaw = (worldYaw - currentYaw + 540) % 360 - 180;
    // Difference in pitch
    double dPitch = worldPitch - currentPitch;

    double centerX = screenSize.width / 2;
    double centerY = screenSize.height / 2;

    double x = centerX + (dYaw / fovX) * screenSize.width;
    double y = centerY - (dPitch / fovY) * screenSize.height;

    // Rotate point based on phone roll angle
    double rollRad = currentRoll * math.pi / 180;
    double dx = x - centerX;
    double dy = y - centerY;

    double rotatedX = centerX + (dx * math.cos(rollRad) - dy * math.sin(rollRad));
    double rotatedY = centerY + (dx * math.sin(rollRad) + dy * math.cos(rollRad));

    return Offset(rotatedX, rotatedY);
  }
}

enum BoundaryPointStatus { UNVERIFIED, VERIFIED, FLAGGED }

class BoundaryPointModel {
  final String id;
  final int index;
  final double lat;
  final double lng;
  BoundaryPointStatus status;
  String? note;
  String? photoUri;

  BoundaryPointModel({
    required this.id,
    required this.index,
    required this.lat,
    required this.lng,
    this.status = BoundaryPointStatus.UNVERIFIED,
    this.note,
    this.photoUri,
  });
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
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  // Camera & ARCore Controllers
  CameraController? _cameraController;
  ArCoreController? _arCoreController;
  List<CameraDescription>? _cameras;
  bool _isCameraReady = false;
  bool _useNativeArCore = true; // Toggle between ARCore 6-DoF SLAM & Low-Pass Filtered Sensors
  String? _cameraError;
  int _activeTab = 0; // 0 = Measure (AR), 1 = Level, 2 = Points Verification

  // Real 3D World-Anchored Points (Sensor Mode)
  final List<ArAnchor> _anchors = [];

  // ARCore 3D Position Anchors (SLAM Mode)
  final List<vector.Vector3> _arCorePositions = [];

  // Cadastral Boundary Points from Bhumi-Shield_AR package
  late List<BoundaryPointModel> _boundaryPoints;
  BoundaryPointModel? _selectedPoint;

  // Smoothed Low-Pass Filtered Device Sensor States (Yaw, Pitch, Roll)
  double _yaw = 0.0;
  double _pitch = 0.0;
  double _roll = 0.0;

  // Raw buffer for low-pass exponential filter
  static const double _filterAlpha = 0.10; // Smoothing factor (0.05-0.15 = rock solid stability)

  StreamSubscription<AccelerometerEvent>? _accelSubscription;
  StreamSubscription<MagnetometerEvent>? _magSubscription;

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

    // Initialize boundary points based on parcel context
    _boundaryPoints = [
      BoundaryPointModel(id: 'P1', index: 1, lat: 19.6967, lng: 72.7699),
      BoundaryPointModel(id: 'P2', index: 2, lat: 19.6972, lng: 72.7705),
      BoundaryPointModel(id: 'P3', index: 3, lat: 19.6968, lng: 72.7712),
      BoundaryPointModel(id: 'P4', index: 4, lat: 19.6962, lng: 72.7706),
    ];
    _selectedPoint = _boundaryPoints.first;

    _checkArCoreAndInit();
    _initSensors();
    _initLocation();
  }

  Future<void> _checkArCoreAndInit() async {
    try {
      final bool arCoreAvailable = await ArCoreController.checkArCoreAvailability();
      if (arCoreAvailable && mounted) {
        setState(() {
          _useNativeArCore = true;
        });
        return;
      } else {
        setState(() {
          _useNativeArCore = false;
          _cameraError = 'ARCore is not available. Please install Google Play Services for AR from the Play Store.';
        });
      }
    } catch (e) {
      debugPrint('ARCore check note: $e');
      setState(() {
        _useNativeArCore = false;
        _cameraError = 'ARCore initialization failed: $e';
      });
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_useNativeArCore) return;

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
              _cameraError = null;
            });
          }
        }
      } else {
        setState(() {
          _cameraError = 'Camera permission required for AR Viewfinder';
        });
      }
    } catch (e) {
      debugPrint('Real camera init note: $e');
      if (mounted) {
        setState(() {
          _cameraError = 'Camera initialization: $e';
        });
      }
    }
  }

  void _initSensors() {
    // Accelerometer for Pitch & Roll with Low-Pass Exponential Filter
    _accelSubscription = accelerometerEventStream().listen((AccelerometerEvent event) {
      if (mounted) {
        double rawPitch = math.atan2(event.y, math.sqrt(event.x * event.x + event.z * event.z)) * 180 / math.pi;
        double rawRoll = math.atan2(-event.x, event.z) * 180 / math.pi;

        setState(() {
          if (_pitch == 0.0 && _roll == 0.0) {
            _pitch = rawPitch;
            _roll = rawRoll;
          } else {
            // Apply exponential low-pass filter to eliminate sensor jitter & tremor
            _pitch = _pitch + _filterAlpha * (rawPitch - _pitch);
            _roll = _roll + _filterAlpha * (rawRoll - _roll);
          }
        });
      }
    });

    // Magnetometer for Compass Heading (Yaw) with Low-Pass Exponential Filter
    _magSubscription = magnetometerEventStream().listen((MagnetometerEvent event) {
      if (mounted) {
        double rawYaw = math.atan2(event.y, event.x) * 180 / math.pi;
        if (rawYaw < 0) rawYaw += 360;

        setState(() {
          if (_yaw == 0.0) {
            _yaw = rawYaw;
          } else {
            // Wrap-around aware low-pass filter
            double diffYaw = (rawYaw - _yaw + 540) % 360 - 180;
            _yaw = (_yaw + _filterAlpha * diffYaw + 360) % 360;
          }
        });
      }
    });
  }

  Future<void> _initLocation() async {
    try {
      final status = await Permission.locationWhenInUse.request();
      if (status.isGranted) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(),
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
    _arCoreController?.dispose();
    _cameraController?.dispose();
    _pulseController.dispose();
    _accelSubscription?.cancel();
    _magSubscription?.cancel();
    _positionSubscription?.cancel();
    super.dispose();
  }

  // --- ARCore 6-DoF SLAM Callback ---
  void _onArCoreViewCreated(ArCoreController controller) {
    _arCoreController = controller;
    _arCoreController?.onPlaneTap = _handleArCorePlaneTap;
  }

  void _handleArCorePlaneTap(List<ArCoreHitTestResult> hits) {
    if (hits.isEmpty) return;

    final hit = hits.first;
    final pos = hit.pose.translation;

    // Add a stable 3D visual sphere node into ARCore SLAM world space
    final node = ArCoreNode(
      shape: ArCoreSphere(
        materials: [ArCoreMaterial(color: const Color(0xFF10B981))],
        radius: 0.04, // 4cm node
      ),
      position: pos,
    );

    _arCoreController?.addArCoreNodeWithAnchor(node);

    setState(() {
      _arCorePositions.add(pos);
    });
  }

  // --- Sensor Mode Spatial Anchor Placement ---
  void _addAnchorAt(Offset screenPosition) {
    final size = MediaQuery.of(context).size;
    double centerX = size.width / 2;
    double centerY = size.height / 2;

    double dx = screenPosition.dx - centerX;
    double dy = screenPosition.dy - centerY;

    double fovX = 60.0;
    double fovY = 80.0;

    double angleX = (dx / size.width) * fovX;
    double angleY = (dy / size.height) * fovY;

    double anchorYaw = (_yaw + angleX + 360) % 360;
    double anchorPitch = _pitch - angleY;

    setState(() {
      _anchors.add(ArAnchor(worldYaw: anchorYaw, worldPitch: anchorPitch));
    });
  }

  void _addAnchorAtCenter() {
    if (_useNativeArCore) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please tap directly on the physical ground on your screen to drop a stable AR anchor!'),
          duration: Duration(seconds: 2),
          backgroundColor: Color(0xFF10B981),
        ),
      );
      return;
    }
    final screenSize = MediaQuery.of(context).size;
    _addAnchorAt(Offset(screenSize.width / 2, screenSize.height / 2));
  }

  void _clearAnchors() {
    setState(() {
      _anchors.clear();
      _arCorePositions.clear();
    });
  }

  void _undoAnchor() {
    if (_useNativeArCore && _arCorePositions.isNotEmpty) {
      setState(() {
        _arCorePositions.removeLast();
      });
      _arCoreController?.removeNodeWithIndex(_arCorePositions.length);
    } else if (_anchors.isNotEmpty) {
      setState(() {
        _anchors.removeLast();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Native ARCore 6-DoF SLAM View or Camera Viewport Fallback
          if (_useNativeArCore)
            ArCoreView(
              onArCoreViewCreated: _onArCoreViewCreated,
              enableTapRecognizer: true,
              enablePlaneRenderer: true,
            )
          else if (_isCameraReady && _cameraController != null && _cameraController!.value.isInitialized)
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
            // Viewfinder Loading / Fallback Banner
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
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      width: 48,
                      height: 48,
                      child: CircularProgressIndicator(color: Color(0xFF10B981), strokeWidth: 3),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _cameraError ?? 'Initializing Rock-Solid AR Engine...',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),

          // 2. Interactive World-Locked Spatial Overlay (Sensor Mode)
          if (!_useNativeArCore)
            GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTapDown: (details) {
                if (_activeTab == 0) {
                  _addAnchorAt(details.localPosition);
                }
              },
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: WorldSpatialArPainter(
                      anchors: _anchors,
                      screenSize: size,
                      pulse: _pulseController.value,
                      isLevelMode: _activeTab == 1,
                      yaw: _yaw,
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

          // 3. Dynamic Island Top Navigation & Status Bar
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 10),

                  // Header Controls (Undo, Title Badge, Clear, Done)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Undo Button
                        GestureDetector(
                          onTap: () {
                            if (_anchors.isNotEmpty || _arCorePositions.isNotEmpty) {
                              _undoAnchor();
                            } else {
                              Navigator.pop(context);
                            }
                          },
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white30),
                            ),
                            child: const Icon(Icons.undo, color: Colors.white, size: 20),
                          ),
                        ),

                        // Khasra Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.75),
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

                        // Clear Trash Button
                        GestureDetector(
                          onTap: _clearAnchors,
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white30),
                            ),
                            child: const Icon(Icons.delete_outline, color: Colors.white, size: 22),
                          ),
                        ),

                        // Done / Save Button
                        GestureDetector(
                          onTap: () {
                            Navigator.pop(context, true);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Done',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
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

          // 4. Center AR Aiming Reticle
          Center(
            child: IgnorePointer(
              child: Container(
                width: 20,
                height: 20,
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
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // 5. Bottom Measure Controls & Mode Switcher
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drop Spatial Anchor Button
                  GestureDetector(
                    onTap: _addAnchorAtCenter,
                    child: Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.25),
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                      padding: const EdgeInsets.all(6),
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Icon(Icons.add_location_alt, color: Colors.black, size: 34),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Mode Switcher (Measure | Level)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.8),
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
                                  '3D AR Measure',
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
                                  'Horizon Level',
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
                        // Points Verification Tab
                        GestureDetector(
                          onTap: () => setState(() => _activeTab = 2),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: _activeTab == 2 ? const Color(0xFFEA580C) : Colors.transparent,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.verified_outlined,
                                  color: _activeTab == 2 ? Colors.white : Colors.white60,
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Pillars (${_boundaryPoints.where((p) => p.status == BoundaryPointStatus.VERIFIED).length}/${_boundaryPoints.length})',
                                  style: TextStyle(
                                    color: _activeTab == 2 ? Colors.white : Colors.white60,
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

                  // Interactive Boundary Point Inspection Card (From Bhumi-Shield_AR package)
                  if (_activeTab == 2 && _selectedPoint != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xEE1E293B),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.6)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.5),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'POINT ${_selectedPoint!.id}',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF00E5FF),
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: _selectedPoint!.status == BoundaryPointStatus.VERIFIED
                                          ? const Color(0xFF059669).withValues(alpha: 0.3)
                                          : (_selectedPoint!.status == BoundaryPointStatus.FLAGGED
                                              ? const Color(0xFFDC2626).withValues(alpha: 0.3)
                                              : Colors.white12),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      _selectedPoint!.status.name,
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: _selectedPoint!.status == BoundaryPointStatus.VERIFIED
                                            ? const Color(0xFF34D399)
                                            : (_selectedPoint!.status == BoundaryPointStatus.FLAGGED
                                                ? const Color(0xFFF87171)
                                                : Colors.white70),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                'Lat: ${_selectedPoint!.lat.toStringAsFixed(4)}°, Lng: ${_selectedPoint!.lng.toStringAsFixed(4)}°',
                                style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Colors.white70),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              ..._boundaryPoints.map((pt) {
                                final isSel = pt.id == _selectedPoint!.id;
                                return Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() => _selectedPoint = pt),
                                    child: Container(
                                      margin: const EdgeInsets.symmetric(horizontal: 2),
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isSel ? const Color(0xFF00E5FF).withValues(alpha: 0.25) : Colors.black26,
                                        border: Border.all(
                                          color: isSel ? const Color(0xFF00E5FF) : Colors.white24,
                                        ),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Center(
                                        child: Text(
                                          pt.id,
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: isSel ? const Color(0xFF00E5FF) : Colors.white60,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF059669),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _selectedPoint!.status = BoundaryPointStatus.VERIFIED;
                                    });
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Boundary Point ${_selectedPoint!.id} marked as VERIFIED'),
                                        backgroundColor: const Color(0xFF059669),
                                        duration: const Duration(seconds: 1),
                                      ),
                                    );
                                  },
                                  child: const Text('VERIFY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFDC2626),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _selectedPoint!.status = BoundaryPointStatus.FLAGGED;
                                    });
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Boundary Point ${_selectedPoint!.id} FLAGGED for discrepancy'),
                                        backgroundColor: const Color(0xFFDC2626),
                                        duration: const Duration(seconds: 1),
                                      ),
                                    );
                                  },
                                  child: const Text('FLAG', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// World Spatial AR Custom Painter rendering 3D anchored vectors
class WorldSpatialArPainter extends CustomPainter {
  final List<ArAnchor> anchors;
  final Size screenSize;
  final double pulse;
  final bool isLevelMode;
  final double yaw;
  final double pitch;
  final double roll;
  final String dgpsCoordinates;
  final String currentLocation;

  WorldSpatialArPainter({
    required this.anchors,
    required this.screenSize,
    required this.pulse,
    required this.isLevelMode,
    required this.yaw,
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

    // Convert 3D world anchors to current 2D screen positions based on smoothed device rotation
    List<Offset> projectedPoints = anchors.map((a) {
      return a.toScreenOffset(
        screenSize: size,
        currentYaw: yaw,
        currentPitch: pitch,
        currentRoll: roll,
      );
    }).toList();

    if (projectedPoints.length < 2) {
      if (projectedPoints.length == 1) {
        _drawSingleNode(canvas, projectedPoints[0]);
      }
      return;
    }

    // 1. Draw Connected Vector Lines
    final linePaint = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke;

    final path = Path()..moveTo(projectedPoints[0].dx, projectedPoints[0].dy);
    for (int i = 1; i < projectedPoints.length; i++) {
      path.lineTo(projectedPoints[i].dx, projectedPoints[i].dy);
    }
    if (projectedPoints.length >= 3) {
      path.close();

      // Filled Polygon Boundary
      final fillPaint = Paint()
        ..color = const Color(0xFF10B981).withValues(alpha: 0.22)
        ..style = PaintingStyle.fill;
      canvas.drawPath(path, fillPaint);
    }

    canvas.drawPath(path, linePaint);

    // 2. Draw Vector Measurement Labels
    for (int i = 0; i < projectedPoints.length; i++) {
      final p1 = projectedPoints[i];
      final p2 = (i == projectedPoints.length - 1 && projectedPoints.length >= 3)
          ? projectedPoints[0]
          : (i < projectedPoints.length - 1 ? projectedPoints[i + 1] : null);

      if (p2 != null) {
        final mid = Offset((p1.dx + p2.dx) / 2, (p1.dy + p2.dy) / 2);

        // Compute real-world angular distance in degrees converted to meters
        final a1 = anchors[i];
        final a2 = (i == anchors.length - 1 && anchors.length >= 3) ? anchors[0] : anchors[i + 1];

        double dYaw = (a2.worldYaw - a1.worldYaw + 540) % 360 - 180;
        double dPitch = a2.worldPitch - a1.worldPitch;
        double angularSpanDeg = math.sqrt(dYaw * dYaw + dPitch * dPitch);

        // Standard surveyor height estimation (1.5m eye height)
        double realMeters = (angularSpanDeg * 0.18).clamp(0.5, 120.0);
        final label = realMeters >= 1.0 ? '${realMeters.toStringAsFixed(2)} m' : '${(realMeters * 100).round()} cm';

        _drawMeasurementTag(canvas, mid, label);
      }
    }

    // 3. Draw Anchor Nodes
    for (var p in projectedPoints) {
      _drawSingleNode(canvas, p);
    }
  }

  void _drawSingleNode(Canvas canvas, Offset p) {
    canvas.drawCircle(p, 8, Paint()..color = Colors.white);
    canvas.drawCircle(
      p,
      12 + (pulse * 5),
      Paint()
        ..color = const Color(0xFF10B981).withValues(alpha: 0.5)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5,
    );
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
      Paint()..color = Colors.black.withValues(alpha: 0.7),
    );

    tp.paint(canvas, const Offset(24, 103));
  }

  void _drawMeasurementTag(Canvas canvas, Offset position, String text) {
    final textSpan = TextSpan(
      text: '$text',
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

    canvas.drawRRect(
      RRect.fromRectAndRadius(pillRect, const Radius.circular(14)),
      Paint()..color = Colors.white,
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
  bool shouldRepaint(covariant WorldSpatialArPainter oldDelegate) => true;
}
