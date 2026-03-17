// Web mock for purchases
// This allows the app to run in the browser without crashing due to native module missing

import { Product, Purchase } from 'react-native-iap';

export const initBilling = async (): Promise<boolean> => {
    console.log('Purchases: initBilling called (web mock)');
    return true;
};

export const isBillingAvailable = (): boolean => {
    return true;
};

export const closeBilling = async () => {
    console.log('Purchases: closeBilling called (web mock)');
};

export const getAvailableProducts = async (): Promise<Product[]> => {
    console.log('Purchases: getAvailableProducts called (web mock)');
    return [];
};

export const getPremiumProduct = async (): Promise<Product | null> => {
    console.log('Purchases: getPremiumProduct called (web mock)');
    return null;
};

export const purchaseProduct = async (product: Product): Promise<Purchase | null> => {
    console.log('Purchases: purchaseProduct called (web mock)', product);
    return null;
};

export const checkPurchaseStatus = async (): Promise<'none' | 'monthly' | 'lifetime'> => {
    console.log('Purchases: checkPurchaseStatus called (web mock)');
    return 'none';
};

export const restorePurchases = async (): Promise<boolean> => {
    console.log('Purchases: restorePurchases called (web mock)');
    return false;
};

export const getBillingErrorMessage = (error: any): string => {
    return error?.message || 'Unknown billing error (web mock)';
};

// Deprecated/Legacy exports kept for compatibility if needed, but should be removed if unused
export const initPurchases = async () => {
    console.log('Purchases: initPurchases called (web mock - legacy)');
};

export const getOfferings = async (): Promise<any> => {
    console.log('Purchases: getOfferings called (web mock - legacy)');
    return null;
};

export const purchasePackage = async (pack: any) => {
    console.log('Purchases: purchasePackage called (web mock - legacy)', pack);
    return null;
};

export const getCustomerInfo = async () => {
    console.log('Purchases: getCustomerInfo called (web mock - legacy)');
    return null;
};
