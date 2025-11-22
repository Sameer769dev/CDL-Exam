import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Check, Star, Shield, Zap, X } from "lucide-react-native";
import { useUser } from "../src/context/UserContext";
import { getPremiumProduct, getBillingErrorMessage } from "../src/utils/billing";
import { trackPaywallView, trackPurchaseInitiated, trackPurchaseCompleted, trackPurchaseFailed, trackPurchaseCancelled, trackRestorePurchases } from "../src/utils/analytics";
import { Product } from "react-native-iap";

export default function PaywallScreen() {
    const router = useRouter();
    const { unlockPremium, restorePurchases, isLoading: isUserLoading } = useUser();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        trackPaywallView();
        loadProduct();
    }, []);

    const loadProduct = async () => {
        setIsLoading(true);
        try {
            const premiumProduct = await getPremiumProduct();
            setProduct(premiumProduct);
        } catch (error) {
            console.error('[Paywall] Error loading product:', error);
            Alert.alert('Error', 'Failed to load product information. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!product) {
            Alert.alert('Error', 'Product not available. Please try again.');
            return;
        }

        setIsPurchasing(true);
        trackPurchaseInitiated(product.productId, product.localizedPrice);

        try {
            await unlockPremium();

            // Track successful purchase
            trackPurchaseCompleted(
                product.productId,
                product.localizedPrice,
                parseFloat(product.price)
            );

            Alert.alert(
                'Success! 🎉',
                'Premium unlocked! You now have access to all features.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('[Paywall] Purchase error:', error);

            // Check if user cancelled
            if (error?.code === 'E_USER_CANCELLED') {
                trackPurchaseCancelled(product.productId);
            } else {
                const errorMessage = getBillingErrorMessage(error);
                trackPurchaseFailed(product.productId, errorMessage);
                Alert.alert('Purchase Failed', errorMessage);
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setIsPurchasing(true);

        try {
            const restored = await restorePurchases();

            trackRestorePurchases(restored);

            if (restored) {
                Alert.alert(
                    'Success! 🎉',
                    'Purchases restored successfully!',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert(
                    'No Purchases Found',
                    'No previous purchases were found for this account.'
                );
            }
        } catch (error: any) {
            console.error('[Paywall] Restore error:', error);
            const errorMessage = getBillingErrorMessage(error);
            trackRestorePurchases(false, errorMessage);
            Alert.alert('Restore Failed', errorMessage);
        } finally {
            setIsPurchasing(false);
        }
    };

    const features = [
        "Unlock All 8 Endorsement Categories",
        "Unlimited Exam Simulator Access",
        "Mistake Bank & Review Mode",
        "Ad-Free Experience",
        "Offline Access",
        "Lifetime Updates"
    ];

    const priceString = product?.localizedPrice || "$14.99";

    return (
        <View className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1">
                <View className="flex-row justify-end p-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-slate-800 p-2 rounded-full"
                        disabled={isPurchasing}
                    >
                        <X size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <View className="items-center mb-8 mt-4">
                        <View className="bg-yellow-500 p-4 rounded-2xl mb-6 shadow-lg shadow-yellow-500/20">
                            <Star size={48} color="white" fill="white" />
                        </View>
                        <Text className="text-3xl font-black text-white text-center mb-2">
                            Go Premium
                        </Text>
                        <Text className="text-slate-400 text-center text-lg">
                            Master your CDL exam with full access
                        </Text>
                    </View>

                    <View className="bg-slate-800 rounded-3xl p-6 mb-8 border border-slate-700">
                        {features.map((feature, index) => (
                            <View key={index} className="flex-row items-center mb-4 last:mb-0">
                                <View className="bg-green-500/20 p-1 rounded-full mr-4">
                                    <Check size={16} color="#4ade80" />
                                </View>
                                <Text className="text-white font-medium text-lg flex-1">
                                    {feature}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View className="items-center mb-8">
                        <Text className="text-slate-400 text-sm mb-2">One-time payment. No subscriptions.</Text>
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-4xl font-bold text-white">
                                {priceString}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handlePurchase}
                        className="bg-yellow-500 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-yellow-500/20 active:bg-yellow-600 mb-4"
                        disabled={isPurchasing || isLoading || !product}
                    >
                        {isPurchasing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Zap size={24} color="white" fill="white" className="mr-2" />
                                <Text className="text-white font-bold text-xl">
                                    Unlock Everything
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRestore}
                        className="py-3 items-center"
                        disabled={isPurchasing}
                    >
                        <Text className="text-slate-500 font-medium">
                            Restore Purchases
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
