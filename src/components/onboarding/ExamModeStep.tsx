import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, EyeOff, FileText, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface ExamModeStepProps {
    onSelect: (mode: 'full_support' | 'no_explanations' | 'exam_style') => void;
}

export const ExamModeStep: React.FC<ExamModeStepProps> = ({ onSelect }) => {
    const { isDark } = useTheme();

    const modes = [
        {
            id: 'full_support',
            title: 'Full Support',
            description: 'After answering each question, the correct answer and explanation is shown.',
            icon: BookOpen,
            color: '#3b82f6' // Blue
        },
        {
            id: 'no_explanations',
            title: 'No Explanations',
            description: 'After answering each question, only the correct answer is shown.',
            icon: EyeOff,
            color: '#ef4444' // Red
        },
        {
            id: 'exam_style',
            title: 'Exam-style',
            description: 'Answers and explanations are revealed after the test is complete.',
            icon: FileText,
            color: '#f59e0b' // Amber
        }
    ] as const;

    return (
        <View className="flex-1 px-6">
            <View className="mb-6">
                <Text className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                    What is your preferred exam mode?
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                    Choose how you want to practice. You can change this later in settings.
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} className="flex-1">
                {modes.map((mode, index) => (
                    <Animated.View
                        key={mode.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                        className="mb-5"
                    >
                        <TouchableOpacity
                            onPress={() => onSelect(mode.id)}
                            activeOpacity={0.8}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-200/50 flex-row items-center"
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: `${mode.color}20` }}
                            >
                                <mode.icon size={24} color={mode.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {mode.title}
                                </Text>
                                <Text className="text-sm text-slate-600 dark:text-slate-400 leading-6">
                                    {mode.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};
