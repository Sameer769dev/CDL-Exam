/**
 * ProgressStatsCard Component
 * 
 * Displays overall user statistics in a clean, card-based layout.
 * Shows total questions, accuracy, study time, and sessions.
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useProgressStats } from '../../hooks/useProgressStats';
import { TrendingUp, Clock, Target, Award } from 'lucide-react-native';

interface Props {
    compact?: boolean;
}

export const ProgressStatsCard: React.FC<Props> = ({ compact = false }) => {
    const {
        stats,
        formattedTime,
        accuracy,
        totalQuestions,
        sessionsCount,
        isLoading
    } = useProgressStats();

    if (isLoading) {
        return (
            <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 items-center justify-center" style={{ minHeight: 120 }}>
                <ActivityIndicator size="small" color="#3b82f6" />
            </View>
        );
    }

    if (compact) {
        return (
            <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <View className="flex-row items-center justify-between">
                    <StatItemCompact
                        icon={<Target size={16} color="#3b82f6" />}
                        value={totalQuestions.toString()}
                        label="Questions"
                    />
                    <View className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                    <StatItemCompact
                        icon={<Award size={16} color="#10b981" />}
                        value={`${accuracy}%`}
                        label="Accuracy"
                    />
                    <View className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                    <StatItemCompact
                        icon={<Clock size={16} color="#f59e0b" />}
                        value={formattedTime}
                        label="Time"
                    />
                </View>
            </View>
        );
    }

    return (
        <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Overall Progress
            </Text>

            <View className="flex-row flex-wrap gap-4">
                <StatItem
                    icon={<Target size={20} color="#3b82f6" />}
                    label="Questions Attempted"
                    value={totalQuestions.toLocaleString()}
                />
                <StatItem
                    icon={<Award size={20} color="#10b981" />}
                    label="Overall Accuracy"
                    value={`${accuracy}%`}
                    valueColor={accuracy >= 80 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}
                />
                <StatItem
                    icon={<Clock size={20} color="#f59e0b" />}
                    label="Total Study Time"
                    value={formattedTime}
                />
                <StatItem
                    icon={<TrendingUp size={20} color="#8b5cf6" />}
                    label="Study Sessions"
                    value={sessionsCount.toString()}
                />
            </View>

            {/* Progress indicator */}
            {totalQuestions > 0 && (
                <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Exam Readiness
                        </Text>
                        <Text className={`text-sm font-bold ${accuracy >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                            {accuracy >= 80 ? 'Ready to Pass' : 'Keep Practicing'}
                        </Text>
                    </View>
                    <View className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <View
                            className={`h-full rounded-full ${accuracy >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(accuracy, 100)}%` }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

// ==================== Sub-components ====================

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({
    icon,
    label,
    value,
    valueColor = "text-slate-900 dark:text-white"
}) => (
    <View className="flex-1 min-w-[140px]">
        <View className="flex-row items-center gap-2 mb-1">
            {icon}
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                {label}
            </Text>
        </View>
        <Text className={`text-2xl font-bold ${valueColor}`}>
            {value}
        </Text>
    </View>
);

interface StatItemCompactProps {
    icon: React.ReactNode;
    value: string;
    label: string;
}

const StatItemCompact: React.FC<StatItemCompactProps> = ({ icon, value, label }) => (
    <View className="flex-1 items-center">
        <View className="mb-1">{icon}</View>
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
            {value}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400">
            {label}
        </Text>
    </View>
);
