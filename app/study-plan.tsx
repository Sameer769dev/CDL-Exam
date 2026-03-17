import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CheckCircle, Circle, ChevronLeft, ChevronRight, BookOpen, BrainCircuit, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';
import { generateStudyPlan, StudyPlanDay, DailyTask } from '../src/utils/studyPlan';

export default function StudyPlanScreen() {
    const router = useRouter();
    const { userProfile, isPremium } = useUser();
    const { isDark } = useTheme();
    const [plan, setPlan] = useState<StudyPlanDay[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (userProfile?.examDate) {
            const generatedPlan = generateStudyPlan(userProfile.examDate);
            setPlan(generatedPlan);
        }
    }, [userProfile?.examDate]);

    const selectedDayPlan = useMemo(() => {
        return plan.find(day => day.date === selectedDate);
    }, [plan, selectedDate]);

    const handleTaskPress = (task: DailyTask) => {
        if (task.type === 'quiz') {
            router.push({
                pathname: '/quiz',
                params: { categoryId: task.categoryId }
            });
        } else if (task.type === 'flashcards') {
            router.push({
                pathname: '/flashcards',
                params: { categoryId: task.categoryId }
            });
        } else if (task.type === 'review') {
            router.push('/mistake-bank');
        }
    };

    const renderCalendarItem = ({ item, index }: { item: StudyPlanDay, index: number }) => {
        const date = new Date(item.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = date.getDate();
        const isSelected = item.date === selectedDate;
        const isToday = item.date === new Date().toISOString().split('T')[0];

        return (
            <TouchableOpacity
                onPress={() => setSelectedDate(item.date)}
                className={`items-center justify-center w-14 h-20 mr-3 rounded-2xl border ${isSelected
                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30'
                    : isToday
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                    }`}
            >
                <Text className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {dayName}
                </Text>
                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {dayNumber}
                </Text>
                {isToday && !isSelected && (
                    <View className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
                )}
            </TouchableOpacity>
        );
    };

    const renderTaskItem = ({ item, index }: { item: DailyTask, index: number }) => {
        const Icon = item.type === 'quiz' ? BrainCircuit : item.type === 'flashcards' ? BookOpen : AlertTriangle;
        const color = item.type === 'quiz' ? '#3b82f6' : item.type === 'flashcards' ? '#8b5cf6' : '#ef4444';

        return (
            <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
                <TouchableOpacity
                    onPress={() => handleTaskPress(item)}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700 flex-row items-center shadow-sm"
                >
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
                        <Icon size={24} color={color} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {item.title}
                        </Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400">
                            {item.description}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <Text className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                {item.estimatedTime} min
                            </Text>
                        </View>
                    </View>
                    <View className="ml-2">
                        <Circle size={24} color={isDark ? '#475569' : '#cbd5e1'} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <ChevronLeft size={28} color={isDark ? "#fff" : "#1e293b"} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">
                        Study Plan
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Date Strip */}
                <View className="mb-6">
                    <FlatList
                        ref={flatListRef}
                        data={plan}
                        renderItem={renderCalendarItem}
                        keyExtractor={item => item.date}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                        getItemLayout={(data, index) => (
                            { length: 68, offset: 68 * index, index }
                        )}
                        initialScrollIndex={plan.findIndex(d => d.date === selectedDate) > 0 ? plan.findIndex(d => d.date === selectedDate) : 0}
                    />
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {/* Today's Focus */}
                    <View className="mb-6">
                        <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-400 text-base">
                            {selectedDayPlan?.isRestDay ? 'Take a break or review weak areas.' : 'Focus on these tasks to stay on track.'}
                        </Text>
                    </View>

                    {/* Tasks */}
                    {selectedDayPlan?.tasks.map((task, index) => (
                        <View key={task.id}>
                            {renderTaskItem({ item: task, index })}
                        </View>
                    ))}

                    {(!selectedDayPlan || selectedDayPlan.tasks.length === 0) && (
                        <View className="items-center justify-center py-10 opacity-50">
                            <Calendar size={48} color={isDark ? '#475569' : '#cbd5e1'} />
                            <Text className="text-slate-500 mt-4 font-medium">No tasks scheduled for this day.</Text>
                        </View>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
