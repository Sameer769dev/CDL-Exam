/**
 * StudyStreakCard Component
 * 
 * Displays current and longest study streaks with visual indicators.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Flame, Trophy, Calendar } from 'lucide-react-native';
import { useProgressStats } from '../../hooks/useProgressStats';

interface Props {
    compact?: boolean;
}

export const StudyStreakCard: React.FC<Props> = ({ compact = false }) => {
    const { currentStreak, longestStreak, isLoading } = useProgressStats();

    if (isLoading) {
        return null;
    }

    const getStreakLevel = (streak: number) => {
        if (streak >= 30) return { label: 'Legendary', color: '#8b5cf6', emoji: '🔥🔥🔥' };
        if (streak >= 14) return { label: 'On Fire', color: '#ef4444', emoji: '🔥🔥' };
        if (streak >= 7) return { label: 'Hot Streak', color: '#f59e0b', emoji: '🔥' };
        if (streak >= 3) return { label: 'Building', color: '#3b82f6', emoji: '💪' };
        return { label: 'Start Today', color: '#64748b', emoji: '🎯' };
    };

    const streakLevel = getStreakLevel(currentStreak);

    if (compact) {
        return (
            <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <View className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                        <Flame size={24} color="#f97316" fill={currentStreak > 0 ? "#f97316" : "none"} />
                    </View>
                    <View>
                        <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                            Current Streak
                        </Text>
                        <Text className="text-2xl font-black text-slate-900 dark:text-white">
                            {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                        </Text>
                    </View>
                </View>

                {longestStreak > currentStreak && (
                    <View className="items-end">
                        <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Best: {longestStreak} days
                        </Text>
                        <Trophy size={16} color="#fbbf24" />
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-3xl border border-orange-100 dark:border-orange-800/50">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    Study Streak
                </Text>
                <View className="bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold" style={{ color: streakLevel.color }}>
                        {streakLevel.label}
                    </Text>
                </View>
            </View>

            {/* Current Streak */}
            <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl mb-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-orange-100 dark:bg-orange-900/40 p-4 rounded-2xl">
                            <Flame
                                size={32}
                                color="#f97316"
                                fill={currentStreak > 0 ? "#f97316" : "none"}
                            />
                        </View>
                        <View>
                            <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                                Current Streak
                            </Text>
                            <View className="flex-row items-baseline gap-2">
                                <Text className="text-4xl font-black text-slate-900 dark:text-white">
                                    {currentStreak}
                                </Text>
                                <Text className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                    {currentStreak === 1 ? 'day' : 'days'}
                                </Text>
                                <Text className="text-2xl">{streakLevel.emoji}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-3">
                <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Trophy size={16} color="#fbbf24" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Longest Streak
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {longestStreak}
                    </Text>
                </View>

                <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Calendar size={16} color="#3b82f6" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Goal
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        30
                    </Text>
                </View>
            </View>

            {/* Motivation Message */}
            {currentStreak === 0 && (
                <View className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <Text className="text-sm text-blue-800 dark:text-blue-300 font-medium text-center">
                        🎯 Start your streak today! Study daily to build consistency.
                    </Text>
                </View>
            )}

            {currentStreak > 0 && currentStreak < longestStreak && (
                <View className="mt-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">
                    <Text className="text-sm text-amber-800 dark:text-amber-300 font-medium text-center">
                        💪 Keep going! You're {longestStreak - currentStreak} days away from your record!
                    </Text>
                </View>
            )}

            {currentStreak === longestStreak && currentStreak > 0 && (
                <View className="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/50">
                    <Text className="text-sm text-green-800 dark:text-green-300 font-medium text-center">
                        🌟 New record! You're on your longest streak ever!
                    </Text>
                </View>
            )}
        </View>
    );
};
