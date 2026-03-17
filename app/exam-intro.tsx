import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

// Helper Components
const FeatureItem = ({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
    <View className="w-1/2 p-2">
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 items-center border border-slate-200 dark:border-slate-700">
            <Ionicons name={icon} size={32} color={color} style={{ marginBottom: 8 }} />
            <Text className="text-base font-bold text-slate-900 dark:text-white text-center mt-2">{title}</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">{desc}</Text>
        </View>
    </View>
);

const InstructionItem = ({ number, text, isLast }: { number: string, text: string, isLast?: boolean }) => (
    <View className={`flex-row items-start ${!isLast ? 'mb-4' : ''}`}>
        <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Text className="text-white text-xs font-bold">{number}</Text>
        </View>
        <Text className="flex-1 text-slate-700 dark:text-slate-300 text-base leading-relaxed">{text}</Text>
    </View>
);

import CreditSuccessModal from '../src/components/CreditSuccessModal';

export default function ExamIntroScreen() {
    const router = useRouter();
    const { highScores, isPremium, subscriptionType, examCredits, purchaseExamAttempt, spendExamCredit } = useUser();
    const { isDark } = useTheme();
    const [purchasing, setPurchasing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Safely handle undefined credits
    const availableCredits = examCredits ?? 0;
    const isLifetime = subscriptionType === 'lifetime';

    // Get exam high score (assuming 'exam_simulator' is the category ID)
    const examScore = highScores['exam_simulator'];

    const handleStartExam = async () => {
        if (isLifetime) {
            // Lifetime users have unlimited access
            router.replace('/exam-simulator');
            return;
        }

        if (availableCredits > 0) {
            // Consume a credit
            const success = await spendExamCredit();
            if (success) {
                router.replace('/exam-simulator');
            } else {
                Alert.alert('Error', 'Failed to start exam. Please try again.');
            }
        } else {
            // No credits
            Alert.alert(
                'No Exam Credits',
                'You need an exam credit to start a simulated exam.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Get Credits', onPress: () => { /* Scroll to purchase or show modal */ } }
                ]
            );
        }
    };

    const handlePurchaseSingle = async () => {
        setPurchasing(true);
        try {
            // Race the purchase attempt with a timeout to prevent infinite spinner
            const purchasePromise = purchaseExamAttempt();
            const timeoutPromise = new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(false), 30000); // 30s timeout
            });

            // If purchase takes too long or user closes without result, timeout wins
            const success = await Promise.race([purchasePromise, timeoutPromise]);

            if (success) {
                // Show custom beautiful modal instead of alert
                setShowSuccessModal(true);
            }
            // If !success (cancelled or timeout), we stop spinner in finally
        } catch (error) {
            Alert.alert('Error', 'Purchase failed. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Custom Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 z-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <ChevronLeft size={28} color={isDark ? "#fff" : "#1e293b"} strokeWidth={2.5} />
                    </TouchableOpacity>

                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        Exam Simulator
                    </Text>

                    {/* Right Side: Credits Indicator */}
                    <View className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full flex-row items-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <Ionicons name="ticket" size={16} color={isDark ? "#fbbf24" : "#f59e0b"} />
                        <Text className="ml-2 font-black text-slate-900 dark:text-white">
                            {isLifetime ? "Unlimited" : availableCredits}
                        </Text>
                    </View>
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 200 }}>
                    {/* Hero Section */}
                    <View className="items-center py-8 px-6">
                        <LinearGradient
                            colors={isDark ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f1f5f9']}
                            className="w-32 h-32 rounded-full items-center justify-center mb-6 shadow-lg border border-slate-200 dark:border-slate-700"
                        >
                            <Ionicons name="speedometer" size={64} color={isDark ? "#38bdf8" : "#0284c7"} />
                        </LinearGradient>

                        <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            CDL Exam Simulator
                        </Text>
                        <Text className="text-base text-slate-500 dark:text-slate-400 text-center max-w-xs">
                            Simulate the real exam experience with timed questions and official grading criteria.
                        </Text>
                    </View>

                    {/* Features Grid */}
                    <View className="px-6 mb-8">
                        <View className="flex-row flex-wrap justify-between">
                            <FeatureItem
                                icon="time"
                                title="Timed Mode"
                                desc="60 minutes to complete"
                                color="#f59e0b"
                            />
                            <FeatureItem
                                icon="list"
                                title="50 Questions"
                                desc="Randomly selected"
                                color="#3b82f6"
                            />
                            <FeatureItem
                                icon="trophy"
                                title="80% Passing"
                                desc="Required to pass"
                                color="#10b981"
                            />
                            <FeatureItem
                                icon="refresh"
                                title="Real Format"
                                desc="Official test style"
                                color="#8b5cf6"
                            />
                        </View>
                    </View>

                    {/* Instructions */}
                    <View className="px-6 mb-8">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Before you start
                        </Text>
                        <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                            <InstructionItem number="1" text="You cannot pause the exam once started." />
                            <InstructionItem number="2" text="Unanswered questions count as incorrect." />
                            <InstructionItem number="3" text="Results are saved to your history." />
                            <InstructionItem number="4" text="Good luck!" isLast />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Bottom Action Area */}
            <View className="absolute bottom-0 left-0 right-0">
                <View className="bg-white/90 dark:bg-slate-900/90 blur-xl border-t border-slate-200 dark:border-slate-800 pb-8 pt-4 px-6">

                    {/* Purchase Options for Non-Lifetime Users with 0 Credits */}
                    {!isLifetime && availableCredits === 0 && (
                        <View className="mb-4 space-y-3">
                            <TouchableOpacity
                                onPress={() => router.push('/paywall')}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-500/30"
                                style={{ backgroundColor: '#4f46e5' }} // Fallback
                            >
                                <Ionicons name="infinite" size={24} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-lg">
                                    Unlock Unlimited Exams
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center justify-between">
                                <View className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                                <Text className="mx-4 text-slate-400 font-medium">OR</Text>
                                <View className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                            </View>

                            <TouchableOpacity
                                onPress={handlePurchaseSingle}
                                disabled={purchasing}
                                className="bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl flex-row items-center justify-center border border-slate-200 dark:border-slate-700"
                            >
                                {purchasing ? (
                                    <ActivityIndicator color={isDark ? "white" : "black"} />
                                ) : (
                                    <>
                                        <Ionicons name="ticket-outline" size={24} color={isDark ? "white" : "black"} style={{ marginRight: 8 }} />
                                        <Text className="text-slate-900 dark:text-white font-bold text-lg">
                                            Buy Single Attempt
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Start Exam Button - Visible if Lifetime OR has credits */}
                    {(isLifetime || availableCredits > 0) && (
                        <TouchableOpacity
                            onPress={handleStartExam}
                            className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/30"
                        >
                            <Text className="text-white font-bold text-xl mr-2">
                                Start Exam
                            </Text>
                            {!isLifetime && (
                                <View className="bg-blue-500 px-2 py-1 rounded-md">
                                    <Text className="text-white text-xs font-bold">
                                        {availableCredits} Left
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Premium Success Modal */}
            <CreditSuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onStartExam={() => {
                    setShowSuccessModal(false);
                    handleStartExam();
                }}
            />
        </View>
    );
}
