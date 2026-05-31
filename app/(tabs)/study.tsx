import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    Target,
    Flame,
    TrendingUp,
    AlertOctagon,
    ChevronRight,
    Layers,
    LayoutGrid,
    BrainCircuit,
    Crown,
    ShieldCheck
} from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useUser } from '../../src/context/UserContext';
import { getCategories } from '../../src/utils/dataLoader';
import { Category } from '../../src/types/quiz';

export default function StudyScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { progress, isPremium, studySessions, studyStreak } = useUser();
    const [categories, setCategories] = useState<Category[]>([]);
    const [lastStudied, setLastStudied] = useState<Category | null>(null);

    useEffect(() => {
        const cats = getCategories();
        setCategories(cats);

        // Find last studied category (one with most recent progress)
        const studiedCats = cats.filter(cat => progress[cat.id]?.questionsAttempted > 0);
        if (studiedCats.length > 0) {
            setLastStudied(studiedCats[0]);
        }
    }, [progress]);

    // Calculate daily stats
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = studySessions.filter(s => s.date.startsWith(today));

    const totalQuestionsAttempted = todaySessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
    const totalCorrect = todaySessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
    const accuracy = totalQuestionsAttempted > 0
        ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
        : 0;

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 140 }}
                >
                    {/* Header */}
                    <View className="px-6 pt-6 pb-4">
                        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                            Study
                        </Text>
                        <Text className="text-base text-slate-600 dark:text-slate-300">
                            Track your progress and continue learning
                        </Text>
                    </View>

                    {/* Continue Studying Card */}
                    {lastStudied && (
                        <View className="px-6 mb-8">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Continue Studying
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/quiz',
                                    params: { categoryId: lastStudied.id }
                                })}
                                className="bg-blue-600 p-6 rounded-[32px] shadow-xl shadow-blue-500/30 active:scale-[0.98] overflow-hidden relative"
                            >
                                {/* Background Decorative Elements */}
                                <View className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full -mr-16 -mt-16" />
                                <View className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full -ml-10 -mb-10" />

                                <View className="flex-row items-start justify-between mb-6">
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center mb-3">
                                            <View className="bg-white/20 p-2 rounded-xl mr-3 backdrop-blur-sm">
                                                <BrainCircuit size={20} color="#fff" strokeWidth={3} />
                                            </View>
                                            <Text className="text-blue-100 font-bold text-xs uppercase tracking-wider">
                                                In Progress
                                            </Text>
                                        </View>
                                        <Text className="text-white font-black text-2xl leading-tight mb-1">
                                            {lastStudied.name}
                                        </Text>
                                        <Text className="text-blue-100 text-sm font-medium opacity-90">
                                            {progress[lastStudied.id]?.questionsAttempted || 0} of {lastStudied.totalQuestions} Questions
                                        </Text>
                                    </View>

                                    <View className="bg-white/20 p-3 rounded-full">
                                        <ChevronRight size={24} color="#fff" strokeWidth={3} />
                                    </View>
                                </View>

                                {/* Enhanced Progress Bar */}
                                <View>
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-white font-bold text-xs">Progress</Text>
                                        <Text className="text-white font-bold text-xs">
                                            {Math.round(((progress[lastStudied.id]?.questionsAttempted || 0) / lastStudied.totalQuestions) * 100)}%
                                        </Text>
                                    </View>
                                    <View className="bg-black/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                                        <View
                                            className="h-full bg-white rounded-full shadow-sm"
                                            style={{
                                                width: `${((progress[lastStudied.id]?.questionsAttempted || 0) / lastStudied.totalQuestions) * 100}%`
                                            }}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Stats Grid */}
                    <View className="px-6 mb-8">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Today's Progress
                        </Text>
                        <View className="flex-row gap-4">
                            {/* Questions Answered */}
                            <View className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm">
                                <View className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                                    <Target size={24} color="#3b82f6" strokeWidth={2.5} />
                                </View>
                                <Text className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                    {totalQuestionsAttempted}
                                </Text>
                                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Questions
                                </Text>
                            </View>

                            {/* Accuracy */}
                            <View className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm">
                                <View className="bg-green-50 dark:bg-green-900/20 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                                    <TrendingUp size={24} color="#16a34a" strokeWidth={2.5} />
                                </View>
                                <Text className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                    {accuracy}%
                                </Text>
                                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Accuracy
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Study Streak */}
                    <View className="px-6 mb-8">
                        <TouchableOpacity
                            className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 flex-row items-center justify-between active:scale-[0.98] shadow-sm"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="bg-orange-50 dark:bg-orange-900/20 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                                    <Flame size={28} color="#f97316" strokeWidth={2.5} fill="#f97316" fillOpacity={0.2} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xl font-black text-slate-900 dark:text-white mb-1">
                                        {studyStreak?.currentStreak || 0} Day Streak
                                    </Text>
                                    <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-tight">
                                        You're on fire! 🔥 Keep studying to maintain it.
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Actions */}
                    <View className="px-6 mb-8">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Quick Actions
                        </Text>

                        {/* All Categories */}
                        <TouchableOpacity
                            onPress={() => router.push('/categories')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 flex-row items-center justify-between active:scale-[0.98]"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                    <LayoutGrid size={22} color="#3b82f6" strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                                        Browse Categories
                                    </Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {categories.length} topics available
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#cbd5e1'} strokeWidth={2.5} />
                        </TouchableOpacity>

                        {/* Flashcards */}
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/categories', params: { mode: 'flashcards' } })}
                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 flex-row items-center justify-between active:scale-[0.98]"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-purple-50 dark:bg-purple-900/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                    <Layers size={22} color="#9333ea" strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                                        Study Flashcards
                                    </Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        Quick concept review
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#cbd5e1'} strokeWidth={2.5} />
                        </TouchableOpacity>

                        {/* Mistakes */}
                        <TouchableOpacity
                            onPress={() => router.push('/mistake-bank')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 flex-row items-center justify-between active:scale-[0.98]"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-red-50 dark:bg-red-900/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                    <AlertOctagon size={22} color="#dc2626" strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                                        Mistake Bank
                                    </Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        Master your weak points
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#cbd5e1'} strokeWidth={2.5} />
                        </TouchableOpacity>

                        {/* Cross-Verify Readiness */}
                        <TouchableOpacity
                            onPress={() => router.push('/cross-verify' as any)}
                            className="bg-red-600 p-4 rounded-2xl flex-row items-center justify-between active:opacity-90"
                            style={{ shadowColor: '#dc2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 }}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center mr-4 border border-white/20">
                                    <ShieldCheck size={22} color="white" strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-white">
                                        Verify DMV Readiness
                                    </Text>
                                    <Text className="text-sm text-red-200 font-medium">
                                        Check fees & official handbook
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    {/* Premium Upsell (if not premium) */}
                    {!isPremium && (
                        <View className="px-6 mb-10">
                            <TouchableOpacity
                                onPress={() => router.push('/paywall')}
                                className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[32px] shadow-xl shadow-amber-500/10 active:scale-[0.98] overflow-hidden relative border border-slate-800 dark:border-slate-700"
                            >
                                {/* Golden Glow Effect */}
                                <View className="absolute top-0 right-0 w-full h-full bg-amber-500/5" />
                                <View className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full" />

                                <View className="flex-row items-center justify-between relative z-10">
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center mb-3">
                                            <View className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                                                <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                                                    Premium Access
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-white font-black text-2xl mb-2">
                                            Unlock Everything
                                        </Text>
                                        <Text className="text-slate-400 text-sm font-medium leading-relaxed">
                                            Get unlimited access to all categories, exam simulator, and ad-free experience.
                                        </Text>
                                    </View>

                                    <View className="bg-amber-500 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-amber-500/40">
                                        <Crown size={28} color="#fff" fill="#fff" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>


        </View>
    );
}
