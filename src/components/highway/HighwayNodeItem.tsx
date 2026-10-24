import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lock, Star, Zap, Gift, Award, Sparkles, BookOpen } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HighwayNode } from '../../types/highway';

interface HighwayNodeItemProps {
    node: HighwayNode;
    index: number;
    accentColor: string;
    onPress: (node: HighwayNode) => void;
}

export function HighwayNodeItem({ node, index, accentColor, onPress }: HighwayNodeItemProps) {
    // S-curve offset: generates the winding road effect
    // Pattern: center (0) -> right (50) -> center (0) -> left (-50) -> repeat
    const getXOffset = (idx: number) => {
        const step = idx % 4;
        if (step === 0) return 0;
        if (step === 1) return 55;
        if (step === 2) return 0;
        return -55;
    };

    const xOffset = getXOffset(index);

    const isCurrentActive = node.isUnlocked && !node.isCompleted;

    const pulseStyle = useAnimatedStyle(() => {
        if (!isCurrentActive) return {};
        return {
            transform: [
                {
                    scale: withRepeat(
                        withSequence(
                            withTiming(1.08, { duration: 800 }),
                            withTiming(1, { duration: 800 })
                        ),
                        -1,
                        true
                    ),
                },
            ],
        };
    });

    const getNodeIcon = () => {
        if (!node.isUnlocked) {
            return <Lock size={22} color="#64748b" />;
        }
        switch (node.type) {
            case 'speed_drill':
                return <Zap size={24} color="white" fill="white" />;
            case 'scenario':
                return <Sparkles size={24} color="white" />;
            case 'chest':
                return <Gift size={24} color="white" />;
            case 'boss_exam':
                return <Award size={26} color="white" />;
            default:
                return <BookOpen size={22} color="white" />;
        }
    };

    const getNodeBgColor = () => {
        if (!node.isUnlocked) return 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700';
        if (node.isCompleted) return 'bg-amber-500 border-amber-600';
        return 'bg-blue-600 border-blue-700';
    };

    return (
        <View className="items-center my-3 relative" style={{ transform: [{ translateX: xOffset }] }}>
            {/* Active Halo Glow */}
            {isCurrentActive && (
                <View
                    className="absolute w-20 h-20 rounded-full bg-blue-500/25 -top-1"
                    style={{ filter: 'blur(8px)' } as any}
                />
            )}

            <Animated.View style={pulseStyle}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                        onPress(node);
                    }}
                    activeOpacity={0.8}
                    disabled={!node.isUnlocked}
                    className={`w-[70px] h-[70px] rounded-full items-center justify-center border-b-4 shadow-lg ${getNodeBgColor()} ${
                        !node.isUnlocked ? 'opacity-60' : 'active:scale-95'
                    }`}
                >
                    {getNodeIcon()}
                </TouchableOpacity>
            </Animated.View>

            {/* Stars Crown for Completed Nodes */}
            {node.isCompleted && (
                <View className="flex-row items-center mt-1.5 bg-slate-900/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {[1, 2, 3].map(s => (
                        <Star
                            key={s}
                            size={10}
                            color="#fbbf24"
                            fill={s <= (node.stars || 3) ? '#fbbf24' : 'none'}
                            style={{ marginHorizontal: 1 }}
                        />
                    ))}
                </View>
            )}

            {/* Title Badge under active or landmark nodes */}
            <View className="mt-1.5 items-center">
                <Text
                    numberOfLines={1}
                    className={`text-[11px] font-bold ${
                        isCurrentActive
                            ? 'text-blue-600 dark:text-blue-400 font-black'
                            : node.isCompleted
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                    {node.title}
                </Text>
            </View>
        </View>
    );
}
