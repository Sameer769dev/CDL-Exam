import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Flame, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { hasDailyChallengePlayed, getTodaysDailyChallengeKey, getDailyChallengeStreak } from '../utils/dailyChallenge';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function DailyChallengeCard() {
    const router = useRouter();
    const [hasPlayed, setHasPlayed] = useState(false);
    const [streak, setStreak] = useState(0);

    const loadData = async () => {
        const played = await hasDailyChallengePlayed(getTodaysDailyChallengeKey());
        const currentStreak = await getDailyChallengeStreak();
        setHasPlayed(played);
        setStreak(currentStreak);
    };

    // Reload when tab comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    return (
        <Animated.View entering={FadeInDown.springify().damping(20)} className="mb-6 px-6">
            <TouchableOpacity
                onPress={() => {
                    if (!hasPlayed) {
                        router.push('/daily-challenge');
                    }
                }}
                activeOpacity={hasPlayed ? 1 : 0.8}
                className={`rounded-3xl p-5 border overflow-hidden relative ${
                    hasPlayed 
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                        : 'bg-orange-500 border-orange-600 dark:bg-orange-600 dark:border-orange-700 shadow-lg shadow-orange-500/30'
                }`}
            >
                {/* Background Pattern for unplayed state */}
                {!hasPlayed && (
                    <>
                        <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                        <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10" />
                    </>
                )}

                <View className="flex-row items-center justify-between relative z-10">
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                            <View className={`px-2 py-1 rounded-md mr-2 ${hasPlayed ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white/20'}`}>
                                <Text className={`text-xs font-bold uppercase tracking-wider ${hasPlayed ? 'text-slate-500 dark:text-slate-400' : 'text-white'}`}>
                                    Daily Challenge
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Flame size={12} color={hasPlayed ? '#f97316' : 'white'} className="mr-1" />
                                <Text className={`text-xs font-bold ${hasPlayed ? 'text-orange-500' : 'text-orange-100'}`}>
                                    {streak} day streak
                                </Text>
                            </View>
                        </View>
                        
                        <Text className={`text-xl font-bold mb-1 ${hasPlayed ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                            {hasPlayed ? "Challenge Complete!" : "Ready for today?"}
                        </Text>
                        
                        <Text className={`text-sm leading-tight ${hasPlayed ? 'text-slate-500 dark:text-slate-400' : 'text-orange-100'}`}>
                            {hasPlayed 
                                ? "Great job maintaining your streak. Come back tomorrow!" 
                                : "10 questions in 60 seconds. Can you beat the clock?"}
                        </Text>
                    </View>
                    
                    <View className={`w-12 h-12 rounded-full items-center justify-center border ${
                        hasPlayed 
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                            : 'bg-white/20 border-white/30'
                    }`}>
                        {hasPlayed ? (
                            <CheckCircle2 size={24} color="#10b981" />
                        ) : (
                            <ArrowRight size={24} color="white" />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
