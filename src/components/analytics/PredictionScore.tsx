import React from 'react';
import { View, Text } from 'react-native';
import { useWeakAreas } from '../../hooks/useWeakAreas';
import { TrendingUp, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

export function PredictionScore() {
    const { passProbability, readinessLevel } = useWeakAreas();
    const { isDark } = useTheme();

    const getPredictionText = () => {
        if (passProbability >= 90) return "You are highly likely to pass on your first try! Keep maintaining your current study habits.";
        if (passProbability >= 75) return "You're on track to pass, but a few more practice tests will help secure your score.";
        if (passProbability >= 60) return "You have a fair chance, but focusing on your weak areas is strongly recommended.";
        return "You need more practice before attempting the real exam. Focus on daily challenges and your mistake bank.";
    };

    const getPredictionColor = () => {
        if (passProbability >= 80) return isDark ? '#10b981' : '#10b981';
        if (passProbability >= 65) return isDark ? '#3b82f6' : '#3b82f6';
        if (passProbability >= 50) return isDark ? '#f59e0b' : '#f59e0b';
        return isDark ? '#ef4444' : '#ef4444';
    };

    return (
        <Animated.View entering={FadeIn.delay(300)} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    Pass Prediction
                </Text>
                {passProbability >= 80 ? (
                    <TrendingUp size={20} color="#10b981" />
                ) : (
                    <AlertTriangle size={20} color="#f59e0b" />
                )}
            </View>
            
            <View className="flex-row items-baseline mb-4">
                <Text className="text-5xl font-black" style={{ color: getPredictionColor() }}>
                    {passProbability}%
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 font-bold ml-2">
                    probability
                </Text>
            </View>

            <View className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What this means:
                </Text>
                <Text className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {getPredictionText()}
                </Text>
            </View>
        </Animated.View>
    );
}
