/**
 * ProgressRing Component
 * 
 * Circular progress indicator with percentage display.
 */

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showPercentage?: boolean;
    label?: string;
}

export const ProgressRing: React.FC<Props> = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = '#3b82f6',
    backgroundColor = '#e2e8f0',
    showPercentage = true,
    label
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getProgressColor = () => {
        if (progress >= 90) return '#10b981'; // green
        if (progress >= 80) return '#3b82f6'; // blue
        if (progress >= 70) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    const progressColor = color === '#3b82f6' ? getProgressColor() : color;

    return (
        <View className="items-center justify-center" style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            {/* Center Content */}
            <View className="absolute items-center justify-center" style={{ width: size, height: size }}>
                {showPercentage && (
                    <Text className="text-3xl font-black text-slate-900 dark:text-white">
                        {Math.round(progress)}%
                    </Text>
                )}
                {label && (
                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                        {label}
                    </Text>
                )}
            </View>
        </View>
    );
};
