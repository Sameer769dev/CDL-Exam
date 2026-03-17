import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { getAvatarSource } from '../../src/utils/avatars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActionGrid } from '../../src/components/ActionGrid';
import { QuickAccessCarousel } from '../../src/components/QuickAccessCarousel';
import { BannerAdComponent } from '../../src/components/BannerAd';
import { useTheme } from '../../src/context/ThemeContext';
import { getCategories } from '../../src/utils/dataLoader';
import { Category } from '../../src/types/quiz';
import { useUser } from '../../src/context/UserContext';
import { ProgressStatsCard } from '../../src/components/progress/ProgressStatsCard';
import { WeakAreasCard } from '../../src/components/progress/WeakAreasCard';
import { TimeDisplay } from '../../src/components/progress/TimeDisplay';
import { useProgressStats } from '../../src/hooks/useProgressStats';

export default function HomeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { isDark } = useTheme();
    const { studyStreak, studySessions, isPremium, userProfile } = useUser();
    const { stats } = useProgressStats();
    const [categories, setCategories] = useState<Category[]>([]);
    const hasShownPaywall = React.useRef(false);

    useEffect(() => {
        setCategories(getCategories());

        // Check if we should show paywall (e.g. after onboarding)
        // Use ref to prevent double triggering if dependencies change
        if (params.showPaywall === 'true' && !isPremium && !hasShownPaywall.current) {
            hasShownPaywall.current = true;
            // Clear the param so it doesn't trigger again on remount
            router.setParams({ showPaywall: undefined });
            setTimeout(() => {
                router.push('/paywall');
            }, 500);
        }
    }, [params.showPaywall, isPremium]);

    // Calculate daily progress
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = studySessions.filter(s => s.date && s.date.startsWith(today));
    const todayQuestions = todaySessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
    const dailyGoal = 50;
    const progressPercent = Math.min((todayQuestions / dailyGoal) * 100, 100);

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 160 }}
                >
                    {/* Header */}
                    <View className="px-6 py-4 flex-row justify-between items-center">
                        <View>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {(() => {
                                    const hour = new Date().getHours();
                                    const totalQuestions = stats.totalQuestionsAttempted || 0;

                                    if (totalQuestions < 5) return "Welcome aboard,";
                                    if (hour < 12) return "Good morning,";
                                    if (hour < 17) return "Good afternoon,";
                                    return "Good evening,";
                                })()}
                            </Text>
                            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
                                {userProfile?.name || 'Driver'}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => router.push('/settings')}
                                activeOpacity={0.8}
                                className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden"
                            >
                                <Image
                                    source={getAvatarSource(userProfile?.avatar)}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View className="pb-6">
                        {/* Study Plan Widget - NEW */}
                        {userProfile?.examDate && (
                            <View className="mb-6 px-6">
                                <TouchableOpacity
                                    onPress={() => router.push('/study-plan')}
                                    activeOpacity={0.9}
                                    className="bg-blue-600 rounded-3xl p-5 shadow-lg shadow-blue-500/30 overflow-hidden relative"
                                >
                                    {/* Background Pattern */}
                                    <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                                    <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10" />

                                    <View className="flex-row items-center justify-between relative z-10">
                                        <View className="flex-1 mr-4">
                                            <View className="flex-row items-center mb-2">
                                                <View className="bg-white/20 px-2 py-1 rounded-md mr-2">
                                                    <Text className="text-white text-xs font-bold uppercase tracking-wider">
                                                        Study Plan
                                                    </Text>
                                                </View>
                                                <Text className="text-blue-100 text-xs font-medium">
                                                    {userProfile.targetState ? `${userProfile.targetState} Exam` : 'Personalized'}
                                                </Text>
                                            </View>
                                            <Text className="text-white text-xl font-bold mb-1">
                                                Stay on Track
                                            </Text>
                                            <Text className="text-blue-100 text-sm leading-tight">
                                                Your exam is on {new Date(userProfile.examDate).toLocaleDateString()}. View today's tasks.
                                            </Text>
                                        </View>
                                        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center border border-white/30">
                                            <Calendar size={24} color="white" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Action Grid */}
                        <View className="mb-8 px-6">
                            <ActionGrid />
                        </View>

                        {/* Daily Progress Section */}
                        <View className="mb-8 px-6">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Daily Progress
                            </Text>
                            <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex-row items-center justify-between">
                                <View>
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Current Streak</Text>
                                    <View className="flex-row items-baseline">
                                        <Text className="text-3xl font-black text-orange-500 mr-2">
                                            {studyStreak?.currentStreak || 0}
                                        </Text>
                                        <Text className="text-slate-600 dark:text-slate-300 font-bold">Days 🔥</Text>
                                    </View>
                                </View>
                                <View className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700 mx-4" />
                                <View className="flex-1">
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Today's Goal</Text>
                                    <Text className="text-slate-900 dark:text-white font-bold text-base">
                                        {todayQuestions} / {dailyGoal} Qs
                                    </Text>
                                    <View className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                        <View
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Longest Streak */}
                            <View className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex-row items-center justify-between">
                                <Text className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    Longest Streak
                                </Text>
                                <Text className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    🏆 {studyStreak?.longestStreak || 0} days
                                </Text>
                            </View>
                        </View>

                        {/* Total Study Time */}
                        <View className="mb-8 px-6">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Study Time
                            </Text>
                            <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <TimeDisplay
                                    seconds={stats.totalStudyTime}
                                    label="Total Time Studied"
                                    size="large"
                                    showIcon
                                />
                            </View>
                        </View>

                        {/* Overall Progress Stats */}
                        <View className="mb-8 px-6">
                            <ProgressStatsCard />
                        </View>

                        {/* Weak Areas */}
                        <View className="mb-8 px-6">
                            <WeakAreasCard maxItems={2} />
                        </View>

                        {/* Quick Access */}
                        <View className="mb-8">
                            <QuickAccessCarousel categories={categories} />
                        </View>


                    </View>
                </ScrollView>
                <View className="absolute bottom-[90px] left-0 right-0 items-center z-10">
                    <BannerAdComponent position="bottom" />
                </View>
            </SafeAreaView>
        </View>
    );
}
