# Running CDL Exam App on Android Emulator

## Quick Start

```bash
# Start the app on emulator
npx expo run:android
```

That's it! Expo will automatically:
1. Start the emulator if not running
2. Build the app
3. Install it on the emulator
4. Launch the app

---

## Prerequisites

### 1. Check if Android SDK is Installed

You already have it! (We used it to build the APK)

**Location**: `C:\Users\dhana\AppData\Local\Android\Sdk`

### 2. Check if Emulator is Set Up

Run this to see available emulators:
```bash
$env:ANDROID_HOME = "C:\Users\dhana\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds
```

---

## Option 1: Use Expo (Easiest)

### Start Development Server

```bash
# Navigate to project
cd "C:\Users\dhana\Desktop\CDL Exam"

# Start on emulator
npx expo run:android
```

**What happens:**
- Metro bundler starts
- Emulator launches automatically
- App builds and installs
- Hot reload enabled (changes update instantly)

### Benefits
✅ Fast development
✅ Hot reload
✅ Easy debugging
✅ Instant updates

---

## Option 2: Manual Emulator Control

### 1. Set Environment Variable (One Time)

```powershell
# Add to your PowerShell profile (permanent)
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\dhana\AppData\Local\Android\Sdk', 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', 'C:\Users\dhana\AppData\Local\Android\Sdk', 'User')

# Or set for current session only
$env:ANDROID_HOME = "C:\Users\dhana\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\dhana\AppData\Local\Android\Sdk"
```

### 2. List Available Emulators

```bash
& "C:\Users\dhana\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds
```

**Example output:**
```
Pixel_5_API_33
Pixel_7_API_34
```

### 3. Start Emulator

```bash
# Replace 'Pixel_5_API_33' with your emulator name
& "C:\Users\dhana\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Pixel_5_API_33
```

### 4. Install APK on Running Emulator

```bash
# Install release APK
adb install "C:\Users\dhana\Desktop\CDL Exam\android\app\build\outputs\apk\release\app-release.apk"

# Or install debug APK (if you build it)
adb install "C:\Users\dhana\Desktop\CDL Exam\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## Option 3: Android Studio (Most Features)

### 1. Open Android Studio

### 2. Open AVD Manager
- Tools → Device Manager
- Or click the device icon in toolbar

### 3. Create/Start Emulator
- Click ▶️ next to an emulator to start it
- Or create new emulator with "Create Device"

### 4. Run App
```bash
npx expo run:android
```

---

## Creating a New Emulator (If Needed)

### Using Android Studio

1. **Open AVD Manager**
   - Tools → Device Manager

2. **Create Virtual Device**
   - Click "Create Device"
   - Select device (e.g., Pixel 7)
   - Click "Next"

3. **Select System Image**
   - Choose API level (recommend API 33 or 34)
   - Download if needed
   - Click "Next"

4. **Configure AVD**
   - Name: `CDL_Test_Emulator`
   - Graphics: Hardware
   - Click "Finish"

5. **Start Emulator**
   - Click ▶️ to launch

### Using Command Line

```bash
# List available system images
& "C:\Users\dhana\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" --list

# Download system image (if needed)
& "C:\Users\dhana\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "system-images;android-33;google_apis;x86_64"

# Create emulator
& "C:\Users\dhana\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" create avd -n CDL_Test -k "system-images;android-33;google_apis;x86_64" -d pixel_5
```

---

## Development Workflow

### Recommended: Expo Development Build

```bash
# 1. Start Metro bundler
npx expo start

# 2. Press 'a' to open on Android emulator
# Or run:
npx expo run:android
```

**Features:**
- ✅ Hot reload (instant updates)
- ✅ Fast refresh
- ✅ Debug menu (shake device or Ctrl+M)
- ✅ Chrome DevTools
- ✅ Network inspector

### Debug Menu (Ctrl+M or Cmd+M)

- **Reload** - Reload the app
- **Debug** - Open Chrome DevTools
- **Change Bundle Location** - Connect to different Metro server
- **Toggle Inspector** - Inspect UI elements
- **Show Perf Monitor** - Performance metrics

---

## Testing on Emulator

### 1. Test Onboarding Fix

```bash
# Clear app data (simulate fresh install)
adb shell pm clear com.protimeworld.cdlprep

# Relaunch app
adb shell am start -n com.protimeworld.cdlprep/.MainActivity
```

### 2. Monitor Logs

```bash
# View app logs
adb logcat | grep -E "App|Onboarding|Billing|Ads"

# View crash logs
adb logcat | grep -E "FATAL|AndroidRuntime"

# Clear logs first
adb logcat -c
```

### 3. Test Different Scenarios

**Fresh Install:**
```bash
adb uninstall com.protimeworld.cdlprep
adb install app-release.apk
```

**Airplane Mode:**
- Swipe down from top
- Enable Airplane mode
- Test app

**Rotate Screen:**
- Ctrl+Left/Right arrow

**Take Screenshot:**
- Camera icon in emulator toolbar

---

## Troubleshooting

### Emulator Won't Start

**Check if HAXM/Hyper-V is enabled:**
```bash
# Check virtualization
systeminfo | findstr /C:"Hyper-V"
```

**Solution:**
- Enable Hyper-V in Windows Features
- Or install Intel HAXM for older systems

### "No Emulators Found"

```bash
# List emulators
& "C:\Users\dhana\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds

# If empty, create one using Android Studio
```

### App Won't Install

```bash
# Uninstall old version first
adb uninstall com.protimeworld.cdlprep

# Then install
adb install app-release.apk
```

### Emulator is Slow

**Speed up emulator:**
1. Use x86_64 system image (not ARM)
2. Enable hardware acceleration
3. Allocate more RAM in AVD settings
4. Use "Cold Boot" instead of "Quick Boot"

---

## Quick Commands Reference

```bash
# Start app on emulator (development)
npx expo run:android

# List emulators
& "C:\Users\dhana\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds

# Start specific emulator
& "C:\Users\dhana\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd EMULATOR_NAME

# Install APK
adb install path\to\app.apk

# Uninstall app
adb uninstall com.protimeworld.cdlprep

# Clear app data
adb shell pm clear com.protimeworld.cdlprep

# View logs
adb logcat | grep -E "App|Onboarding"

# Take screenshot
adb exec-out screencap -p > screenshot.png
```

---

## Recommended Setup for Testing

### 1. Create Test Script

Create `run-emulator.bat`:
```batch
@echo off
echo Starting Android Emulator...
set ANDROID_HOME=C:\Users\dhana\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\dhana\AppData\Local\Android\Sdk

REM Start emulator (replace with your emulator name)
start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_5_API_33

REM Wait for emulator to boot
timeout /t 30

REM Start Metro bundler
cd "C:\Users\dhana\Desktop\CDL Exam"
npx expo start
```

### 2. One-Command Testing

```bash
# Just run this!
.\run-emulator.bat
```

---

## Summary

**Fastest way to test:**
```bash
npx expo run:android
```

**For release testing:**
1. Start emulator manually
2. Install APK: `adb install app-release.apk`
3. Monitor logs: `adb logcat`

**Benefits of emulator:**
- ✅ Faster than building APK
- ✅ Hot reload for development
- ✅ Easy debugging
- ✅ No need for physical device
- ✅ Can test different Android versions

Ready to test your onboarding fix on the emulator!
