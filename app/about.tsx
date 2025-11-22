import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Mail,
    Globe,
    FileText,
    Shield,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Truck
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
        <View className="mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <TouchableOpacity
                onPress={toggleExpand}
                className="p-4 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
            >
                <Text className="text-slate-900 dark:text-white font-semibold flex-1 mr-4">
                    {question}
                </Text>
                {expanded ? (
                    <ChevronUp size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                ) : (
                    <ChevronDown size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                )}
            </TouchableOpacity>
            {expanded && (
                <View className="px-4 pb-4 pt-0">
                    <Text className="text-slate-600 dark:text-slate-400 leading-relaxed">
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
        Linking.openURL('mailto:support@cdlprep2025.com?subject=CDL Prep App Support');
    };

    const handleOpenWebsite = () => {
        Linking.openURL('https://www.cdlprep2025.com');
    };

    const handlePrivacyPolicy = () => {
        Linking.openURL('https://www.cdlprep2025.com/privacy');
    };

    const handleTerms = () => {
        Linking.openURL('https://www.cdlprep2025.com/terms');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                title: "About & Help",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color={isDark ? "#fff" : "#0f172a"} />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView className="flex-1 p-6">
                {/* Header */}
                <View className="items-center mb-8">
                    <View className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl mb-4">
                        <Truck size={48} color="#2563eb" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        CDL Prep 2025
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400">
                        Version 1.0.0
                    </Text>
                </View>

                {/* Description */}
                <Text className="text-slate-600 dark:text-slate-400 text-center mb-8 leading-relaxed">
                    The most comprehensive study guide for your Commercial Driver's License exam. Master every category with practice tests, flashcards, and detailed analytics.
                </Text>

                {/* Support */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-2">
                        Support
                    </Text>

                    <TouchableOpacity
                        onPress={handleContactSupport}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center mb-4 active:bg-slate-50 dark:active:bg-slate-700"
                    >
                        <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-4">
                            <Mail size={20} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 dark:text-white font-semibold">Contact Support</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm">Get help with any issues</Text>
                        </View>
                        <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleOpenWebsite}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center active:bg-slate-50 dark:active:bg-slate-700"
                    >
                        <View className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                            <Globe size={20} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 dark:text-white font-semibold">Visit Website</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm">More resources online</Text>
                        </View>
                        <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                    </TouchableOpacity>
                </View>

                {/* FAQ */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-2">
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
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-2">
                        Legal
                    </Text>

                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <TouchableOpacity
                            onPress={handlePrivacyPolicy}
                            className="p-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                        >
                            <View className="flex-row items-center">
                                <Shield size={20} color={isDark ? "#94a3b8" : "#64748b"} className="mr-3" />
                                <Text className="text-slate-900 dark:text-white font-medium">Privacy Policy</Text>
                            </View>
                            <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleTerms}
                            className="p-4 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
                        >
                            <View className="flex-row items-center">
                                <FileText size={20} color={isDark ? "#94a3b8" : "#64748b"} className="mr-3" />
                                <Text className="text-slate-900 dark:text-white font-medium">Terms of Service</Text>
                            </View>
                            <ChevronDown size={20} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text className="text-slate-400 text-center text-xs mb-8">
                    © 2025 CDL Prep Inc. All rights reserved.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
