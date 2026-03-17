import React from 'react';
import { View, Text } from 'react-native';

interface QuizProgressProps {
    current: number;
    total: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
    current,
    total
}) => {
    const percentage = Math.round((current / total) * 100);

    return (
        <View className="items-center mb-8 w-full px-4">
            <View className="flex-row justify-between w-full mb-3 px-1">
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Question {current} of {total}
                </Text>
                <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {percentage}%
                </Text>
            </View>

            <View className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <View
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </View>
        </View>
    );
};
