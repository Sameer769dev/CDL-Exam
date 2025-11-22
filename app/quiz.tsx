import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { MoveRight, Lightbulb, BadgeCheck, CircleX } from "lucide-react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withSpring,
    SlideInRight,
    SlideOutLeft,
    FadeIn
} from "react-native-reanimated";
import { ProgressBar } from "../src/components/ProgressBar";
import { OptionButton } from "../src/components/OptionButton";
import { BookmarkButton } from "../src/components/BookmarkButton";
import { getQuestionsByCategory, getCategoryById, getQuestionsByIds, getAllQuestions } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";
import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";
import { saveStudySession } from "../src/utils/storage";

export default function QuizScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const categoryId = (params.categoryId as string) || 'air_brakes';
    const mode = (params.mode as string) || 'standard';

    const {
        updateProgress,
        saveScore,
        addToMistakeBank,
        removeFromMistakeBank,
        mistakeBank,
        bookmarks
    } = useUser();

    const { isDark } = useTheme();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const startTimeRef = useRef<number>(Date.now());

    const shake = useSharedValue(0);
    const shakeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shake.value }]
        };
    });

    useEffect(() => {
        loadQuestions();
    }, [categoryId, mode]);

    const loadQuestions = () => {
        let data: Question[] = [];

        if (mode === 'mistake_bank') {
            const mistakeIds = mistakeBank[categoryId] || [];
            data = getQuestionsByIds(categoryId, mistakeIds);
        } else if (mode === 'bookmarks') {
            if (categoryId === 'all') {
                const allQuestions = getAllQuestions();
                data = allQuestions.filter(q => bookmarks.includes(q.id));
            } else {
                data = getQuestionsByIds(categoryId, bookmarks);
            }
        } else {
            data = getQuestionsByCategory(categoryId);
        }

        setQuestions(data);
        setLoading(false);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleOptionSelect = React.useCallback(async (option: string) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = option === currentQuestion.correct_answer;

        if (isCorrect) {
            setScore((prev) => prev + 1);

            // Remove from mistake bank if in review mode
            if (mode === 'mistake_bank') {
                await removeFromMistakeBank(categoryId, currentQuestion.id);
            }
        } else {
            // Add to mistake bank if not already there
            await addToMistakeBank(categoryId, currentQuestion.id);

            // Shake animation for incorrect answer
            shake.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }

        // Only update progress in standard mode
        if (mode === 'standard') {
            await updateProgress(
                categoryId,
                currentQuestionIndex + 1,
                isCorrect ? score + 1 : score
            );
        }
    }, [isAnswered, currentQuestion, mode, categoryId, currentQuestionIndex, score, shake, removeFromMistakeBank, addToMistakeBank, updateProgress]);

    const handleNext = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            // Quiz finished
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

            // Save study session
            await saveStudySession({
                date: new Date().toISOString(),
                categoryId: categoryId,
                questionsAttempted: totalQuestions,
                questionsCorrect: score,
                timeSpent: timeSpent,
                mode: mode === 'mistake_bank' ? 'mistake_bank' : 'quiz'
            });

            if (mode === 'standard') {
                await saveScore(categoryId, score, totalQuestions);
            }

            router.replace({
                pathname: "/results",
                params: {
                    score: score,
                    total: totalQuestions,
                    categoryId: categoryId
                },
            });
        }
    };

    const getOptionState = (option: string) => {
        if (!isAnswered) return "default";
        if (option === currentQuestion.correct_answer) return "correct";
        if (option === selectedOption) return "incorrect";
        return "disabled";
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center p-6">
                <Stack.Screen options={{ title: "Quiz" }} />
                <Text className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4">
                    {mode === 'mistake_bank' ? "No mistakes to review!" : mode === 'bookmarks' ? "No saved questions!" : "No questions available yet."}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
                    {mode === 'mistake_bank' ? "Great job! You've cleared all your mistakes." : mode === 'bookmarks' ? "Bookmark questions to review them here." : "This category is coming soon!"}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-600 py-4 px-8 rounded-xl"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const categoryName = categoryId === 'all' ? 'All Categories' : (getCategoryById(categoryId)?.name || "Quiz");
    const title = mode === 'mistake_bank' ? `Review: ${categoryName}` : mode === 'bookmarks' ? `Saved: ${categoryName}` : categoryName;

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                title: title,
                headerRight: () => (
                    <BookmarkButton
                        questionId={currentQuestion.id}
                        size={24}
                        color={isDark ? "#94a3b8" : "#475569"}
                    />
                )
            }} />

            <View className="p-6 flex-1">
                <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <Animated.View
                        key={currentQuestionIndex}
                        entering={SlideInRight.springify().damping(20)}
                        exiting={SlideOutLeft.duration(200)}
                        style={shakeStyle}
                    >
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug tracking-tight">
                            {currentQuestion.question}
                        </Text>

                        <View className="mb-8">
                            {currentQuestion.options.map((option, index) => (
                                <OptionButton
                                    key={index}
                                    text={option}
                                    onPress={() => handleOptionSelect(option)}
                                    state={getOptionState(option)}
                                />
                            ))}
                        </View>
                    </Animated.View>

                    {isAnswered && (
                        <Animated.View
                            entering={FadeIn.duration(400)}
                            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-24"
                        >
                            <View className="flex-row items-center mb-2">
                                <Lightbulb size={20} color="#2563eb" className="mr-2" />
                                <Text className="text-blue-800 dark:text-blue-300 font-bold">Explanation</Text>
                            </View>
                            <Text className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                                {currentQuestion.explanation}
                            </Text>
                        </Animated.View>
                    )}
                </ScrollView>

                {isAnswered && (
                    <View className="absolute bottom-6 left-6 right-6">
                        <TouchableOpacity
                            onPress={handleNext}
                            className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none active:bg-blue-700"
                        >
                            <Text className="text-white font-semibold text-lg mr-2">
                                {currentQuestionIndex < totalQuestions - 1
                                    ? "Next Question"
                                    : "See Results"}
                            </Text>
                            <MoveRight size={24} color="white" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
