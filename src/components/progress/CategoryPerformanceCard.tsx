/**
 * CategoryPerformanceCard Component
 * 
 * Displays detailed performance metrics for a single category.
 * Shows accuracy, high score, mistakes, and trend indicator.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Trophy } from 'lucide-react-native';
import { CategoryPerformance } from '../../types/progress';
import { formatRelativeDate } from '../../utils/progressCalculations';

interface Props {
    performance: CategoryPerformance;
    compact?: boolean;
    showDetails?: boolean;
}

export const CategoryPerformanceCard: React.FC<Props> = ({
    performance,
    compact = false,
    showDetails = true
}) => {
    const getTrendIcon = () => {
        const iconSize = compact ? 16 : 20;
        switch (performance.trend) {
            case 'improving':
                return <TrendingUp size={iconSize} color="#10b981" strokeWidth={2.5} />;
            case 'declining':
                return <TrendingDown size={iconSize} color="#ef4444" strokeWidth={2.5} />;
            default:
                return <Minus size={iconSize} color="#64748b" strokeWidth={2.5} />;
        }
    };

    const getTrendColor = () => {
        switch (performance.trend) {
            case 'improving': return 'text-green-600 dark:text-green-400';
            case 'declining': return 'text-red-600 dark:text-red-400';
            default: return 'text-slate-500 dark:text-slate-400';
        }
    };

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 90) return 'text-green-600 dark:text-green-400';
        if (accuracy >= 80) return 'text-blue-600 dark:text-blue-400';
        if (accuracy >= 70) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (compact) {
        return (
            <View className="flex-row items-center justify-between py-3 px-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <View className="flex-1 mr-3">
                    <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        {performance.categoryName}
                    </Text>
                    {performance.questionsAttempted > 0 && (
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            {performance.questionsAttempted} questions • {formatRelativeDate(performance.lastAttemptDate)}
                        </Text>
                    )}
                </View>

                <View className="flex-row items-center gap-3">
                    {getTrendIcon()}
                    <Text className={`text-xl font-bold ${getAccuracyColor(performance.accuracy)}`}>
                        {Math.round(performance.accuracy)}%
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-3">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {performance.categoryName}
                    </Text>
                    {performance.lastAttemptDate && (
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Last studied {formatRelativeDate(performance.lastAttemptDate)}
                        </Text>
                    )}
                </View>

                <View className="flex-row items-center gap-2">
                    {getTrendIcon()}
                    <Text className={`text-xs font-semibold uppercase tracking-wide ${getTrendColor()}`}>
                        {performance.trend}
                    </Text>
                </View>
            </View>

            {/* Main Stats */}
            <View className="flex-row gap-3 mb-4">
                <StatBox
                    label="Accuracy"
                    value={`${Math.round(performance.accuracy)}%`}
                    valueColor={getAccuracyColor(performance.accuracy)}
                    icon={<Trophy size={16} color="#3b82f6" />}
                />
                <StatBox
                    label="High Score"
                    value={`${Math.round(performance.highScore)}%`}
                    valueColor="text-purple-600 dark:text-purple-400"
                    icon={<Trophy size={16} color="#8b5cf6" />}
                />
                {performance.mistakeCount > 0 && (
                    <StatBox
                        label="Mistakes"
                        value={performance.mistakeCount.toString()}
                        valueColor="text-amber-600 dark:text-amber-400"
                        icon={<AlertTriangle size={16} color="#f59e0b" />}
                    />
                )}
            </View>

            {/* Additional Details */}
            {showDetails && performance.questionsAttempted > 0 && (
                <View className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <View className="flex-row justify-between">
                        <DetailItem
                            label="Questions Attempted"
                            value={performance.questionsAttempted.toString()}
                        />
                        <DetailItem
                            label="Correct Answers"
                            value={performance.questionsCorrect.toString()}
                        />
                        <DetailItem
                            label="Sessions"
                            value={performance.sessionsCount.toString()}
                        />
                    </View>
                </View>
            )}

            {/* Flashcard Progress (if available) */}
            {performance.flashcardsReviewed > 0 && (
                <View className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Flashcard Progress
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reviewed</Text>
                            <Text className="text-base font-bold text-slate-900 dark:text-white">
                                {performance.flashcardsReviewed}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mastered</Text>
                            <Text className="text-base font-bold text-green-600 dark:text-green-400">
                                {performance.flashcardsMastered}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

// ==================== Sub-components ====================

interface StatBoxProps {
    label: string;
    value: string;
    valueColor: string;
    icon: React.ReactNode;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, valueColor, icon }) => (
    <View className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
        <View className="flex-row items-center gap-1 mb-1">
            {icon}
            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {label}
            </Text>
        </View>
        <Text className={`text-xl font-bold ${valueColor}`}>
            {value}
        </Text>
    </View>
);

interface DetailItemProps {
    label: string;
    value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
    <View>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {label}
        </Text>
        <Text className="text-sm font-bold text-slate-900 dark:text-white">
            {value}
        </Text>
    </View>
);
