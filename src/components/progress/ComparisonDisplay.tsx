/**
 * ComparisonDisplay Component
 * 
 * Shows comparison between current attempt and previous attempts.
 * Displays improvement, high score comparison, and attempt count.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Trophy, Target, Minus } from 'lucide-react-native';
import { AttemptComparison } from '../../utils/progressComparison';

interface Props {
    comparison: AttemptComparison;
    showDetails?: boolean;
    variant?: 'default' | 'light';
}

export const ComparisonDisplay: React.FC<Props> = ({
    comparison,
    showDetails = true,
    variant = 'default'
}) => {
    const isLight = variant === 'light';
    const containerStyle = isLight
        ? "bg-white/90 backdrop-blur-sm p-4 rounded-2xl gap-3 shadow-sm"
        : "bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl gap-3";

    return (
        <View className={containerStyle}>
            {/* New High Score Banner */}
            {comparison.isNewHighScore && (
                <View className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800 flex-row items-center gap-2">
                    <Trophy size={20} color="#f59e0b" fill="#f59e0b" />
                    <Text className="text-amber-800 dark:text-amber-200 font-bold flex-1">
                        🎉 New High Score!
                    </Text>
                </View>
            )}

            {/* Improvement Indicator */}
            {comparison.improvement !== null && (
                <View className="flex-row items-center justify-between py-2">
                    <Text className="text-slate-600 dark:text-slate-400 font-medium">
                        vs. Previous Attempt
                    </Text>
                    <View className="flex-row items-center gap-2">
                        {comparison.improvement > 0 ? (
                            <>
                                <View className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                                    <TrendingUp size={14} color="#10b981" strokeWidth={2.5} />
                                </View>
                                <Text className="text-green-600 dark:text-green-400 font-bold text-base">
                                    +{comparison.improvement.toFixed(1)}%
                                </Text>
                            </>
                        ) : comparison.improvement < 0 ? (
                            <>
                                <View className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full">
                                    <TrendingDown size={14} color="#ef4444" strokeWidth={2.5} />
                                </View>
                                <Text className="text-red-600 dark:text-red-400 font-bold text-base">
                                    {comparison.improvement.toFixed(1)}%
                                </Text>
                            </>
                        ) : (
                            <>
                                <View className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-full">
                                    <Minus size={14} color="#64748b" strokeWidth={2.5} />
                                </View>
                                <Text className="text-slate-600 dark:text-slate-400 font-bold text-base">
                                    Same
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* Previous Score Details */}
            {showDetails && comparison.previousPercentage !== null && (
                <View className="flex-row items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                    <Text className="text-slate-600 dark:text-slate-400 font-medium">
                        Previous Score
                    </Text>
                    <Text className="text-slate-900 dark:text-white font-bold">
                        {comparison.previousPercentage.toFixed(0)}%
                    </Text>
                </View>
            )}

            {/* High Score Comparison */}
            {!comparison.isNewHighScore && comparison.highScorePercentage > 0 && (
                <View className="flex-row items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                    <View className="flex-row items-center gap-2">
                        <Target size={16} color="#8b5cf6" />
                        <Text className="text-slate-600 dark:text-slate-400 font-medium">
                            Your High Score
                        </Text>
                    </View>
                    <Text className="text-purple-600 dark:text-purple-400 font-bold">
                        {comparison.highScorePercentage.toFixed(0)}%
                    </Text>
                </View>
            )}

            {/* Attempt Count */}
            {showDetails && (
                <View className="flex-row items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                    <Text className="text-slate-600 dark:text-slate-400 font-medium">
                        Total Attempts
                    </Text>
                    <Text className="text-slate-900 dark:text-white font-bold">
                        {comparison.attemptsCount}
                    </Text>
                </View>
            )}

            {/* First Attempt Message */}
            {comparison.trend === 'first_attempt' && (
                <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Text className="text-blue-800 dark:text-blue-200 font-medium text-center">
                        🎯 First attempt - great start! Keep practicing to improve.
                    </Text>
                </View>
            )}
        </View>
    );
};
