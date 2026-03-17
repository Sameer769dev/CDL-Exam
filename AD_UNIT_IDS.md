# Ad Unit IDs - Test vs Production

## ✅ Current Configuration: TEST MODE

Your app is now using **Google's official test ad unit IDs** for safe testing.

### Test Ad Unit IDs (Currently Active)

| Ad Format | Android Test ID | iOS Test ID |
|-----------|----------------|-------------|
| **Banner** | `ca-app-pub-3940256099942544/6300978111` | `ca-app-pub-3940256099942544/2934735716` |
| **Interstitial** | `ca-app-pub-3940256099942544/1033173712` | `ca-app-pub-3940256099942544/4411468910` |
| **Rewarded Video** | `ca-app-pub-3940256099942544/5224354917` | `ca-app-pub-3940256099942544/1712485313` |

### Your Production Ad Unit IDs (Saved for Reference)

| Ad Format | Production ID |
|-----------|---------------|
| **Banner** | `ca-app-pub-5397047296907599/3691898228` |
| **Interstitial** | `ca-app-pub-5397047296907599/5343164894` |
| **Rewarded** | `ca-app-pub-5397047296907599/2717001554` |

---

## Why Use Test Ad Unit IDs?

✅ **Safe Testing** - Won't affect your production ad metrics  
✅ **No Policy Violations** - Clicking your own ads won't get you banned  
✅ **Faster Loading** - Test ads load quickly for development  
✅ **Always Available** - Test ads always fill, no matter your location  
✅ **Labeled Clearly** - Test ads show "Test Ad" label

---

## What You'll See

When using test ad unit IDs, you'll see:
- Ads with "Test Ad" label
- Sample ad content from Google
- Ads that load reliably every time
- No real advertisers or campaigns

---

## When to Switch Back to Production IDs

Switch back to production IDs when:
- ✅ Testing is complete
- ✅ App is ready for production release
- ✅ Uploading to Google Play Store
- ✅ Ready for real users

---

## How to Switch to Production IDs

### Option 1: Manual Edit

Edit [`src/utils/ads.ts`](file:///c:/Users/dhana/Desktop/CDL%20Exam/src/utils/ads.ts) and replace test IDs with production IDs:

```typescript
const AD_UNITS = {
    BANNER: Platform.select({
        android: 'ca-app-pub-5397047296907599/3691898228', // Your production ID
        ios: 'ca-app-pub-5397047296907599/3691898228',
        default: 'ca-app-pub-5397047296907599/3691898228',
    }),
    INTERSTITIAL: Platform.select({
        android: 'ca-app-pub-5397047296907599/5343164894', // Your production ID
        ios: 'ca-app-pub-5397047296907599/5343164894',
        default: 'ca-app-pub-5397047296907599/5343164894',
    }),
    REWARDED: Platform.select({
        android: 'ca-app-pub-5397047296907599/2717001554', // Your production ID
        ios: 'ca-app-pub-5397047296907599/2717001554',
        default: 'ca-app-pub-5397047296907599/2717001554',
    }),
};
```

### Option 2: Environment-Based Configuration (Recommended)

For better control, you could add environment-based switching:

```typescript
const IS_TESTING = __DEV__; // Automatically use test IDs in development

const PRODUCTION_IDS = {
    BANNER: 'ca-app-pub-5397047296907599/3691898228',
    INTERSTITIAL: 'ca-app-pub-5397047296907599/5343164894',
    REWARDED: 'ca-app-pub-5397047296907599/2717001554',
};

const TEST_IDS = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

const AD_UNITS = {
    BANNER: Platform.select({
        android: IS_TESTING ? TEST_IDS.BANNER : PRODUCTION_IDS.BANNER,
        ios: IS_TESTING ? TEST_IDS.BANNER : PRODUCTION_IDS.BANNER,
        default: IS_TESTING ? TEST_IDS.BANNER : PRODUCTION_IDS.BANNER,
    }),
    // ... same for INTERSTITIAL and REWARDED
};
```

---

## Testing Checklist

With test ad unit IDs active, verify:

- [ ] Banner ads display on home screen
- [ ] Banner ads show "Test Ad" label
- [ ] Interstitial ads load and display
- [ ] Rewarded video ads play
- [ ] Ads don't show for premium users
- [ ] Ad frequency capping works (2 min cooldown for interstitials)

---

## Important Notes

> [!WARNING]
> **Never release to production with test ad unit IDs!**
> - You won't earn any revenue
> - Ads will show "Test Ad" label to real users
> - Violates AdMob policies

> [!IMPORTANT]
> **Before uploading to Play Store:**
> 1. Switch back to production ad unit IDs
> 2. Rebuild the APK/AAB
> 3. Test one more time to ensure production ads load
> 4. Upload to Play Store

---

## Current File Location

The ad configuration is in:
[`src/utils/ads.ts`](file:///c:/Users/dhana/Desktop/CDL%20Exam/src/utils/ads.ts)

Your production IDs are saved as comments in the file for easy reference.

---

## Next Steps

1. ✅ Test ad unit IDs are now active
2. ⏳ Rebuild the APK to test with new ad IDs
3. ⏳ Verify ads display correctly
4. ⏳ Switch back to production IDs before release

---

## Rebuild Command

To rebuild with the new test ad unit IDs:

```bash
.\build-release.bat
```

Or rebuild from scratch:
```bash
npx expo prebuild --clean
cd android
.\gradlew.bat assembleRelease
```
