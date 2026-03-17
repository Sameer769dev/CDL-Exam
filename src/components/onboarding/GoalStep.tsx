import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Target, Zap, Trophy, Crown } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface GoalStepProps {
    onNext: (questionsPerDay: number) => void;
}



export const GoalStep: React.FC<GoalStepProps> = ({ onNext }) => {
    const { colors } = useTheme();
    const [selectedGoal, setSelectedGoal] = useState(10);

    const GOALS = [
        { count: 5, label: 'Quick', icon: <Zap size={24} color={colors.semantic.success} />, desc: '5 min daily' },
        { count: 10, label: 'Standard', icon: <Target size={24} color={colors.primary.main} />, desc: '10 min daily' },
        { count: 20, label: 'Focused', icon: <Trophy size={24} color={colors.semantic.warning} />, desc: '20 min daily' },
        { count: 30, label: 'Dedicated', icon: <Crown size={24} color={colors.semantic.info} />, desc: '30 min daily' },
    ];

    return (
        <View className="flex-1 px-6">
            <View className="mb-6">
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                        How much time can you spend on a test?
                    </Text>
                    <Text className="text-lg mb-8" style={{ color: colors.text.secondary }}>
                        We'll adjust your daily questions to match your schedule.
                    </Text>
                </Animated.View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} className="flex-1">
                {GOALS.map((goal, index) => {
                    const isSelected = selectedGoal === goal.count;
                    return (
                        <Animated.View
                            key={goal.count}
                            entering={FadeInDown.delay(400 + (index * 100)).springify()}
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedGoal(goal.count)}
                                activeOpacity={0.7}
                                className="flex-row items-center p-5 mb-5 rounded-3xl border shadow-sm"
                                style={{
                                    backgroundColor: isSelected ? colors.primary.main : colors.background.card,
                                    borderColor: isSelected ? colors.primary.main : colors.border.default,
                                    shadowColor: isSelected ? colors.primary.main : '#000',
                                    shadowOpacity: isSelected ? 0.3 : 0.05,
                                    shadowRadius: 8,
                                    elevation: isSelected ? 8 : 2
                                }}
                            >
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center"
                                    style={{
                                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.background.main
                                    }}
                                >
                                    {React.cloneElement(goal.icon as React.ReactElement<{ color: string }>, {
                                        color: isSelected ? colors.text.inverse : (goal.icon as React.ReactElement<{ color: string }>).props.color
                                    })}
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text className="text-lg font-bold" style={{ color: isSelected ? colors.text.inverse : colors.text.primary }}>{goal.label}</Text>
                                    <Text style={{ color: isSelected ? colors.primary.light : colors.text.secondary }}>{goal.desc}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-xl font-bold" style={{ color: isSelected ? colors.text.inverse : colors.text.secondary }}>
                                        {goal.count}
                                    </Text>
                                    <Text className="text-xs" style={{ color: isSelected ? colors.primary.light : colors.text.secondary }}>min</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </ScrollView>

            <Animated.View entering={FadeInDown.delay(800).springify()} className="pb-8 pt-4">
                <TouchableOpacity
                    onPress={() => onNext(selectedGoal)}
                    className="h-16 rounded-3xl items-center justify-center active:scale-95 transition-all"
                    style={{
                        backgroundColor: colors.primary.main,
                        shadowColor: colors.primary.main,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4
                    }}
                >
                    <Text className="text-xl font-bold" style={{ color: colors.text.inverse }}>Proceed</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
