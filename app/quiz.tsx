import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { MoveRight, Lightbulb, X, Clock, Sparkles } from "lucide-react-native";
import Animated, {
    FadeInDown,
    FadeOut,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { QuizProgress } from "../src/components/QuizProgress";
import { OptionButton } from "../src/components/OptionButton";
import { BookmarkButton } from "../src/components/BookmarkButton";
import { MasteryBadge } from "../src/components/MasteryBadge";
import { AITutorModal } from "../src/components/AITutorModal";
import {
    getQuestionsByCategory,
    getQuestionsByIds,
    getAllQuestions,
    getCategoryById,
    getAccessibleQuestionCount,
    shuffleAllOptions,
} from "../src/utils/dataLoader";
import { fetchDynamicQuestions } from "../src/utils/aiClient";
import { getCachedDynamicQuestions, saveDynamicQuestions } from "../src/utils/aiCache";
import { Question } from "../src/types/quiz";
import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";
import { CustomAlert } from "../src/components/CustomAlert";

// Seconds allowed per question in timed mode
const TIMED_MODE_SECONDS = 30;

export default function QuizScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const categoryId = (params.categoryId as string) || 'air_brakes';
    const mode = (params.mode as string) || 'standard';
    // timed mode is standard + per-question countdown
    const isTimedMode = mode === 'timed';

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
        getSmartQuestions,
        questionMastery,
        updateQuestionMastery
    } = useUser();

    const { isDark } = useTheme();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [sessionAnswers, setSessionAnswers] = useState<Record<number | string, boolean>>({});
    // Track user's chosen answer text per question id (for review screen)
    const [userAnswerMap, setUserAnswerMap] = useState<Record<number | string, string>>({});
    const startTimeRef = useRef<number>(Date.now());
    
    // AI Tutor Modal
    const [tutorVisible, setTutorVisible] = useState(false);

    // Image Zoom Modal
    const [zoomVisible, setZoomVisible] = useState(false);

    // Timed mode state
    const [timeLeft, setTimeLeft] = useState(TIMED_MODE_SECONDS);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerProgress = useSharedValue(1); // 1 = full, 0 = empty

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
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
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
                stopTimer();
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

    // ─── Timer helpers ─────────────────────────────────────────────────────────
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        if (!isTimedMode) return;
        stopTimer();
        setTimeLeft(TIMED_MODE_SECONDS);
        timerProgress.value = withTiming(0, {
            duration: TIMED_MODE_SECONDS * 1000,
            easing: Easing.linear,
        });
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    // Time up — auto-mark as wrong
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [isTimedMode, stopTimer]);

    // Cleanup timer on unmount
    useEffect(() => () => stopTimer(), []);

    const handleTimeUp = useCallback(() => {
        // Same flow as selecting a wrong answer
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
        setIsAnswered(true);
        setSelectedOption(null); // null = time expired
    }, []);

    const timerBarStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%`,
    }));

    // ─── Load questions ────────────────────────────────────────────────────────
    const loadQuestions = async () => {
        let data: Question[] = [];
        const effectiveMode = isTimedMode ? 'standard' : mode;

        if (effectiveMode === 'mistake_bank') {
            const mistakeIds = mistakeBank[categoryId] || [];
            data = getQuestionsByIds(categoryId, mistakeIds);
            data = data.sort(() => Math.random() - 0.5);
        } else if (effectiveMode === 'bookmarks') {
            if (categoryId === 'all') {
                const allQuestions = getAllQuestions();
                data = allQuestions.filter(q => (bookmarks as (number | string)[]).includes(q.id));
            } else {
                data = getQuestionsByIds(categoryId, bookmarks as (number | string)[]);
            }
            data = data.sort(() => Math.random() - 0.5);
        } else if (effectiveMode === 'ai_endless') {
            setAiGenerating(true);
            try {
                // Try cache first
                let aiQuestions = await getCachedDynamicQuestions(categoryId, 10);
                if (aiQuestions.length < 5) {
                    // Fetch new from API if cache is low
                    const fetched = await fetchDynamicQuestions(categoryId, 10);
                    await saveDynamicQuestions(fetched);
                    aiQuestions = [...aiQuestions, ...fetched].slice(0, 10);
                }
                data = aiQuestions;
            } catch (error) {
                console.error("AI Generation failed, falling back to standard questions", error);
                const allCategoryQuestions = getQuestionsByCategory(categoryId);
                data = await getSmartQuestions(categoryId, allCategoryQuestions, 10);
            } finally {
                setAiGenerating(false);
            }
        } else {
            const allCategoryQuestions = getQuestionsByCategory(categoryId);
            const category = getCategoryById(categoryId);
            if (category) {
                const accessibleCount = getAccessibleQuestionCount(category, isPremium);
                const accessibleQuestions = allCategoryQuestions.slice(0, accessibleCount);
                const smartQuestions = await getSmartQuestions(categoryId, accessibleQuestions, 10);
                data = smartQuestions;
            } else {
                const smartQuestions = await getSmartQuestions(categoryId, allCategoryQuestions, 10);
                data = smartQuestions;
            }
        }

        // ✅ SHUFFLE OPTIONS — correct answer matched by string value, not index
        data = shuffleAllOptions(data);

        // Check for active session resume
        const isStandardQuiz = (mode === 'standard' || isTimedMode) && activeSession?.mode === 'quiz';
        const isMistakeBank = mode === 'mistake_bank' && activeSession?.mode === 'mistake_bank';

        if (activeSession && activeSession.categoryId === categoryId && (isStandardQuiz || isMistakeBank)) {
            setAlertConfig({
                title: "Resume Session?",
                message: mode === 'mistake_bank'
                    ? "You have an unfinished mistake review. Would you like to continue?"
                    : "You have an unfinished quiz. Would you like to continue where you left off?",
                primaryButtonText: "Resume",
                secondaryButtonText: "Start Over",
                onPrimaryPress: async () => {
                    setAlertVisible(false);
                    const allQuestions = getAllQuestions();
                    const sessionQuestions = shuffleAllOptions(
                        allQuestions.filter(q => activeSession.questionIds.includes(q.id))
                    );
                    sessionQuestions.sort((a, b) => {
                        return activeSession.questionIds.indexOf(a.id) - activeSession.questionIds.indexOf(b.id);
                    });
                    setQuestions(sessionQuestions);
                    setCurrentQuestionIndex(activeSession.currentIndex);
                    setSessionAnswers(activeSession.answers);
                    const currentScore = Object.values(activeSession.answers).filter(v => v).length;
                    setScore(currentScore);
                    setLoading(false);
                    if (isTimedMode) startTimer();
                },
                onSecondaryPress: async () => {
                    setAlertVisible(false);
                    await finishActiveSession();
                    setQuestions(data);
                    setLoading(false);
                    if (isTimedMode) startTimer();
                },
                type: 'default'
            });
            setAlertVisible(true);
            return;
        }

        setQuestions(data);
        setLoading(false);
        if (isTimedMode) startTimer();
    };

    if (aiGenerating && loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
                    The AI Instructor is writing your unique questions...
                </Text>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // ─── Answer selection ──────────────────────────────────────────────────────
    const handleOptionSelect = useCallback((option: string) => {
        if (isAnswered) return;
        stopTimer();

        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = option === currentQuestion.correct_answer;
        if (isCorrect) {
            setScore(prev => prev + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
        }

        const newAnswers = { ...sessionAnswers, [currentQuestion.id]: isCorrect };
        setSessionAnswers(newAnswers);
        setUserAnswerMap(prev => ({ ...prev, [currentQuestion.id]: option }));

        setTimeout(() => {
            Promise.all([
                isCorrect && mode === 'mistake_bank'
                    ? removeFromMistakeBank(categoryId, currentQuestion.id)
                    : !isCorrect
                        ? addToMistakeBank(categoryId, currentQuestion.id)
                        : Promise.resolve(),
                (mode === 'standard' || isTimedMode)
                    ? updateProgress(categoryId, currentQuestionIndex + 1, isCorrect ? score + 1 : score)
                    : Promise.resolve(),
                (mode === 'standard' || isTimedMode)
                    ? syncActiveSession({
                        categoryId,
                        mode: 'quiz',
                        questionIds: questions.map(q => q.id),
                        currentIndex: currentQuestionIndex,
                        answers: newAnswers,
                        startTime: startTimeRef.current,
                        lastUpdated: new Date().toISOString()
                    })
                    : Promise.resolve(),
                updateQuestionMastery(currentQuestion.id, isCorrect)
            ]).catch(error => console.error('Background save error:', error));
        }, 0);
    }, [isAnswered, currentQuestion, mode, isTimedMode, categoryId, currentQuestionIndex, score, stopTimer]);

    // ─── Navigate to next question ─────────────────────────────────────────────
    const handleNext = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setSelectedOption(null);
            setIsAnswered(false);

            if (mode === 'standard' || isTimedMode) {
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
            // Restart per-question timer
            if (isTimedMode) startTimer();
        } else {
            stopTimer();
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

            // Build review payload — compact JSON of each question's data
            const reviewData = questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                imageUrl: q.imageUrl,
                userAnswer: userAnswerMap[q.id] || null,
            }));

            router.replace({
                pathname: "/results",
                params: {
                    score: score,
                    total: totalQuestions,
                    categoryId: categoryId,
                    mode: mode,
                    timeSpent: timeSpent.toString(),
                    showAd: isPremium ? 'false' : 'true',
                    reviewData: JSON.stringify(reviewData),
                },
            });

            Promise.all([
                trackSession({
                    categoryId: categoryId,
                    questionsAttempted: totalQuestions,
                    questionsCorrect: score,
                    timeSpent: timeSpent,
                    mode: mode === 'mistake_bank' ? 'mistake_bank' : 'quiz'
                }),
                (mode === 'standard' || isTimedMode)
                    ? saveScore(categoryId, score, totalQuestions)
                    : Promise.resolve(),
                (mode === 'standard' || isTimedMode)
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

    // ─── Render ────────────────────────────────────────────────────────────────
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
                        className="bg-blue-600 py-4 px-8 rounded-[24px]"
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

                        {/* Timed mode: live countdown badge */}
                        {isTimedMode && (
                            <View className={`flex-row items-center px-3 py-1.5 rounded-full ${timeLeft <= 10 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                <Clock size={14} color={timeLeft <= 10 ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b')} />
                                <Text className={`ml-1.5 font-bold text-sm tabular-nums ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {timeLeft}s
                                </Text>
                            </View>
                        )}

                        <View className="flex-row items-center gap-2">
                            <BookmarkButton
                                questionId={currentQuestion.id}
                                size={24}
                                color={isDark ? "#94a3b8" : "#475569"}
                            />
                        </View>
                    </View>

                    {/* Timed mode progress bar */}
                    {isTimedMode && (
                        <View className="h-1.5 bg-slate-200 dark:bg-slate-800 mx-6 rounded-full overflow-hidden mb-1">
                            <Animated.View
                                style={[timerBarStyle, { height: '100%', borderRadius: 9999 }]}
                                className={timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'}
                            />
                        </View>
                    )}

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
                                <View className="flex-row items-center justify-center mb-3">
                                    {isTimedMode && (
                                        <View className="bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full mr-2">
                                            <Text className="text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider">
                                                ⚡ Timed Mode
                                            </Text>
                                        </View>
                                    )}
                                    <MasteryBadge level={(questionMastery as any)[currentQuestion.id]?.difficulty || 'new'} />
                                </View>

                                <Text className="text-[22px] font-bold text-slate-900 dark:text-white mb-6 leading-relaxed tracking-tight text-center">
                                    {currentQuestion.question}
                                </Text>

                                {currentQuestion.imageUrl ? (
                                    <TouchableOpacity 
                                        activeOpacity={0.8}
                                        onPress={() => setZoomVisible(true)}
                                        className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <Image
                                            source={{ uri: currentQuestion.imageUrl }}
                                            className="w-full h-48"
                                            resizeMode="contain"
                                        />
                                        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md">
                                            <Text className="text-white text-xs font-bold">Tap to Zoom</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : null}

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

                                {/* Time expired — show correct answer immediately */}
                                {isAnswered && selectedOption === null && (
                                    <Animated.View
                                        entering={FadeIn.duration(300)}
                                        className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800 mb-4"
                                    >
                                        <Text className="text-red-700 dark:text-red-300 font-bold text-sm">
                                            ⏱ Time's up! The correct answer is shown in green.
                                        </Text>
                                    </Animated.View>
                                )}
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
                                    <Text className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-base mb-4">
                                        {currentQuestion.explanation}
                                    </Text>
                                    
                                    {/* Show AI Tutor button if they got it wrong */}
                                    {selectedOption !== currentQuestion.correct_answer && (
                                        <TouchableOpacity 
                                            onPress={() => setTutorVisible(true)}
                                            className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-blue-200 dark:border-blue-900 flex-row items-center justify-center mt-2"
                                        >
                                            <Sparkles size={16} color="#0d9488" className="mr-2" />
                                            <Text className="text-teal-700 dark:text-teal-400 font-bold">
                                                Ask AI Instructor why
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </Animated.View>
                            )}
                        </ScrollView>

                        {isAnswered && (
                            <View className="absolute bottom-6 left-6 right-6">
                                <TouchableOpacity
                                    onPress={handleNext}
                                    className="bg-blue-600 py-4 rounded-[32px] flex-row items-center justify-center shadow-lg shadow-blue-500/30 active:bg-blue-700"
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

            {isAnswered && (
                <AITutorModal 
                    visible={tutorVisible}
                    onClose={() => setTutorVisible(false)}
                    questionText={currentQuestion.question}
                    userAnswer={selectedOption || "Time Expired"}
                    correctAnswer={currentQuestion.correct_answer}
                />
            )}

            {/* Image Zoom Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={zoomVisible}
                onRequestClose={() => setZoomVisible(false)}
            >
                <View className="flex-1 bg-black/90 justify-center items-center p-4">
                    <TouchableOpacity 
                        className="absolute top-12 right-6 z-10 p-2 bg-white/20 rounded-full"
                        onPress={() => setZoomVisible(false)}
                    >
                        <X size={24} color="white" />
                    </TouchableOpacity>
                    {currentQuestion?.imageUrl && (
                        <Image
                            source={{ uri: currentQuestion.imageUrl }}
                            className="w-full h-[70%]"
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
