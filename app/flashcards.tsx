import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react-native";
import { BookmarkButton } from "../src/components/BookmarkButton";
import { SwipeableCard } from "../src/components/SwipeableCard";
import { getQuestionsByCategory, getCategoryById } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";
import { useTheme } from "../src/context/ThemeContext";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

export default function FlashcardsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const categoryId = (params.categoryId as string) || 'air_brakes';
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [masteredCount, setMasteredCount] = useState(0);
    const [studyAgainCount, setStudyAgainCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        const data = getQuestionsByCategory(categoryId);
        // Shuffle questions for better practice
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
    }, [categoryId]);

    const handleSwipeRight = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setMasteredCount(prev => prev + 1);
        nextCard();
    }, []);

    const handleSwipeLeft = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStudyAgainCount(prev => prev + 1);
        nextCard();
    }, []);

    const nextCard = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setMasteredCount(0);
        setStudyAgainCount(0);
        setIsFinished(false);
        // Re-shuffle
        setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
    };

    if (questions.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Text className="text-slate-500 dark:text-slate-400">Loading...</Text>
            </View>
        );
    }

    const categoryName = getCategoryById(categoryId)?.name || "Flashcards";
    const currentQuestion = questions[currentIndex];

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                >
                    <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#1e293b"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    {categoryName}
                </Text>
                <BookmarkButton
                    questionId={currentQuestion?.id}
                    size={24}
                    color={isDark ? "#94a3b8" : "#475569"}
                />
            </View>

            <View className="flex-1 p-6 items-center justify-center">
                {!isFinished ? (
                    <View className="w-full items-center">
                        <Text className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                            Card {currentIndex + 1} of {questions.length}
                        </Text>

                        <SwipeableCard
                            key={currentQuestion.id} // Key ensures component remounts/resets on new question
                            index={currentIndex}
                            question={currentQuestion.question}
                            answer={currentQuestion.options[parseInt(currentQuestion.correct_answer)]}
                            onSwipeRight={handleSwipeRight}
                            onSwipeLeft={handleSwipeLeft}
                        />

                        <View className="flex-row justify-between w-full px-8 mt-12">
                            <View className="items-center">
                                <Text className="text-red-500 font-bold text-lg">← Study Again</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-green-500 font-bold text-lg">Got it! →</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Animated.View entering={FadeIn} className="items-center justify-center w-full">
                        <View className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
                            <CheckCircle2 size={64} color="#16a34a" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Session Complete!
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
                            You mastered {masteredCount} cards and need to review {studyAgainCount}.
                        </Text>

                        <View className="flex-row space-x-4 w-full">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="flex-1 bg-slate-200 dark:bg-slate-800 py-4 rounded-xl items-center"
                            >
                                <Text className="font-bold text-slate-700 dark:text-slate-300">Done</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleRestart}
                                className="flex-1 bg-blue-600 py-4 rounded-xl items-center flex-row justify-center"
                            >
                                <RotateCcw size={20} color="white" className="mr-2" />
                                <Text className="font-bold text-white">Restart</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}
