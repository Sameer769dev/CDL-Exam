import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, CheckCircle2, Flame, TrendingUp, AlertCircle } from 'lucide-react-native';
import { StatCard } from '../src/components/StatCard';
import { CategoryPerformanceCard } from '../src/components/CategoryPerformanceCard';
import { getCategories } from '../src/utils/dataLoader';
import {
    getOverallStats,
    getStudyStreak,
    getCategoryStats,
    getWrongAnswers,
    OverallStats,
    StudyStreak,
    CategoryStats
} from '../src/utils/storage';
import { Category } from '../src/types/quiz';
import { useTheme } from '../src/context/ThemeContext';

export default function StatsScreen() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [studyStreak, setStudyStreak] = useState<StudyStreak | null>(null);
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [mistakeCount, setMistakeCount] = useState(0);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Load all data in parallel
            const [overall, streak, catStats, cats, mistakes] = await Promise.all([
                getOverallStats(),
                getStudyStreak(),
                getCategoryStats(),
                Promise.resolve(getCategories()),
                getWrongAnswers()
            ]);

            setOverallStats(overall);
            setStudyStreak(streak);
            setCategoryStats(catStats);
            setCategories(cats);

            // Count total mistakes
            const totalMistakes = Object.values(mistakes).reduce(
                (sum, arr) => sum + arr.length,
                0
            );
            setMistakeCount(totalMistakes);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-slate-600 dark:text-slate-400 mt-4">Loading statistics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <View className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                        Your Stats
                    </Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                        Track your learning progress
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Overview Stats */}
                <View className="px-5 py-6">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Overview
                    </Text>

                    {overallStats && overallStats.totalQuestionsAttempted > 0 ? (
                        <>
                            <View className="flex-row mb-3">
                                <StatCard
                                    icon={BookOpen}
                                    value={overallStats.totalQuestionsAttempted}
                                    label="Questions"
                                    color="#2563eb"
                                />
                                <StatCard
                                    icon={CheckCircle2}
                                    value={`${overallStats.overallAccuracy.toFixed(0)}%`}
                                    label="Accuracy"
                                    color="#16a34a"
                                />
                            </View>

                            <View className="flex-row">
                                <StatCard
                                    icon={Flame}
                                    value={studyStreak?.currentStreak || 0}
                                    label="Day Streak"
                                    color="#f97316"
                                />
                                <StatCard
                                    icon={TrendingUp}
                                    value={overallStats.categoriesStudied}
                                    label="Categories"
                                    color="#8b5cf6"
                                />
                            </View>
                        </>
                    ) : (
                        <View className="bg-white dark:bg-slate-800 rounded-2xl p-8 items-center border border-slate-200 dark:border-slate-700">
                            <AlertCircle size={48} color={isDark ? "#64748b" : "#94a3b8"} />
                            <Text className="text-slate-900 dark:text-white font-bold text-lg mt-4">
                                No Study Data Yet
                            </Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-center mt-2">
                                Start taking quizzes to see your statistics here
                            </Text>
                        </View>
                    )}
                </View>

                {/* Category Performance */}
                {categoryStats.length > 0 && (
                    <View className="px-5 pb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Category Performance
                        </Text>

                        {categoryStats
                            .sort((a, b) => b.accuracy - a.accuracy)
                            .map(stat => {
                                const category = categories.find(c => c.id === stat.categoryId);
                                if (!category) return null;

                                return (
                                    <CategoryPerformanceCard
                                        key={stat.categoryId}
                                        category={category}
                                        attempted={stat.totalAttempted}
                                        correct={stat.totalCorrect}
                                        accuracy={stat.accuracy}
                                    />
                                );
                            })}
                    </View>
                )}

                {/* Mistake Bank Summary */}
                {mistakeCount > 0 && (
                    <View className="px-5 pb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Mistake Bank
                        </Text>

                        <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <View className="flex-row items-center">
                                <View className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full mr-4">
                                    <AlertCircle size={24} color="#f59e0b" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                        {mistakeCount} {mistakeCount === 1 ? 'Question' : 'Questions'}
                                    </Text>
                                    <Text className="text-sm text-amber-700 dark:text-amber-200/80">
                                        Review your mistakes to improve
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push('/mistake-bank')}
                                    className="bg-amber-500 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-bold text-sm">
                                        Review
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Study Streak Info */}
                {studyStreak && studyStreak.longestStreak > 0 && (
                    <View className="px-5 pb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Study Streak
                        </Text>

                        <View className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                                        Current Streak
                                    </Text>
                                    <Text className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                                        {studyStreak.currentStreak}
                                    </Text>
                                    <Text className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                        {studyStreak.currentStreak === 1 ? 'day' : 'days'}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                                        Longest Streak
                                    </Text>
                                    <Text className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                                        {studyStreak.longestStreak}
                                    </Text>
                                    <Text className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                        {studyStreak.longestStreak === 1 ? 'day' : 'days'}
                                    </Text>
                                </View>
                            </View>

                            {studyStreak.currentStreak >= 7 && (
                                <View className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800">
                                    <Text className="text-center text-orange-700 dark:text-orange-300 font-bold">
                                        🔥 Amazing! Keep up the great work!
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Bottom Padding */}
                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}
