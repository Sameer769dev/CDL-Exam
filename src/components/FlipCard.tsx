import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    runOnJS
} from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface FlipCardProps {
    question: string;
    answer: string;
    isDark: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({ question, answer, isDark }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const rotation = useSharedValue(0);

    const handleFlip = () => {
        const newValue = isFlipped ? 0 : 180;
        rotation.value = withTiming(newValue, { duration: 400 }, () => {
            runOnJS(setIsFlipped)(!isFlipped);
        });
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotation.value, [0, 180], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            backfaceVisibility: 'hidden' as const,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotation.value, [0, 180], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            backfaceVisibility: 'hidden' as const,
        };
    });

    return (
        <View className="flex-1 items-center justify-center px-6">
            <TouchableOpacity
                onPress={handleFlip}
                activeOpacity={0.9}
                className="w-full"
                style={{ height: SCREEN_WIDTH * 1.2, maxHeight: 500 }}
            >
                <View className="relative w-full h-full">
                    {/* Front of card - Question */}
                    <Animated.View
                        style={[frontAnimatedStyle]}
                        className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-blue-500 dark:border-blue-400 p-8 items-center justify-center"
                    >
                        <View className="absolute top-6 right-6 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                            <Text className="text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
                                Question
                            </Text>
                        </View>

                        <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center leading-relaxed">
                            {question}
                        </Text>

                        <View className="absolute bottom-8 flex-row items-center gap-2">
                            <Eye size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Tap to reveal answer
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Back of card - Answer */}
                    <Animated.View
                        style={[backAnimatedStyle]}
                        className="absolute w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 items-center justify-center"
                    >
                        <View className="absolute top-6 right-6 bg-white/20 px-3 py-1.5 rounded-full">
                            <Text className="text-white font-bold text-xs uppercase tracking-wide">
                                Answer
                            </Text>
                        </View>

                        <Text className="text-4xl font-black text-white text-center leading-tight mb-4">
                            {answer}
                        </Text>

                        <View className="absolute bottom-8 flex-row items-center gap-2">
                            <EyeOff size={20} color="#ffffff" />
                            <Text className="text-white/90 text-sm font-medium">
                                Tap to flip back
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            </TouchableOpacity>

            {/* Swipe hint */}
            <View className="mt-8 flex-row items-center justify-center gap-8">
                <View className="items-center">
                    <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-2">
                        <Text className="text-2xl">👈</Text>
                    </View>
                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Study Again
                    </Text>
                </View>

                <View className="items-center">
                    <View className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-2">
                        <Text className="text-2xl">👉</Text>
                    </View>
                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Got It!
                    </Text>
                </View>
            </View>
        </View>
    );
};
