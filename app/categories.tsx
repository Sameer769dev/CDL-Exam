import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { CategoryCard } from '../src/components/CategoryCard';
import { getCategories } from '../src/utils/dataLoader';
import { useUser } from '../src/context/UserContext';
import { Category } from '../src/types/quiz';

export default function CategoriesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const mode = (params.mode as string) || 'quiz';
    const { isPremium, unlockPremium, progress } = useUser();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        setCategories(getCategories());
    }, []);

    const handleCategoryPress = (category: Category) => {
        const isLocked = category.isPremium && !isPremium;
        const hasFreeAccess = (category.freeQuestionCount || 0) > 0;

        if (isLocked && !hasFreeAccess) {
            router.push('/paywall');
            return;
        }

        const targetRoute = mode === 'flashcards' ? '/flashcards' : '/quiz';

        router.push({
            pathname: targetRoute,
            params: { categoryId: category.id }
        });
    };

    const title = mode === 'flashcards' ? 'Flashcards' : 'Choose Category';

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title: title }} />

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const catProgress = progress[item.id]
                        ? (progress[item.id].questionsAttempted / item.totalQuestions) * 100
                        : 0;

                    return (
                        <CategoryCard
                            category={item}
                            progress={catProgress}
                            isLocked={item.isPremium && !isPremium}
                            onPress={() => handleCategoryPress(item)}
                        />
                    );
                }}
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                ListHeaderComponent={
                    <View className="mb-6">
                        {!isPremium && (
                            <TouchableOpacity
                                onPress={() => router.push('/paywall')}
                                className="mb-6 bg-slate-900 dark:bg-slate-800 p-5 rounded-2xl border border-yellow-500/30 shadow-sm overflow-hidden relative"
                            >
                                <View className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-white font-bold text-lg mb-1">
                                            Unlock All Endorsements
                                        </Text>
                                        <Text className="text-slate-400 text-xs leading-relaxed">
                                            Get unlimited access to Hazmat, Air Brakes, and all study modes.
                                        </Text>
                                    </View>
                                    <View className="bg-yellow-500 px-3 py-1.5 rounded-full">
                                        <Text className="text-slate-900 font-bold text-xs">
                                            UPGRADE
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}

                        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {mode === 'flashcards' ? 'Select a Topic' : 'Study Categories'}
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            {mode === 'flashcards'
                                ? 'Choose a category to review flashcards'
                                : 'Select a category to start practicing'}
                        </Text>
                    </View>
                }
                ListFooterComponent={<View className="h-20" />}
            />
        </SafeAreaView>
    );
}
