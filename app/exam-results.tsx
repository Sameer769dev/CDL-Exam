import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle, XCircle, Home, Clock } from "lucide-react-native";

export default function ExamResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const score = Number(params.score);
    const total = Number(params.total);
    const timeTaken = Number(params.timeTaken);

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 80;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1 p-6" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
                <View className="items-center mb-8">
                    {passed ? (
                        <CheckCircle size={80} color="#22c55e" />
                    ) : (
                        <XCircle size={80} color="#ef4444" />
                    )}
                    <Text className={`text-4xl font-bold mt-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {passed ? "You Passed!" : "Exam Failed"}
                    </Text>
                    <Text className="text-slate-500 text-lg mt-2 text-center">
                        {passed
                            ? "Great job! You're ready for the real thing."
                            : "Don't worry, keep practicing and try again."}
                    </Text>
                </View>

                <View className="bg-white w-full rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                    <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <Text className="text-slate-500 text-lg">Score</Text>
                        <Text className="text-2xl font-bold text-slate-900">{percentage}%</Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <Text className="text-slate-500 text-lg">Correct Answers</Text>
                        <Text className="text-2xl font-bold text-slate-900">{score}/{total}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-slate-500 text-lg">Time Taken</Text>
                        <View className="flex-row items-center">
                            <Clock size={18} color="#64748b" className="mr-2" />
                            <Text className="text-2xl font-bold text-slate-900">{formatTime(timeTaken)}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.replace("/")}
                    className="bg-blue-600 w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 active:bg-blue-700"
                >
                    <Home size={24} color="white" className="mr-2" />
                    <Text className="text-white font-bold text-xl">
                        Back to Home
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
