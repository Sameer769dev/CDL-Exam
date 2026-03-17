import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Crown } from 'lucide-react-native';
import { CategoryCard } from '../src/components/CategoryCard';
import { getCategories } from '../src/utils/dataLoader';
import { useUser } from '../src/context/UserContext';
import { Category } from '../src/types/quiz';
import { useTheme } from '../src/context/ThemeContext';
import { CustomAlert } from '../src/components/CustomAlert';

export default function CategoriesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const mode = (params.mode as string) || 'quiz';
    const { isPremium, unlockPremium, progress, flashcardProgress } = useUser();
    const { isDark } = useTheme();
    const [categories, setCategories] = useState<Category[]>([]);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [selectedCategoryForPreview, setSelectedCategoryForPreview] = useState<Category | null>(null);

    useEffect(() => {
        setCategories(getCategories());
    }, []);

    const navigateToCategory = (category: Category) => {
        const targetRoute = mode === 'flashcards' ? '/flashcards' : '/quiz';
        router.push({
            pathname: targetRoute,
            params: { categoryId: category.id }
        });
    };

    const handleCategoryPress = (category: Category) => {
        const isLocked = category.isPremium && !isPremium;
        const hasFreeAccess = (category.freeQuestionCount || 0) > 0;

        if (isLocked) {
            if (!hasFreeAccess) {
                router.push('/paywall');
                return;
            }

            // Show Custom Free Preview Alert
            setSelectedCategoryForPreview(category);
            setAlertVisible(true);
            return;
        }

        navigateToCategory(category);
    };

    const handlePreviewStart = () => {
        setAlertVisible(false);
        if (selectedCategoryForPreview) {
            navigateToCategory(selectedCategoryForPreview);
            setSelectedCategoryForPreview(null);
        }
    };

    const handleUnlockFullAccess = () => {
        setAlertVisible(false);
        router.push('/paywall');
        setSelectedCategoryForPreview(null);
    };

    const title = mode === 'flashcards' ? 'Flashcards' : 'Choose Category';

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <ChevronLeft size={28} color={isDark ? "#fff" : "#1e293b"} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        {title}
                    </Text>
                    <View className="w-10" /> {/* Spacer for balance */}
                </View>

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        let catProgress = 0;

                        if (mode === 'flashcards') {
                            const stats = flashcardProgress[item.id];
                            if (stats) {
                                catProgress = (stats.cardsMastered / item.totalQuestions) * 100;
                            }
                        } else {
                            const stats = progress[item.id];
                            if (stats) {
                                catProgress = (stats.questionsAttempted / item.totalQuestions) * 100;
                            }
                        }

                        return (
                            <CategoryCard
                                category={item}
                                progress={catProgress}
                                isLocked={item.isPremium && !isPremium}
                                onPress={() => handleCategoryPress(item)}
                                mode={mode as 'quiz' | 'flashcards'}
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
                                    className="mb-8 bg-slate-900 dark:bg-slate-800 p-6 rounded-[32px] shadow-xl shadow-amber-500/10 active:scale-[0.98] overflow-hidden relative border border-slate-800 dark:border-slate-700"
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

                {/* Custom Alert for Free Preview */}
                <CustomAlert
                    visible={alertVisible}
                    title="Free Preview Mode"
                    message={`You are entering a limited preview of ${selectedCategoryForPreview?.name}.\n\nYou can access ${selectedCategoryForPreview?.freeQuestionCount} questions for free. Upgrade to Premium to unlock everything!`}
                    primaryButtonText="Unlock Full Access"
                    secondaryButtonText="Start Preview"
                    onPrimaryPress={handleUnlockFullAccess}
                    onSecondaryPress={handlePreviewStart}
                    type="default"
                />
            </SafeAreaView>
        </View>
    );
}
