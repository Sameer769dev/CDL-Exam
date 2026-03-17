/**
 * Analytics utility for tracking monetization events
 * This is a simple implementation that logs to console
 * You can integrate with Firebase Analytics, Mixpanel, or other services
 */

export type MonetizationEvent =
    | 'paywall_viewed'
    | 'purchase_initiated'
    | 'purchase_completed'
    | 'purchase_failed'
    | 'purchase_cancelled'
    | 'restore_purchases'
    | 'restore_success'
    | 'restore_failed'
    | 'ad_impression'
    | 'ad_clicked'
    | 'ad_failed'
    | 'ad_closed';

interface EventProperties {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Track a monetization event
 */
export const trackEvent = (eventName: MonetizationEvent, properties?: EventProperties) => {
    const timestamp = new Date().toISOString();
    const eventData = {
        event: eventName,
        timestamp,
        ...properties,
    };



    // TODO: Integrate with your analytics service
    // Examples:
    // - Firebase Analytics: analytics().logEvent(eventName, properties)
    // - Mixpanel: mixpanel.track(eventName, properties)
    // - Amplitude: amplitude.logEvent(eventName, properties)
};

/**
 * Track paywall view
 */
export const trackPaywallView = (source?: string) => {
    trackEvent('paywall_viewed', { source });
};

/**
 * Track purchase initiation
 */
export const trackPurchaseInitiated = (productId: string, price?: string) => {
    trackEvent('purchase_initiated', { product_id: productId, price });
};

/**
 * Track successful purchase
 */
export const trackPurchaseCompleted = (productId: string, price?: string, revenue?: number) => {
    trackEvent('purchase_completed', {
        product_id: productId,
        price,
        revenue,
        currency: 'USD',
    });
};

/**
 * Track failed purchase
 */
export const trackPurchaseFailed = (productId: string, error: string) => {
    trackEvent('purchase_failed', { product_id: productId, error });
};

/**
 * Track cancelled purchase
 */
export const trackPurchaseCancelled = (productId: string) => {
    trackEvent('purchase_cancelled', { product_id: productId });
};

/**
 * Track restore purchases
 */
export const trackRestorePurchases = (success: boolean, error?: string) => {
    if (success) {
        trackEvent('restore_success');
    } else {
        trackEvent('restore_failed', { error });
    }
};

/**
 * Track ad impression
 */
export const trackAdImpression = (adType: 'banner' | 'interstitial' | 'rewarded', adUnitId?: string) => {
    trackEvent('ad_impression', { ad_type: adType, ad_unit_id: adUnitId });
};

/**
 * Track ad click
 */
export const trackAdClicked = (adType: 'banner' | 'interstitial' | 'rewarded') => {
    trackEvent('ad_clicked', { ad_type: adType });
};

/**
 * Track ad failure
 */
export const trackAdFailed = (adType: 'banner' | 'interstitial' | 'rewarded', error: string) => {
    trackEvent('ad_failed', { ad_type: adType, error });
};

/**
 * Track ad closed
 */
export const trackAdClosed = (adType: 'banner' | 'interstitial' | 'rewarded', rewarded?: boolean) => {
    trackEvent('ad_closed', { ad_type: adType, rewarded });
};

/**
 * Set user properties
 */
export const setUserProperty = (propertyName: string, value: string | number | boolean) => {


    // TODO: Integrate with your analytics service
    // Examples:
    // - Firebase Analytics: analytics().setUserProperty(propertyName, value)
    // - Mixpanel: mixpanel.getPeople().set(propertyName, value)
};

/**
 * Set premium status as user property
 */
export const setUserPremiumStatus = (isPremium: boolean) => {
    setUserProperty('is_premium', isPremium);
};
