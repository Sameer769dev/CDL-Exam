import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Mail,
    Globe,
    FileText,
    Shield,
    ChevronDown,
    ChevronUp
} from 'lucide-react-native';
import { useTheme } from '../src/context/ThemeContext';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [expanded, setExpanded] = useState(false);
    const { isDark } = useTheme();

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View className="mb-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <TouchableOpacity
                onPress={toggleExpand}
                className="p-5 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
            >
                <Text className="text-slate-900 dark:text-white font-bold flex-1 mr-4 text-base">
                    {question}
                </Text>
                {expanded ? (
                    <ChevronUp size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                ) : (
                    <ChevronDown size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                )}
            </TouchableOpacity>
            {expanded && (
                <View className="px-5 pb-5 pt-0">
                    <Text className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {answer}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default function AboutScreen() {
    const router = useRouter();
    const { isDark } = useTheme();

    const handleContactSupport = () => {
        Linking.openURL('mailto:cdlexampreps10@gmail.com?subject=CDL Prep App Support');
    };

    const handleOpenWebsite = () => {
        Linking.openURL('https://cdlprep2025.vercel.app');
    };

    const handlePrivacyPolicy = () => {
        Linking.openURL('https://cdlprep2025.vercel.app/privacy.html');
    };

    const handleTerms = () => {
        Linking.openURL('https://cdlprep2025.vercel.app/terms.html');
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Custom Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <ChevronLeft size={28} color={isDark ? "#fff" : "#1e293b"} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        About & Help
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400">
                        Version 1.0.6
                    </Text>
                    <View className="w-10" /> {/* Spacer for balance */}
                </View>

                <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="items-center mb-10 mt-4">
                        <View className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-3xl mb-6 shadow-sm shadow-blue-100 dark:shadow-none">
                            <Image
                                source={require('../assets/splash-icon.png')}
                                className="w-16 h-16"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                            CDL Prep 2025
                        </Text>
                        <View className="bg-slate-200 dark:bg-slate-800 px-4 py-1.5 rounded-full">
                            <Text className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                                Version 1.0.5
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="text-slate-600 dark:text-slate-400 text-center mb-10 leading-relaxed text-lg px-4">
                        The most comprehensive study guide for your Commercial Driver's License exam. Master every category with practice tests, flashcards, and detailed analytics.
                    </Text>

                    {/* Support */}
                    <View className="mb-10">
                        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 ml-4">
                            Support
                        </Text>

                        <TouchableOpacity
                            onPress={handleContactSupport}
                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex-row items-center mb-4 active:bg-slate-50 dark:active:bg-slate-700 shadow-sm"
                        >
                            <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl mr-4">
                                <Mail size={24} color="#2563eb" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 dark:text-white font-bold text-lg mb-0.5">Contact Support</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Get help with any issues</Text>
                            </View>
                            <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleOpenWebsite}
                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex-row items-center active:bg-slate-50 dark:active:bg-slate-700 shadow-sm"
                        >
                            <View className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl mr-4">
                                <Globe size={24} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 dark:text-white font-bold text-lg mb-0.5">Visit Website</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">More resources online</Text>
                            </View>
                            <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    {/* FAQ */}
                    <View className="mb-10">
                        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 ml-4">
                            Frequently Asked Questions
                        </Text>

                        <FAQItem
                            question="Is this app up to date for 2025?"
                            answer="Yes! Our question bank is regularly updated to reflect the latest CDL standards and regulations for the 2025 exam year."
                        />
                        <FAQItem
                            question="Does this cover all endorsements?"
                            answer="We cover General Knowledge, Air Brakes, Combination Vehicles, Hazmat, Tanker, Doubles/Triples, Passenger, and School Bus endorsements."
                        />
                        <FAQItem
                            question="Can I use the app offline?"
                            answer="Yes, once downloaded, all practice questions and flashcards are available offline so you can study anywhere."
                        />
                        <FAQItem
                            question="How do I reset my progress?"
                            answer="Currently, you can reset individual category progress by reinstalling the app. A dedicated reset feature is coming in the next update."
                        />
                    </View>

                    {/* Legal */}
                    <View className="mb-12">
                        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 ml-4">
                            Legal
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <TouchableOpacity
                                onPress={handlePrivacyPolicy}
                                className="p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center">
                                    <View className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl mr-3">
                                        <Shield size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-bold text-base">Privacy Policy</Text>
                                </View>
                                <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleTerms}
                                className="p-5 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center">
                                    <View className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl mr-3">
                                        <FileText size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-bold text-base">Terms of Service</Text>
                                </View>
                                <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text className="text-slate-400 text-center text-xs font-medium mb-8">
                        © 2025 CDL Prep Inc. All rights reserved.
                    </Text>

                    {/* Bottom Spacer */}
                    <View className="h-8" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
