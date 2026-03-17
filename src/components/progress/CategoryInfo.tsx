/**
 * CategoryInfo Component
 * 
 * Shows additional category information: last studied, time spent, mistakes.
 * Designed to be added to category cards for enhanced context.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, Clock, AlertTriangle } from 'lucide-react-native';
import { formatRelativeDate, formatStudyTime } from '../../utils/progressCalculations';

interface Props {
    lastAttemptDate: string | null;
    timeSpent: number; // seconds
    mistakeCount: number;
    compact?: boolean;
}

export const CategoryInfo: React.FC<Props> = ({
    lastAttemptDate,
    timeSpent,
    mistakeCount,
    compact = false
}) => {
    // Don't show if no data
    if (!lastAttemptDate && timeSpent === 0 && mistakeCount === 0) {
        return null;
    }

    if (compact) {
        return (
            <View className="flex-row items-center flex-wrap gap-2 mt-2">
                {lastAttemptDate && (
                    <View className="flex-row items-center gap-1">
                        <Calendar size={10} color="#64748b" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            {formatRelativeDate(lastAttemptDate)}
                        </Text>
                    </View>
                )}

                {timeSpent > 0 && (
                    <View className="flex-row items-center gap-1">
                        <Clock size={10} color="#64748b" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            {formatStudyTime(timeSpent)}
                        </Text>
                    </View>
                )}

                {mistakeCount > 0 && (
                    <View className="flex-row items-center gap-1">
                        <AlertTriangle size={10} color="#f59e0b" />
                        <Text className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {mistakeCount}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className="gap-2 mt-3">
            {/* Last Studied */}
            {lastAttemptDate && (
                <View className="flex-row items-center gap-2">
                    <View className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-md">
                        <Calendar size={12} color="#64748b" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Last studied
                        </Text>
                        <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatRelativeDate(lastAttemptDate)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Time Spent */}
            {timeSpent > 0 && (
                <View className="flex-row items-center gap-2">
                    <View className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md">
                        <Clock size={12} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Time spent
                        </Text>
                        <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {formatStudyTime(timeSpent)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Mistakes */}
            {mistakeCount > 0 && (
                <View className="flex-row items-center gap-2">
                    <View className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-md">
                        <AlertTriangle size={12} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Mistakes to review
                        </Text>
                        <Text className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            {mistakeCount} {mistakeCount === 1 ? 'question' : 'questions'}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};
