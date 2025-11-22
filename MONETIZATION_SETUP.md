# Google Play Console & AdMob Configuration Guide

This guide will help you configure Google Play Console for in-app purchases and AdMob for advertisements.

---

## Part 1: Google Play Console Setup

### Step 1: Create In-App Product

1. **Navigate to Google Play Console**
   - Go to https://play.google.com/console
   - Select your app: **CDL Hazmat & Brakes 2025** (com.protimeworld.cdlprep)

2. **Go to Monetization Section**
   - In the left sidebar, click **Monetize** → **In-app products**

3. **Create New Product**
   - Click **Create product**
   - Fill in the details:

   ```
   Product ID: cdl_prep_premium_unlock
   Name: Premium Unlock
   Description: Unlock all 8 endorsement categories, remove ads, and get lifetime access to all features
   Status: Active
   Price: $14.99 USD
   ```

4. **Set Product Type**
   - Select **Non-consumable** (one-time purchase)

5. **Configure Pricing**
   - Set base price: $14.99 USD
   - Google will auto-convert to other currencies
   - Review and confirm pricing

6. **Activate Product**
   - Click **Save** and then **Activate**

### Step 2: Add License Testers

1. **Go to Settings** → **License Testing**
2. **Add Test Accounts**
   - Add your Gmail accounts for testing
   - These accounts can make test purchases without being charged

3. **License Test Response**
   - Set to **RESPOND_NORMALLY** for realistic testing

### Step 3: Verify Billing Permissions

1. **Check AndroidManifest.xml**
   - The billing permission is already added in app.json:
   ```json
   "permissions": ["com.android.vending.BILLING"]
   ```

2. **Build and Upload**
   - You'll need to build and upload an APK/AAB to test in-app purchases
   - Use internal testing track for initial testing

---

## Part 2: AdMob Setup

### Step 1: Create AdMob Account

1. **Go to AdMob**
   - Visit https://admob.google.com
   - Sign in with your Google account

2. **Create or Link App**
   - Click **Apps** → **Add App**
   - Select **Android**
   - App name: **CDL Hazmat & Brakes 2025**
   - Package name: **com.protimeworld.cdlprep**

### Step 2: Create Ad Units

You need to create 3 ad units:

#### 1. Banner Ad Unit

```
Name: CDL Hazmat & Brakes - Home Banner
Format: Banner
Ad unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX (copy this)
```

#### 2. Interstitial Ad Unit

```
Name: CDL Hazmat & Brakes - Quiz Completion
Format: Interstitial
Ad unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX (copy this)
```

#### 3. Rewarded Video Ad Unit (Optional)

```
Name: CDL Hazmat & Brakes - Hint Reward
Format: Rewarded
Ad unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX (copy this)
```

### Step 3: Get Your AdMob App ID

1. **Find App ID**
   - Go to **Apps** → Select your app
   - Copy the **App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

2. **Update app.json**
   - Replace the test App ID in `app.json`:

   ```json
   "plugins": [
     "expo-router",
     [
       "react-native-google-mobile-ads",
       {
         "androidAppId": "ca-app-pub-YOUR_ACTUAL_APP_ID~XXXXXXXXXX",
   - Follow Google's UMP (User Messaging Platform) guidelines

2. **Test Consent Form**
   - Use test device IDs to test consent flow

---

## Part 3: Testing

### Test In-App Purchases

1. **Build Development Client**
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

2. **Use Test Account**
   - Sign in with a license tester account
   - Navigate to paywall
   - Attempt purchase
   - Verify Google Play purchase sheet appears

3. **Test Scenarios**
   - [ ] Purchase succeeds
   - [ ] Purchase is cancelled
   - [ ] Restore purchases works
   - [ ] Premium features unlock
   - [ ] Ads disappear for premium users

### Test Ads

1. **Development Mode**
   - Ads will show test ads automatically in `__DEV__` mode

2. **Test Ad Display**
   - [ ] Banner ad shows on home screen (free users)
   - [ ] Banner ad hides for premium users
   - [ ] Interstitial ad shows after quiz (when implemented)
   - [ ] Ads load without crashing

3. **Production Testing**
   - Upload to internal testing track
   - Test with real ad units
   - Verify ad impressions in AdMob dashboard

---

## Part 4: Production Checklist

Before releasing to production:

- [ ] Replace all test ad unit IDs with real ones
- [ ] Activate in-app product in Google Play Console
- [ ] Test purchase flow with real billing (internal testing)
- [ ] Verify ads show correctly
- [ ] Update privacy policy to mention AdMob data collection
- [ ] Set up app-ads.txt (if you have a website)
- [ ] Monitor AdMob dashboard for ad performance
- [ ] Monitor Google Play Console for purchase issues

---

## Part 5: Revenue Tracking

### Google Play Console

1. **View Purchase Reports**
   - Go to **Monetize** → **Financial reports**
   - Track revenue, refunds, and subscriptions

2. **Track User Metrics**
   - Go to **Statistics** → **Financial**
   - View conversion rates and ARPU

### AdMob Dashboard

1. **View Ad Revenue**
   - Go to **Reports**
   - Track impressions, clicks, and revenue
   - View eCPM and fill rate

2. **Optimize Performance**
   - Test different ad placements
   - Monitor ad mediation (if added)
   - A/B test ad frequency

---

## Troubleshooting

### In-App Purchase Issues

**Issue**: "Item not available for purchase"
- **Solution**: Ensure product is activated in Google Play Console
- **Solution**: Wait 24 hours after creating product

**Issue**: "Billing service unavailable"
- **Solution**: Verify Google Play Services is updated
- **Solution**: Check billing permission in AndroidManifest

**Issue**: Purchase not restoring
- **Solution**: Ensure using same Google account
- **Solution**: Verify product is non-consumable

### Ad Issues

**Issue**: Ads not showing
- **Solution**: Verify AdMob app ID is correct
- **Solution**: Check ad unit IDs match
- **Solution**: Ensure test mode for development

**Issue**: "Ad failed to load"
- **Solution**: Check internet connection
- **Solution**: Verify AdMob account is active
- **Solution**: Check for policy violations

---

## Next Steps

1. ✅ Complete Google Play Console setup
2. ✅ Complete AdMob setup
3. ✅ Update configuration files with real IDs
4. ✅ Build and test on device
5. ✅ Upload to internal testing track
6. ✅ Monitor metrics and optimize

---

## Support Resources

- [Google Play Billing Documentation](https://developer.android.com/google/play/billing)
- [AdMob Help Center](https://support.google.com/admob)
- [react-native-iap GitHub](https://github.com/dooboolab-community/react-native-iap)
- [react-native-google-mobile-ads Documentation](https://docs.page/invertase/react-native-google-mobile-ads)
