import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, interpolate, useDerivedValue, withTiming } from 'react-native-reanimated';

interface PaginationDotsProps {
    total: number;
    currentIndex: number;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({ total, currentIndex }) => {
    return (
        <View className="flex-row justify-center items-center gap-2">
            {Array.from({ length: total }).map((_, index) => {
                return <Dot key={index} index={index} currentIndex={currentIndex} />;
            })}
        </View>
    );
};

import { useTheme } from '../context/ThemeContext';

const Dot: React.FC<{ index: number; currentIndex: number }> = ({ index, currentIndex }) => {
    const { colors } = useTheme();
    const isActive = useDerivedValue(() => {
        return index === currentIndex;
    }, [currentIndex]);

    const animatedStyle = useAnimatedStyle(() => {
        const width = interpolate(
            isActive.value ? 1 : 0,
            [0, 1],
            [8, 32] // 8px (w-2) to 32px (w-8)
        );

        return {
            width: withSpring(width, { damping: 15, stiffness: 100 }),
            opacity: withTiming(isActive.value ? 1 : 0.5, { duration: 400 }),
            backgroundColor: isActive.value ? colors.primary.main : colors.icon.default,
        };
    });

    return (
        <Animated.View
            className="h-2 rounded-full"
            style={animatedStyle}
        />
    );
};
