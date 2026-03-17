/**
 * CategoryTimeBadge Component
 * 
 * Small badge showing time spent on a category.
 * Designed to fit inline with other category information.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';
import { formatStudyTime } from '../../utils/progressCalculations';

interface Props {
    seconds: number;
    size?: 'small' | 'medium';
    showIcon?: boolean;
}

export const CategoryTimeBadge: React.FC<Props> = ({
    seconds,
    size = 'small',
    showIcon = true
}) => {
    // Don't show if no time spent
    if (seconds === 0) return null;

    const formatted = formatStudyTime(seconds);

    const sizeConfig = {
        small: {
            icon: 12,
            text: 'text-xs',
            padding: 'px-2 py-1'
        },
        medium: {
            icon: 14,
            text: 'text-sm',
            padding: 'px-3 py-1.5'
        }
    };

    const config = sizeConfig[size];

    return (
        <View className={`bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 ${config.padding} rounded-lg flex-row items-center gap-1.5`}>
            {showIcon && (
                <Clock size={config.icon} color="#3b82f6" strokeWidth={2.5} />
            )}
            <Text className={`${config.text} font-bold text-blue-700 dark:text-blue-300`}>
                {formatted}
            </Text>
        </View>
    );
};
