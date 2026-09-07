# BHUMI-SHIELD AR

**BHUMI-SHIELD AR** is a dedicated Android mobile application developed as part of the **BHUMI-SHIELD** land acquisition monitoring and decision-support system (Smart India Hackathon). 

The mobile application empowers field officers to perform AR-based field verification, comparing official cadastral parcel boundaries with real-world physical ground realities and capturing geotagged evidence offline.

---

## 📌 Phase 0 Scope

Phase 0 establishes the **clean development foundation** for the project. No premature feature implementation or mock systems are included.

### Included in Phase 0:
- ✅ Modern Android Studio project setup with **Gradle Kotlin DSL**.
- ✅ Foundational project package structure (`com.bhumishield.ar`).
- ✅ Configured dependency catalog for Google ARCore, Fused Location Provider, CameraX, ML Kit Barcode Scanning, Room, Retrofit, Kotlin Coroutines, and Timber logging.
- ✅ Clean MVVM + Repository abstractions for location services, AR engine, parcel data, and verification records.
- ✅ Basic Jetpack Compose screen rendering **BHUMI-SHIELD AR**, **AR Field Verification**, and **Status: App Ready**.
- ✅ Modular location interface designed to support smartphone GPS initially and external GNSS/RTK/DGPS hardware in future phases.

### Explicitly Excluded in Phase 0:
- ❌ AR spatial parcel rendering / overlays.
- ❌ Camera preview / CameraX integration.
- ❌ QR code scanning (ML Kit).
- ❌ Room database tables and DAOs.
- ❌ Retrofit REST API network endpoints.
- ❌ IoT hardware integration.
- ❌ Authentication / Backend / Microservices.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Platform** | Android (minSdk 26, targetSdk 34) |
| **Language** | Kotlin 2.0 |
| **UI Framework** | Jetpack Compose (Material 3) |
| **Build System** | Gradle Kotlin DSL (`build.gradle.kts`) with Version Catalog (`libs.versions.toml`) |
| **Architecture** | MVVM + Repository Pattern |
| **AR Engine** | Google ARCore (configured) |
| **Location** | Android / Google Fused Location Provider (abstracted for future RTK/DGPS) |
| **Camera & Evidence** | CameraX (configured) |
| **QR Code** | Google ML Kit Barcode Scanning (configured) |
| **Local Persistence** | Room (configured) |
| **Networking** | Retrofit + OkHttp (configured) |
| **Asynchrony** | Kotlin Coroutines + Flow |
| **Logging** | Timber |

---

## 📁 Project Structure

```text
com.bhumishield.ar
├── BhumiShieldApp.kt               # Custom Application class & Timber logger setup
├── MainActivity.kt                 # Activity host for Jetpack Compose UI
├── ui/
│   ├── theme/
│   │   ├── Color.kt                # Material 3 color definitions
│   │   ├── Type.kt                 # Typography definitions
│   │   └── Theme.kt                # Light / Dark theme configurations
│   └── screens/
│       └── HomeScreen.kt           # Minimal Phase 0 Jetpack Compose screen
├── ar/
│   └── ArEngineManager.kt          # Abstraction for ARCore session & coordinate transformations
├── location/
│   └── PositionSource.kt           # Abstract location interface (Smartphone GPS / future RTK)
├── parcel/
│   └── ParcelRepository.kt         # Cadastral parcel geometry & metadata interface
├── verification/
│   └── VerificationRecord.kt       # Field evidence data model & repository interface
└── util/
    └── AppLogger.kt                # Logging wrapper around Timber
```

---

## 🚀 How to Build

### Prerequisites
1. **JDK 17** or higher installed.
2. **Android Studio** (Panda / Ladybug / Jellyfish or newer recommended).
3. **Android SDK Platform 34** and Build-Tools installed via Android Studio SDK Manager.

### Building via Command Line
Run the Gradle wrapper assemble command:

```powershell
# Windows
.\gradlew.bat assembleDebug

# macOS / Linux
./gradlew assembleDebug
```

The compiled APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 How to Run on a Physical Android Phone

1. **Enable Developer Options & USB Debugging** on your Android device:
   - Go to **Settings > About Phone** -> Tap **Build Number** 7 times.
   - Go to **Settings > System > Developer Options** -> Enable **USB Debugging**.
2. **Connect your phone** to your computer via USB.
3. **Verify Device Connection**:
   ```powershell
   adb devices
   ```
   *(Ensure your device appears with `device` status)*.
4. **Install & Run via Android Studio**:
   - Open `BhumiShieldAR` in Android Studio.
   - Select your physical device from the target device dropdown at the top toolbar.
   - Click the green **Run ▶** button (`Shift + F10`).
5. **Install via Command Line (Alternative)**:
   ```powershell
   .\gradlew.bat installDebug
   ```

---

## 🔮 Phase 1 Preview (Next Steps)

In Phase 1, the following features will be introduced:
1. **CameraX & AR Foundation**: Integrating camera permission requests and displaying the active camera feed.
2. **QR Code Scanning**: Utilizing ML Kit to scan physical boundary pillar QR codes.
3. **Fused Location Integration**: Hooking up real-time smartphone GPS coordinates into `PositionSource`.
4. **Local Parcel Storage**: Implementing Room database entities and DAOs for offline parcel caching.
5. **Initial Boundary Coordinate Rendering**: Processing WGS84 parcel boundary coordinates into local ENU space.
