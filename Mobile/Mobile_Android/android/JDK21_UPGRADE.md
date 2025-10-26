# Java 21 Upgrade (Android module)

This project has been updated to target Java 21 (LTS). This document explains how to install JDK 21 on Windows, configure the environment for Gradle/Android builds, and verify the setup.

## What changed
- `android/app/build.gradle.kts` now sets:
  - `sourceCompatibility = JavaVersion.VERSION_21`
  - `targetCompatibility = JavaVersion.VERSION_21`
  - `kotlinOptions.jvmTarget = JavaVersion.VERSION_21.toString()`

## Install JDK 21 on Windows
1. Download an OpenJDK 21 build (Adoptium / Temurin or another vendor):
   - https://adoptium.net/ or https://jdk.java.net/21/
2. Run the installer and install to a path such as `C:\jdk-21`.

## Configure environment variables (PowerShell)
Run these commands in an elevated PowerShell or add them via System Properties > Environment Variables:

```powershell
setx JAVA_HOME "C:\jdk-21"
setx PATH "$env:JAVA_HOME\bin;$env:PATH"
```

After running `setx`, open a new terminal session to pick up the changes.

## Verify installation
In a new PowerShell window run:

```powershell
java -version
javac -version
```

You should see output indicating Java 21 (for example: `openjdk version "21" ...`).

## Gradle compatibility notes
- The project currently uses Gradle `8.12` via `gradle-wrapper.properties`. Gradle 8.x supports newer Java versions; Gradle 8.12 should work with Java 21 but if you run into compatibility issues consider upgrading the Gradle wrapper to a newer compatible release.
- If Gradle fails due to toolchain configuration, you can configure the Gradle JVM toolchain in `build.gradle.kts` using `java { toolchain { languageVersion.set(JavaLanguageVersion.of(21)) } }`.

## Optional: configure Gradle toolchain (recommended)
Add the following under `android` or top-level `subprojects` if you prefer toolchain-managed compilation:

```kotlin
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}
```

This allows Gradle to use a matching JDK automatically if available.

## Troubleshooting
- If Android Gradle Plugin (AGP) versions are older and incompatible with Java 21, update AGP in `settings.gradle.kts`/`build.gradle.kts` plugin versions (check the `plugins` block in `settings.gradle.kts`).
- If Kotlin version complains about unsupported `jvmTarget`, ensure the `org.jetbrains.kotlin` plugin version supports `21` (Kotlin 1.8+ generally supports newer jvm targets; update if necessary).

If you want, I can:
- Add the Gradle `java.toolchain` configuration into the project automatically.
- Attempt to run a Gradle build to surface compatibility errors and iterate fixes.

*** End of document ***