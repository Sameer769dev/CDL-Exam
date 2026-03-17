import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface StudyTimeStepProps {
    onSelect: (time: 'morning' | 'afternoon' | 'evening' | 'night' | 'no_preference') => void;
}

export const StudyTimeStep: React.FC<StudyTimeStepProps> = ({ onSelect }) => {
    const { isDark } = useTheme();

    const times = [
        {
            id: 'no_preference',
            title: 'No Preference',
            icon: Clock,
            color: '#64748b' // Slate
        },
        {
            id: 'morning',
            title: 'Morning',
            icon: Sunrise,
            color: '#f59e0b' // Amber
        },
        {
            id: 'afternoon',
            title: 'Afternoon',
            icon: Sun,
            color: '#eab308' // Yellow
        },
        {
            id: 'evening',
            title: 'Early evening',
            icon: Sunset,
            color: '#f97316' // Orange
        },
        {
            id: 'night',
            title: 'Late night',
            icon: Moon,
            color: '#6366f1' // Indigo
        }
    ] as const;

    return (
        <View className="flex-1 px-6">
            <View className="mb-6">
                <Text className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                    What is your preferred study time?
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                    We'll send you reminders at the best time for you.
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} className="flex-1">
                {times.map((time, index) => (
                    <Animated.View
                        key={time.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                        className="mb-5"
                    >
                        <TouchableOpacity
                            onPress={() => onSelect(time.id)}
                            activeOpacity={0.8}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-200/50 flex-row items-center justify-between"
                        >
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                {time.title}
                            </Text>
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${time.color}20` }}
                            >
                                <time.icon size={24} color={time.color} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};
