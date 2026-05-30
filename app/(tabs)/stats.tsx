import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { TrendingUp, Crown, AlertCircle } from 'lucide-react-native';
import { useUser } from '../../src/context/UserContext';
import { useProgressStats } from '../../src/hooks/useProgressStats';
import { useCategoryStats } from '../../src/hooks/useCategoryStats';
import { useWeakAreas } from '../../src/hooks/useWeakAreas';

// Import all progress components
import { ProgressStatsCard } from '../../src/components/progress/ProgressStatsCard';
import { StudyStreakCard } from '../../src/components/progress/StudyStreakCard';
import { StudyHistoryChart } from '../../src/components/progress/StudyHistoryChart';
import { CategoryPerformanceCard } from '../../src/components/progress/CategoryPerformanceCard';
import { WeakAreasCard } from '../../src/components/progress/WeakAreasCard';
import { ProgressRing } from '../../src/components/progress/ProgressRing';
import { HeatmapGrid } from '../../src/components/analytics/HeatmapGrid';
import { WeeklyBarChart } from '../../src/components/analytics/WeeklyBarChart';
import { PredictionScore } from '../../src/components/analytics/PredictionScore';

export default function ProgressDashboard() {
    const { isPremium } = useUser();
    const { hasStudied } = useProgressStats();
    const { performances } = useCategoryStats();
    const { readinessLevel, passProbability, readinessScore } = useWeakAreas();

    // Get readiness color
    const getReadinessColor = () => {
        if (readinessScore >= 80) return '#10b981'; // green
        if (readinessScore >= 65) return '#3b82f6'; // blue
        if (readinessScore >= 50) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 140 }}
                >
                    {/* Header */}
                    <View className="px-6 pt-6 pb-4 flex-row justify-between items-start">
                        <View>
                            <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                                Your Progress
                            </Text>
                            <Text className="text-base text-slate-600 dark:text-slate-300">
                                Track your journey to CDL success
                            </Text>
                        </View>
                    </View>

                    {hasStudied ? (
                        <>
                            {/* Exam Readiness Score */}
                            <View className="px-6 mb-6">
                                <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                        Exam Readiness
                                    </Text>

                                    <View className="items-center">
                                        <ProgressRing
                                            progress={readinessScore}
                                            size={140}
                                            strokeWidth={12}
                                            label="Ready"
                                        />

                                        <View className="mt-4 items-center">
                                            <Text className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                                Status: <Text style={{ color: getReadinessColor() }} className="font-bold">
                                                    {readinessLevel === 'ready' ? 'Ready to Pass' :
                                                        readinessLevel === 'almost-ready' ? 'Almost Ready' :
                                                            readinessLevel === 'needs-work' ? 'Needs More Work' :
                                                                'Keep Practicing'}
                                                </Text>
                                            </Text>
                                            <Text className="text-xs text-slate-500 dark:text-slate-400">
                                                Estimated pass probability: {passProbability}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Overall Statistics */}
                            <View className="px-6 mb-6">
                                <ProgressStatsCard />
                            </View>

                            {/* Study Streak */}
                            <View className="px-6 mb-6">
                                <StudyStreakCard />
                            </View>

                            {/* Recent Activity Chart */}
                            <View className="px-6 mb-6">
                                <StudyHistoryChart />
                            </View>

                            {/* Weekly Bar Chart */}
                            <View className="px-6 mb-6">
                                <WeeklyBarChart />
                            </View>

                            {/* Heatmap Grid */}
                            <View className="px-6 mb-6">
                                <HeatmapGrid />
                            </View>

                            {/* Weak Areas */}
                            <View className="px-6 mb-6">
                                <WeakAreasCard maxItems={5} />
                            </View>

                            {/* Pass Prediction Score */}
                            <View className="px-6 mb-6">
                                <PredictionScore />
                            </View>

                            {/* Category Performance */}
                            {performances && performances.length > 0 && (
                                <View className="px-6 mb-6">
                                    <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                        Category Performance
                                    </Text>
                                    <View className="gap-3">
                                        {performances
                                            .filter(p => p.questionsAttempted > 0)
                                            .sort((a, b) => b.accuracy - a.accuracy)
                                            .map(performance => (
                                                <CategoryPerformanceCard
                                                    key={performance.categoryId}
                                                    performance={performance}
                                                    showDetails={true}
                                                />
                                            ))}
                                    </View>
                                </View>
                            )}

                            {/* Premium Upsell */}
                            {!isPremium && (
                                <View className="px-6 mb-6">
                                    <TouchableOpacity
                                        onPress={() => router.push('/paywall')}
                                        className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[32px] shadow-xl shadow-amber-500/10 active:scale-[0.98] overflow-hidden relative border border-slate-800 dark:border-slate-700"
                                    >
                                        {/* Golden Glow Effect */}
                                        <View className="absolute top-0 right-0 w-full h-full bg-amber-500/5" />
                                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full" />

                                        <View className="flex-row items-center justify-between relative z-10">
                                            <View className="flex-1 mr-4">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                                                        <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                                                            Premium Access
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text className="text-white font-black text-2xl mb-2">
                                                    Unlock Everything
                                                </Text>
                                                <Text className="text-slate-400 text-sm font-medium leading-relaxed">
                                                    Get unlimited access to all categories, exam simulator, and ad-free experience.
                                                </Text>
                                            </View>

                                            <View className="bg-amber-500 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-amber-500/40">
                                                <Crown size={28} color="#fff" fill="#fff" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <View className="px-6">
                            <View className="bg-white dark:bg-slate-800 rounded-[24px] p-8 items-center border border-slate-100 dark:border-slate-700 shadow-sm">
                                <View className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full items-center justify-center mb-4">
                                    <TrendingUp size={32} color="#64748b" strokeWidth={2} />
                                </View>
                                <Text className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                                    No Progress Data Yet
                                </Text>
                                <Text className="text-slate-600 dark:text-slate-400 text-center mb-6">
                                    Start taking quizzes to see your detailed progress statistics and insights here
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/categories')}
                                    className="bg-blue-600 px-6 py-3 rounded-full active:scale-95"
                                >
                                    <Text className="text-white font-bold">
                                        Start Studying
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View >
    );
}
