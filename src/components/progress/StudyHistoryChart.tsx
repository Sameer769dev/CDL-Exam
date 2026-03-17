/**
 * StudyHistoryChart Component
 * 
 * Bar chart showing study activity for the last 7 days.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useStudyHistory } from '../../hooks/useStudyHistory';
import { BarChart3 } from 'lucide-react-native';

interface Props {
    days?: number;
}

export const StudyHistoryChart: React.FC<Props> = ({ days = 7 }) => {
    const {
        activity,
        totalQuestions,
        averageAccuracy,
        daysWithActivity,
        consistencyPercentage,
        isLoading
    } = useStudyHistory(days);

    if (isLoading) {
        return null;
    }

    const maxQuestions = Math.max(...activity.map(a => a.questionsAttempted), 1);

    const getDayLabel = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yest';

        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                    <BarChart3 size={20} color="#3b82f6" />
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        Recent Activity
                    </Text>
                </View>
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Last {days} days
                </Text>
            </View>

            {/* Stats Summary */}
            <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Questions</Text>
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">
                        {totalQuestions}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Accuracy</Text>
                    <Text className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {averageAccuracy}%
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Consistency</Text>
                    <Text className="text-xl font-bold text-green-600 dark:text-green-400">
                        {consistencyPercentage}%
                    </Text>
                </View>
            </View>

            {/* Chart */}
            <View className="flex-row items-end justify-between gap-2" style={{ height: 120 }}>
                {activity.map((day, index) => {
                    const heightPercentage = maxQuestions > 0
                        ? (day.questionsAttempted / maxQuestions) * 100
                        : 0;
                    const barHeight = Math.max(heightPercentage, day.questionsAttempted > 0 ? 10 : 0);

                    return (
                        <View key={day.date} className="flex-1 items-center gap-2">
                            {/* Bar */}
                            <View className="w-full items-center justify-end" style={{ height: 100 }}>
                                {day.questionsAttempted > 0 && (
                                    <View className="w-full items-center">
                                        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                                            {day.questionsAttempted}
                                        </Text>
                                        <View
                                            className={`w-full rounded-t-lg ${day.accuracy >= 80
                                                    ? 'bg-green-500'
                                                    : day.accuracy >= 70
                                                        ? 'bg-blue-500'
                                                        : 'bg-amber-500'
                                                }`}
                                            style={{ height: `${barHeight}%` }}
                                        />
                                    </View>
                                )}
                            </View>

                            {/* Day Label */}
                            <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {getDayLabel(day.date)}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Legend */}
            {totalQuestions > 0 && (
                <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex-row items-center justify-center gap-4">
                    <LegendItem color="bg-green-500" label="≥80%" />
                    <LegendItem color="bg-blue-500" label="70-79%" />
                    <LegendItem color="bg-amber-500" label="<70%" />
                </View>
            )}

            {/* Empty State */}
            {totalQuestions === 0 && (
                <View className="py-8 items-center">
                    <Text className="text-slate-500 dark:text-slate-400 text-center">
                        No study activity in the last {days} days.{'\n'}
                        Start practicing to see your progress!
                    </Text>
                </View>
            )}
        </View>
    );
};

// ==================== Sub-components ====================

interface LegendItemProps {
    color: string;
    label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => (
    <View className="flex-row items-center gap-2">
        <View className={`w-3 h-3 rounded ${color}`} />
        <Text className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {label}
        </Text>
    </View>
);
