import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Category } from '../types/quiz';
import { Gauge, GraduationCap, Flame, Droplets, Layers, UsersRound, BusFront, Boxes, Bookmark, Lock } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { isCategoryAvailable } from '../utils/dataLoader';

interface QuickAccessCarouselProps {
    categories: Category[];
}

export const QuickAccessCarousel: React.FC<QuickAccessCarouselProps> = ({ categories }) => {
    const router = useRouter();
    const { isDark } = useTheme();
    const { isPremium } = useUser();

    const getIcon = (iconName: string, color: string) => {
        const iconColor = isDark ? "#94a3b8" : "#475569";
        switch (iconName) {
            case 'gauge': return <Gauge size={20} color={iconColor} />;
            case 'graduation-cap': return <GraduationCap size={20} color={iconColor} />;
            case 'flame': return <Flame size={20} color={iconColor} />;
            case 'droplets': return <Droplets size={20} color={iconColor} />;
            case 'layers': return <Layers size={20} color={iconColor} />;
            case 'users-round': return <UsersRound size={20} color={iconColor} />;
            case 'bus-front': return <BusFront size={20} color={iconColor} />;
            case 'boxes': return <Boxes size={20} color={iconColor} />;
            default: return <Bookmark size={20} color={iconColor} />;
        }
    };

    return (
        <View>
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">
                Recent Categories
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                className="-mx-6 px-6"
            >
                {categories.slice(0, 5).map((category, index) => {
                    const isLocked = !isCategoryAvailable(category, isPremium, []);

                    return (
                        <Animated.View
                            key={category.id}
                            entering={FadeInUp.delay(index * 100).springify()}
                            className="mr-4"
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    if (isLocked) {
                                        router.push('/paywall');
                                    } else {
                                        router.push({
                                            pathname: "/quiz",
                                            params: { categoryId: category.id }
                                        });
                                    }
                                }}
                                activeOpacity={0.8}
                                className={`bg-white dark:bg-slate-800 p-4 rounded-3xl w-48 border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95 transition-transform ${isLocked ? 'opacity-90' : ''}`}
                            >
                                <View className="flex-row items-start justify-between mb-3">
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center bg-${category.color}-50 dark:bg-${category.color}-900/20`}>
                                        {getIcon(category.icon, category.color)}
                                    </View>
                                    {isLocked ? (
                                        <View className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-lg flex-row items-center">
                                            <Lock size={12} color={isDark ? '#fbbf24' : '#d97706'} strokeWidth={2.5} />
                                        </View>
                                    ) : (
                                        <View className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {category.totalQuestions} Qs
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text className="text-slate-900 dark:text-white font-bold text-base mb-1 leading-tight" numberOfLines={2}>
                                    {category.name}
                                </Text>
                                <Text className={`text-xs font-medium ${isLocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isLocked ? 'Premium Only' : 'Tap to practice'}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </ScrollView>
        </View>
    );
};
