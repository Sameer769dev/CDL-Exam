/**
 * HighScoreBadge Component
 * 
 * Small badge component displaying high score with trophy icon.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Trophy } from 'lucide-react-native';

interface Props {
    score: number;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
}

export const HighScoreBadge: React.FC<Props> = ({
    score,
    size = 'medium',
    showIcon = true
}) => {
    const getColor = () => {
        if (score >= 90) return {
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            text: 'text-purple-700 dark:text-purple-300',
            border: 'border-purple-200 dark:border-purple-800',
            icon: '#8b5cf6'
        };
        if (score >= 80) return {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: '#3b82f6'
        };
        return {
            bg: 'bg-slate-100 dark:bg-slate-700',
            text: 'text-slate-700 dark:text-slate-300',
            border: 'border-slate-200 dark:border-slate-600',
            icon: '#64748b'
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

    if (score === 0) {
        return null; // Don't show if no score yet
    }

    return (
        <View className={`${color.bg} ${color.border} border ${sizeClasses.container} rounded-lg flex-row items-center gap-1.5`}>
            {showIcon && (
                <Trophy size={sizeClasses.icon} color={color.icon} strokeWidth={2.5} fill={score === 100 ? color.icon : 'none'} />
            )}
            <Text className={`${color.text} ${sizeClasses.text} font-bold`}>
                {Math.round(score)}%
            </Text>
        </View>
    );
};
