# ARCore & Sceneform
-keep class com.google.ar.core.** { *; }
-keep interface com.google.ar.core.** { *; }
-dontwarn com.google.ar.core.**

-keep class com.google.ar.sceneform.** { *; }
-keep interface com.google.ar.sceneform.** { *; }
-dontwarn com.google.ar.sceneform.**

-dontwarn com.google.devtools.build.android.desugar.runtime.**
-dontwarn com.google.ar.sceneform.animation.**
-dontwarn com.google.ar.sceneform.assets.**
