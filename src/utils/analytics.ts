/**
 * Analytics utility for CDL Prep
 * Handles monetization events, engagement milestones, and funnels.
 */

export type AppEvent =
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
    | 'ad_closed'
    // Engagement & Funnel Events
    | 'onboarding_started'
    | 'onboarding_step_completed'
    | 'onboarding_completed'
    | 'quiz_started'
    | 'quiz_completed'
    | 'question_answered'
    | 'ai_tutor_queried'
    | 'readiness_calculated'
    | 'streak_updated'
    | 'study_plan_viewed';

export type MonetizationEvent = AppEvent; // backwards compatibility

interface EventProperties {
    [key: string]: string | number | boolean | undefined | null;
}

type AnalyticsListener = (eventName: AppEvent, properties: EventProperties) => void;
const listeners: AnalyticsListener[] = [];

/**
 * Register a listener (e.g. Firebase Analytics, PostHog, Mixpanel).
 */
export const registerAnalyticsProvider = (listener: AnalyticsListener) => {
    listeners.push(listener);
};

/**
 * Track an application event
 */
export const trackEvent = (eventName: AppEvent, properties?: EventProperties) => {
    const timestamp = new Date().toISOString();
    const cleanProps: EventProperties = {};
    if (properties) {
        for (const [k, v] of Object.entries(properties)) {
            if (v !== undefined) cleanProps[k] = v;
        }
    }

    if (__DEV__) {
        console.log(`[Analytics] 📊 ${eventName}`, cleanProps);
    }

    for (const listener of listeners) {
        try {
            listener(eventName, { timestamp, ...cleanProps });
        } catch (err) {
            console.error(`[Analytics] Error in listener for ${eventName}:`, err);
        }
    }
};

// ─── Monetization & Ads ───────────────────────────────────────────────────────

export const trackPaywallView = (source?: string) => {
    trackEvent('paywall_viewed', { source });
};

export const trackPurchaseInitiated = (productId: string, price?: string) => {
    trackEvent('purchase_initiated', { product_id: productId, price });
};

export const trackPurchaseCompleted = (productId: string, price?: string, revenue?: number) => {
    trackEvent('purchase_completed', {
        product_id: productId,
        price,
        revenue,
        currency: 'USD',
    });
};

export const trackPurchaseFailed = (productId: string, error: string) => {
    trackEvent('purchase_failed', { product_id: productId, error });
};

export const trackPurchaseCancelled = (productId: string) => {
    trackEvent('purchase_cancelled', { product_id: productId });
};

export const trackRestorePurchases = (success: boolean, error?: string) => {
    if (success) {
        trackEvent('restore_success');
    } else {
        trackEvent('restore_failed', { error });
    }
};

export const trackAdImpression = (adType: 'banner' | 'interstitial' | 'rewarded', adUnitId?: string) => {
    trackEvent('ad_impression', { ad_type: adType, ad_unit_id: adUnitId });
};

export const trackAdClicked = (adType: 'banner' | 'interstitial' | 'rewarded') => {
    trackEvent('ad_clicked', { ad_type: adType });
};

export const trackAdFailed = (adType: 'banner' | 'interstitial' | 'rewarded', error: string) => {
    trackEvent('ad_failed', { ad_type: adType, error });
};

export const trackAdClosed = (adType: 'banner' | 'interstitial' | 'rewarded', rewarded?: boolean) => {
    trackEvent('ad_closed', { ad_type: adType, rewarded });
};

// ─── Engagement & Learning Funnel ─────────────────────────────────────────────

export const trackQuizStarted = (categoryId: string, mode: string, questionCount: number) => {
    trackEvent('quiz_started', { category_id: categoryId, mode, question_count: questionCount });
};

export const trackQuizCompleted = (categoryId: string, score: number, total: number, timeSpentSec: number) => {
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    trackEvent('quiz_completed', {
        category_id: categoryId,
        score,
        total,
        accuracy_percent: accuracy,
        time_spent_seconds: timeSpentSec,
    });
};

export const trackAITutorQueried = (categoryId: string, isCorrect: boolean) => {
    trackEvent('ai_tutor_queried', { category_id: categoryId, was_correct: isCorrect });
};

export const trackReadinessCalculated = (categoryId: string, scorePercent: number) => {
    trackEvent('readiness_calculated', { category_id: categoryId, readiness_score: scorePercent });
};

// ─── User Properties ──────────────────────────────────────────────────────────

const userProperties: Record<string, string | number | boolean> = {};

export const setUserProperty = (propertyName: string, value: string | number | boolean) => {
    userProperties[propertyName] = value;
    if (__DEV__) {
        console.log(`[Analytics] 👤 UserProperty [${propertyName}]:`, value);
    }
};

export const setUserPremiumStatus = (isPremium: boolean) => {
    setUserProperty('is_premium', isPremium);
};
