import React from "react";
import { View, SafeAreaView } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ResultCard } from "../src/components/ResultCard";

export default function ResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const score = Number(params.score) || 0;
    const total = Number(params.total) || 5;
    const categoryId = (params.categoryId as string) || 'air_brakes';

    const handleRetake = () => {
        router.replace({
            pathname: "/quiz",
            params: { categoryId: categoryId }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1 items-center justify-center p-6">
                <ResultCard score={score} total={total} onRetake={handleRetake} />
            </View>
        </SafeAreaView>
    );
}
