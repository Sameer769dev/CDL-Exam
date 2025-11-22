import {
    initConnection,
    endConnection,
    getProducts,
    requestPurchase,
    getAvailablePurchases,
    finishTransaction,
    purchaseErrorListener,
    purchaseUpdatedListener,
    Product,
    Purchase,
    PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';

// Product IDs - Configure these in Google Play Console
const PRODUCT_IDS = {
    PREMIUM: 'cdl_prep_premium_unlock',
};

// Get the appropriate product ID for the platform
const getProductIds = (): string[] => {
    if (Platform.OS === 'android') {
        return [PRODUCT_IDS.PREMIUM];
    }
    // iOS product IDs (if you add iOS support later)
    return [PRODUCT_IDS.PREMIUM];
};

let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;

/**
 * Initialize the billing connection
 * Call this when the app starts
 */
export const initBilling = async (): Promise<boolean> => {
    try {
        console.log('[Billing] Initializing connection...');
        const result = await initConnection();
        console.log('[Billing] Connection initialized:', result);

        // Set up purchase listeners
        setupPurchaseListeners();

        return true;
    } catch (error) {
        console.error('[Billing] Error initializing connection:', error);
        return false;
    }
};

/**
 * End the billing connection
 * Call this when the app is closing
 */
export const closeBilling = async () => {
    try {
        // Remove listeners
        if (purchaseUpdateSubscription) {
            purchaseUpdateSubscription.remove();
            purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
            purchaseErrorSubscription.remove();
            purchaseErrorSubscription = null;
        }

        await endConnection();
        console.log('[Billing] Connection closed');
    } catch (error) {
        console.error('[Billing] Error closing connection:', error);
    }
};

/**
 * Set up listeners for purchase updates and errors
 */
const setupPurchaseListeners = () => {
    // Listen for purchase updates
    purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: Purchase) => {
            console.log('[Billing] Purchase updated:', purchase);

            const receipt = purchase.transactionReceipt;
            if (receipt) {
                try {
                    // Acknowledge the purchase
                    await finishTransaction({ purchase, isConsumable: false });
                    console.log('[Billing] Purchase acknowledged');
                } catch (error) {
                    console.error('[Billing] Error acknowledging purchase:', error);
                }
            }
        }
    );

    // Listen for purchase errors
    purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
            console.warn('[Billing] Purchase error:', error);
        }
    );
};

/**
 * Get available products from Google Play
 */
export const getAvailableProducts = async (): Promise<Product[]> => {
    try {
        console.log('[Billing] Fetching products...');
        const products = await getProducts({ skus: getProductIds() });
        console.log('[Billing] Products fetched:', products);
        return products;
    } catch (error) {
        console.error('[Billing] Error fetching products:', error);
        return [];
    }
};

/**
 * Get the premium product
 */
export const getPremiumProduct = async (): Promise<Product | null> => {
    try {
        const products = await getAvailableProducts();
        const premium = products.find(p => p.productId === PRODUCT_IDS.PREMIUM);
        return premium || null;
    } catch (error) {
        console.error('[Billing] Error getting premium product:', error);
        return null;
    }
};

/**
 * Purchase the premium unlock
 */
export const purchasePremium = async (): Promise<Purchase | null> => {
    try {
        console.log('[Billing] Initiating purchase...');

        // Request the purchase
        const purchase = await requestPurchase({ sku: PRODUCT_IDS.PREMIUM });

        console.log('[Billing] Purchase completed:', purchase);
        return purchase;
    } catch (error: any) {
        console.error('[Billing] Purchase error:', error);

        // Handle user cancellation
        if (error.code === 'E_USER_CANCELLED') {
            console.log('[Billing] User cancelled purchase');
            return null;
        }

        throw error;
    }
};

/**
 * Check if the user has purchased premium
 */
export const checkPurchaseStatus = async (): Promise<boolean> => {
    try {
        console.log('[Billing] Checking purchase status...');

        // Get all available purchases
        const purchases = await getAvailablePurchases();
        console.log('[Billing] Available purchases:', purchases);

        // Check if premium is purchased
        const hasPremium = purchases.some(
            purchase => purchase.productId === PRODUCT_IDS.PREMIUM
        );

        console.log('[Billing] Has premium:', hasPremium);
        return hasPremium;
    } catch (error) {
        console.error('[Billing] Error checking purchase status:', error);
        return false;
    }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
    try {
        console.log('[Billing] Restoring purchases...');

        const purchases = await getAvailablePurchases();
        console.log('[Billing] Restored purchases:', purchases);

        // Check if premium was restored
        const hasPremium = purchases.some(
            purchase => purchase.productId === PRODUCT_IDS.PREMIUM
        );

        if (hasPremium) {
            console.log('[Billing] Premium restored successfully');
            return true;
        } else {
            console.log('[Billing] No premium purchase found');
            return false;
        }
    } catch (error) {
        console.error('[Billing] Error restoring purchases:', error);
        throw error;
    }
};

/**
 * Get user-friendly error message
 */
export const getBillingErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred';

    const code = error.code || '';

    switch (code) {
        case 'E_USER_CANCELLED':
            return 'Purchase cancelled';
        case 'E_NETWORK_ERROR':
            return 'Network error. Please check your connection and try again.';
        case 'E_SERVICE_ERROR':
            return 'Google Play services error. Please try again later.';
        case 'E_ITEM_UNAVAILABLE':
            return 'This item is not available for purchase.';
        case 'E_ALREADY_OWNED':
            return 'You already own this item. Try restoring purchases.';
        case 'E_DEVELOPER_ERROR':
            return 'Configuration error. Please contact support.';
        default:
            return error.message || 'Purchase failed. Please try again.';
    }
};
