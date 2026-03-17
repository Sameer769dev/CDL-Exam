/**
 * TimeDisplay Component
 * 
 * Display study time in a formatted, user-friendly way.
 * Shows time prominently to motivate users.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';
import { formatStudyTime } from '../../utils/progressCalculations';

interface Props {
    seconds: number;
    label?: string;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
    compact?: boolean;
    variant?: 'default' | 'light';
}

export const TimeDisplay: React.FC<Props> = ({
    seconds,
    label = 'Study Time',
    size = 'medium',
    showIcon = true,
    compact = false,
    variant = 'default'
}) => {
    const formatted = formatStudyTime(seconds);
    const isLight = variant === 'light';

    const sizeConfig = {
        small: {
            text: 'text-xs',
            value: 'text-base',
            icon: 14,
            container: 'gap-1'
        },
        medium: {
            text: 'text-sm',
            value: 'text-2xl',
            icon: 18,
            container: 'gap-2'
        },
        large: {
            text: 'text-base',
            value: 'text-4xl',
            icon: 24,
            container: 'gap-3'
        }
    };

    const config = sizeConfig[size];
    const textColor = isLight ? 'text-white' : 'text-slate-900 dark:text-white';
    const labelColor = isLight ? 'text-white/80' : 'text-slate-500 dark:text-slate-400';
    const iconColor = isLight ? '#ffffff' : '#3b82f6';
    const iconBg = isLight ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20';

    if (compact) {
        return (
            <View className="flex-row items-center gap-1.5">
                {showIcon && <Clock size={config.icon} color={iconColor} />}
                <Text className={`${config.value} font-bold ${textColor}`}>
                    {formatted}
                </Text>
            </View>
        );
    }

    return (
        <View className={`items-center ${config.container}`}>
            {showIcon && (
                <View className={`${iconBg} p-2 rounded-full`}>
                    <Clock size={config.icon} color={iconColor} strokeWidth={2.5} />
                </View>
            )}
            <Text className={`${config.value} font-black ${textColor}`}>
                {formatted}
            </Text>
            <Text className={`${config.text} font-semibold ${labelColor}`}>
                {label}
            </Text>
        </View>
    );
};
