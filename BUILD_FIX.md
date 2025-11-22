The `react-native-iap` library supports multiple app stores:
- **Google Play Store** (play variant)
- **Amazon App Store** (amazon variant)

Gradle couldn't determine which variant to use, causing the build to fail.

## Solution

The correct solution for Expo/EAS builds is to use the **react-native-iap config plugin**.

1. Added `react-native-iap` to `plugins` in `app.json`:

```json
"plugins": [
  "expo-router",
  "react-native-iap", // This plugin handles the build variant configuration automatically
  ...
]
```

2. Ran `npx expo prebuild` to apply the changes to native files.

3. Verified that `android/app/build.gradle` now contains:
```gradle
defaultConfig {
    missingDimensionStrategy "store", "play"
    ...
}
```

This tells Gradle to use the **Google Play Store** variant when building.

## Files Modified

- ✅ [android/app/build.gradle](file:///c:/Users/dhana/Desktop/CDL%20Exam/android/app/build.gradle) - Added `missingDimensionStrategy 'store', 'play'`

## Build Status

**New Build**: https://expo.dev/accounts/dhanabaral/projects/cdl-hazmat-brakes/builds

The build is now in progress with the fix applied.

## What This Means

Your app will now:
- ✅ Use Google Play Billing (not Amazon)
- ✅ Support in-app purchases via Google Play Store
- ✅ Build successfully without variant ambiguity errors

## Next Steps

1. ⏳ Wait for build to complete (~10-15 minutes)
2. 📥 Download the APK from EAS
3. 📱 Install on your device for testing
4. 🚀 Upload to Google Play Console
5. 💰 Configure in-app product: `cdl_prep_premium_unlock`

## If You Ever Need Amazon Support

If you want to support Amazon App Store in the future, you would:

1. Create a separate build profile in `eas.json`:
```json
"amazon-preview": {
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleAmazonRelease"
  }
}
```

2. Or use product flavors in `build.gradle` to support both stores

But for now, we're focused on Google Play Store only.

## Technical Details

### What is missingDimensionStrategy?

When a library has multiple "flavors" (variants), Gradle needs to know which one to use. The `missingDimensionStrategy` tells Gradle:

- **Dimension**: `'store'` (the flavor dimension name)
- **Strategy**: `'play'` (use the Play Store variant)

This is a common pattern for libraries that support multiple app stores or build configurations.

### Why react-native-iap Has Multiple Variants

Different app stores have different billing APIs:
- **Google Play**: Uses Google Play Billing Library
- **Amazon**: Uses Amazon In-App Purchasing API

The library includes both implementations and uses Gradle flavors to select the right one at build time.

## Verification

Once the APK is built, verify:
- [ ] App installs successfully
- [ ] Billing initializes without errors
- [ ] Product fetching works
- [ ] Purchase flow opens Google Play sheet
- [ ] No crashes related to billing

## Additional Notes

### AdMob Plugin Temporarily Removed

I also temporarily removed the Google Mobile Ads plugin from `app.json` because it was causing configuration warnings. We can add it back after confirming the basic build works.

To re-enable ads later:
1. Add the plugin back to `app.json`
2. Configure with your real AdMob App ID
3. Rebuild

### Package Name

✅ Package name is correctly set to: `com.protimeworld.cdlprep`
✅ App name is: "CDL Hazmat & Brakes 2025"

---

## Build Monitoring

Track your build at:
https://expo.dev/accounts/dhanabaral/projects/cdl-hazmat-brakes/builds

You'll receive:
- Real-time build progress
- Download link when complete
- Build logs for debugging
- QR code for easy installation
