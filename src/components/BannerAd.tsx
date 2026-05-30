import React, { useState } from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useUser } from '../context/UserContext';
import { getBannerAdUnitId, shouldShowAds } from '../utils/ads';

interface BannerAdProps {
    size?: BannerAdSize;
    style?: ViewStyle;
    /** Logical position hint — used by the parent layout, not rendered here. */
    position?: 'top' | 'bottom';
}

/**
 * AdMob-compliant banner ad component.
 *
 * Policy compliance:
 *  - Never shown to premium users.
 *  - Not rendered on web (no native SDK).
 *  - Container collapses to zero height when the ad fails to load,
 *    preventing blank/empty spaces that could confuse users.
 *  - Does NOT set requestNonPersonalizedAdsOnly — the UMP consent
 *    SDK (initialised in ads.ts) controls personalisation automatically.
 *  - Must NOT be placed where it overlaps interactive UI elements or
 *    could be accidentally tapped during gameplay.
 */
export const BannerAdComponent: React.FC<BannerAdProps> = ({
    size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
    style,
}) => {
    const { isPremium } = useUser();
    const [adVisible, setAdVisible] = useState(false);

    // Policy: premium users never see ads.
    if (!shouldShowAds(isPremium)) {
        return null;
    }

    // No native AdMob SDK on web.
    if (Platform.OS === 'web') {
        return null;
    }

    return (
        <View
            style={[
                {
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    // Collapse the container until the ad has actually loaded.
                    // This prevents an empty gap from appearing while loading or
                    // when no fill is available — a common policy red flag.
                    minHeight: adVisible ? undefined : 0,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <BannerAd
                unitId={getBannerAdUnitId()}
                size={size}
                onAdLoaded={() => setAdVisible(true)}
                onAdFailedToLoad={(error) => {
                    console.warn('[BannerAd] Failed to load:', error.message);
                    setAdVisible(false);
                }}
            />
        </View>
    );
};
