# Release Notes - v1.0.8 (Build 10)

**Release Date:** October 27, 2026  
**Package:** `com.protimeworld.cdl`  
**Version:** `1.0.8`  
**Version Code:** `10`  
**Platform:** Android (Google Play Store)

---

## 📱 Google Play Console "What's New" (Ready to Paste)

### English (United States) - en-US (Max 500 characters)
```text
What's new in v1.0.8:
• Enhanced Ad Experience: Now powered by Google AdMob, Meta Audience Network, and Unity Ads mediation for seamless loading.
• Free Highway Fuel: Watch a quick rewarded video to replenish all 5 fuel tanks and keep studying without pauses!
• Ad Privacy & Choices: Added a direct GDPR & privacy options manager in Settings.
• Performance & Stability: Memory leak fixes in rewarded ads and optimized exam results loading.
• 2026 CDL Exam questions updated.
```

---

## 🚀 Highlights & New Features

### 1. Multi-Network Ad Mediation (AdMob + Meta + Unity)
- Integrated **Meta Audience Network (Facebook Ads)** and **Unity Ads SDK** via Google AdMob Mediation.
- Real-time bidding and waterfall auctions ensure faster ad fill rates and top-tier advertiser quality.
- Embedded custom Unity Maven repository and ProGuard / R8 preservation rules for rock-solid release builds.

### 2. Live Mediation Ad Inspector
- Added the **Mediation Ad Inspector** under **Settings > Other**.
- Test live mediation adapters directly on any Android device or emulator without needing special developer builds.

### 3. Rewarded Video "Refuel" Feature
- Drivers running low on game fuel can now choose **"Watch Ad to Refill All Tanks"** inside the Highway Fuel modal to instantly restore all 5 tanks.
- Clean event listener lifecycle management guarantees zero memory leaks or unhandled callbacks.

### 4. GDPR / UMP Privacy Management
- Added **"Ad Privacy & Consent Choices"** in **Settings > Legal**, allowing European Union (GDPR) and US users to review, customize, or revoke consent choices at any time.

### 5. Pro Member Protection & Policy Compliance
- Verified strict exclusion of all interstitial and banner ads for active Pro/Premium members.
- Banner ad containers collapse gracefully to 0px height if fill fails (avoiding empty layout gaps per Google Play policies).
- 2-minute frequency capping on full-screen interstitial ads after practice exams to prevent user annoyance.
- Fully verified `app-ads.txt` records for Google, Meta (`facebook.com`), and Unity (`unityads.unity3d.com`).

---

## 🛠️ Build & Verification Checklist

- [x] `package.json` updated to `1.0.8`
- [x] `app.json` updated to `version: "1.0.8"`, `versionCode: 10`
- [x] `android/app/build.gradle` updated to `versionName "1.0.8"`, `versionCode 10`
- [x] In-app settings updated to display version `1.0.8`
- [x] TypeScript validation (`npx tsc --noEmit`): **Passed (0 errors)**
- [x] Jest automated tests (`npm test`): **Passed (5/5 suites, 19/19 tests)**

---

## 📦 How to Build the Release APK / AAB

### To build Release APK locally:
```powershell
.\build-release.bat
```
or via Gradle directly:
```powershell
cd android
.\gradlew.bat assembleRelease
```
The output will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

### To build Android App Bundle (.aab) for Google Play:
```powershell
cd android
.\gradlew.bat bundleRelease
```
The output bundle will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`
