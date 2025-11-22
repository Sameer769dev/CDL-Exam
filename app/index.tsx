import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { Truck, Sparkles, AlertOctagon, Award, Activity, Bookmark, Settings, GraduationCap, Gauge, Flame, Droplets, Layers, UsersRound, BusFront, Boxes, ChevronRight } from "lucide-react-native";
import { useTheme } from "../src/context/ThemeContext";
import { AnimatedCard } from "../src/components/AnimatedCard";
import { getCategories } from "../src/utils/dataLoader";
import BannerAdComponent from "../src/components/BannerAd";

export default function LandingPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const categories = getCategories();

    const getIcon = (iconName: string, color: string) => {
        const iconColor = isDark ? "#94a3b8" : "#475569";
        switch (iconName) {
            case 'gauge': return <Gauge size={24} color={iconColor} strokeWidth={1.5} />;
            case 'graduation-cap': return <GraduationCap size={24} color={iconColor} strokeWidth={1.5} />;
            case 'flame': return <Flame size={24} color={iconColor} strokeWidth={1.5} />;
            case 'droplets': return <Droplets size={24} color={iconColor} strokeWidth={1.5} />;
            case 'layers': return <Layers size={24} color={iconColor} strokeWidth={1.5} />;
            case 'users-round': return <UsersRound size={24} color={iconColor} strokeWidth={1.5} />;
            case 'bus-front': return <BusFront size={24} color={iconColor} strokeWidth={1.5} />;
            case 'boxes': return <Boxes size={24} color={iconColor} strokeWidth={1.5} />;
            default: return <Bookmark size={24} color={iconColor} strokeWidth={1.5} />;
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
            <View className="items-center justify-center p-6 pb-20">
                <Stack.Screen options={{ headerShown: false }} />

                <View className="absolute top-12 right-6 z-10">
                    <Link href="/settings" asChild>
                        <TouchableOpacity className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm active:opacity-80">
                            <Settings size={22} color={isDark ? "#94a3b8" : "#475569"} strokeWidth={2} />
                        </TouchableOpacity>
                    </Link>
                </View>

                <View className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl mb-6 mt-12 shadow-sm">
                    <Truck size={48} color="#2563eb" strokeWidth={1.5} />
                </View>

                <Text className="text-5xl font-black text-slate-900 dark:text-white mb-3 text-center tracking-tight">
                    CDL Hazmat & Brakes 2025
                </Text>

                <Text className="text-lg font-normal text-slate-500 dark:text-slate-400 text-center mb-10 px-4 leading-relaxed">
                    Master the hardest parts of your CDL exam. Ace Hazmat and Air Brakes with confidence.
                </Text>

                <View className="w-full max-w-sm">
                    <Link href={{ pathname: "/categories", params: { mode: 'quiz' } }} asChild>
                        <TouchableOpacity className="bg-blue-600 w-full p-4 rounded-2xl flex-row items-center justify-center shadow-md shadow-blue-200 dark:shadow-none mb-3 active:bg-blue-700">
                            <Sparkles size={20} color="white" strokeWidth={2} className="mr-2" />
                            <Text className="text-white text-lg font-semibold">Start Practice Quiz</Text>
                        </TouchableOpacity>
                    </Link>

                    <Link href={{ pathname: "/categories", params: { mode: 'flashcards' } }} asChild>
                        <TouchableOpacity className="bg-indigo-600 w-full p-4 rounded-2xl flex-row items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none mb-3 active:bg-indigo-700">
                            <Layers size={20} color="white" strokeWidth={2} className="mr-2" />
                            <Text className="text-white text-lg font-semibold">Flashcards</Text>
                        </TouchableOpacity>
                    </Link>

                    <View className="flex-row space-x-3 mb-3">
                        <Link href="/mistake-bank" asChild>
                            <TouchableOpacity className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl flex-row items-center justify-center shadow-sm active:bg-slate-50 dark:active:bg-slate-700">
                                <AlertOctagon size={20} color={isDark ? "#ef4444" : "#dc2626"} strokeWidth={2} className="mr-2" />
                                <Text className="text-slate-700 dark:text-slate-200 text-base font-semibold">Mistakes</Text>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/stats" asChild>
                            <TouchableOpacity className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl flex-row items-center justify-center shadow-sm active:bg-slate-50 dark:active:bg-slate-700">
                                <Activity size={20} color={isDark ? "#60a5fa" : "#2563eb"} strokeWidth={2} className="mr-2" />
                                <Text className="text-slate-700 dark:text-slate-200 text-base font-semibold">Stats</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <Link href="/exam-intro" asChild>
                        <TouchableOpacity className="bg-slate-900 dark:bg-slate-700 py-4 px-8 rounded-2xl flex-row items-center justify-center shadow-md shadow-slate-200 dark:shadow-none active:bg-slate-800 dark:active:bg-slate-600 w-full mb-8">
                            <Award size={20} color="white" className="mr-2" strokeWidth={2} />
                            <Text className="text-white font-semibold text-lg">Exam Simulator</Text>
                        </TouchableOpacity>
                    </Link>

                    <View className="pb-4">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-1 tracking-tight">
                            Quick Access
                        </Text>
                        {categories.slice(0, 3).map((category, index) => (
                            <AnimatedCard key={category.id} index={index}>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/quiz",
                                        params: { categoryId: category.id }
                                    })}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 shadow-sm flex-row items-center active:opacity-70"
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 bg-${category.color}-50 dark:bg-${category.color}-900/20`}>
                                        {getIcon(category.icon, category.color)}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                                            {category.name}
                                        </Text>
                                        <Text className="text-slate-500 dark:text-slate-400 text-xs">
                                            {category.totalQuestions} Questions
                                        </Text>
                                    </View>
                                    <ChevronRight size={18} color={isDark ? "#94a3b8" : "#cbd5e1"} />
                                </TouchableOpacity>
                            </AnimatedCard>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.youtube.com/results?search_query=CDL+Air+Brake+Test+Check')}
                        className="mt-4 flex-row items-center justify-center py-2"
                    >
                        <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">Watch Video Guide: Air Brake Test</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Banner Ad - Shows only for free users */}
            <BannerAdComponent position="bottom" />
        </ScrollView>
    );
}
