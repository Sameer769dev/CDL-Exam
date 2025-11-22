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

const Dot: React.FC<{ index: number; currentIndex: number }> = ({ index, currentIndex }) => {
    const isActive = useDerivedValue(() => {
        return index === currentIndex;
    }, [currentIndex]);

    const animatedStyle = useAnimatedStyle(() => {
        const width = interpolate(
            isActive.value ? 1 : 0,
            [0, 1],
            [8, 32] // 8px (w-2) to 32px (w-8)
        );

        const opacity = interpolate(
            isActive.value ? 1 : 0,
            [0, 1],
            [0.5, 1]
        );

        return {
            width: withSpring(width, { damping: 15, stiffness: 100 }),
            opacity: withTiming(isActive.value ? 1 : 0.5, { duration: 200 }),
            backgroundColor: isActive.value ? '#3B82F6' : '#94A3B8', // Blue-500 : Slate-400
        };
    });

    return (
        <Animated.View
            className="h-2 rounded-full"
            style={animatedStyle}
        />
    );
};
