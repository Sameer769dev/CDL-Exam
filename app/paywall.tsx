import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Dimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Check, X, ShieldCheck, Zap, Star, Award, Lock } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useUser } from "../src/context/UserContext";
import { getPremiumProduct, getBillingErrorMessage, getAvailableProducts, purchaseProduct, checkPurchaseStatus, PRODUCT_IDS } from "../src/utils/billing";
import { trackPaywallView, trackPurchaseInitiated, trackPurchaseCompleted, trackPurchaseFailed, trackPurchaseCancelled, trackRestorePurchases } from "../src/utils/analytics";
import { Product } from "react-native-iap";
import PremiumSuccessModal from "../src/components/PremiumSuccessModal";

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
    const router = useRouter();
    const { unlockPremium, restorePurchases } = useUser();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const scale = useSharedValue(1);

    useEffect(() => {
        trackPaywallView();
        loadProducts();
        // Pulse animation for CTA
        scale.value = withRepeat(withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const availableProducts = await getAvailableProducts();
            setProducts(availableProducts);
            if (availableProducts.length === 0) {
                console.log('[Paywall] No products found on first load');
            }
        } catch (error) {
            console.error('[Paywall] Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async () => {
        const productToBuy = products.find(p => {
            // RNIAP v14+ might use 'id' or 'productId'. Check both.
            const pid = (p as any).productId || (p as any).id;

            return selectedPlan === 'monthly'
                ? pid === PRODUCT_IDS.PREMIUM_MONTHLY
                : pid === PRODUCT_IDS.PREMIUM_LIFETIME;
        });

        if (!productToBuy) {
            Alert.alert(
                'Products not loaded',
                'We couldn\'t load the products from Google Play. Please type Retry to try again.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Retry', onPress: () => loadProducts() }
                ]
            );
            return;
        }

        setIsPurchasing(true);
        trackPurchaseInitiated((productToBuy as any).productId || (productToBuy as any).id, (productToBuy as any).localizedPrice);

        try {
            await purchaseProduct(productToBuy);

            // Poll for status change since purchaseProduct returns null immediately
            // and the listener handles the actual completion asynchronously
            let attempts = 0;
            const checkInterval = setInterval(async () => {
                attempts++;
                const subscriptionStatus = await checkPurchaseStatus();

                // Only show success if user actually has premium (monthly or lifetime), not 'none'
                if (subscriptionStatus !== 'none') {
                    clearInterval(checkInterval);
                    setIsPurchasing(false);
                    trackPurchaseCompleted((productToBuy as any).productId || (productToBuy as any).id, (productToBuy as any).localizedPrice, productToBuy.price || 0);

                    // Refresh user context
                    await restorePurchases(); // This reloads data in context

                    // Show premium success modal
                    setShowSuccessModal(true);
                } else if (attempts > 20) { // Timeout after ~20-40 seconds
                    clearInterval(checkInterval);
                    setIsPurchasing(false);
                    // Don't show error, just stop loading. User might still be in system flow.
                }
            }, 2000);

        } catch (error: any) {
            setIsPurchasing(false);
            if (error?.code !== 'E_USER_CANCELLED') {
                const msg = getBillingErrorMessage(error);
                trackPurchaseFailed((productToBuy as any).productId || (productToBuy as any).id, msg);
                Alert.alert('Purchase Failed', msg);
            } else {
                trackPurchaseCancelled((productToBuy as any).productId || (productToBuy as any).id);
            }
        }
    };

    const handleRestore = async () => {
        setIsPurchasing(true);
        try {
            const restored = await restorePurchases();
            trackRestorePurchases(restored);
            Alert.alert(
                restored ? 'Purchases Restored' : 'No Purchases Found',
                restored ? 'Your premium access has been restored!' : 'We couldn\'t find any active subscriptions for this account.'
            );
        } catch (error: any) {
            const msg = getBillingErrorMessage(error);
            trackRestorePurchases(false, msg);
            Alert.alert('Restore Failed', msg);
        } finally {
            setIsPurchasing(false);
        }
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const features = [
        { icon: ShieldCheck, text: "Pass Guarantee", desc: "99% pass rate for premium users" },
        { icon: Zap, text: "Unlimited Practice", desc: "Access all 5000+ exam questions" },
        { icon: Star, text: "Exam Simulator", desc: "Realistic test environment" },
        { icon: Award, text: "Ad-Free Experience", desc: "Focus on your studies" },
    ];

    const monthlyProduct = products.find(p => ((p as any).productId || (p as any).id) === PRODUCT_IDS.PREMIUM_MONTHLY);
    const lifetimeProduct = products.find(p => ((p as any).productId || (p as any).id) === PRODUCT_IDS.PREMIUM_LIFETIME);

    const monthlyPrice = (monthlyProduct as any)?.localizedPrice || "$29.99";
    const lifetimePrice = (lifetimeProduct as any)?.localizedPrice || "$99.99";

    return (
        <View className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

            <SafeAreaView className="flex-1">
                {/* Close Button */}
                <View className="flex-row justify-end p-4 z-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-slate-800/80 p-2 rounded-full backdrop-blur-md active:bg-slate-700"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <X size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                >
                    {/* Header with Logo */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-8 mt-2">
                        <View className="shadow-2xl shadow-blue-500/20 mb-6">
                            <Image
                                source={require('../assets/icon.png')}
                                style={{ width: 80, height: 80, borderRadius: 20 }}
                                resizeMode="cover"
                            />
                        </View>
                        <Text className="text-3xl font-black text-white text-center mb-2">
                            Unlock Full Access
                        </Text>
                        <Text className="text-slate-400 text-center text-lg font-medium">
                            Pass your CDL exam with confidence
                        </Text>
                    </Animated.View>

                    {/* Features List */}
                    <View className="mb-8 gap-4">
                        {features.map((feature, index) => (
                            <Animated.View
                                key={index}
                                entering={FadeInDown.delay(200 + (index * 100)).springify()}
                                className="flex-row items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50"
                            >
                                <View className="w-10 h-10 bg-blue-500/10 rounded-lg items-center justify-center mr-3">
                                    <feature.icon size={20} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base">{feature.text}</Text>
                                    <Text className="text-slate-400 text-xs">{feature.desc}</Text>
                                </View>
                                <Check size={18} color="#22c55e" strokeWidth={3} />
                            </Animated.View>
                        ))}
                    </View>

                    {/* Plans Selection */}
                    <Animated.View entering={FadeInDown.delay(600).springify()} className="gap-4 mb-8">
                        {/* Lifetime Plan */}
                        <TouchableOpacity
                            onPress={() => setSelectedPlan('lifetime')}
                            activeOpacity={0.9}
                            className={`relative overflow-hidden rounded-2xl border-2 ${selectedPlan === 'lifetime' ? 'border-amber-400 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}
                        >
                            {selectedPlan === 'lifetime' && (
                                <View className="absolute top-0 right-0 bg-amber-400 px-3 py-1 rounded-bl-xl z-10">
                                    <Text className="text-slate-900 font-bold text-xs uppercase tracking-wider">Best Value</Text>
                                </View>
                            )}
                            <View className="p-5">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className={`font-bold text-lg ${selectedPlan === 'lifetime' ? 'text-white' : 'text-slate-300'}`}>Lifetime Access</Text>
                                    {selectedPlan === 'lifetime' && <View className="bg-amber-400/20 p-1 rounded-full"><Check size={16} color="#fbbf24" /></View>}
                                </View>
                                <View className="flex-row items-baseline">
                                    <Text className="text-3xl font-black text-white">{lifetimePrice}</Text>
                                    <Text className="text-slate-400 ml-1 text-sm">/ one-time</Text>
                                </View>
                                <Text className="text-slate-400 text-xs mt-2">Pay once, own it forever. No subscriptions.</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Monthly Plan */}
                        <TouchableOpacity
                            onPress={() => setSelectedPlan('monthly')}
                            activeOpacity={0.9}
                            className={`relative overflow-hidden rounded-2xl border-2 ${selectedPlan === 'monthly' ? 'border-blue-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}
                        >
                            <View className="p-5">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className={`font-bold text-lg ${selectedPlan === 'monthly' ? 'text-white' : 'text-slate-300'}`}>Monthly Plan</Text>
                                    {selectedPlan === 'monthly' && <View className="bg-blue-500/20 p-1 rounded-full"><Check size={16} color="#3b82f6" /></View>}
                                </View>
                                <View className="flex-row items-baseline">
                                    <Text className="text-3xl font-black text-white">{monthlyPrice}</Text>
                                    <Text className="text-slate-400 ml-1 text-sm">/ month</Text>
                                </View>
                                <Text className="text-blue-400 font-bold text-xs mt-2">
                                    7 Days Free • $19.99 first month • Then {monthlyPrice}/mo
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Action Button */}
                    <Animated.View entering={FadeInDown.delay(700).springify()} className="mb-6">
                        <TouchableOpacity
                            onPress={handlePurchase}
                            disabled={isPurchasing || isLoading}
                            activeOpacity={0.9}
                        >
                            <Animated.View
                                style={[animatedButtonStyle]}
                                className={`py-4 rounded-full items-center shadow-lg ${selectedPlan === 'lifetime' ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-600/30'}`}
                            >
                                {isPurchasing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-xl tracking-wide">
                                        {selectedPlan === 'lifetime' ? 'Get Lifetime Access' : 'Start Free Trial'}
                                    </Text>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                        <Text className="text-slate-500 text-xs text-center mt-4">
                            {selectedPlan === 'lifetime'
                                ? 'One-time payment. No recurring fees.'
                                : 'Recurring billing. Cancel anytime in Google Play.'}
                        </Text>
                    </Animated.View>

                    {/* Footer Links */}
                    <View className="flex-row justify-center gap-6 mb-8">
                        <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
                            <Text className="text-slate-400 font-semibold text-sm">Restore Purchases</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {/* Open Terms */ }}>
                            <Text className="text-slate-600 text-sm">Terms</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {/* Open Privacy */ }}>
                            <Text className="text-slate-600 text-sm">Privacy</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Premium Success Modal */}
            <PremiumSuccessModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
            />
        </View>
    );
}
