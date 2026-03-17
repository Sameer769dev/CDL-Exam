/**
 * WeakAreasCard Component
 * 
 * Displays identified weak areas with priority levels and recommendations.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useWeakAreas } from '../../hooks/useWeakAreas';
import { useRouter } from 'expo-router';

interface Props {
    onCategoryPress?: (categoryId: string) => void;
    maxItems?: number;
}

export const WeakAreasCard: React.FC<Props> = ({
    onCategoryPress,
    maxItems = 3
}) => {
    const router = useRouter();
    const {
        weakAreas,
        highPriority,
        recommendations,
        hasWeakAreas,
        isLoading
    } = useWeakAreas();

    if (isLoading) {
        return null;
    }

    const handlePress = (categoryId: string) => {
        if (onCategoryPress) {
            onCategoryPress(categoryId);
        } else {
            router.push({
                pathname: '/quiz',
                params: { categoryId, mode: 'standard' }
            });
        }
    };

    // No weak areas - show success message
    if (!hasWeakAreas) {
        return (
            <View className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800/50">
                <View className="flex-row items-center gap-3 mb-3">
                    <View className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                        <CheckCircle2 size={24} color="#10b981" />
                    </View>
                    <Text className="text-lg font-bold text-green-900 dark:text-green-100 flex-1">
                        No Weak Areas!
                    </Text>
                </View>
                <Text className="text-green-800 dark:text-green-200 leading-relaxed">
                    Great job! You're performing well across all categories. Keep practicing to maintain your skills.
                </Text>
            </View>
        );
    }

    const displayAreas = weakAreas.slice(0, maxItems);

    return (
        <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                    <AlertTriangle size={20} color="#f59e0b" />
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        Areas to Improve
                    </Text>
                </View>
                {weakAreas.length > maxItems && (
                    <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {weakAreas.length} total
                    </Text>
                )}
            </View>

            {/* Weak Areas List */}
            <View className="gap-3 mb-4">
                {displayAreas.map((area, index) => (
                    <TouchableOpacity
                        key={area.categoryId}
                        onPress={() => handlePress(area.categoryId)}
                        className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl active:opacity-70"
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                    {area.categoryName}
                                </Text>
                                <Text className="text-xs text-slate-600 dark:text-slate-400">
                                    {area.recommendedAction}
                                </Text>
                            </View>

                            <View className="items-end gap-1">
                                <PriorityBadge priority={area.priority} />
                                <Text className="text-xl font-bold text-red-600 dark:text-red-400">
                                    {Math.round(area.accuracy)}%
                                </Text>
                            </View>
                        </View>

                        {area.mistakeCount > 0 && (
                            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <Text className="text-xs text-slate-500 dark:text-slate-400">
                                    {area.mistakeCount} {area.mistakeCount === 1 ? 'mistake' : 'mistakes'} to review
                                </Text>
                                <ArrowRight size={16} color="#64748b" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Top Recommendation */}
            {recommendations.length > 0 && (
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <Text className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-2">
                        💡 Top Recommendation
                    </Text>
                    <Text className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {recommendations[0]}
                    </Text>
                </View>
            )}
        </View>
    );
};

// ==================== Sub-components ====================

interface PriorityBadgeProps {
    priority: 'high' | 'medium' | 'low';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
    const config = {
        high: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            label: 'High Priority'
        },
        medium: {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            label: 'Medium'
        },
        low: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            label: 'Low'
        }
    };

    const style = config[priority];

    return (
        <View className={`${style.bg} ${style.border} border px-2 py-1 rounded-md`}>
            <Text className={`${style.text} text-xs font-bold uppercase tracking-wide`}>
                {style.label}
            </Text>
        </View>
    );
};
