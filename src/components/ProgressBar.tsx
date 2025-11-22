import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";

interface ProgressBarProps {
    current: number;
    total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const progress = Math.min((current / total) * 100, 100);
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withSpring(progress, { damping: 15 });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${width.value}%`
        };
    });

    return (
        <View className="w-full mb-6">
            <View className="flex-row justify-between mb-2">
                <Text className="text-slate-500 font-medium">
                    Question {current} of {total}
                </Text>
                <Text className="text-slate-500 font-medium">{Math.round(progress)}%</Text>
            </View>
            <View className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <Animated.View
                    className="h-full bg-blue-600 rounded-full"
                    style={animatedStyle}
                />
            </View>
        </View>
    );
};
