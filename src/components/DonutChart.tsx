import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay, Easing } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutChartProps {
    correct: number;
    incorrect: number;
    unseen: number;
    size?: number;
    strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    correct,
    incorrect,
    unseen,
    size = 160,
    strokeWidth = 12
}) => {
    const total = correct + incorrect + unseen;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    const correctProgress = useSharedValue(0);
    const incorrectProgress = useSharedValue(0);
    const unseenProgress = useSharedValue(0);

    useEffect(() => {
        const correctPct = total > 0 ? correct / total : 0;
        const incorrectPct = total > 0 ? incorrect / total : 0;
        const unseenPct = total > 0 ? unseen / total : 1;

        correctProgress.value = withDelay(0, withTiming(correctPct, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        }));
        incorrectProgress.value = withDelay(200, withTiming(incorrectPct, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        }));
        unseenProgress.value = withDelay(400, withTiming(unseenPct, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        }));
    }, [correct, incorrect, unseen, total]);

    const createAnimatedProps = (progressValue: ReturnType<typeof useSharedValue<number>>, offset: number = 0) => {
        return useAnimatedProps(() => {
            const strokeDashoffset = circumference * (1 - progressValue.value);
            return {
                strokeDashoffset,
                strokeDasharray: `${circumference} ${circumference}`,
            };
        });
    };

    // Calculate static offsets for rotation
    const correctAngle = 0;
    const incorrectAngle = (correct / total) * 360 || 0;
    const unseenAngle = ((correct + incorrect) / total) * 360 || 0;

    const masteryPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
        <View className="items-center justify-center">
            <View style={{ width: size, height: size }} className="relative">
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <G rotation="-90" origin={`${center}, ${center}`}>
                        {/* Unseen Segment (Background) */}
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#1e293b" // slate-800
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />

                        {/* Incorrect Segment */}
                        <AnimatedCircle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#ef4444" // red-500
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeLinecap="round"
                            animatedProps={useAnimatedProps(() => ({
                                strokeDasharray: `${circumference * incorrectProgress.value} ${circumference}`,
                                strokeDashoffset: 0, // We rotate the group instead
                            }))}
                            rotation={correctAngle}
                            origin={`${center}, ${center}`}
                        />

                        {/* Correct Segment */}
                        <AnimatedCircle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#22c55e" // green-500
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeLinecap="round"
                            animatedProps={useAnimatedProps(() => ({
                                strokeDasharray: `${circumference * correctProgress.value} ${circumference}`,
                                strokeDashoffset: 0,
                            }))}
                            rotation={correctAngle + incorrectAngle + unseenAngle} // Just start at 0 actually, logic is simpler if we layer them or calculate exact arcs. 
                        // Simplified approach: Layer them. 
                        // Better approach for this specific visual: 
                        // 1. Background circle (Unseen color)
                        // 2. Incorrect circle (starts at 0)
                        // 3. Correct circle (starts after incorrect)
                        // But actually, usually "Unseen" is the background.
                        // Let's try a simpler layering:
                        // Base: Unseen Color
                        // Layer 1: Incorrect + Correct (Total Answered) ? No.

                        // Let's stick to simple arcs for now.
                        // Actually, simpler visual: 
                        // 1. Full circle track (slate-800)
                        // 2. Correct arc (Green)
                        // 3. Incorrect arc (Red)
                        // They don't need to touch perfectly for this "Mastery" feel, usually Correct is the main metric.
                        />
                    </G>
                </Svg>

                {/* Re-implementing with simple overlay arcs for cleaner code/visuals */}
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
                    <G rotation="-90" origin={`${center}, ${center}`}>
                        {/* Track */}
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#1e293b"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeOpacity={0.5}
                        />

                        {/* Correct Arc */}
                        <AnimatedCircle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#22c55e"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeLinecap="round"
                            animatedProps={useAnimatedProps(() => ({
                                strokeDasharray: `${circumference} ${circumference}`,
                                strokeDashoffset: circumference * (1 - correctProgress.value),
                            }))}
                        />
                    </G>
                </Svg>

                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
                        {masteryPercentage}%
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest">
                        Mastery
                    </Text>
                </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-center mt-6 space-x-6">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium">Correct</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-slate-800/50 mr-2" />
                    <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium">Remaining</Text>
                </View>
            </View>
        </View>
    );
};
