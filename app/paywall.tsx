import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Check, Star, Shield, Zap, X } from "lucide-react-native";
import { useUser } from "../src/context/UserContext";
import { getOfferings } from "../src/utils/purchases";
import { PurchasesPackage } from "react-native-purchases";

export default function PaywallScreen() {
    const router = useRouter();
    const { unlockPremium, isLoading: isUserLoading } = useUser();
    const [offering, setOffering] = useState<PurchasesPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        const currentOffering = await getOfferings();
        if (currentOffering?.availablePackages.length > 0) {
            setOffering(currentOffering.availablePackages[0]);
        }
        setIsLoading(false);
    };

    const handlePurchase = async () => {
        try {
            await unlockPremium(offering || undefined);
            router.back();
        } catch (error) {
            // Error is handled in unlockPremium or just cancelled
        }
    };

    const handleRestore = async () => {
        try {
            await unlockPremium(); // No package arg triggers restore/fallback logic
            Alert.alert("Success", "Purchases restored!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to restore purchases.");
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

    const priceString = offering?.product.priceString || "$14.99";

    return (
        <View className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1">
                <View className="flex-row justify-end p-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-slate-800 p-2 rounded-full"
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
                    >
                        <Zap size={24} color="white" fill="white" className="mr-2" />
                        <Text className="text-white font-bold text-xl">
                            Unlock Everything
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRestore}
                        className="py-3 items-center"
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
