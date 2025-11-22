import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

// Replace with your actual RevenueCat API Keys
const API_KEYS = {
    ios: 'sk_HDsEEWnJeamMUXfPCJOrVfEJsNhUR', // User provided key
    android: 'sk_HDsEEWnJeamMUXfPCJOrVfEJsNhUR', // Using same key for now, usually different
};

export const initPurchases = async () => {
    try {
        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: API_KEYS.ios });
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: API_KEYS.android });
        }

        // Enable debug logs for development
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    } catch (error) {
        console.error('Error initializing purchases:', error);
    }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
            return offerings.current;
        }
    } catch (error) {
        console.error('Error fetching offerings:', error);
    }
    return null;
};

export const purchasePackage = async (pack: PurchasesPackage) => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(pack);
        return customerInfo;
    } catch (error: any) {
        if (!error.userCancelled) {
            console.error('Error purchasing package:', error);
            throw error;
        }
    }
};

export const getCustomerInfo = async () => {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo;
    } catch (error) {
        console.error('Error getting customer info:', error);
        return null;
    }
};

export const restorePurchases = async () => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
    } catch (error) {
        console.error('Error restoring purchases:', error);
        throw error;
    }
};
