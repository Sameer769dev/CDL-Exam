import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { CheckCircle2, XCircle } from "lucide-react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    ZoomIn,
    Easing
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
        if (state === 'default') {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const getBackgroundColor = () => {
        if (state === 'correct') return 'bg-green-500 dark:bg-green-600';
        if (state === 'incorrect') return 'bg-red-50 dark:bg-red-900/20';
        if (state === 'selected') return 'bg-blue-50 dark:bg-blue-900/20';
        if (state === 'disabled') return 'bg-slate-100 dark:bg-slate-800';
        return 'bg-white dark:bg-slate-800'; // Default
    };

    const getBorderColor = () => {
        if (state === 'correct') return 'border-green-600 dark:border-green-500';
        if (state === 'incorrect') return 'border-red-500 dark:border-red-400';
        if (state === 'selected') return 'border-blue-500 dark:border-blue-400';
        if (state === 'disabled') return 'border-slate-200 dark:border-slate-700';
        return 'border-slate-200 dark:border-slate-700'; // Default
    };

    const getTextColor = () => {
        if (state === 'correct') return 'text-white';
        if (state === 'incorrect') return 'text-red-700 dark:text-red-300';
        if (state === 'selected') return 'text-blue-700 dark:text-blue-300';
        if (state === 'disabled') return 'text-slate-400 dark:text-slate-500';
        return 'text-slate-900 dark:text-white';
    };

    const showIcon = state === 'correct' || state === 'incorrect';

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={state !== 'default'}
            activeOpacity={1}
            className="mb-4"
        >
            <Animated.View
                className={`p-5 rounded-2xl border-2 ${getBackgroundColor()} ${getBorderColor()} shadow-sm flex-row items-center justify-between`}
                style={animatedStyle}
            >
                <Text className={`text-base font-semibold leading-relaxed flex-1 ${getTextColor()}`}>
                    {text}
                </Text>
                {showIcon && (
                    <Animated.View
                        entering={ZoomIn.duration(300)}
                        className="ml-3"
                    >
                        {state === 'correct' ? (
                            <CheckCircle2 size={24} color="#fff" strokeWidth={2.5} />
                        ) : (
                            <XCircle size={24} color="#dc2626" strokeWidth={2.5} />
                        )}
                    </Animated.View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
});
