import mobileAds, {
    BannerAd,
    BannerAdSize,
    TestIds,
    InterstitialAd,
    AdEventType,
    RewardedAd,
    RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Ad Unit IDs - Replace with your actual AdMob ad unit IDs
const AD_UNITS = {
    BANNER: Platform.select({
        android: 'ca-app-pub-5397047296907599/3691898228',
        ios: 'ca-app-pub-5397047296907599/3691898228',
        default: 'ca-app-pub-5397047296907599/3691898228',
    }),
    INTERSTITIAL: Platform.select({
        android: 'ca-app-pub-5397047296907599/5343164894',
        ios: 'ca-app-pub-5397047296907599/5343164894',
        default: 'ca-app-pub-5397047296907599/5343164894',
    }),
    REWARDED: Platform.select({
        android: 'ca-app-pub-5397047296907599/2717001554',
        ios: 'ca-app-pub-5397047296907599/2717001554',
        default: 'ca-app-pub-5397047296907599/2717001554',
    }),
};

let interstitialAd: InterstitialAd | null = null;
let rewardedAd: RewardedAd | null = null;
let isAdInitialized = false;

// Track last interstitial show time to implement frequency capping
let lastInterstitialTime = 0;
const INTERSTITIAL_COOLDOWN = 120000; // 2 minutes in milliseconds

/**
 * Initialize AdMob
 * Call this when the app starts
 */
export const initAds = async (): Promise<boolean> => {
    try {
        console.log('[Ads] Initializing AdMob...');
        await mobileAds().initialize();
        isAdInitialized = true;
        console.log('[Ads] AdMob initialized successfully');

        // Preload interstitial ad
        loadInterstitialAd();

        return true;
    } catch (error) {
        console.error('[Ads] Error initializing AdMob:', error);
        return false;
    }
};

/**
 * Get banner ad unit ID
 */
export const getBannerAdUnitId = (): string => {
    return AD_UNITS.BANNER;
};

/**
 * Load interstitial ad
 */
export const loadInterstitialAd = () => {
    if (!isAdInitialized) {
        console.warn('[Ads] AdMob not initialized, skipping interstitial load');
        return;
    }

    try {
        interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL);

        interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            console.log('[Ads] Interstitial ad loaded');
        });

        interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('[Ads] Interstitial ad error:', error);
        });

        interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            console.log('[Ads] Interstitial ad closed');
            // Preload next ad
            loadInterstitialAd();
        });

        interstitialAd.load();
    } catch (error) {
        console.error('[Ads] Error loading interstitial ad:', error);
    }
};

/**
 * Show interstitial ad with frequency capping
 * @param isPremium - Whether the user is premium (premium users don't see ads)
 * @returns Promise<boolean> - Whether the ad was shown
 */
export const showInterstitialAd = async (isPremium: boolean = false): Promise<boolean> => {
    // Don't show ads to premium users
    if (isPremium) {
        console.log('[Ads] Premium user, skipping interstitial ad');
        return false;
    }

    // Check cooldown period
    const now = Date.now();
    if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN) {
        console.log('[Ads] Interstitial ad on cooldown');
        return false;
    }

    if (!interstitialAd) {
        console.warn('[Ads] Interstitial ad not loaded');
        loadInterstitialAd();
        return false;
    }

    try {
        const loaded = interstitialAd.loaded;
        if (loaded) {
            await interstitialAd.show();
            lastInterstitialTime = now;
            console.log('[Ads] Interstitial ad shown');
            return true;
        } else {
            console.warn('[Ads] Interstitial ad not ready');
            loadInterstitialAd();
            return false;
        }
    } catch (error) {
        console.error('[Ads] Error showing interstitial ad:', error);
        loadInterstitialAd();
        return false;
    }
};

/**
 * Load rewarded ad
 */
export const loadRewardedAd = () => {
    if (!isAdInitialized) {
        console.warn('[Ads] AdMob not initialized, skipping rewarded ad load');
        return;
    }

    try {
        rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED);

        rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            console.log('[Ads] Rewarded ad loaded');
        });

        rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            console.log('[Ads] User earned reward:', reward);
        });

        rewardedAd.load();
    } catch (error) {
        console.error('[Ads] Error loading rewarded ad:', error);
    }
};

/**
 * Show rewarded ad
 * @returns Promise<boolean> - Whether the user earned the reward
 */
export const showRewardedAd = async (): Promise<boolean> => {
    if (!rewardedAd) {
        console.warn('[Ads] Rewarded ad not loaded');
        loadRewardedAd();
        return false;
    }

    try {
        const loaded = rewardedAd.loaded;
        if (loaded) {
            return new Promise((resolve) => {
                let rewarded = false;

                rewardedAd!.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                    rewarded = true;
                });

                rewardedAd!.addAdEventListener(AdEventType.CLOSED, () => {
                    console.log('[Ads] Rewarded ad closed, reward earned:', rewarded);
                    loadRewardedAd(); // Preload next ad
                    resolve(rewarded);
                });

                rewardedAd!.show();
            });
        } else {
            console.warn('[Ads] Rewarded ad not ready');
            loadRewardedAd();
            return false;
        }
    } catch (error) {
        console.error('[Ads] Error showing rewarded ad:', error);
        loadRewardedAd();
        return false;
    }
};

/**
 * Check if ads should be shown to the user
 * @param isPremium - Whether the user is premium
 * @returns boolean - Whether ads should be shown
 */
export const shouldShowAds = (isPremium: boolean): boolean => {
    return !isPremium;
};

/**
 * Get ad-related analytics event data
 */
export const getAdEventData = (adType: 'banner' | 'interstitial' | 'rewarded', event: 'impression' | 'click' | 'error') => {
    return {
        ad_type: adType,
        ad_event: event,
        timestamp: new Date().toISOString(),
    };
};
