import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';

interface PaginationDotsProps {
    total: number;
    currentIndex: number;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({ total, currentIndex }) => {
    return (
        <View className="flex-row justify-center items-center gap-2">
            {Array.from({ length: total }).map((_, index) => {
                const isActive = index === currentIndex;

                return (
                    <View
                        key={index}
                        className={`h-2 rounded-full transition-all ${isActive
                                ? 'w-8 bg-blue-600'
                                : 'w-2 bg-slate-300 dark:bg-slate-600'
                            }`}
                    />
                );
            })}
        </View>
    );
};
