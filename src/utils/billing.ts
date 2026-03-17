import {
    initConnection,
    endConnection,
    fetchProducts,
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
export const PRODUCT_IDS = {
    PREMIUM_MONTHLY: 'premium_monthly',
    PREMIUM_LIFETIME: 'premium_lifetime',
    EXAM_ATTEMPT: 'exam_attempt_single',
};

// Get the appropriate product ID for the platform
const getSubscriptionIds = (): string[] => {
    return [PRODUCT_IDS.PREMIUM_MONTHLY];
};

const getInAppProductIds = (): string[] => {
    return [PRODUCT_IDS.PREMIUM_LIFETIME, PRODUCT_IDS.EXAM_ATTEMPT];
};



let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;
let isBillingInitialized = false;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Initialize the billing connection
 * Call this when the app starts
 */
export const initBilling = async (): Promise<boolean> => {
    if (isBillingInitialized) return true;

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const result = await initConnection();

            // Set up purchase listeners only after successful initialization
            setupPurchaseListeners();

            isBillingInitialized = true;
            // console.log('[Billing] Connection initialized successfully');
            return true;
        } catch (error: any) {
            retries++;
            const isLastAttempt = retries === maxRetries;
            const responseCode = error?.responseCode;

            console.warn(`[Billing] Connection attempt ${retries} failed:`, error?.debugMessage || error?.message);

            // Handle specific cases where retrying might not help
            if (error?.code === 'E_IAP_NOT_AVAILABLE') {
                console.warn('[Billing] In-app purchases not available on this device/emulator');
                isBillingInitialized = false;
                return false;
            }

            if (isLastAttempt) {
                console.error('[Billing] Failed to initialize connection after multiple attempts:', error);
                isBillingInitialized = false;
                return false;
            }

            // Exponential backoff: 1s, 3s, 5s
            const delay = retries * 2000;
            console.log(`[Billing] Retrying in ${delay}ms...`);
            await wait(delay);
        }
    }

    return false;
};

/**
 * Check if billing is initialized and available
 */
export const isBillingAvailable = (): boolean => {
    return isBillingInitialized;
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
            const transactionId = purchase.transactionId;
            if (transactionId) {
                try {
                    // Determine if consumable
                    const isConsumable = purchase.productId === PRODUCT_IDS.EXAM_ATTEMPT;

                    // Acknowledge the purchase
                    await finishTransaction({ purchase, isConsumable });

                    if (isConsumable) {
                        // For consumables, we need to add credits
                        const { addExamCredit } = require('./storage');
                        await addExamCredit(1);
                        // console.log('[Billing] Added exam credit');
                    } else {
                        // Update local storage for subscriptions/lifetime
                        const { setPremiumStatus } = require('./storage');
                        await setPremiumStatus(true);
                        // console.log('[Billing] Premium status saved');
                    }

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
 * Get available products (Both Subscriptions and In-Apps) from Google Play
 */
export const getAvailableProducts = async (): Promise<Product[]> => {
    if (!isBillingInitialized) {
        const success = await initBilling();
        if (!success) {
            console.warn('[Billing] Cannot fetch products - billing initialization failed');
            return [];
        }
    }
    try {
        // Fetch Subscriptions (Explicitly request 'subs')
        const subscriptions = await fetchProducts({ skus: getSubscriptionIds(), type: 'subs' });
        // console.log('[Billing] Subscriptions fetched:', subscriptions.length);

        // Fetch In-App Products (Explicitly request 'inapp') ('inapp' is default but 'in-app' is preferred in v14)
        const products = await fetchProducts({ skus: getInAppProductIds(), type: 'in-app' }); // Using 'inapp' as it's often more compatible, or 'in-app'
        // console.log('[Billing] Products fetched:', products.length);

        // Normalize and merge
        // Note: RNIAP v12+ might use 'id' or 'productId'. We normalize to 'productId' for consistency if needed,
        // but the RNIAP types usually have productId. The logs showed 'id', so we ensure we handle that.
        const allProducts = [...(subscriptions || []), ...(products || [])] as Product[];

        return allProducts;
    } catch (error) {
        console.error('[Billing] Error fetching products:', error);
        return [];
    }
};

/**
 * Get the premium product
 */
export const getPremiumProduct = async (): Promise<Product | null> => {
    if (!isBillingInitialized) {
        console.warn('[Billing] Cannot get premium product - billing not initialized');
        return null;
    }
    try {
        const products = await getAvailableProducts();
        // Check both productId and id (RNIAP types mismatch fallback)
        const premium = products.find(p => ((p as any).productId || (p as any).id) === PRODUCT_IDS.PREMIUM_MONTHLY);
        return premium || null;
    } catch (error) {
        console.error('[Billing] Error getting premium product:', error);
        return null;
    }
};

/**
 * Purchase the premium unlock
 */
/**
 * Purchase a product (Subscription or One-time)
 */
export const purchaseProduct = async (product: Product): Promise<boolean> => {
    if (!isBillingInitialized) {
        const success = await initBilling();
        if (!success) {
            console.warn('[Billing] Cannot purchase - billing not initialized');
            return false;
        }
    }
    try {
        const sku = (product as any).productId || (product as any).id;

        if (!sku) {
            throw new Error('Product SKU is missing');
        }

        console.log('[Billing] Initiating purchase for:', sku, 'Type:', product.type);

        // SUBSCRIPTIONS
        if ((product.type as any) === 'subs') {
            const androidProduct = product as any;
            let offerToken = null;

            if (Platform.OS === 'android') {
                // Debug: Log the full product structure to see what properties are available
                console.log('[Billing] Full subscription product object:', JSON.stringify(androidProduct, null, 2));

                // Try multiple possible property names for subscription offers
                // The correct property is subscriptionOfferDetailsAndroid (as shown in logs)
                const offers = androidProduct.subscriptionOfferDetailsAndroid ||
                    androidProduct.subscriptionOfferDetails ||
                    androidProduct.subscriptionOffers ||
                    androidProduct.offers ||
                    (androidProduct.subscriptionOptions ? androidProduct.subscriptionOptions : null);

                console.log('[Billing] Subscription offers found:', offers ? JSON.stringify(offers, null, 2) : 'NONE');

                if (offers && Array.isArray(offers) && offers.length > 0) {
                    // Try to find a trial offer first (free pricing phase)
                    const trialOffer = offers.find((offer: any) =>
                        offer.pricingPhases &&
                        offer.pricingPhases.pricingPhaseList &&
                        offer.pricingPhases.pricingPhaseList.some((phase: any) => phase.priceAmountMicros === '0')
                    );

                    // Use trial offer if found, otherwise use the first offer
                    offerToken = trialOffer?.offerToken ||
                        trialOffer?.basePlanId ||
                        offers[0]?.offerToken ||
                        offers[0]?.basePlanId;

                    console.log('[Billing] Selected offer token:', offerToken);
                }

                if (!offerToken) {
                    console.error('[Billing] No offer token found for subscription:', sku);
                    console.error('[Billing] Product keys:', Object.keys(androidProduct));
                    throw new Error('No offer token found for subscription. Please try again later.');
                }
            }

            if (Platform.OS === 'android' && offerToken) {
                const requestParams: any = {
                    type: 'subs',
                    request: {
                        android: {
                            skus: [sku],
                            subscriptionOffers: [{
                                sku: sku,
                                offerToken: offerToken
                            }]
                        },
                        ios: {
                            sku: sku,
                            andDangerouslyFinishTransactionAutomatically: false
                        }
                    }
                };
                console.log('[Billing] Requesting subscription (Android):', JSON.stringify(requestParams));
                await requestPurchase(requestParams);
            }
            else if (Platform.OS === 'ios') {
                const requestParams: any = {
                    type: 'subs',
                    request: {
                        ios: {
                            sku: sku,
                            andDangerouslyFinishTransactionAutomatically: false
                        },
                        android: {
                            skus: [sku] // Fallback structure
                        }
                    }
                };
                console.log('[Billing] Requesting subscription (iOS):', JSON.stringify(requestParams));
                await requestPurchase(requestParams);
            }
        }
        // IN-APP PRODUCTS (Lifetime/One-time)
        else {
            const requestParams: any = {
                type: 'in-app',
                request: {
                    android: {
                        skus: [sku], // Strict requirement for array
                    },
                    ios: {
                        sku: sku,
                        andDangerouslyFinishTransactionAutomatically: false
                    }
                }
            };

            console.log('[Billing] Requesting one-time purchase:', JSON.stringify(requestParams));
            await requestPurchase(requestParams);
        }

        // Return true to indicate the purchase request was successfully sent
        return true;
    } catch (error: any) {
        console.error('[Billing] Purchase error:', error);

        // Handle user cancellation
        if (error.code === 'E_USER_CANCELLED') {
            return false;
        }

        throw error;
    }
};

/**
 * Check if the user has purchased premium and return the type
 */
export type SubscriptionType = 'none' | 'monthly' | 'lifetime';

export const checkPurchaseStatus = async (): Promise<SubscriptionType> => {
    if (!isBillingInitialized) {
        console.warn('[Billing] Cannot check purchase status - billing not initialized');
        return 'none';
    }
    try {
        // Get all available purchases
        const purchases = await getAvailablePurchases();

        // Check for Lifetime first (highest tier)
        const hasLifetime = purchases.some(
            purchase => purchase.productId === PRODUCT_IDS.PREMIUM_LIFETIME
        );

        if (hasLifetime) return 'lifetime';

        // Check for Monthly
        const hasMonthly = purchases.some(
            purchase => purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY
        );

        if (hasMonthly) return 'monthly';

        return 'none';
    } catch (error) {
        console.error('[Billing] Error checking purchase status:', error);
        return 'none';
    }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
    if (!isBillingInitialized) {
        console.warn('[Billing] Cannot restore purchases - billing not initialized');
        return false;
    }
    try {
        const purchases = await getAvailablePurchases();

        // Check if premium was restored
        const hasPremium = purchases.some(
            purchase => purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY || purchase.productId === PRODUCT_IDS.PREMIUM_LIFETIME
        );

        if (hasPremium) {
            return true;
        } else {
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
        case 'E_IAP_NOT_AVAILABLE':
            return 'In-app purchases are not available on this device.';
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
