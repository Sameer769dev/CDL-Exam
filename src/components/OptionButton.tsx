import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BadgeCheck, CircleX } from "lucide-react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolateColor,
    useDerivedValue
} from "react-native-reanimated";

interface OptionButtonProps {
    text: string;
    onPress: () => void;
    state?: 'default' | 'correct' | 'incorrect' | 'disabled' | 'selected';
}

export const OptionButton = React.memo(({ text, onPress, state = 'default' }: OptionButtonProps) => {
    const scale = useSharedValue(1);
    const progress = useDerivedValue(() => {
        return withTiming(state === 'default' ? 0 : 1, { duration: 200 });
    }, [state]);

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
        if (state === 'correct') return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        if (state === 'incorrect') return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        if (state === 'disabled') return 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60';
        if (state === 'selected') return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        return 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm';
    };

    const getTextColor = () => {
        if (state === 'correct') return 'text-green-700 dark:text-green-400 font-semibold';
        if (state === 'incorrect') return 'text-red-700 dark:text-red-400 font-semibold';
        if (state === 'disabled') return 'text-slate-400 dark:text-slate-600';
        if (state === 'selected') return 'text-blue-700 dark:text-blue-400 font-semibold';
        return 'text-slate-700 dark:text-slate-200 font-medium';
    };

    const getIcon = () => {
        if (state === 'correct') return <BadgeCheck size={20} color="#16a34a" strokeWidth={2} />;
        if (state === 'incorrect') return <CircleX size={20} color="#dc2626" strokeWidth={2} />;
        if (state === 'selected') return <View className="w-5 h-5 rounded-full border-[5px] border-blue-500 bg-white" />;
        return <View className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={state !== 'default' && state !== 'selected'}
            activeOpacity={1}
        >
            <Animated.View
                className={`flex-row items-center p-4 rounded-2xl border mb-3 ${getBackgroundColor()}`}
                style={animatedStyle}
            >
                <View className="mr-3.5">
                    {getIcon()}
                </View>
                <Text className={`flex-1 text-base leading-relaxed ${getTextColor()}`}>
                    {text}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
});
