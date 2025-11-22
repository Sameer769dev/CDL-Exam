import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Timer, FileText, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react-native';

export default function ExamIntroScreen() {
    const router = useRouter();

    const handleStartExam = () => {
        router.replace('/exam');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title: 'Exam Simulator' }} />

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8 mt-4">
                    <View className="bg-blue-100 p-6 rounded-full mb-6">
                        <ShieldCheck size={64} color="#2563eb" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-900 text-center mb-2">
                        CDL Exam Simulator
                    </Text>
                    <Text className="text-slate-500 text-center text-lg px-4">
                        Test your knowledge under real exam conditions.
                    </Text>
                </View>

                <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                    <Text className="text-xl font-bold text-slate-900 mb-6">
                        Exam Rules
                    </Text>

                    <View className="flex-row items-start mb-6">
                        <View className="bg-slate-100 p-2 rounded-lg mr-4">
                            <FileText size={24} color="#475569" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">
                                50 Questions
                            </Text>
                            <Text className="text-slate-500">
                                Randomly selected from all categories.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start mb-6">
                        <View className="bg-slate-100 p-2 rounded-lg mr-4">
                            <Timer size={24} color="#475569" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">
                                60 Minutes
                            </Text>
                            <Text className="text-slate-500">
                                Complete the exam before the timer runs out.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start mb-6">
                        <View className="bg-slate-100 p-2 rounded-lg mr-4">
                            <ShieldCheck size={24} color="#475569" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">
                                80% Passing Score
                            </Text>
                            <Text className="text-slate-500">
                                You need to answer at least 40 questions correctly.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start">
                        <View className="bg-slate-100 p-2 rounded-lg mr-4">
                            <AlertCircle size={24} color="#475569" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">
                                No Explanations
                            </Text>
                            <Text className="text-slate-500">
                                You won't see if you're right or wrong until the end.
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleStartExam}
                    className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 active:bg-blue-700 mb-8"
                >
                    <Text className="text-white font-bold text-xl mr-2">
                        Start Exam
                    </Text>
                    <ArrowRight size={24} color="white" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
