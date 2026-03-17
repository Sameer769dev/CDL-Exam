import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Bookmark, Trash2, Play, ArrowRight } from 'lucide-react-native';
import { useUser } from '../src/context/UserContext';
import { getAllQuestions, getCategoryById } from '../src/utils/dataLoader';
import { Question } from '../src/types/quiz';
import { useTheme } from '../src/context/ThemeContext';
import { BottomNav } from '../src/components/BottomNav';

export default function BookmarksScreen() {
    const router = useRouter();
    const { bookmarks, toggleBookmark } = useUser();
    const { isDark } = useTheme();
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);

    useEffect(() => {
        loadBookmarkedQuestions();
    }, [bookmarks]);

    const loadBookmarkedQuestions = () => {
        const allQuestions = getAllQuestions();
        const filtered = allQuestions.filter(q => bookmarks.includes(q.id));
        setBookmarkedQuestions(filtered);
    };

    const handleRemoveBookmark = async (id: number) => {
        await toggleBookmark(id);
    };

    const handleStartQuiz = () => {
        if (bookmarkedQuestions.length === 0) return;

        router.push({
            pathname: "/quiz",
            params: {
                mode: 'bookmarks',
                categoryId: 'all'
            }
        });
    };

    const renderItem = ({ item }: { item: Question }) => {
        const category = getCategoryById(item.categoryId);

        return (
            <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm border border-slate-100 dark:border-slate-700">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                            <View className={`w-2 h-2 rounded-full mr-2 bg-${category?.color || 'slate'}-500`} />
                            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {category?.name || 'Unknown Category'}
                            </Text>
                        </View>
                        <Text className="text-slate-800 dark:text-slate-200 font-medium leading-snug" numberOfLines={3}>
                            {item.question}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleRemoveBookmark(item.id)}
                        className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full"
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                    Saved Questions
                </Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                    Review your bookmarked questions
                </Text>
            </View>

            <View className="flex-1 p-6 pb-24">
                {bookmarkedQuestions.length > 0 ? (
                    <>
                        <View className="bg-blue-600 dark:bg-blue-700 p-6 rounded-2xl mb-6 shadow-lg shadow-blue-200 dark:shadow-none">
                            <View className="flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="text-blue-100 font-medium mb-1">Total Saved</Text>
                                    <Text className="text-3xl font-bold text-white">
                                        {bookmarkedQuestions.length}
                                    </Text>
                                </View>
                                <View className="bg-blue-500 p-3 rounded-xl">
                                    <Bookmark size={32} color="white" fill="white" />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleStartQuiz}
                                className="bg-white py-3 px-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Play size={20} color="#2563eb" fill="#2563eb" className="mr-2" />
                                <Text className="text-blue-700 font-bold">Practice All Saved Questions</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            Your List
                        </Text>

                        <FlatList
                            data={bookmarkedQuestions}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <View className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
                            <Bookmark size={48} color={isDark ? "#64748b" : "#94a3b8"} />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No Saved Questions
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center px-8 leading-relaxed">
                            Tap the bookmark icon while taking a quiz to save questions for later review.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/categories')}
                            className="mt-8 bg-slate-900 dark:bg-slate-700 py-3 px-6 rounded-xl"
                        >
                            <Text className="text-white font-bold">Start Studying</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <BottomNav />
        </SafeAreaView>
    );
}
