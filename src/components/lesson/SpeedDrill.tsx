import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Zap, Flame, Check, X, Trophy, ArrowRight, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useGame } from '../../context/GameContext';

export interface SpeedDrillItem {
    id: string;
    statement: string;
    isTrue: boolean;
    explanation: string;
}

export interface SpeedDrillProps {
    title: string;
    subtitle?: string;
    items: SpeedDrillItem[];
    totalDurationSeconds?: number;
    onFinish: (result: { score: number; total: number; maxStreak: number; xpEarned: number }) => void;
}

export const SpeedDrill: React.FC<SpeedDrillProps> = ({
    title,
    subtitle = "Rapid-Fire Speed Drill",
    items,
    totalDurationSeconds = 45,
    onFinish,
}) => {
    const { isDark } = useTheme();
    const { addXP, addGems } = useGame();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(totalDurationSeconds);
    const [isFinished, setIsFinished] = useState(false);
    const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const currentItem = items[currentIndex];

    // Countdown Timer
    useEffect(() => {
        if (isFinished) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isFinished]);

    const handleAnswer = (userChoice: boolean) => {
        if (isFinished || !currentItem) return;

        const isCorrect = userChoice === currentItem.isTrue;

        if (isCorrect) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setScore(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak > maxStreak) setMaxStreak(newStreak);
                return newStreak;
            });
            setLastAnswerStatus('correct');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setStreak(0);
            setLastAnswerStatus('wrong');
        }

        setTimeout(() => {
            setLastAnswerStatus(null);
            if (currentIndex + 1 < items.length) {
                setCurrentIndex(prev => prev + 1);
            } else {
                handleFinish();
            }
        }, 250);
    };

    const handleFinish = () => {
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const xp = Math.max(10, score * 5 + maxStreak * 3);
        const gems = score >= items.length * 0.8 ? 15 : 5;

        addXP(xp);
        addGems(gems);

        onFinish({
            score,
            total: items.length,
            maxStreak,
            xpEarned: xp,
        });
    };

    if (isFinished) {
        const accuracy = Math.round((score / Math.max(1, items.length)) * 100);
        return (
            <View className="flex-1 justify-center items-center p-6 bg-slate-50 dark:bg-slate-950">
                <View className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 items-center justify-center mb-4">
                    <Trophy size={40} color="#f59e0b" />
                </View>

                <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center">
                    Drill Completed!
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center">
                    You reacted like a seasoned commercial driver.
                </Text>

                {/* Score Stats Grid */}
                <View className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Score</Text>
                            <Text className="text-2xl font-black text-slate-900 dark:text-white">{score}/{items.length}</Text>
                        </View>
                        <View className="w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <View className="items-center">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Max Combo</Text>
                            <View className="flex-row items-center">
                                <Flame size={18} color="#f97316" className="mr-0.5" />
                                <Text className="text-2xl font-black text-orange-500">{maxStreak}x</Text>
                            </View>
                        </View>
                        <View className="w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <View className="items-center">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Accuracy</Text>
                            <Text className="text-2xl font-black text-emerald-500">{accuracy}%</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => onFinish({ score, total: items.length, maxStreak, xpEarned: score * 5 })}
                    className="w-full py-4 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30 flex-row"
                >
                    <Text className="text-white font-black text-base mr-2">CONTINUE</Text>
                    <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    const timerPercentage = (timeLeft / totalDurationSeconds) * 100;

    return (
        <View className="flex-1 p-5">
            {/* Top Bar: Progress, Timer & Streak */}
            <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <Zap size={18} color="#eab308" />
                        <Text className="text-slate-900 dark:text-white font-black text-sm ml-1.5">
                            {currentIndex + 1} / {items.length}
                        </Text>
                    </View>

                    {/* Streak Flame Pill */}
                    <View className="flex-row items-center bg-orange-500/10 dark:bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                        <Flame size={16} color="#f97316" />
                        <Text className="text-orange-500 font-black text-xs ml-1">
                            {streak}x Streak
                        </Text>
                    </View>

                    {/* Time Left */}
                    <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <Text className={`font-black text-xs ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            ⏱ {timeLeft}s
                        </Text>
                    </View>
                </View>

                {/* Animated Timer Bar */}
                <View className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <View
                        className={`h-full rounded-full ${
                            timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${timerPercentage}%` }}
                    />
                </View>
            </View>

            {/* Flash Statement Card */}
            <View className="flex-1 justify-center">
                <View className={`bg-white dark:bg-slate-900 rounded-[32px] p-6 border shadow-xl items-center justify-center min-h-[260px] ${
                    lastAnswerStatus === 'correct'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : lastAnswerStatus === 'wrong'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                }`}>
                    <View className="bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-4">
                        <Text className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-wider">
                            Is this statement TRUE or FALSE?
                        </Text>
                    </View>

                    <Text className="text-slate-900 dark:text-white text-xl font-black text-center leading-relaxed">
                        {currentItem?.statement}
                    </Text>
                </View>
            </View>

            {/* TRUE / FALSE Rapid Action Buttons */}
            <View className="flex-row gap-4 pt-6 pb-4">
                {/* FALSE BUTTON */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleAnswer(false)}
                    className="flex-1 bg-red-500 py-5 rounded-2xl items-center justify-center shadow-lg shadow-red-500/30 active:scale-95"
                >
                    <View className="flex-row items-center">
                        <X size={26} color="#fff" strokeWidth={3.5} className="mr-1.5" />
                        <Text className="text-white font-black text-xl">FALSE</Text>
                    </View>
                </TouchableOpacity>

                {/* TRUE BUTTON */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleAnswer(true)}
                    className="flex-1 bg-emerald-500 py-5 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95"
                >
                    <View className="flex-row items-center">
                        <Check size={26} color="#fff" strokeWidth={3.5} className="mr-1.5" />
                        <Text className="text-white font-black text-xl">TRUE</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};
