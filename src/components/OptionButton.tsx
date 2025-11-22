import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BadgeCheck, CircleX } from "lucide-react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    useDerivedValue
} from "react-native-reanimated";

interface OptionButtonProps {
    text: string;
    onPress: () => void;
    state?: 'default' | 'correct' | 'incorrect' | 'disabled' | 'selected';
}

export const OptionButton = React.memo(({ text, onPress, state = 'default' }: OptionButtonProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const getBackgroundColor = () => {
        if (state === 'correct') return 'bg-green-500 border-green-600';
        if (state === 'incorrect') return 'bg-white dark:bg-slate-800 border-red-500 border-2';
        if (state === 'selected') return 'bg-white dark:bg-slate-800 border-blue-500 border-2';
        if (state === 'disabled') return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50';
        return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'; // Default
    };

    const getTextColor = () => {
        if (state === 'correct') return 'text-white font-bold';
        if (state === 'incorrect') return 'text-red-600 dark:text-red-400 font-semibold';
        if (state === 'selected') return 'text-blue-600 dark:text-blue-400 font-semibold';
        if (state === 'disabled') return 'text-slate-400 dark:text-slate-500';
        return 'text-slate-700 dark:text-slate-200 font-medium';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={state !== 'default' && state !== 'selected'}
            activeOpacity={1}
            className="mb-3"
        >
            <Animated.View
                className={`p-5 rounded-2xl border ${getBackgroundColor()} shadow-sm`}
                style={animatedStyle}
            >
                <Text className={`text-lg leading-relaxed ${getTextColor()}`}>
                    {text}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
});
