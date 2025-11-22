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
                        <Text className="text-2xl font-bold text-slate-900 mb-2">
                            {mode === 'flashcards' ? 'Select a Topic' : 'Study Categories'}
                        </Text>
                        <Text className="text-slate-500">
                            {mode === 'flashcards'
                                ? 'Choose a category to review flashcards'
                                : 'Select a category to start practicing'}
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    !isPremium ? (
                        <TouchableOpacity
                            onPress={() => router.push('/paywall')}
                            className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl mb-8"
                        >
                            <Text className="text-white font-bold text-xl mb-2">
                                Unlock All Categories
                            </Text>
                            <Text className="text-blue-100 mb-4">
                                Get unlimited access to all endorsements and study modes
                            </Text>
                            <View className="bg-white px-4 py-2 rounded-lg self-start">
                                <Text className="text-blue-600 font-bold">
                                    Upgrade to Pro →
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}
