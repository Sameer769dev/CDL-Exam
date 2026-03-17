import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Car, Truck, Award, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface ExperienceStepProps {
    onSelect: (experience: '0-2' | '2-4' | '4-6' | '6+') => void;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({ onSelect }) => {
    const { isDark } = useTheme();

    const levels = [
        {
            id: '0-2',
            title: '0 - 2 years',
            icon: Car,
            color: '#3b82f6' // Blue
        },
        {
            id: '2-4',
            title: '2 - 4 years',
            icon: Truck,
            color: '#10b981' // Emerald
        },
        {
            id: '4-6',
            title: '4 - 6 years',
            icon: Award,
            color: '#f59e0b' // Amber
        },
        {
            id: '6+',
            title: '6+ years',
            icon: ShieldCheck,
            color: '#ef4444' // Red
        }
    ] as const;

    return (
        <View className="flex-1 px-6">
            <View className="mb-6">
                <Text className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                    What is your driving experience?
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                    This helps us tailor the difficulty of your practice questions.
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} className="flex-1">
                {levels.map((level, index) => (
                    <Animated.View
                        key={level.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                        className="mb-5"
                    >
                        <TouchableOpacity
                            onPress={() => onSelect(level.id)}
                            activeOpacity={0.8}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-200/50 flex-row items-center"
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: `${level.color}20` }}
                            >
                                <level.icon size={24} color={level.color} />
                            </View>
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                {level.title}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};
