import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Bookmark, Trash2, Play, ArrowRight } from 'lucide-react-native';
import { useUser } from '../../src/context/UserContext';
import { getAllQuestions, getCategoryById } from '../../src/utils/dataLoader';
import { Question } from '../../src/types/quiz';
import { useTheme } from '../../src/context/ThemeContext';

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
            <View className="bg-white dark:bg-slate-800 p-5 rounded-[24px] mb-3 shadow-sm border border-slate-100 dark:border-slate-700">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                            <View className={`w-2 h-2 rounded-full mr-2 bg-${category?.color || 'slate'}-500`} />
                            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {category?.name || 'Unknown Category'}
                            </Text>
                        </View>
                        <Text className="text-slate-800 dark:text-slate-200 font-medium leading-snug text-base" numberOfLines={3}>
                            {item.question}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleRemoveBookmark(item.id)}
                        className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                        Saved Questions
                    </Text>
                    <Text className="text-base text-slate-600 dark:text-slate-300">
                        Review your bookmarked questions
                    </Text>
                </View>

                <View className="flex-1 px-6 pb-0">
                    {bookmarkedQuestions.length > 0 ? (
                        <>
                            <View className="bg-blue-600 dark:bg-blue-700 p-6 rounded-[32px] mb-8 shadow-xl shadow-blue-500/30 overflow-hidden relative">
                                {/* Decorative Elements */}
                                <View className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full -mr-16 -mt-16" />
                                <View className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full -ml-10 -mb-10" />

                                <View className="flex-row justify-between items-center mb-6 relative z-10">
                                    <View>
                                        <Text className="text-blue-100 font-bold text-sm uppercase tracking-wider mb-1">Total Saved</Text>
                                        <Text className="text-5xl font-black text-white">
                                            {bookmarkedQuestions.length}
                                        </Text>
                                    </View>
                                    <View className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                        <Bookmark size={32} color="white" fill="white" />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleStartQuiz}
                                    className="bg-white py-4 px-6 rounded-full flex-row items-center justify-center shadow-sm active:scale-[0.98]"
                                >
                                    <Play size={20} color="#2563eb" fill="#2563eb" className="mr-2" />
                                    <Text className="text-blue-700 font-bold text-lg">Practice All Saved</Text>
                                </TouchableOpacity>
                            </View>

                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">
                                Your List
                            </Text>

                            <FlatList
                                data={bookmarkedQuestions}
                                renderItem={renderItem}
                                keyExtractor={item => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            />
                        </>
                    ) : (
                        <View className="flex-1 items-center justify-center pb-20">
                            <View className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6 shadow-sm">
                                <Bookmark size={64} color={isDark ? "#64748b" : "#94a3b8"} strokeWidth={1.5} />
                            </View>
                            <Text className="text-2xl font-black text-slate-900 dark:text-white mb-3 text-center">
                                No Saved Questions
                            </Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-center px-8 leading-relaxed text-base mb-8">
                                Tap the bookmark icon while taking a quiz to save questions for later review.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/categories')}
                                className="bg-slate-900 dark:bg-slate-700 py-4 px-8 rounded-full shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.95]"
                            >
                                <Text className="text-white font-bold text-lg">Start Studying</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
