import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
    FadeInDown
} from 'react-native-reanimated';

interface AnimatedCardProps {
    children: React.ReactNode;
    index: number;
    style?: ViewStyle;
    className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    index,
    style,
    className
}) => {
    // Using Layout Animations for simpler entry
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify().damping(12)}
            style={style}
            className={className}
        >
            {children}
        </Animated.View>
    );
};
