import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useUser } from '../src/context/UserContext';
import { getCategoryById } from '../src/utils/dataLoader';

export default function MistakeBankScreen() {
    const router = useRouter();
    const { mistakeBank } = useUser();

    // Filter categories that have mistakes
    const categoriesWithMistakes = Object.keys(mistakeBank).filter(
        catId => mistakeBank[catId] && mistakeBank[catId].length > 0
    );

    const handleReview = (categoryId: string) => {
        router.push({
            pathname: '/quiz',
            params: {
                categoryId,
                mode: 'mistake_bank'
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title: 'Mistake Bank' }} />

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center mb-6">
                    <View className="bg-amber-100 p-3 rounded-full mr-4">
                        <AlertTriangle size={32} color="#d97706" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-slate-900">
                            Review Mistakes
                        </Text>
                        <Text className="text-slate-500">
                            Focus on questions you missed
                        </Text>
                    </View>
                </View>

                {categoriesWithMistakes.length === 0 ? (
                    <View className="items-center justify-center py-12 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <View className="bg-green-100 p-6 rounded-full mb-6">
                            <CheckCircle2 size={48} color="#16a34a" />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-2">
                            Clean Record!
                        </Text>
                        <Text className="text-slate-500 text-center px-8 mb-8">
                            You don't have any saved mistakes to review. Keep up the great work!
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-slate-900 py-4 px-8 rounded-xl"
                        >
                            <Text className="text-white font-bold">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {categoriesWithMistakes.map(catId => {
                            const category = getCategoryById(catId);
                            const count = mistakeBank[catId].length;

                            if (!category) return null;

                            return (
                                <TouchableOpacity
                                    key={catId}
                                    onPress={() => handleReview(catId)}
                                    className="bg-white p-5 rounded-2xl mb-4 border-2 border-slate-100 flex-row items-center justify-between active:bg-slate-50"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                            style={{ backgroundColor: `${category.color}20` }}
                                        >
                                            <View
                                                className="w-5 h-5 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-lg font-bold text-slate-900">
                                                {category.name}
                                            </Text>
                                            <Text className="text-amber-600 font-medium">
                                                {count} {count === 1 ? 'mistake' : 'mistakes'} to review
                                            </Text>
                                        </View>
                                    </View>
                                    <ArrowRight size={24} color="#cbd5e1" />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
