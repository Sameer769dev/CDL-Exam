import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, ArrowRight, ChevronLeft, Trash2, Lock, PlayCircle, Zap, AlertOctagon } from 'lucide-react-native';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';
import { getCategoryById } from '../src/utils/dataLoader';
import { showRewardedAd } from '../src/utils/ads';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CustomAlert } from '../src/components/CustomAlert';

const { width } = Dimensions.get('window');

export default function MistakeBankScreen() {
    const router = useRouter();
    const { mistakeBank, isPremium } = useUser();
    const { isDark } = useTheme();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoadingAd, setIsLoadingAd] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        primaryButtonText: '',
        onPrimaryPress: () => { },
        type: 'default' as 'default' | 'danger' | 'success'
    });

    // Filter categories that have mistakes
    const categoriesWithMistakes = Object.keys(mistakeBank).filter(
        catId => mistakeBank[catId] && mistakeBank[catId].length > 0
    );

    const totalMistakes = categoriesWithMistakes.reduce(
        (acc, catId) => acc + (mistakeBank[catId]?.length || 0),
        0
    );

    const handleReview = (categoryId: string) => {
        router.push({
            pathname: '/quiz',
            params: {
                categoryId,
                mode: 'mistake_bank'
            }
        });
    };

    const handleWatchAd = async () => {
        setIsLoadingAd(true);
        try {
            const rewarded = await showRewardedAd();

            if (rewarded) {
                setIsUnlocked(true);
            } else {
                // Ad failed to load or show
                setAlertConfig({
                    title: 'Ad Unavailable',
                    message: 'We couldn\'t load an ad at this time. Please try again later.',
                    primaryButtonText: 'OK',
                    onPrimaryPress: () => setAlertVisible(false),
                    type: 'default'
                });
                setAlertVisible(true);
            }
        } catch (error) {
            console.error('Ad error:', error);
            setAlertConfig({
                title: 'Error',
                message: 'Something went wrong while loading the ad. Please check your connection.',
                primaryButtonText: 'OK',
                onPrimaryPress: () => setAlertVisible(false),
                type: 'danger'
            });
            setAlertVisible(true);
        } finally {
            setIsLoadingAd(false);
        }
    };

    const isLocked = !isPremium && !isUnlocked;

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 active:bg-slate-100 dark:active:bg-slate-700"
                    >
                        <ChevronLeft size={24} color={isDark ? "#fff" : "#1e293b"} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        Mistake Bank
                    </Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <View className="px-6 pt-2 pb-6">
                        {/* Hero Section */}
                        <Animated.View
                            entering={FadeInDown.delay(100).springify()}
                            className="mb-8"
                        >
                            <View className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-[24px] border border-amber-100 dark:border-amber-800/30 flex-row items-start">
                                <View className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl mr-4">
                                    <AlertTriangle size={24} color="#d97706" strokeWidth={2.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        Review Mistakes
                                    </Text>
                                    <Text className="text-slate-600 dark:text-slate-400 leading-snug">
                                        You have <Text className="font-bold text-amber-600 dark:text-amber-500">{totalMistakes}</Text> questions to review. Focus on these to improve your score.
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>

                        {isLocked ? (
                            <Animated.View
                                entering={FadeInUp.delay(200).springify()}
                                className="items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 px-6"
                            >
                                <View className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-[24px] items-center justify-center mb-6">
                                    <Lock size={40} color={isDark ? "#94a3b8" : "#64748b"} strokeWidth={2} />
                                </View>
                                <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
                                    Premium Feature
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-center text-base leading-relaxed mb-8 px-4">
                                    Upgrade to Premium to review your mistakes and master your weak points.
                                </Text>

                                <TouchableOpacity
                                    onPress={() => router.push('/paywall')}
                                    className="bg-amber-400 w-full py-4 rounded-full active:scale-95 transition-all mb-3 flex-row items-center justify-center shadow-lg shadow-amber-400/20"
                                >
                                    <Zap size={20} color="white" fill="white" className="mr-2" />
                                    <Text className="text-white font-bold text-lg">Unlock Premium</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleWatchAd}
                                    disabled={isLoadingAd}
                                    className="bg-slate-900 dark:bg-slate-700 w-full py-4 rounded-full active:scale-95 transition-all flex-row items-center justify-center"
                                >
                                    {isLoadingAd ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <PlayCircle size={20} color="white" className="mr-2" />
                                            <Text className="text-white font-bold text-lg">Watch Ad to</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ) : categoriesWithMistakes.length === 0 ? (
                            <Animated.View
                                entering={FadeInUp.delay(200).springify()}
                                className="items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 px-6"
                            >
                                <View className="bg-green-100 dark:bg-green-900/30 p-8 rounded-full mb-6">
                                    <CheckCircle2 size={64} color="#16a34a" strokeWidth={2} />
                                </View>
                                <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                                    Clean Record!
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-center text-lg leading-relaxed mb-8">
                                    You don't have any saved mistakes to review. Keep up the great work!
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    className="bg-slate-900 dark:bg-slate-700 py-4 px-10 rounded-2xl active:scale-95 transition-all shadow-lg shadow-slate-900/20"
                                >
                                    <Text className="text-white font-bold text-lg">Go Back</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            <View className="space-y-4">
                                {categoriesWithMistakes.map((catId, index) => {
                                    const category = getCategoryById(catId);
                                    const count = mistakeBank[catId].length;

                                    if (!category) return null;

                                    return (
                                        <Animated.View
                                            key={catId}
                                            entering={FadeInDown.delay(200 + index * 50).springify()}
                                        >
                                            <TouchableOpacity
                                                onPress={() => handleReview(catId)}
                                                className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 flex-row items-center justify-between shadow-sm active:scale-[0.98] transition-all"
                                            >
                                                <View className="flex-row items-center flex-1">
                                                    <View
                                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm"
                                                        style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
                                                    >
                                                        <View
                                                            className="w-8 h-8 rounded-full items-center justify-center opacity-20"
                                                            style={{ backgroundColor: category.color }}
                                                        >
                                                            <View
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: category.color, opacity: 1 }}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View className="flex-1 mr-4">
                                                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                            {category.name}
                                                        </Text>
                                                        <View className="flex-row items-center">
                                                            <View className="bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg self-start border border-red-100 dark:border-red-800/30">
                                                                <Text className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wide">
                                                                    {count} {count === 1 ? 'Mistake' : 'Mistakes'}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-full">
                                                    <ArrowRight size={20} color={isDark ? "#94a3b8" : "#64748b"} strokeWidth={2.5} />
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                primaryButtonText={alertConfig.primaryButtonText}
                onPrimaryPress={alertConfig.onPrimaryPress}
                type={alertConfig.type}
            />
        </View>
    );
}
