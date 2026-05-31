import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Share, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../src/context/ThemeContext";
import { CircularProgress } from "../src/components/CircularProgress";
import { useUser } from "../src/context/UserContext";
import { compareAttempt } from "../src/utils/progressComparison";
import { showInterstitialAd } from "../src/utils/ads";
import {
    Home,
    RotateCcw,
    CheckCircle,
    XCircle,
    Clock,
    Share2,
    ChevronRight,
    Trophy,
    TrendingUp,
    ShieldCheck
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { BannerAdComponent } from "../src/components/BannerAd";
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from "expo-store-review";
import { AnswerReviewList } from "../src/components/AnswerReviewList";

const { width } = Dimensions.get('window');

const StatBox = ({ icon: Icon, label, value, color, delay }: any) => {
    const { isDark } = useTheme();

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).springify()}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 min-w-[45%] mb-3"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className={`p-2.5 rounded-xl ${color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : color === 'gold' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <Icon size={20} color={color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : color === 'gold' ? '#f59e0b' : '#3b82f6'} strokeWidth={2.5} />
                </View>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                {label}
            </Text>
            <Text className="text-2xl font-black text-slate-900 dark:text-white">
                {value}
            </Text>
        </Animated.View>
    );
};

export default function ResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { isDark } = useTheme();
    const { highScores, studySessions } = useUser();
    const [isSharing, setIsSharing] = useState(false);

    // Params
    const score = Number(params.score) || 0;
    const total = Number(params.total) || 5;
    const categoryId = (params.categoryId as string) || 'general';
    const mode = (params.mode as string) || 'standard';
    const timeSpent = Number(params.timeSpent) || 0;
    // showAd is set by quiz/flashcards to trigger the interstitial here,
    // at the natural content break — NOT during active gameplay.
    const shouldShowAd = params.showAd === 'true';
    
    // Parse Review Data
    let reviewData = [];
    try {
        if (params.reviewData && typeof params.reviewData === 'string') {
            reviewData = JSON.parse(params.reviewData);
        }
    } catch (e) {
        console.error("Failed to parse review data", e);
    }

    // Computed
    const percentage = Math.round((score / total) * 100);
    const isPass = percentage >= 80;

    useEffect(() => {
        // Show interstitial ad at the natural break point (results screen).
        // Only fires once, and only when the quiz/flashcard screen requested it.
        if (shouldShowAd) {
            showInterstitialAd(false).catch(() => { /* non-critical */ });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isPass) {
            const requestReview = async () => {
                try {
                    if (await StoreReview.hasAction()) {
                        await StoreReview.requestReview();
                    }
                } catch (error) {
                    console.log('Error requesting review:', error);
                }
            };
            requestReview();
        }
    }, [isPass]);
    const wrong = total - score;

    // Format Time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    // Comparison Logic
    const comparison = categoryId ? compareAttempt(
        categoryId,
        score,
        total,
        studySessions,
        highScores
    ) : null;

    const improvement = comparison?.improvement || 0;

    // Handlers
    const handleRetake = () => {
        router.replace({
            pathname: "/quiz",
            params: { categoryId, mode }
        });
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            // Format category name
            const categoryName = categoryId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Create promotional message
            const shareMessage = `🎯 I scored ${score}/${total} (${percentage}%) on ${categoryName} in CDL Prep 2025!

${isPass ? '✅ PASSED! Ready for the real exam!' : '📚 Practicing to ace my CDL exam!'}

Prepare for your CDL exam with:
✅ 1000+ practice questions
✅ Realistic exam simulator
✅ Track your progress
✅ Study at your own pace
✅ All endorsements covered

Download CDL Prep 2025 now:
📱 Play Store: https://play.google.com/store/apps/details?id=com.protimeworld.cdl

#CDL #CDLPrep #TruckDriver #CDLExam #TruckingLife #CDL2025 #CommercialDriversLicense`;

            const result = await Share.share({
                message: shareMessage,
                title: `My CDL Prep Result: ${percentage}%`,
            });

            if (result.action === Share.sharedAction) {
                // Successfully shared
                console.log('Shared successfully');
            } else if (result.action === Share.dismissedAction) {
                // Share dismissed
                console.log('Share dismissed');
            }
        } catch (error: any) {
            console.error('Error sharing:', error);
            Alert.alert('Share Failed', 'Unable to share your results. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    const getFeedbackMessage = () => {
        if (percentage === 100) return { title: "Perfect Score!", subtitle: "You mastered this topic!", emoji: "🎯" };
        if (percentage >= 80) return { title: "Congratulations!", subtitle: "You passed accurately!", emoji: "🎉" };
        if (percentage >= 60) return { title: "Good Attempt!", subtitle: "Getting closer to passing.", emoji: "💪" };
        return { title: "Keep Practicing", subtitle: "Don't give up, try again!", emoji: "📚" };
    };

    const feedback = getFeedbackMessage();
    const primaryColor = isPass ? '#10b981' : '#f59e0b';
    const textColor = isDark ? '#ffffff' : '#0f172a';

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Header Actions */}
                <View className="flex-row justify-between px-6 py-4 z-10">
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                        }}
                    >
                        <Home size={20} color={isDark ? '#cbd5e1' : '#64748b'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={isSharing}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                            opacity: isSharing ? 0.6 : 1,
                        }}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color={isDark ? '#cbd5e1' : '#64748b'} />
                        ) : (
                            <Share2 size={20} color={isDark ? '#cbd5e1' : '#64748b'} />
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Score Section */}
                    <Animated.View entering={ZoomIn.duration(600).springify()} className="items-center mt-2 mb-6">
                        <View
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 items-center w-full"
                            style={{
                                shadowColor: isPass ? "#10b981" : "#f59e0b",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 24,
                                elevation: 8,
                            }}
                        >
                            <CircularProgress
                                percentage={percentage}
                                radius={110}
                                strokeWidth={16}
                                color={primaryColor}
                                textColor={textColor}
                                duration={1500}
                            />

                            <Animated.View entering={FadeInUp.delay(500)} className="items-center mt-6">
                                <Text className="text-5xl mb-2">{feedback.emoji}</Text>
                                <Text className="text-3xl font-black text-slate-900 dark:text-white text-center">
                                    {feedback.title}
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-center font-medium mt-2 text-base">
                                    {feedback.subtitle}
                                </Text>
                            </Animated.View>

                            {/* Improvement Badge */}
                            {improvement !== 0 && (
                                <Animated.View entering={FadeInUp.delay(700)} className="mt-5 flex-row items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                                    <TrendingUp size={16} color="#3b82f6" />
                                    <Text className="text-blue-600 dark:text-blue-400 text-sm font-bold ml-1.5">
                                        {improvement > 0 ? '+' : ''}{improvement}% from last time
                                    </Text>
                                </Animated.View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap justify-between mb-6">
                        <StatBox
                            icon={CheckCircle}
                            label="Correct"
                            value={`${score}/${total}`}
                            color="green"
                            delay={300}
                        />
                        <StatBox
                            icon={XCircle}
                            label="Incorrect"
                            value={wrong}
                            color="red"
                            delay={400}
                        />
                        <StatBox
                            icon={Clock}
                            label="Time"
                            value={formatTime(timeSpent)}
                            color="blue"
                            delay={500}
                        />
                        <StatBox
                            icon={Trophy}
                            label="Best Score"
                            value={`${highScores[categoryId]?.score || score}/${total}`}
                            color="gold"
                            delay={600}
                        />
                    </View>

                    {/* Review Section */}
                    {reviewData.length > 0 && (
                        <AnswerReviewList data={reviewData} />
                    )}

                    {/* Action Buttons */}
                    <View className="gap-3 mb-4 mt-6">
                        {/* ── Cross-Verify nudge ── */}
                        <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-1">
                            <View className="flex-row items-center mb-2">
                                <ShieldCheck size={18} color="#d97706" style={{ marginRight: 8 }} />
                                <Text className="text-amber-800 dark:text-amber-300 font-black text-sm">Before you book your DMV appointment</Text>
                            </View>
                            <Text className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed mb-3">
                                CDL knowledge tests are <Text className="font-black">non-refundable</Text>. Check your state’s handbook, fees, and your real pass probability — for free.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/cross-verify' as any)}
                                className="bg-amber-500 rounded-xl py-2.5 flex-row items-center justify-center active:opacity-80"
                            >
                                <ShieldCheck size={16} color="white" style={{ marginRight: 6 }} />
                                <Text className="text-white font-black text-sm">Cross-Verify My Readiness →</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={handleRetake}
                            activeOpacity={0.9}
                            className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${isPass ? 'bg-green-600' : 'bg-blue-600'}`}
                            style={{
                                shadowColor: isPass ? "#10b981" : "#3b82f6",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 6,
                            }}
                        >
                            <RotateCcw size={22} color="white" strokeWidth={2.5} />
                            <Text className="text-white font-bold text-lg ml-2">
                                {isPass ? 'Practice Again' : 'Try Again'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className="w-full py-4 rounded-2xl flex-row items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                        >
                            <Home size={22} color={isDark ? '#cbd5e1' : '#64748b'} />
                            <Text className="text-slate-700 dark:text-slate-300 font-bold text-lg ml-2">
                                Back to Home
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

                {/* Banner Ad - Fixed at bottom, less intrusive */}
                <View
                    className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 items-center py-2"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <BannerAdComponent />
                </View>
            </SafeAreaView>
        </View>
    );
}
