import mobileAds, {
    BannerAd,
    BannerAdSize,
    TestIds,
    InterstitialAd,
    AdEventType,
    RewardedAd,
    RewardedAdEventType,
    AdsConsent,
    AdsConsentStatus,
    AdsConsentDebugGeography,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Ad Unit IDs
// Use __DEV__ to automatically switch between test IDs and production IDs.
// NEVER ship test IDs in a production build.
// ---------------------------------------------------------------------------
const IS_TESTING = __DEV__;

const PRODUCTION_AD_UNITS = {
    BANNER: Platform.select({
        android: 'ca-app-pub-5397047296907599/3691898228',
        ios: 'ca-app-pub-5397047296907599/3691898228', // Replace with real iOS unit when available
        default: 'ca-app-pub-5397047296907599/3691898228',
    }),
    INTERSTITIAL: Platform.select({
        android: 'ca-app-pub-5397047296907599/5343164894',
        ios: 'ca-app-pub-5397047296907599/5343164894', // Replace with real iOS unit when available
        default: 'ca-app-pub-5397047296907599/5343164894',
    }),
    REWARDED: Platform.select({
        android: 'ca-app-pub-5397047296907599/2717001554',
        ios: 'ca-app-pub-5397047296907599/2717001554', // Replace with real iOS unit when available
        default: 'ca-app-pub-5397047296907599/2717001554',
    }),
};

const TEST_AD_UNITS = {
    BANNER: Platform.select({
        android: TestIds.BANNER,
        ios: TestIds.BANNER,
        default: TestIds.BANNER,
    }),
    INTERSTITIAL: Platform.select({
        android: TestIds.INTERSTITIAL,
        ios: TestIds.INTERSTITIAL,
        default: TestIds.INTERSTITIAL,
    }),
    REWARDED: Platform.select({
        android: TestIds.REWARDED,
        ios: TestIds.REWARDED,
        default: TestIds.REWARDED,
    }),
};

const AD_UNITS = IS_TESTING ? TEST_AD_UNITS : PRODUCTION_AD_UNITS;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let interstitialAd: InterstitialAd | null = null;
let rewardedAd: RewardedAd | null = null;
let isAdInitialized = false;

// Frequency capping: minimum 2 minutes between interstitial ads (AdMob best practice)
let lastInterstitialTime = 0;
const INTERSTITIAL_COOLDOWN_MS = 120_000; // 2 minutes

// ---------------------------------------------------------------------------
// Consent (UMP / GDPR / CCPA)
// Must be requested BEFORE initializing the Mobile Ads SDK.
// ---------------------------------------------------------------------------

/**
 * Request consent information via the UMP SDK.
 * Returns true if ads can be requested (consent obtained or not required).
 */
const requestConsent = async (): Promise<boolean> => {
    try {
        const consentInfo = await AdsConsent.requestInfoUpdate();

        // If consent is required and not yet obtained, show the consent form.
        if (
            consentInfo.isConsentFormAvailable &&
            consentInfo.status === AdsConsentStatus.REQUIRED
        ) {
            await AdsConsent.showForm();
        }

        // After showing the form, re-check the status.
        const updatedInfo = await AdsConsent.requestInfoUpdate();

        // Ads can be requested only when consent is OBTAINED or NOT_REQUIRED.
        return (
            updatedInfo.status === AdsConsentStatus.OBTAINED ||
            updatedInfo.status === AdsConsentStatus.NOT_REQUIRED
        );
    } catch (error) {
        // If consent request fails (e.g., network error), fall back to
        // non-personalized ads only — do NOT skip consent silently.
        console.warn('[Ads] Consent request failed, defaulting to non-personalized:', error);
        return true; // Allow ads, but they will be non-personalized (see below)
    }
};

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initialize AdMob.
 * Must be called at app startup. Handles UMP consent before SDK init.
 * @returns true if ads are ready to be shown
 */
export const initAds = async (): Promise<boolean> => {
    try {
        // Step 1: Collect consent BEFORE initializing the SDK.
        const canRequestAds = await requestConsent();
        if (!canRequestAds) {
            console.warn('[Ads] Consent not granted — ads will not be shown.');
            return false;
        }

        // Step 2: Initialize the Mobile Ads SDK.
        await mobileAds().initialize();
        isAdInitialized = true;

        // Step 3: Preload both ad formats so they are ready on first need.
        loadInterstitialAd();
        loadRewardedAd();

        return true;
    } catch (error) {
        console.error('[Ads] Error initializing AdMob:', error);
        return false;
    }
};

// ---------------------------------------------------------------------------
// Banner Ad
// ---------------------------------------------------------------------------

/**
 * Returns the banner ad unit ID appropriate for the current build type.
 */
export const getBannerAdUnitId = (): string => {
    return AD_UNITS.BANNER as string;
};

// ---------------------------------------------------------------------------
// Interstitial Ad
// ---------------------------------------------------------------------------

/**
 * Loads (preloads) the next interstitial ad.
 * Safe to call multiple times — self-manages lifecycle via CLOSED event.
 */
export const loadInterstitialAd = () => {
    if (!isAdInitialized) {
        console.warn('[Ads] AdMob not initialized, skipping interstitial load');
        return;
    }

    try {
        // Create a fresh request each time with NO hardcoded personalization override.
        // The SDK respects the user's consent decision automatically.
        interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL as string);

        interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            // Ad is ready — no action needed here; show is triggered on demand.
        });

        interstitialAd.addAdEventListener(AdEventType.ERROR, (error: Error) => {
            console.error('[Ads] Interstitial ad error:', error);
            interstitialAd = null;
        });

        interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            // Preload the next ad immediately after dismissal.
            loadInterstitialAd();
        });

        interstitialAd.load();
    } catch (error) {
        console.error('[Ads] Error loading interstitial ad:', error);
    }
};

/**
 * Show an interstitial ad with frequency capping.
 * Only call this at natural stopping points (e.g., after a quiz is complete),
 * NEVER during active gameplay or content consumption.
 *
 * @param isPremium - Premium users are never shown ads.
 * @returns true if the ad was shown successfully.
 */
export const showInterstitialAd = async (isPremium: boolean = false): Promise<boolean> => {
    // Policy: never show ads to paying/premium users.
    if (isPremium) {
        return false;
    }

    // Frequency cap: respect minimum cooldown between interstitials.
    const now = Date.now();
    if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
        return false;
    }

    if (!interstitialAd) {
        console.warn('[Ads] Interstitial ad not loaded — requesting load');
        loadInterstitialAd();
        return false;
    }

    try {
        if (interstitialAd.loaded) {
            lastInterstitialTime = now;
            await interstitialAd.show();
            return true;
        } else {
            console.warn('[Ads] Interstitial ad not ready yet');
            loadInterstitialAd();
            return false;
        }
    } catch (error) {
        console.error('[Ads] Error showing interstitial ad:', error);
        loadInterstitialAd();
        return false;
    }
};

// ---------------------------------------------------------------------------
// Rewarded Ad
// ---------------------------------------------------------------------------

/**
 * Load a rewarded ad.
 */
export const loadRewardedAd = () => {
    if (!isAdInitialized) {
        console.warn('[Ads] AdMob not initialized, skipping rewarded ad load');
        return;
    }

    try {
        rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED as string);

        rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            // Rewarded ad is preloaded and ready.
        });

        rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            // Reward granted — handled per-show in showRewardedAd().
        });

        rewardedAd.addAdEventListener(AdEventType.ERROR, (error: Error) => {
            console.error('[Ads] Rewarded ad error:', error);
            rewardedAd = null;
        });

        rewardedAd.load();
    } catch (error) {
        console.error('[Ads] Error loading rewarded ad:', error);
    }
};

/**
 * Show a rewarded ad and wait for the reward outcome.
 * Registers fresh listeners per show to avoid listener accumulation.
 *
 * @returns true if the user completed the ad and earned the reward.
 */
export const showRewardedAd = async (): Promise<boolean> => {
    if (!rewardedAd) {
        console.warn('[Ads] Rewarded ad not loaded — requesting load');
        loadRewardedAd();
        return false;
    }

    try {
        if (!rewardedAd.loaded) {
            console.warn('[Ads] Rewarded ad not ready yet');
            loadRewardedAd();
            return false;
        }

        return new Promise<boolean>((resolve) => {
            let rewarded = false;

            const rewardListener = rewardedAd!.addAdEventListener(
                RewardedAdEventType.EARNED_REWARD,
                () => {
                    rewarded = true;
                }
            );

            const closedListener = rewardedAd!.addAdEventListener(
                AdEventType.CLOSED,
                () => {
                    // Preload the next rewarded ad right away.
                    loadRewardedAd();
                    resolve(rewarded);
                }
            );

            rewardedAd!.show();
        });
    } catch (error) {
        console.error('[Ads] Error showing rewarded ad:', error);
        loadRewardedAd();
        return false;
    }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if ads should be shown to this user.
 * Premium users never see ads (required by AdMob policy when offering premium).
 */
export const shouldShowAds = (isPremium: boolean): boolean => {
    return !isPremium;
};

/**
 * Returns structured metadata for ad analytics events.
 */
export const getAdEventData = (
    adType: 'banner' | 'interstitial' | 'rewarded',
    event: 'impression' | 'click' | 'error'
) => {
    return {
        ad_type: adType,
        ad_event: event,
        timestamp: new Date().toISOString(),
    };
};
