import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { MoveRight, X, Clock, Flame, Calendar, Trophy } from "lucide-react-native";
import Animated, { FadeInDown, FadeOut, FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing, ZoomIn } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { OptionButton } from "../src/components/OptionButton";
import { Question } from "../src/types/quiz";
import { useTheme } from "../src/context/ThemeContext";
import { CustomAlert } from "../src/components/CustomAlert";
import { getDailyChallengeQuestions, getTodaysDailyChallengeKey, saveDailyChallengeResult, getDailyChallengeStreak } from "../src/utils/dailyChallenge";
import { shuffleAllOptions } from "../src/utils/dataLoader";
import ConfettiCannon from "react-native-confetti-cannon";

const CHALLENGE_TOTAL_TIME = 60; // 60 seconds for 10 questions

export default function DailyChallengeScreen() {
    const router = useRouter();
    const { isDark } = useTheme();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(CHALLENGE_TOTAL_TIME);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerProgress = useSharedValue(1);

    // Results state
    const [isFinished, setIsFinished] = useState(false);
    const [newStreak, setNewStreak] = useState(0);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', primaryButtonText: '', secondaryButtonText: '',
        onPrimaryPress: () => { }, onSecondaryPress: () => { }, type: 'default' as 'default' | 'danger' | 'success'
    });

    useEffect(() => {
        const backAction = () => {
            if (isFinished) {
                router.back();
                return true;
            }
            setAlertConfig({
                title: "Quit Challenge?",
                message: "If you quit, you will lose today's attempt!",
                primaryButtonText: "Quit",
                secondaryButtonText: "Cancel",
                onPrimaryPress: () => {
                    setAlertVisible(false);
                    stopTimer();
                    router.back();
                },
                onSecondaryPress: () => setAlertVisible(false),
                type: 'danger'
            });
            setAlertVisible(true);
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [isFinished]);

    useEffect(() => {
        loadQuestions();
        return () => stopTimer();
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        timerProgress.value = withTiming(0, {
            duration: CHALLENGE_TOTAL_TIME * 1000,
            easing: Easing.linear,
        });
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    finishChallenge(true); // timeout finish
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer]);

    const loadQuestions = async () => {
        // Get 10 deterministic questions for today
        const data = getDailyChallengeQuestions();
        // Shuffle options dynamically for this session
        setQuestions(shuffleAllOptions(data));
        setLoading(false);
        startTimer();
    };

    const finishChallenge = async (isTimeout = false) => {
        stopTimer();
        setIsFinished(true);
        
        // Save result and get updated streak
        // Passed if score >= 8 (80%)
        const finalScore = isTimeout ? score : (score + (selectedOption === questions[currentQuestionIndex]?.correct_answer ? 1 : 0));
        const passed = finalScore >= 8;
        
        const streak = await saveDailyChallengeResult(getTodaysDailyChallengeKey(), passed);
        setNewStreak(streak);
        
        if (passed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
    };

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return;
        
        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = option === questions[currentQuestionIndex].correct_answer;
        if (isCorrect) {
            setScore(prev => prev + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
        }
        
        // Auto-advance in challenge mode for speed
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsAnswered(false);
            } else {
                finishChallenge();
            }
        }, 800);
    };

    const timerBarStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%`,
    }));

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        const passed = percentage >= 80;
        
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom']}>
                <Stack.Screen options={{ headerShown: false }} />
                {passed && <ConfettiCannon count={150} origin={{x: -10, y: 0}} fallSpeed={2500} fadeOut />}
                
                <View className="flex-1 px-6 justify-center items-center">
                    <Animated.View entering={ZoomIn.springify()} className="items-center w-full">
                        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${passed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                            {passed ? <Trophy size={48} color="#10b981" /> : <X size={48} color="#ef4444" />}
                        </View>
                        
                        <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            {passed ? "Challenge Completed!" : "Good Try!"}
                        </Text>
                        
                        <Text className="text-lg text-slate-500 dark:text-slate-400 text-center mb-8">
                            You scored {score}/{questions.length} ({percentage}%)
                        </Text>
                        
                        <View className="w-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 items-center mb-8">
                            <View className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-3">
                                <Flame size={32} color="#f97316" />
                            </View>
                            <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                Daily Streak
                            </Text>
                            <Text className="text-4xl font-black text-slate-900 dark:text-white">
                                {newStreak} <Text className="text-xl">days</Text>
                            </Text>
                            {passed && (
                                <Text className="text-green-600 dark:text-green-400 font-bold mt-2">
                                    Streak increased!
                                </Text>
                            )}
                        </View>
                        
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-blue-600 w-full py-4 rounded-[32px] items-center active:bg-blue-700"
                        >
                            <Text className="text-white font-bold text-lg">
                                Back to Home
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const getOptionState = (option: string) => {
        if (!isAnswered) return "default";
        if (option === currentQuestion.correct_answer) return "correct";
        if (option === selectedOption) return "incorrect";
        return "disabled";
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="flex-row justify-between items-center px-6 py-2">
                <TouchableOpacity
                    onPress={() => {
                        setAlertConfig({
                            title: "Quit Challenge?",
                            message: "If you quit, you will lose today's attempt!",
                            primaryButtonText: "Quit",
                            secondaryButtonText: "Cancel",
                            onPrimaryPress: () => {
                                setAlertVisible(false);
                                stopTimer();
                                router.back();
                            },
                            onSecondaryPress: () => setAlertVisible(false),
                            type: 'danger'
                        });
                        setAlertVisible(true);
                    }}
                    className="p-2 -ml-2 rounded-full"
                >
                    <X size={24} color={isDark ? "#94a3b8" : "#475569"} />
                </TouchableOpacity>

                <View className="flex-row items-center bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
                    <Calendar size={14} color="#f97316" />
                    <Text className="ml-1.5 font-bold text-sm text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                        Daily Challenge
                    </Text>
                </View>

                <View className={`flex-row items-center px-3 py-1.5 rounded-full ${timeLeft <= 10 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Clock size={14} color={timeLeft <= 10 ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b')} />
                    <Text className={`ml-1.5 font-bold text-sm tabular-nums ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {timeLeft}s
                    </Text>
                </View>
            </View>

            <View className="h-1.5 bg-slate-200 dark:bg-slate-800 mx-6 rounded-full overflow-hidden mb-4">
                <Animated.View
                    style={[timerBarStyle, { height: '100%', borderRadius: 9999 }]}
                    className={timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'}
                />
            </View>
            
            <View className="px-6 mb-4 flex-row justify-between items-center">
                <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </Text>
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                    Score: {score}
                </Text>
            </View>

            <View className="flex-1">
                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <Animated.View key={currentQuestionIndex} entering={FadeInDown.springify().damping(20).mass(0.8)} exiting={FadeOut.duration(200)}>
                        <Text className="text-[22px] font-bold text-slate-900 dark:text-white mb-8 leading-relaxed tracking-tight text-center mt-4">
                            {currentQuestion.question}
                        </Text>
                        <View className="mb-8">
                            {currentQuestion.options.map((option, index) => (
                                <OptionButton key={index} text={option} onPress={() => handleOptionSelect(option)} state={getOptionState(option)} />
                            ))}
                        </View>
                    </Animated.View>
                </ScrollView>
            </View>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                primaryButtonText={alertConfig.primaryButtonText}
                secondaryButtonText={alertConfig.secondaryButtonText}
                onPrimaryPress={alertConfig.onPrimaryPress}
                onSecondaryPress={alertConfig.onSecondaryPress}
                type={alertConfig.type}
            />
        </SafeAreaView>
    );
}
