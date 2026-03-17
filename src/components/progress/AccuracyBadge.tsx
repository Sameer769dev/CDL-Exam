/**
 * AccuracyBadge Component
 * 
 * Small badge component displaying accuracy percentage with color coding.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Target } from 'lucide-react-native';

interface Props {
    accuracy: number;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
}

export const AccuracyBadge: React.FC<Props> = ({
    accuracy,
    size = 'medium',
    showIcon = true
}) => {
    const getColor = () => {
        if (accuracy >= 90) return {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-700 dark:text-green-300',
            border: 'border-green-200 dark:border-green-800',
            icon: '#10b981'
        };
        if (accuracy >= 80) return {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: '#3b82f6'
        };
        if (accuracy >= 70) return {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: '#f59e0b'
        };
        return {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            icon: '#ef4444'
        };
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return { container: 'px-2 py-1', text: 'text-xs', icon: 12 };
            case 'large':
                return { container: 'px-4 py-2', text: 'text-base', icon: 18 };
            default:
                return { container: 'px-3 py-1.5', text: 'text-sm', icon: 14 };
        }
    };

    const color = getColor();
    const sizeClasses = getSizeClasses();

    return (
        <View className={`${color.bg} ${color.border} border ${sizeClasses.container} rounded-lg flex-row items-center gap-1.5`}>
            {showIcon && (
                <Target size={sizeClasses.icon} color={color.icon} strokeWidth={2.5} />
            )}
            <Text className={`${color.text} ${sizeClasses.text} font-bold`}>
                {Math.round(accuracy)}%
            </Text>
        </View>
    );
};
