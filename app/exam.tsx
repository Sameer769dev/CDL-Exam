import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ArrowRight, Clock, X } from "lucide-react-native";
import Animated, {
    SlideInRight,
    SlideOutLeft,
    SlideInDown,
    Easing
} from "react-native-reanimated";
import { OptionButton } from "../src/components/OptionButton";
import { generateExamQuestions } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";
import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";
import { trackExamSession } from "../src/utils/sessionTracking";
import { CustomAlert } from "../src/components/CustomAlert";
import { shuffleAllOptions } from "../src/utils/dataLoader";
import { Flag } from "lucide-react-native";

export default function ExamScreen() {
    const router = useRouter();
    const { saveScore } = useUser();
    const { isDark } = useTheme();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        primaryButtonText: '',
        secondaryButtonText: '',
        onPrimaryPress: () => { },
        onSecondaryPress: () => { },
        type: 'default' as 'default' | 'danger' | 'success'
    });

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
        // Ensure options are shuffled for the exam as well
        setQuestions(shuffleAllOptions(data));
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

    const toggleFlag = () => {
        setFlaggedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(currentQuestionIndex)) {
                next.delete(currentQuestionIndex);
            } else {
                next.add(currentQuestionIndex);
            }
            return next;
        });
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
            setAlertConfig({
                title: "Submit Exam?",
                message: `You have answered ${answeredCount} out of ${total} questions. Are you sure you want to submit?`,
                primaryButtonText: "Submit",
                secondaryButtonText: "Cancel",
                onPrimaryPress: () => {
                    setAlertVisible(false);
                    handleSubmit();
                },
                onSecondaryPress: () => setAlertVisible(false),
                type: 'default'
            });
            setAlertVisible(true);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // Calculate score
        let score = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correct_answer) {
                score++;
            }
        });

        // Save score to 'exam_simulator' category
        await saveScore('exam_simulator', score, questions.length);

        // Track exam session
        const timeSpent = 3600 - timeLeft; // seconds
        await trackExamSession(score, questions.length, timeSpent);

        // Build review payload
        const reviewData = questions.map((q, index) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            userAnswer: answers[index] || null,
        }));

        router.replace({
            pathname: "/results",
            params: {
                score: score,
                total: questions.length,
                categoryId: 'exam_simulator',
                mode: 'exam',
                timeSpent: timeSpent.toString(),
                reviewData: JSON.stringify(reviewData),
            },
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const selectedOption = answers[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <TouchableOpacity
                        onPress={() => {
                            setAlertConfig({
                                title: "Quit Exam?",
                                message: "Your progress will be lost.",
                                primaryButtonText: "Quit",
                                secondaryButtonText: "Cancel",
                                onPrimaryPress: () => {
                                    setAlertVisible(false);
                                    router.back();
                                },
                                onSecondaryPress: () => setAlertVisible(false),
                                type: 'danger'
                            });
                            setAlertVisible(true);
                        }}
                        className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <X size={28} color={isDark ? "#e2e8f0" : "#1e293b"} strokeWidth={2.5} />
                    </TouchableOpacity>

                    <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                        <Clock size={18} color={timeLeft < 300 ? "#ef4444" : "#475569"} className="mr-2" />
                        <Text className={`font-bold text-base ${timeLeft < 300 ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="h-1 bg-slate-200 dark:bg-slate-800 w-full">
                    <View
                        className="h-full bg-blue-600"
                        style={{ width: `${progress}%` }}
                    />
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </Text>
                            <View className="flex-row items-center">
                                <TouchableOpacity 
                                    onPress={toggleFlag}
                                    className={`mr-4 px-3 py-1.5 rounded-full flex-row items-center border ${flaggedQuestions.has(currentQuestionIndex) ? 'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700/50' : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
                                >
                                    <Flag size={14} color={flaggedQuestions.has(currentQuestionIndex) ? '#d97706' : (isDark ? '#94a3b8' : '#64748b')} strokeWidth={flaggedQuestions.has(currentQuestionIndex) ? 3 : 2} className="mr-1.5" />
                                    <Text className={`text-xs font-bold ${flaggedQuestions.has(currentQuestionIndex) ? 'text-amber-700 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {flaggedQuestions.has(currentQuestionIndex) ? 'Flagged' : 'Flag'}
                                    </Text>
                                </TouchableOpacity>
                                <Text className="text-sm font-bold text-slate-400 dark:text-slate-500">
                                    {Math.round(progress)}%
                                </Text>
                            </View>
                        </View>

                        <Animated.View
                            key={currentQuestionIndex}
                            entering={SlideInRight.duration(300).easing(Easing.out(Easing.cubic))}
                            exiting={SlideOutLeft.duration(250).easing(Easing.in(Easing.cubic))}
                        >
                            <Text className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 leading-relaxed">
                                {currentQuestion.question}
                            </Text>

                            <View className="mb-6">
                                {currentQuestion.options.map((option, index) => (
                                    <OptionButton
                                        key={index}
                                        text={option}
                                        onPress={() => handleOptionSelect(option)}
                                        state={selectedOption === option ? 'selected' : 'default'}
                                    />
                                ))}
                            </View>
                        </Animated.View>
                    </View>
                </ScrollView>

                {/* Fixed Bottom Button */}
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-900/80 blur-md border-t border-slate-200 dark:border-slate-800">
                    <TouchableOpacity
                        onPress={handleNext}
                        className="bg-blue-600 py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/30 active:bg-blue-700 active:scale-[0.98]"
                    >
                        <Text className="text-white font-bold text-xl mr-3">
                            {currentQuestionIndex < totalQuestions - 1
                                ? "Next Question"
                                : "Submit Exam"}
                        </Text>
                        <ArrowRight size={24} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
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
        </View>
    );
}
