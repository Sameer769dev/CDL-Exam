import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, ArrowLeft, RotateCw, CheckCircle, CheckCircle2, HelpCircle } from "lucide-react-native";
import { BookmarkButton } from "../src/components/BookmarkButton";
import { getQuestionsByCategory, getCategoryById } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";
import { useTheme } from "../src/context/ThemeContext";

export default function FlashcardsScreen() {
    const params = useLocalSearchParams();
    const categoryId = (params.categoryId as string) || 'air_brakes';
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        const data = getQuestionsByCategory(categoryId);
        setQuestions(data);
    }, [categoryId]);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    if (questions.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Text className="text-slate-500 dark:text-slate-400">Loading...</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const categoryName = getCategoryById(categoryId)?.name || "Flashcards";

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                title: categoryName,
                headerRight: () => (
                    <BookmarkButton
                        questionId={currentQuestion.id}
                        size={24}
                        color={isDark ? "#94a3b8" : "#475569"}
                    />
                )
            }} />

            <View className="flex-1 p-6 items-center justify-center">
                <View className="w-full mb-8">
                    <Text className="text-center text-slate-500 dark:text-slate-400 font-medium mb-4">
                        Card {currentIndex + 1} of {questions.length}
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleFlip}
                        className="w-full aspect-[4/5]"
                    >
                        <View className={`w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-700 p-8 items-center justify-center ${isFlipped ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}>
                            {isFlipped ? (
                                <>
                                    <View className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-6">
                                        <CheckCircle2 size={32} color="#16a34a" />
                                    </View>
                                    <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center leading-9">
                                        {currentQuestion.options[currentQuestion.correctAnswer]}
                                    </Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-center mt-6">
                                        Tap to flip back
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-6">
                                        <HelpCircle size={32} color="#2563eb" />
                                    </View>
                                    <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center leading-9">
                                        {currentQuestion.question}
                                    </Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-center mt-6">
                                        Tap to reveal answer
                                    </Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between w-full px-4">
                    <TouchableOpacity
                        onPress={handlePrev}
                        disabled={currentIndex === 0}
                        className={`p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 ${currentIndex === 0 ? 'opacity-50' : ''}`}
                    >
                        <ArrowLeft size={24} color={isDark ? "#94a3b8" : "#475569"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={currentIndex === questions.length - 1}
                        className={`p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 ${currentIndex === questions.length - 1 ? 'opacity-50' : ''}`}
                    >
                        <ArrowRight size={24} color={isDark ? "#94a3b8" : "#475569"} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
