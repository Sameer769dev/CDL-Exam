import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ArrowRight, Clock, AlertTriangle } from "lucide-react-native";
import { ProgressBar } from "../src/components/ProgressBar";
import { OptionButton } from "../src/components/OptionButton";
import { generateExamQuestions } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";

export default function ExamScreen() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        if (loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading]);

    const loadQuestions = () => {
        const data = generateExamQuestions(50);
        setQuestions(data);
        setLoading(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = (option: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            confirmSubmit();
        }
    };

    const confirmSubmit = () => {
        const answeredCount = Object.keys(answers).length;
        const total = questions.length;

        if (answeredCount < total) {
            Alert.alert(
                "Submit Exam?",
                `You have answered ${answeredCount} out of ${total} questions. Are you sure you want to submit?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Submit", onPress: handleSubmit }
                ]
            );
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        // Calculate score
        let score = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correct_answer) {
                score++;
            }
        });

        router.replace({
            pathname: "/exam-results",
            params: {
                score: score,
                total: questions.length,
                timeTaken: 3600 - timeLeft
            },
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const selectedOption = answers[currentQuestionIndex];

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                title: "Exam Simulator",
                headerRight: () => (
                    <View className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full">
                        <Clock size={16} color="#475569" className="mr-2" />
                        <Text className={`font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-slate-700'}`}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                )
            }} />

            <View className="p-6 flex-1">
                <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <Text className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
                        {currentQuestion.question}
                    </Text>

                    <View className="mb-8">
                        {currentQuestion.options.map((option, index) => (
                            <OptionButton
                                key={index}
                                text={option}
                                onPress={() => handleOptionSelect(option)}
                                state={selectedOption === option ? 'selected' : 'default'}
                            />
                        ))}
                    </View>
                </ScrollView>

                <View className="absolute bottom-6 left-6 right-6">
                    <TouchableOpacity
                        onPress={handleNext}
                        className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 active:bg-blue-700"
                    >
                        <Text className="text-white font-bold text-xl mr-2">
                            {currentQuestionIndex < totalQuestions - 1
                                ? "Next Question"
                                : "Submit Exam"}
                        </Text>
                        <ArrowRight size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
