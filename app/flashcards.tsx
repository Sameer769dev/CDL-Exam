import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { X, RotateCcw, Check, X as XIcon, Bookmark } from "lucide-react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
    withTiming
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from 'expo-haptics';
import { getQuestionsByCategory, getCategoryById } from "../src/utils/dataLoader";
import { Question } from "../src/types/quiz";
import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";
// Interstitial ad is shown from results.tsx at the natural content break.
import { CustomAlert } from "../src/components/CustomAlert";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function FlashcardsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const categoryId = (params.categoryId as string) || 'air_brakes';

    const {
        updateFlashcardProgress,
        isPremium,
        toggleBookmark,
        isBookmarked,
        trackSession,
        activeSession,
        syncActiveSession,
        finishActiveSession,
        getSmartQuestions
    } = useUser();

    const { isDark } = useTheme();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [masteredCount, setMasteredCount] = useState(0);
    const [studyAgainCount, setStudyAgainCount] = useState(0);
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
            title: "Quit Session?",
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

    // Animation values
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const cardOpacity = useSharedValue(1);
    const flipRotation = useSharedValue(0);

    useEffect(() => {
        loadQuestions();
    }, [categoryId]);

    const loadQuestions = async () => {
        const allCategoryQuestions = getQuestionsByCategory(categoryId);
        let data: Question[] = [];

        // Check for active session resume
        if (activeSession && activeSession.categoryId === categoryId && activeSession.mode === 'flashcards') {
            // Ask user if they want to resume
            // Ask user if they want to resume
            // Ask user if they want to resume
            setAlertConfig({
                title: "Welcome Back!",
                message: "You have an unfinished session. Would you like to pick up where you left off?",
                primaryButtonText: "Resume Session",
                secondaryButtonText: "Start Fresh",
                onPrimaryPress: async () => {
                    setAlertVisible(false);
                    const count = isPremium ? 20 : 10;
                    const smartQuestions = await getSmartQuestions(categoryId, allCategoryQuestions, count);
                    setQuestions(smartQuestions);
                    setCurrentIndex(activeSession.currentIndex);
                    setSessionAnswers(activeSession.answers);

                    // Calculate stats
                    const mastered = Object.values(activeSession.answers).filter(v => v).length;
                    const studyAgain = Object.values(activeSession.answers).filter(v => !v).length;
                    setMasteredCount(mastered);
                    setStudyAgainCount(studyAgain);

                    setLoading(false);
                },
                onSecondaryPress: async () => {
                    setAlertVisible(false);
                    await finishActiveSession(); // Clear old session
                    const count = isPremium ? 20 : 10;
                    const smartQuestions = await getSmartQuestions(categoryId, allCategoryQuestions, count);
                    setQuestions(smartQuestions);
                    setLoading(false);
                },
                type: 'default'
            });
            setAlertVisible(true);
            return;
        }

        // New Session
        const count = isPremium ? 20 : 10;
        const smartQuestions = await getSmartQuestions(categoryId, allCategoryQuestions, count);
        data = smartQuestions;

        setQuestions(data);
        setLoading(false);
    };

    const currentQuestion = questions[currentIndex];
    const isFinished = currentIndex >= questions.length;

    const handleFlip = () => {
        Haptics.selectionAsync();
        setIsFlipped(!isFlipped);
        flipRotation.value = withSpring(isFlipped ? 0 : 180, { damping: 12, stiffness: 90 });
    };

    const handleSwipe = async (direction: 'left' | 'right' | 'middle') => {
        const isRight = direction === 'right' || direction === 'middle'; // Both count as 'correct' for now in stats, but could be separated later
        const newMasteredCount = isRight ? masteredCount + 1 : masteredCount;

        // Update stats
        if (direction === 'right') {
            setMasteredCount(prev => prev + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (direction === 'middle') {
            setMasteredCount(prev => prev + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // or warning
        } else {
            setStudyAgainCount(prev => prev + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        // Update Session State
        const newAnswers = { ...sessionAnswers, [currentQuestion.id]: isRight };
        setSessionAnswers(newAnswers);

        // Sync Active Session & Update Progress Incrementally
        await Promise.all([
            syncActiveSession({
                categoryId,
                mode: 'flashcards',
                questionIds: questions.map(q => q.id),
                currentIndex: currentIndex + 1,
                answers: newAnswers,
                startTime: startTimeRef.current,
                lastUpdated: new Date().toISOString()
            }),
            updateFlashcardProgress(categoryId, currentIndex + 1, newMasteredCount)
        ]);

        // Animate out
        const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : (direction === 'left' ? -SCREEN_WIDTH * 1.5 : 0);
        const targetY = direction === 'middle' ? SCREEN_WIDTH * 1.5 : 0;
        
        translateX.value = withTiming(targetX, { duration: 300 });
        // We can just fade out or translate down for middle
        cardOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(nextCard)();
        });
    };

    const nextCard = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
            flipRotation.value = 0;
            translateX.value = 0;
            rotate.value = 0;
            cardOpacity.value = 1;
        } else {
            // Session Finished
            finishSession();
        }
    };

    const finishSession = async () => {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Save Progress
        await Promise.all([
            trackSession({
                categoryId,
                questionsAttempted: questions.length,
                questionsCorrect: masteredCount,
                timeSpent,
                mode: 'flashcards'
            }),
            updateFlashcardProgress(categoryId, questions.length, masteredCount),
            finishActiveSession()
        ]);

        // Navigate first, then let results.tsx show the interstitial at
        // the natural content break — NOT blocking the transition here.
        router.replace({
            pathname: "/results",
            params: {
                score: masteredCount,
                total: questions.length,
                categoryId: categoryId,
                mode: 'flashcards',
                timeSpent: timeSpent.toString(),
                showAd: isPremium ? 'false' : 'true',
            },
        });
    };

    // Gesture Handler
    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = e.translationX;
            rotate.value = interpolate(
                e.translationX,
                [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                [-10, 0, 10],
                Extrapolate.CLAMP
            );
        })
        .onEnd((e) => {
            if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
                const direction = e.translationX > 0 ? 'right' : 'left';
                runOnJS(handleSwipe)(direction);
            } else {
                translateX.value = withSpring(0);
                rotate.value = withSpring(0);
            }
        });

    // Animated Styles
    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ],
    }));

    const frontStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${interpolate(flipRotation.value, [0, 180], [0, 180])}deg` }],
        opacity: interpolate(flipRotation.value, [85, 95], [1, 0]) * cardOpacity.value,
        zIndex: flipRotation.value < 90 ? 1 : 0,
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${interpolate(flipRotation.value, [0, 180], [180, 360])}deg` }],
        opacity: interpolate(flipRotation.value, [85, 95], [0, 1]) * cardOpacity.value,
        zIndex: flipRotation.value < 90 ? 0 : 1,
    }));

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#3b82f6" />
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

    if (isFinished) {
        return null; // Will redirect in nextCard
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
            <Stack.Screen options={{
                headerShown: false,
                title: getCategoryById(categoryId)?.name || 'Flashcards'
            }} />

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <TouchableOpacity
                    onPress={handleQuit}
                    className="p-2 -ml-2 rounded-full active:bg-slate-200 dark:active:bg-slate-800"
                >
                    <X size={24} color={isDark ? "#94a3b8" : "#475569"} />
                </TouchableOpacity>
                <Text className="text-slate-500 dark:text-slate-400 font-medium">
                    {currentIndex + 1} / {questions.length}
                </Text>
                <TouchableOpacity
                    onPress={() => toggleBookmark(currentQuestion.id)}
                    className="p-2 -mr-2 rounded-full active:bg-slate-200 dark:active:bg-slate-800"
                >
                    <Bookmark
                        size={24}
                        color={isBookmarked(currentQuestion.id) ? "#3b82f6" : (isDark ? "#94a3b8" : "#475569")}
                        fill={isBookmarked(currentQuestion.id) ? "#3b82f6" : "none"}
                    />
                </TouchableOpacity>
            </View>

            {/* Card Area */}
            <View className="flex-1 items-center justify-center px-4">
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[cardStyle, { width: SCREEN_WIDTH - 48, height: 400 }]}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={handleFlip}
                            className="w-full h-full"
                        >
                            {/* Front Side */}
                            <Animated.View
                                style={[frontStyle, { position: 'absolute', width: '100%', height: '100%' }]}
                                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 items-center justify-center border border-slate-200 dark:border-slate-700"
                            >
                                <Text className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-4">
                                    {currentQuestion.question}
                                </Text>
                                <Text className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-4">
                                    Tap to flip
                                </Text>
                            </Animated.View>

                            {/* Back Side */}
                            <Animated.View
                                style={[backStyle, { position: 'absolute', width: '100%', height: '100%' }]}
                                className="bg-blue-50 dark:bg-slate-800 rounded-3xl shadow-xl p-6 items-center justify-center border border-blue-100 dark:border-slate-700"
                            >
                                <Text className="text-lg font-bold text-center text-slate-800 dark:text-white mb-6">
                                    {currentQuestion.question}
                                </Text>
                                
                                <View className="w-full space-y-2 mb-4">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isCorrect = option === currentQuestion.correct_answer;
                                        return (
                                            <View key={idx} className={`p-3 rounded-xl border ${isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700' : 'bg-white border-slate-200 dark:bg-slate-700 dark:border-slate-600'}`}>
                                                <Text className={`font-medium ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {option}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                
                                <Text className="text-slate-600 dark:text-slate-300 text-center leading-relaxed text-sm">
                                    {currentQuestion.explanation}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </Animated.View>
                </GestureDetector>
            </View>

            {/* Controls */}
            <View className="px-6 pb-8 pt-4 flex-row justify-between items-center">
                <View className="items-center">
                    <TouchableOpacity
                        onPress={() => handleSwipe('left')}
                        className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center border border-red-200 dark:border-red-800 active:scale-95 transition-all mb-2"
                    >
                        <XIcon size={32} color="#ef4444" />
                    </TouchableOpacity>
                    <Text className="text-xs font-bold text-red-500 uppercase">Need Practice</Text>
                </View>

                <View className="items-center">
                    <TouchableOpacity
                        onPress={() => handleSwipe('middle')}
                        className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center border border-amber-200 dark:border-amber-800 active:scale-95 transition-all mb-2"
                    >
                        <RotateCcw size={28} color="#f59e0b" />
                    </TouchableOpacity>
                    <Text className="text-xs font-bold text-amber-500 uppercase">Almost</Text>
                </View>

                <View className="items-center">
                    <TouchableOpacity
                        onPress={() => handleSwipe('right')}
                        className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center border border-green-200 dark:border-green-800 active:scale-95 transition-all mb-2"
                    >
                        <Check size={32} color="#22c55e" />
                    </TouchableOpacity>
                    <Text className="text-xs font-bold text-green-500 uppercase">Got It</Text>
                </View>
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
