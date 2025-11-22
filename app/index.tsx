import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActionGrid } from '../src/components/ActionGrid';
import { QuickAccessCarousel } from '../src/components/QuickAccessCarousel';
import { BottomNav } from '../src/components/BottomNav';
import BannerAdComponent from '../src/components/BannerAd';
import { useTheme } from '../src/context/ThemeContext';
import { getCategories } from '../src/utils/dataLoader';
import { Category } from '../src/types/quiz';

export default function HomeScreen() {
    const { isDark } = useTheme();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        setCategories(getCategories());
    }, []);

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {/* Header */}
                    <View className="px-6 py-4">
                        <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back,</Text>
                        <Text className="text-slate-900 dark:text-white text-2xl font-bold">Driver</Text>
                    </View>

                    {/* Main Content */}
                    <View className="pb-24">
                        {/* Action Grid */}
                        <View className="mb-8 px-6">
                            <ActionGrid />
                        </View>

                        {/* Quick Access */}
                        <View className="mb-8">
                            <QuickAccessCarousel categories={categories} />
                        </View>

                        {/* Banner Ad */}
                        <View className="mt-4 items-center">
                            <BannerAdComponent position="bottom" />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Floating Bottom Nav */}
            <BottomNav />
        </View>
    );
}
