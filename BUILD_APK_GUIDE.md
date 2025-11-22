# Building APK for CDL Hazmat & Brakes 2025

## Option 1: EAS Build (Recommended - Cloud Build)

### Step 1: Create New EAS Project

Since you changed the package name, you need to create a new EAS project:

```bash
# Remove old EAS project ID
# Edit app.json and remove the "eas" section under "extra"
```

Then run:
```bash
npx eas build:configure
npx eas build --profile preview-apk --platform android
```

This will:
- Create a new EAS project
- Build the APK in the cloud
- Provide a download link when complete

**Advantages**:
- No local Android SDK needed
- Builds in the cloud
- Automatic signing
- Easy to share download link

---

## Option 2: Local Gradle Build

### Prerequisites

You need:
1. Android Studio installed
2. Android SDK configured
3. Java JDK 17 or higher

### Build Debug APK (No Signing Required)

```bash
cd android
./gradlew assembleDebug
```

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Build Release APK (Requires Signing)

1. **Generate Keystore** (first time only):
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing** in `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'my-key-alias'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Build**:
```bash
cd android
./gradlew assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Option 3: EAS Build with New Project (Easiest)

### Step 1: Update app.json

Remove the EAS project ID to create a new one:

```json
"extra": {
  "router": {}
  // Remove the "eas" section
}
```

### Step 2: Run EAS Build

```bash
npx eas build --profile preview-apk --platform android --local
```

This builds locally without cloud (faster for testing).

---

## Recommended Approach for You

Since you need an APK quickly and the package name changed, I recommend:

### Quick Method: EAS Build (New Project)

1. **Edit app.json** - Remove EAS project ID:

```json
"extra": {
  "router": {}
}
```

2. **Run build**:
```bash
npx eas build --profile preview-apk --platform android
```

3. **Follow prompts**:
   - Create new project? **Yes**
   - Generate new Android keystore? **Yes**
   - Wait for build to complete (~10-15 minutes)

4. **Download APK**:
   - EAS will provide a download link
   - Or check: https://expo.dev/accounts/[your-account]/projects/cdl-hazmat-brakes/builds

---

## After Building

### Install APK on Device

1. **Transfer APK to phone**:
   - Email it to yourself
   - Use Google Drive
   - Use USB cable

2. **Enable Unknown Sources**:
   - Settings → Security → Unknown Sources → Enable

3. **Install**:
   - Tap the APK file
   - Follow installation prompts

### Test Checklist

- [ ] App opens without crashing
- [ ] Title shows "CDL Hazmat & Brakes 2025"
- [ ] Package name is com.protimeworld.cdlprep
- [ ] Billing initializes (check logs)
- [ ] Ads show for free users
- [ ] Paywall displays correctly

---

## Troubleshooting

### "Slug mismatch" Error

**Problem**: Old EAS project ID doesn't match new slug

**Solution**: Remove EAS project ID from app.json:
```json
"extra": {
  "router": {}
}
```

### "Android SDK not found"

**Problem**: Local build requires Android SDK

**Solution**: Use EAS cloud build instead:
```bash
npx eas build --profile preview-apk --platform android
```

### "Keystore required"

**Problem**: Release builds need signing

**Solution**: 
- Use debug build for testing: `assembleDebug`
- Or let EAS generate keystore automatically

---

## Next Steps After APK

1. **Test on Device**: Install and test all features
2. **Upload to Google Play Console**: 
   - Go to "One-time products" (as shown in your screenshot)
   - First upload APK/AAB
   - Then create in-app products
3. **Configure Billing**: Create `cdl_prep_premium_unlock` product
4. **Set up AdMob**: Get real ad unit IDs
5. **Update Configuration**: Replace test IDs with real ones

---

## Google Play Console Note

I see from your screenshot that you need to upload an APK first before creating in-app products. The message says:

> "To add one-time products, you need to add the BILLING permission to your APK"

This is already done in app.json! Once you upload the APK, you'll be able to create the in-app product.

---

## Quick Command Reference

```bash
# EAS Build (Cloud - Recommended)
npx eas build --profile preview-apk --platform android

# EAS Build (Local)
npx eas build --profile preview-apk --platform android --local

# Gradle Debug Build
cd android && ./gradlew assembleDebug

# Gradle Release Build
cd android && ./gradlew assembleRelease

# Find APK
# Debug: android/app/build/outputs/apk/debug/app-debug.apk
# Release: android/app/build/outputs/apk/release/app-release.apk
```
