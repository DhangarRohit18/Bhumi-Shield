import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAEZ6Tiz3-6xZRAiBXj99dFgSxDGhXGDSw',
    appId: '1:740135530786:web:e06c73696ce34abc92f57b',
    messagingSenderId: '740135530786',
    projectId: 'dataaq-69662',
    authDomain: 'dataaq-69662.firebaseapp.com',
    storageBucket: 'dataaq-69662.firebasestorage.app',
    measurementId: 'G-EGRLSRT6T8',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCkxW9pphAAKbEOrOfo8ObMq2oMEAihoZw',
    appId: '1:740135530786:android:27a61e6fe14081b692f57b',
    messagingSenderId: '740135530786',
    projectId: 'dataaq-69662',
    storageBucket: 'dataaq-69662.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAEZ6Tiz3-6xZRAiBXj99dFgSxDGhXGDSw',
    appId: '1:740135530786:ios:e06c73696ce34abc92f57b',
    messagingSenderId: '740135530786',
    projectId: 'dataaq-69662',
    storageBucket: 'dataaq-69662.firebasestorage.app',
    iosBundleId: 'com.bhumishield.bhumiShield',
  );
}
