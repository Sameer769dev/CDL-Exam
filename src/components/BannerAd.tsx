import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useUser } from '../context/UserContext';
import { getBannerAdUnitId } from '../utils/ads';

interface BannerAdComponentProps {
    position?: 'top' | 'bottom';
    size?: BannerAdSize;
}

/**
 * Banner Ad Component
 * Automatically hides for premium users
 */
export default function BannerAdComponent({
    position = 'bottom',
    size = BannerAdSize.BANNER
}: BannerAdComponentProps) {
    const { isPremium } = useUser();

    // Don't show ads to premium users
    if (isPremium) {
        return null;
    }

    return (
        <View style={[
            styles.container,
            position === 'top' ? styles.top : styles.bottom
        ]}>
            <BannerAd
                unitId={getBannerAdUnitId()}
                size={size}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
                onAdLoaded={() => {
                    console.log('[BannerAd] Ad loaded');
                }}
                onAdFailedToLoad={(error) => {
                    console.error('[BannerAd] Ad failed to load:', error);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#1e293b', // slate-800
    },
    top: {
        paddingTop: 8,
    },
    bottom: {
        paddingBottom: 8,
    },
});
