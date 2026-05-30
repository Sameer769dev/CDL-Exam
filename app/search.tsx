import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Search, ArrowLeft, X, BookOpen, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../src/context/ThemeContext';
import { getCategories, getQuestionsByCategory } from '../src/utils/dataLoader';
import { Question } from '../src/types/quiz';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function SearchScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [allQuestions, setAllQuestions] = useState<{question: Question, categoryId: string, categoryName: string}[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Load all questions from all categories on mount
        const loadAllQuestions = async () => {
            const categories = getCategories();
            let questions: {question: Question, categoryId: string, categoryName: string}[] = [];
            
            categories.forEach(category => {
                const categoryQuestions = getQuestionsByCategory(category.id);
                const mapped = categoryQuestions.map(q => ({
                    question: q,
                    categoryId: category.id,
                    categoryName: category.title
                }));
                questions = [...questions, ...mapped];
            });
            
            setAllQuestions(questions);
        };
        
        loadAllQuestions();
    }, []);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        
        const query = searchQuery.toLowerCase().trim();
        return allQuestions.filter(item => {
            return (
                item.question.question.toLowerCase().includes(query) ||
                item.question.explanation.toLowerCase().includes(query) ||
                item.question.id.toString() === query ||
                item.question.options.some(opt => opt.toLowerCase().includes(query))
            );
        }).slice(0, 50); // limit to 50 results for performance
    }, [searchQuery, allQuestions]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header & Search Bar */}
                <View className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-row items-center gap-3">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full"
                    >
                        <ArrowLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
                    </TouchableOpacity>
                    
                    <View className="flex-1 flex-row items-center bg-slate-100 dark:bg-slate-800 h-12 rounded-2xl px-4 border border-slate-200 dark:border-slate-700">
                        <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                        <TextInput
                            className="flex-1 ml-3 text-base text-slate-900 dark:text-white"
                            placeholder="Search questions, topics..."
                            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch} className="p-1">
                                <View className="bg-slate-300 dark:bg-slate-600 rounded-full p-1">
                                    <X size={12} color={isDark ? '#f8fafc' : '#0f172a'} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results List */}
                <ScrollView 
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingVertical: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {searchQuery.trim().length === 0 ? (
                        <Animated.View entering={FadeIn} className="flex-1 items-center justify-center mt-20 opacity-60">
                            <Search size={64} color={isDark ? '#334155' : '#cbd5e1'} />
                            <Text className="text-slate-500 dark:text-slate-400 mt-4 text-center font-medium">
                                Find questions across all CDL categories.{'\n'}Search by keyword, topic, or question ID.
                            </Text>
                        </Animated.View>
                    ) : searchResults.length === 0 ? (
                        <Animated.View entering={FadeIn} className="flex-1 items-center justify-center mt-20">
                            <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                                <AlertCircle size={32} color={isDark ? '#64748b' : '#94a3b8'} />
                            </View>
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">No results found</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-center">
                                Try adjusting your search keywords.
                            </Text>
                        </Animated.View>
                    ) : (
                        <View className="gap-4">
                            <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                            </Text>
                            
                            {searchResults.map((item, index) => (
                                <Animated.View 
                                    key={item.question.id}
                                    entering={FadeInDown.delay(Math.min(index * 50, 500)).springify().damping(20)}
                                >
                                    <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <View className="flex-row items-center mb-3">
                                            <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mr-2">
                                                <Text className="text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                                                    {item.categoryName}
                                                </Text>
                                            </View>
                                            <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                                                ID: {item.question.id}
                                            </Text>
                                        </View>
                                        
                                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                            {item.question.question}
                                        </Text>

                                        <View className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                            <View className="flex-row items-center mb-2">
                                                <View className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-2">
                                                    <BookOpen size={12} color="#10b981" />
                                                </View>
                                                <Text className="font-bold text-slate-700 dark:text-slate-300">Answer & Explanation</Text>
                                            </View>
                                            <Text className="text-green-700 dark:text-green-400 font-bold mb-2">
                                                {item.question.correct_answer}
                                            </Text>
                                            <Text className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                                {item.question.explanation}
                                            </Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
