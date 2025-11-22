import React from 'react';
import { View, Text } from 'react-native';
import { Category } from '../types/quiz';

interface CategoryPerformanceCardProps {
    category: Category;
    attempted: number;
    correct: number;
    accuracy: number;
}

export const CategoryPerformanceCard: React.FC<CategoryPerformanceCardProps> = ({
    category,
    attempted,
    correct,
    accuracy
}) => {
    const getPerformanceColor = (acc: number) => {
        if (acc >= 80) return '#16a34a'; // green
        if (acc >= 60) return '#eab308'; // yellow
        return '#dc2626'; // red
    };

    const performanceColor = getPerformanceColor(accuracy);
    const progressPercentage = (attempted / category.totalQuestions) * 100;

    return (
        <View className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-3 border border-slate-100 dark:border-slate-700">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${category.color}20` }}
                    >
                        <View
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: category.color }}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-slate-900 dark:text-white">
                            {category.name}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            {attempted} / {category.totalQuestions} questions
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text
                        className="text-xl font-bold"
                        style={{ color: performanceColor }}
                    >
                        {accuracy.toFixed(0)}%
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        accuracy
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <View
                    className="h-full rounded-full"
                    style={{
                        width: `${Math.min(progressPercentage, 100)}%`,
                        backgroundColor: category.color
                    }}
                />
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-between mt-3">
                <View>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">Correct</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{correct}</Text>
                </View>
                <View>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">Attempted</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{attempted}</Text>
                </View>
                <View>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">Remaining</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                        {category.totalQuestions - attempted}
                    </Text>
                </View>
            </View>
        </View>
    );
};
