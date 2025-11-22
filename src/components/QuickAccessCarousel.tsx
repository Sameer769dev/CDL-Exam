import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Category } from '../types/quiz';
import { Gauge, GraduationCap, Flame, Droplets, Layers, UsersRound, BusFront, Boxes, Bookmark } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface QuickAccessCarouselProps {
    categories: Category[];
}

export const QuickAccessCarousel: React.FC<QuickAccessCarouselProps> = ({ categories }) => {
    const router = useRouter();
    const { isDark } = useTheme();

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
                {categories.slice(0, 5).map((category, index) => (
                    <Animated.View
                        key={category.id}
                        entering={FadeInRight.delay(index * 100).springify()}
                        className="mr-4"
                    >
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: "/quiz",
                                params: { categoryId: category.id }
                            })}
                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl w-40 border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95"
                        >
                            <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 bg-${category.color}-50 dark:bg-${category.color}-900/20`}>
                                {getIcon(category.icon, category.color)}
                            </View>
                            <Text className="text-slate-900 dark:text-white font-semibold text-sm mb-1" numberOfLines={1}>
                                {category.name}
                            </Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-xs">
                                {category.totalQuestions} Questions
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};
