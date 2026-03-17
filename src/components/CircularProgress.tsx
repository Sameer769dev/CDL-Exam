import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
    current: number;
    total: number;
    size?: number;
    strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    current,
    total,
    size = 60,
    strokeWidth = 4
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(current / total, {
            duration: 700,
            easing: Easing.out(Easing.cubic)
        });
    }, [current, total]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    return (
        <View className="items-center justify-center mb-6">
            <View style={{ width: size, height: size }} className="items-center justify-center relative">
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e2e8f0" // slate-200
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#3b82f6" // blue-500
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">
                        {current}/{total}
                    </Text>
                </View>
            </View>
        </View>
    );
};
