import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { MoveRight, Lightbulb, X, RotateCcw } from "lucide-react-native";
import Animated, {
    FadeInDown,
    FadeOut,
    FadeIn
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { QuizProgress } from "../src/components/QuizProgress";
import { OptionButton } from "../src/components/OptionButton";
import { BookmarkButton } from "../src/components/BookmarkButton";
import { getQuestionsByCategory, getQuestionsByIds, getAllQuestions, getCategoryById, getAccessibleQuestionCount } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";
import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";
import { CustomAlert } from "../src/components/CustomAlert";

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
        bookmarks,
        isPremium,
        trackSession,
        activeSession,
        syncActiveSession,
        finishActiveSession,
        getSmartQuestions
    } = useUser();

    const { isDark } = useTheme();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [sessionAnswers, setSessionAnswers] = useState<Record<number, boolean>>({});
    const startTimeRef = useRef<number>(Date.now());

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

    // Handle Back Button
    useEffect(() => {
        const backAction = () => {
            handleQuit();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleQuit = () => {
        setAlertConfig({
            title: "Quit Quiz?",
            message: "Are you sure you want to quit? Your progress will be saved.",
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
    };

    useEffect(() => {
        loadQuestions();
    }, [categoryId, mode]);

    const loadQuestions = async () => {
        let data: Question[] = [];

        if (mode === 'mistake_bank') {
            const mistakeIds = mistakeBank[categoryId] || [];
            data = getQuestionsByIds(categoryId, mistakeIds);
            // Shuffle mistakes
            data = data.sort(() => Math.random() - 0.5);
        } else if (mode === 'bookmarks') {
            if (categoryId === 'all') {
                const allQuestions = getAllQuestions();
                data = allQuestions.filter(q => bookmarks.includes(q.id));
            } else {
                data = getQuestionsByIds(categoryId, bookmarks);
            }
            // Shuffle bookmarks
            data = data.sort(() => Math.random() - 0.5);
        } else {
            // Standard Quiz - Use Smart Ordering
            const allCategoryQuestions = getQuestionsByCategory(categoryId);

            // Enforce Freemium Limits
            const category = getCategoryById(categoryId);
            if (category) {
                const accessibleCount = getAccessibleQuestionCount(category, isPremium);
                // Limit the pool of available questions
                // We slice the array to simulate restricted access
                const accessibleQuestions = allCategoryQuestions.slice(0, accessibleCount);

                const smartQuestions = await getSmartQuestions(categoryId, accessibleQuestions, 10);
                data = smartQuestions;
            } else {
                // Fallback if category not found (shouldn't happen)
                const smartQuestions = await getSmartQuestions(categoryId, allCategoryQuestions, 10);
                data = smartQuestions;
            }
        }

        // Check for active session resume (Common for Quiz and Mistake Bank)
        // We don't resume bookmarks mode as it's usually quick/random
        // Check for active session resume (Common for Quiz and Mistake Bank)
        // We don't resume bookmarks mode as it's usually quick/random
        const isStandardQuiz = mode === 'standard' && activeSession?.mode === 'quiz';
        const isMistakeBank = mode === 'mistake_bank' && activeSession?.mode === 'mistake_bank';

        if (activeSession && activeSession.categoryId === categoryId && (isStandardQuiz || isMistakeBank)) {
            // Ask user if they want to resume
            setAlertConfig({
                title: "Resume Session?",
                message: mode === 'mistake_bank'
                    ? "You have an unfinished mistake review. Would you like to continue?"
                    : "You have an unfinished quiz. Would you like to continue where you left off?",
                primaryButtonText: "Resume",
                secondaryButtonText: "Start Over",
                onPrimaryPress: async () => {
                    setAlertVisible(false);

                    // If resuming, we need to load the specific questions from the session
                    // For standard quiz, getSmartQuestions might return different ones, so we rely on session.questionIds
                    // For mistake bank, we also want the exact same order

                    const allQuestions = getAllQuestions();
                    const sessionQuestions = allQuestions.filter(q => activeSession.questionIds.includes(q.id));
                    // Sort by the saved order
                    sessionQuestions.sort((a, b) => {
                        return activeSession.questionIds.indexOf(a.id) - activeSession.questionIds.indexOf(b.id);
                    });

                    setQuestions(sessionQuestions);
                    setCurrentQuestionIndex(activeSession.currentIndex);
                    setSessionAnswers(activeSession.answers);

                    // Calculate current score from answers
                    const currentScore = Object.values(activeSession.answers).filter(v => v).length;
                    setScore(currentScore);

                    setLoading(false);
                },
                onSecondaryPress: async () => {
                    setAlertVisible(false);
                    await finishActiveSession(); // Clear old session
                    // Use the data loaded above (new session)
                    setQuestions(data);
                    setLoading(false);
                },
                type: 'default'
            });
            setAlertVisible(true);
            return; // Wait for user response
        }

        setQuestions(data);
        setLoading(false);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleOptionSelect = React.useCallback((option: string) => {
        if (isAnswered) return;

        // Immediate UI updates
        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = option === currentQuestion.correct_answer;

        if (isCorrect) {
            setScore((prev) => prev + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
        }

        // Update Session State
        const newAnswers = { ...sessionAnswers, [currentQuestion.id]: isCorrect };
        setSessionAnswers(newAnswers);

        // Background operations
        setTimeout(() => {
            Promise.all([
                isCorrect && mode === 'mistake_bank'
                    ? removeFromMistakeBank(categoryId, currentQuestion.id)
                    : !isCorrect
                        ? addToMistakeBank(categoryId, currentQuestion.id)
                        : Promise.resolve(),
                mode === 'standard'
                    ? updateProgress(
                        categoryId,
                        currentQuestionIndex + 1,
                        isCorrect ? score + 1 : score
                    )
                    : Promise.resolve(),
                // Sync Active Session (Debounced/Immediate)
                mode === 'standard'
                    ? syncActiveSession({
                        categoryId,
                        mode: 'quiz',
                        questionIds: questions.map(q => q.id),
                        currentIndex: currentQuestionIndex,
                        answers: newAnswers,
                        startTime: startTimeRef.current,
                        lastUpdated: new Date().toISOString()
                    })
                    : Promise.resolve()
            ]).catch(error => console.error('Background save error:', error));
        }, 0);
    }, [isAnswered, currentQuestion, mode, categoryId, currentQuestionIndex, score, removeFromMistakeBank, addToMistakeBank, updateProgress, syncActiveSession, sessionAnswers, questions]);

    const handleNext = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            // Immediate navigation
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setSelectedOption(null);
            setIsAnswered(false);

            // Update index in storage
            if (mode === 'standard') {
                syncActiveSession({
                    categoryId,
                    mode: 'quiz',
                    questionIds: questions.map(q => q.id),
                    currentIndex: nextIndex,
                    answers: sessionAnswers,
                    startTime: startTimeRef.current,
                    lastUpdated: new Date().toISOString()
                });
            }
        } else {
            // Quiz finished — navigate first, then show interstitial at the
            // natural break point (results screen). Showing an ad BEFORE
            // navigation would block the UI transition, which violates AdMob
            // best-practice (ads must appear at natural content breaks).
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

            router.replace({
                pathname: "/results",
                params: {
                    score: score,
                    total: totalQuestions,
                    categoryId: categoryId,
                    mode: mode,
                    timeSpent: timeSpent.toString(),
                    showAd: isPremium ? 'false' : 'true',
                },
            });

            // Save Final Results & Clear Active Session
            Promise.all([
                trackSession({
                    categoryId: categoryId,
                    questionsAttempted: totalQuestions,
                    questionsCorrect: score,
                    timeSpent: timeSpent,
                    mode: mode === 'mistake_bank' ? 'mistake_bank' : 'quiz'
                }),
                mode === 'standard'
                    ? saveScore(categoryId, score, totalQuestions)
                    : Promise.resolve(),
                mode === 'standard'
                    ? finishActiveSession()
                    : Promise.resolve()
            ]).catch(error => console.error('Save results error:', error));
        }
    };

    const getOptionState = (option: string) => {
        if (!isAnswered) return "default";
        if (option === currentQuestion.correct_answer) return "correct";
        if (option === selectedOption) return "incorrect";
        return "disabled";
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom']}>
            <Stack.Screen options={{
                headerShown: false,
                title: getCategoryById(categoryId)?.name || 'Quiz'
            }} />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : questions.length === 0 ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4">
                        {mode === 'mistake_bank' ? "No mistakes to review!" : mode === 'bookmarks' ? "No saved questions!" : "No questions available yet."}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
                        {mode === 'mistake_bank' ? "Great job! You've cleared all your mistakes." : mode === 'bookmarks' ? "Bookmark questions to review them here." : "This category is coming soon!"}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-blue-600 py-4 px-8 rounded-[24px] active:scale-95 transition-all"
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 py-2">
                        <TouchableOpacity
                            onPress={handleQuit}
                            className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                        >
                            <X size={24} color={isDark ? "#94a3b8" : "#475569"} />
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-2">
                            <BookmarkButton
                                questionId={currentQuestion.id}
                                size={24}
                                color={isDark ? "#94a3b8" : "#475569"}
                            />
                        </View>
                    </View>

                    <View className="flex-1">
                        <ScrollView
                            className="flex-1 px-6"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 120 }}
                        >
                            {/* Progress Bar */}
                            <QuizProgress current={currentQuestionIndex + 1} total={totalQuestions} />

                            <Animated.View
                                key={currentQuestionIndex}
                                entering={FadeInDown.springify().damping(20).mass(0.8)}
                                exiting={FadeOut.duration(200)}
                            >
                                <Text className="text-[22px] font-bold text-slate-900 dark:text-white mb-8 leading-relaxed tracking-tight text-center">
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
                                    className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[24px] border border-blue-100 dark:border-blue-800"
                                >
                                    <View className="flex-row items-center mb-2">
                                        <Lightbulb size={20} color="#2563eb" className="mr-2" />
                                        <Text className="text-blue-800 dark:text-blue-300 font-bold">Explanation</Text>
                                    </View>
                                    <Text className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-base">
                                        {currentQuestion.explanation}
                                    </Text>
                                </Animated.View>
                            )}
                        </ScrollView>

                        {isAnswered && (
                            <View className="absolute bottom-6 left-6 right-6">
                                <TouchableOpacity
                                    onPress={handleNext}
                                    className="bg-blue-600 py-4 rounded-[32px] flex-row items-center justify-center shadow-lg shadow-blue-500/30 active:bg-blue-700 active:scale-95 transition-all"
                                >
                                    <Text className="text-white font-bold text-lg mr-2">
                                        {currentQuestionIndex < totalQuestions - 1
                                            ? "Next Question"
                                            : "See Results"}
                                    </Text>
                                    <MoveRight size={24} color="white" strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </>
            )}

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

            {/* No banner ad inside the quiz — AdMob policy prohibits ads
                 that could be accidentally tapped during active gameplay. */}
        </SafeAreaView >
    );
}
