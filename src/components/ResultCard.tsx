import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, XCircle, RotateCcw, Home, BookOpen, AlertTriangle, Trophy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { ComparisonDisplay } from './progress/ComparisonDisplay';
import { TimeDisplay } from './progress/TimeDisplay';
import { compareAttempt } from '../utils/progressComparison';
import { useUser } from '../context/UserContext';

interface ResultCardProps {
    score: number;
    total: number;
    onRetake: () => void;
    mode?: 'standard' | 'mistake_bank' | 'bookmarks' | 'exam';
    categoryId?: string;
    timeSpent?: number; // NEW - time spent in seconds
}

export const ResultCard: React.FC<ResultCardProps> = ({
    score,
    total,
    onRetake,
    mode = 'standard',
    categoryId,
    timeSpent // NEW
}) => {
    const router = useRouter();
    const { studySessions, highScores } = useUser(); // NEW
    const percentage = (score / total) * 100;
    const isPass = percentage >= 80;

    // Calculate comparison if categoryId is provided (NEW)
    const comparison = categoryId ? compareAttempt(
        categoryId,
        score,
        total,
        studySessions,
        highScores
    ) : null;

    // Get context-specific messages and actions
    const getContextualContent = () => {
        switch (mode) {
            case 'mistake_bank':
                return {
                    retryText: isPass ? "Review More Mistakes" : "Try Mistakes Again",
                    retryIcon: AlertTriangle,
                    secondaryAction: {
                        text: "Back to Categories",
                        icon: Home,
                        onPress: () => router.push('/study')
                    }
                };
            case 'bookmarks':
                return {
                    retryText: isPass ? "Review Bookmarks Again" : "Retry Bookmarks",
                    retryIcon: BookOpen,
                    secondaryAction: {
                        text: "Back to Bookmarks",
                        icon: Home,
                        onPress: () => router.push('/bookmarks')
                    }
                };
            case 'exam':
                return {
                    retryText: isPass ? "Take Another Exam" : "Retake Exam",
                    retryIcon: RotateCcw,
                    secondaryAction: {
                        text: "Back to Home",
                        icon: Home,
                        onPress: () => router.push('/')
                    }
                };
            default: // standard quiz
                return {
                    retryText: isPass ? "Practice More" : "Try Again",
                    retryIcon: RotateCcw,
                    secondaryAction: {
                        text: "Back to Home",
                        icon: Home,
                        onPress: () => router.push('/')
                    }
                };
        }
    };

    const content = getContextualContent();
    const RetryIcon = content.retryIcon;
    const SecondaryIcon = content.secondaryAction.icon;

    // Get motivational message based on performance
    const getMessage = () => {
        if (percentage === 100) return "Perfect Score! Outstanding! 🎯";
        if (percentage >= 90) return "Excellent work! You're crushing it! 🌟";
        if (percentage >= 80) return "Great job! You're ready! ✨";
        if (percentage >= 70) return "Almost there! Keep practicing! 💪";
        if (percentage >= 60) return "Good effort! Review and try again! 📚";
        return "Don't give up! Practice makes perfect! 🚀";
    };

    return (
        <Animated.View
            entering={ZoomIn.springify().damping(15)}
            className="w-full"
        >
            {isPass ? (
                // PASS SCREEN - Premium Design
                <LinearGradient
                    colors={['#10b981', '#059669', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-8 rounded-3xl shadow-2xl items-center"
                    style={{
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 12
                    }}
                >
                    <Animated.View entering={ZoomIn.delay(200).springify()}>
                        <View className="bg-white/20 p-4 rounded-full mb-4">
                            {percentage === 100 ? (
                                <Trophy size={64} color="#ffffff" strokeWidth={2} />
                            ) : (
                                <CheckCircle size={64} color="#ffffff" strokeWidth={2} />
                            )}
                        </View>
                    </Animated.View>

                    <Animated.Text
                        entering={FadeInUp.delay(300)}
                        className="text-4xl font-black text-white mb-2"
                    >
                        {percentage === 100 ? "Perfect!" : "Passed!"}
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeInUp.delay(400)}
                        className="text-white/90 text-center mb-6 text-base px-4"
                    >
                        {getMessage()}
                    </Animated.Text>

                    <Animated.View
                        entering={FadeInUp.delay(500)}
                        className="w-full bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-6 items-center border border-white/30"
                    >
                        <Text className="text-white/80 text-xs uppercase font-bold tracking-wider mb-2">
                            Your Score
                        </Text>
                        <Text className="text-6xl font-black text-white">
                            {Math.round(percentage)}%
                        </Text>
                        <Text className="text-white/80 mt-2 font-semibold text-base">
                            {score} out of {total} correct
                        </Text>
                    </Animated.View>

                    {/* Comparison Display - NEW */}
                    {comparison && (
                        <Animated.View entering={FadeInUp.delay(550)} className="w-full mb-4">
                            <ComparisonDisplay comparison={comparison} showDetails variant="light" />
                        </Animated.View>
                    )}

                    {/* Time Spent - NEW */}
                    {timeSpent && timeSpent > 0 && (
                        <Animated.View entering={FadeInUp.delay(575)} className="w-full mb-4">
                            <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <TimeDisplay
                                    seconds={timeSpent}
                                    label="Time Spent"
                                    size="small"
                                    compact
                                    variant="light"
                                />
                            </View>
                        </Animated.View>
                    )}

                    <Animated.View entering={FadeInDown.delay(600)} className="w-full gap-3">
                        <TouchableOpacity
                            onPress={onRetake}
                            className="flex-row items-center justify-center bg-white py-4 px-6 rounded-full active:opacity-80 shadow-sm"
                        >
                            <RetryIcon size={20} color="#059669" />
                            <Text className="text-green-700 font-bold text-base ml-2">{content.retryText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={content.secondaryAction.onPress}
                            className="flex-row items-center justify-center bg-white/20 border border-white/40 py-4 px-6 rounded-full active:opacity-80"
                        >
                            <SecondaryIcon size={18} color="#ffffff" />
                            <Text className="text-white font-semibold text-sm ml-2">{content.secondaryAction.text}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </LinearGradient>
            ) : (
                // FAIL SCREEN - Improved Design
                <View className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-lg border border-slate-200 dark:border-slate-700 items-center">
                    <Animated.View entering={ZoomIn.delay(200).springify()}>
                        <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                            <XCircle size={64} color="#dc2626" strokeWidth={2} />
                        </View>
                    </Animated.View>

                    <Animated.Text
                        entering={FadeInUp.delay(300)}
                        className="text-3xl font-black text-slate-900 dark:text-white mb-2"
                    >
                        Keep Trying!
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeInUp.delay(400)}
                        className="text-slate-600 dark:text-slate-300 text-center mb-6 text-base px-4 font-medium"
                    >
                        {getMessage()}
                    </Animated.Text>

                    <Animated.View
                        entering={FadeInUp.delay(500)}
                        className="w-full bg-slate-50 dark:bg-slate-700/50 rounded-[24px] p-6 mb-6 items-center border border-slate-100 dark:border-slate-600"
                    >
                        <Text className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
                            Your Score
                        </Text>
                        <Text className="text-5xl font-black text-slate-900 dark:text-white">
                            {Math.round(percentage)}%
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-300 mt-2 font-medium">
                            {score} out of {total} correct
                        </Text>
                        <View className="mt-4 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-900/30">
                            <Text className="text-amber-700 dark:text-amber-400 font-bold text-sm">
                                Need 80% to pass
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Comparison Display - NEW */}
                    {comparison && (
                        <Animated.View entering={FadeInUp.delay(550)} className="w-full mb-4">
                            <ComparisonDisplay comparison={comparison} showDetails />
                        </Animated.View>
                    )}

                    {/* Time Spent - NEW */}
                    {timeSpent && timeSpent > 0 && (
                        <Animated.View entering={FadeInUp.delay(575)} className="w-full mb-4">
                            <View className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-600">
                                <TimeDisplay
                                    seconds={timeSpent}
                                    label="Time Spent"
                                    size="small"
                                    compact
                                />
                            </View>
                        </Animated.View>
                    )}

                    <Animated.View entering={FadeInDown.delay(600)} className="w-full gap-3">
                        <TouchableOpacity
                            onPress={onRetake}
                            className="flex-row items-center justify-center bg-blue-600 py-4 px-6 rounded-full active:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none"
                        >
                            <RetryIcon size={20} color="white" />
                            <Text className="text-white font-bold text-base ml-2">{content.retryText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={content.secondaryAction.onPress}
                            className="flex-row items-center justify-center bg-slate-100 dark:bg-slate-700 py-4 px-6 rounded-full active:opacity-80"
                        >
                            <SecondaryIcon size={18} color="#64748b" />
                            <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm ml-2">{content.secondaryAction.text}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </Animated.View>
    );
};
