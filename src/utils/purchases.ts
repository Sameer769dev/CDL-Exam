import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// WARNING: The key below is a SECRET key (sk_) which should NEVER be used in a mobile app
// You need to use PUBLIC keys (appl_ for iOS, goog_ for Android)
// Get your public keys from RevenueCat dashboard
const API_KEYS = {
    ios: 'appl_YOUR_IOS_PUBLIC_KEY', // Replace with your iOS public key
    android: 'goog_YOUR_ANDROID_PUBLIC_KEY', // Replace with your Android public key
};

export const initPurchases = async () => {
    // Skip RevenueCat initialization in Expo Go
    if (isExpoGo) {
        console.log('[RevenueCat] Running in Expo Go - skipping initialization');
        return;
    }

    // Skip if no valid API key is configured
    if (!API_KEYS.ios.startsWith('appl_') && !API_KEYS.android.startsWith('goog_')) {
        console.warn('[RevenueCat] No valid public API keys configured - skipping initialization');
        return;
    }

    try {
        if (Platform.OS === 'ios' && API_KEYS.ios.startsWith('appl_')) {
            Purchases.configure({ apiKey: API_KEYS.ios });
            console.log('[RevenueCat] Configured for iOS');
        } else if (Platform.OS === 'android' && API_KEYS.android.startsWith('goog_')) {
            Purchases.configure({ apiKey: API_KEYS.android });
            console.log('[RevenueCat] Configured for Android');
        }

        // Enable debug logs for development
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    } catch (error) {
        console.error('[RevenueCat] Error initializing purchases:', error);
        // Don't throw - allow app to continue
    }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    if (isExpoGo) {
        console.log('[RevenueCat] Expo Go - returning null offerings');
        return null;
    }

    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
            return offerings.current;
        }
    } catch (error) {
        console.error('[RevenueCat] Error fetching offerings:', error);
    }
    return null;
};

export const purchasePackage = async (pack: PurchasesPackage) => {
    if (isExpoGo) {
        throw new Error('Purchases are not available in Expo Go. Please use a development build.');
    }

    try {
        const { customerInfo } = await Purchases.purchasePackage(pack);
        return customerInfo;
    } catch (error: any) {
        if (!error.userCancelled) {
            console.error('[RevenueCat] Error purchasing package:', error);
            throw error;
        }
    }
};

export const getCustomerInfo = async () => {
    if (isExpoGo) {
        console.log('[RevenueCat] Expo Go - returning null customer info');
        return null;
    }

    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo;
    } catch (error) {
        console.error('[RevenueCat] Error getting customer info:', error);
        return null;
    }
};

export const restorePurchases = async () => {
    if (isExpoGo) {
        throw new Error('Restore purchases is not available in Expo Go. Please use a development build.');
    }

    try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
    } catch (error) {
        console.error('[RevenueCat] Error restoring purchases:', error);
        throw error;
    }
};
