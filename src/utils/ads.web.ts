// Web fallback for ads (no-op)
export const initAds = async (): Promise<boolean> => {
    return false;
};

export const getBannerAdUnitId = (): string => {
    return '';
};

export const loadInterstitialAd = () => {};

export const showInterstitialAd = async (isPremium: boolean = false): Promise<boolean> => {
    return false;
};

export const loadRewardedAd = () => {};

export const showRewardedAd = async (): Promise<boolean> => {
    return false;
};

export const shouldShowAds = (isPremium: boolean): boolean => {
    return false;
};

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
