# Ad Implementation & Mediation Guide (AdMob + Meta + Unity)

## 1. Overview & Setup

The app uses **Google Mobile Ads (AdMob)** as the primary mediation hub, orchestrating ads across:
1. **Google AdMob Network**
2. **Meta Audience Network (Facebook Ads)** (via Google Mediation Adapter)
3. **Unity Ads** (via Google Mediation Adapter)

By integrating Meta and Unity through AdMob mediation, you get real-time bidding and waterfall optimization: Google, Meta, and Unity compete simultaneously for every ad slot (Banner, Interstitial, Rewarded), maximizing your eCPM and fill rate without needing separate React UI components.

---

## 2. Configured IDs & Credentials

| Network | Parameter / ID | Value |
|---|---|---|
| **Google AdMob** | App ID | `ca-app-pub-5397047296907599~7797119607` |
| **Google AdMob** | Publisher ID | `pub-5397047296907599` |
| **Meta Audience Network** | Publisher / Business ID | `1609288446392552` |
| **Unity Ads** | Game / Organization ID | `151360580` |

### Production Ad Units:
- **Banner Ad**: `ca-app-pub-5397047296907599/3691898228`
- **Interstitial Ad**: `ca-app-pub-5397047296907599/5343164894`
- **Rewarded Ad**: `ca-app-pub-5397047296907599/2717001554`

> [!NOTE]
> In debug/development mode (`__DEV__`), the app automatically switches to Google test ad unit IDs (`TestIds.BANNER`, `TestIds.INTERSTITIAL`, `TestIds.REWARDED`) to protect against account strikes. In release builds (`assembleRelease`), production IDs are automatically used.

---

## 3. Mediation Architecture & Native Integration

### Android Dependencies ([`android/app/build.gradle`](file:///c:/Users/dhana/Desktop/CDL-Exam/android/app/build.gradle))
```groovy
// Google AdMob Mediation Adapters
implementation 'com.google.ads.mediation:facebook:6.19.0.1'
implementation 'com.google.ads.mediation:unity:4.13.2.0'
```

### Maven Repositories ([`android/build.gradle`](file:///c:/Users/dhana/Desktop/CDL-Exam/android/build.gradle) and [`app.json`](file:///c:/Users/dhana/Desktop/CDL-Exam/app.json))
- Unity Ads Maven: `https://unity-ads.s3.amazonaws.com/maven`

### ProGuard Rules ([`android/app/proguard-rules.pro`](file:///c:/Users/dhana/Desktop/CDL-Exam/android/app/proguard-rules.pro) and [`app.json`](file:///c:/Users/dhana/Desktop/CDL-Exam/app.json))
- Meta Audience Network:
  ```proguard
  -keep class com.facebook.ads.** { *; }
  -dontwarn com.facebook.ads.**
  -keep class com.google.ads.mediation.facebook.** { *; }
  ```
- Unity Ads:
  ```proguard
  -keep class com.unity3d.ads.** { *; }
  -keep class com.unity3d.services.** { *; }
  -dontwarn com.unity3d.services.**
  -keep class com.google.ads.mediation.unity.** { *; }
  ```

---

## 4. `app-ads.txt` Compliance

Located at [`website/app-ads.txt`](file:///c:/Users/dhana/Desktop/CDL-Exam/website/app-ads.txt):
```text
google.com, pub-5397047296907599, DIRECT, f08c47fec0942fa0
facebook.com, 1609288446392552, RESELLER, c3e2032a64c10ebf
unityads.unity3d.com, 151360580, DIRECT, 3591daeb562137bc
```

---

## 5. Where Ads Are Implemented

1. **Banner Ads**:
   - Component: [`src/components/BannerAd.native.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/src/components/BannerAd.native.tsx)
   - Home Dashboard: Bottom of [`app/(tabs)/index.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/app/(tabs)/index.tsx)
   - Exam & Practice Results: Bottom of [`app/results.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/app/results.tsx)
   - Feature: Collapses to 0 height if loading fails (no blank gaps), never rendered for Pro/Premium users.

2. **Interstitial Ads**:
   - Implementation: [`src/utils/ads.native.ts`](file:///c:/Users/dhana/Desktop/CDL-Exam/src/utils/ads.native.ts)
   - Trigger: Displayed after quiz/exam completion in [`app/results.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/app/results.tsx).
   - Frequency Capping: Minimum 2-minute cooldown (`INTERSTITIAL_COOLDOWN_MS = 120_000`) between interstitials.
   - Protection: Completely skipped if user has active Pro/Premium subscription.

3. **Rewarded Video Ads**:
   - Mistake Bank: Unlock mistakes practice for free by watching a rewarded video in [`app/mistake-bank.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/app/mistake-bank.tsx).
   - Highway Fuel Refill: Refill all 5 diesel fuel tanks in [`src/components/highway/GameStatsHeader.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/src/components/highway/GameStatsHeader.tsx) by watching a rewarded ad.

4. **GDPR / UMP Consent & Privacy**:
   - Initialized at startup in [`src/utils/ads.native.ts`](file:///c:/Users/dhana/Desktop/CDL-Exam/src/utils/ads.native.ts) before any ad requests.
   - User re-consent option available in Settings: [`app/(tabs)/settings.tsx`](file:///c:/Users/dhana/Desktop/CDL-Exam/app/(tabs)/settings.tsx).

---

## 6. How to Test & Verify (Mediation Ad Inspector)

1. Open the app on an Android device or emulator.
2. Navigate to **Settings** (`app/(tabs)/settings.tsx`).
3. Under the **Other** section, tap **Mediation Ad Inspector**.
4. The Google Mobile Ads Ad Inspector overlay will appear on screen:
   - You can see each ad unit (Banner, Interstitial, Rewarded).
   - You can see **AdMob**, **Meta Audience Network**, and **Unity Ads** adapters.
   - You can initiate a test request to Meta or Unity to verify live ad fills and bidding.
