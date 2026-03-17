import React, { useState } from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useUser } from '../context/UserContext';
import { getBannerAdUnitId, shouldShowAds } from '../utils/ads';

interface BannerAdProps {
    size?: BannerAdSize;
    style?: ViewStyle;
    position?: 'top' | 'bottom'; // Added to match usage in index.tsx, though currently handled by parent layout
}

export const BannerAdComponent: React.FC<BannerAdProps> = ({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, style }) => {
    const { isPremium } = useUser();
    const [adLoaded, setAdLoaded] = useState(false);

    if (!shouldShowAds(isPremium)) {
        return null;
    }

    if (Platform.OS === 'web') {
        // Placeholder for Web AdSense or similar
        // For now, we don't show anything on web to avoid errors
        return null;
    }

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <BannerAd
                unitId={getBannerAdUnitId()}
                size={size}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => setAdLoaded(true)}
                onAdFailedToLoad={(error) => console.error('Ad failed to load', error)}
            />
        </View>
    );
};
