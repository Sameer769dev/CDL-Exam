import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Flame, Shield, Sparkles, Heart, Zap, X, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../../context/GameContext';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { LeagueModal } from '../gamification/LeagueModal';

export function GameStatsHeader() {
    const { gameState, timeUntilNextFuelSec, refuelAll, buyStreakFreeze } = useGame();
    const { studyStreak, isPremium } = useUser();
    const { isDark } = useTheme();
    const router = useRouter();
    const [fuelModalVisible, setFuelModalVisible] = useState(false);
    const [leagueModalVisible, setLeagueModalVisible] = useState(false);

    const formatCountdown = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <>
            <View className="flex-row items-center justify-between px-6 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-800">
                {/* 1. Fuel / Hearts */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setFuelModalVisible(true);
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <Heart size={16} color="#ef4444" fill={isPremium ? '#ef4444' : gameState.fuel > 0 ? '#ef4444' : 'none'} />
                    <Text className="text-red-500 font-black text-xs ml-1.5">
                        {isPremium ? '∞' : gameState.fuel}
                    </Text>
                </TouchableOpacity>

                {/* 2. Streak */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <Flame size={16} color="#f97316" fill="#f97316" />
                    <Text className="text-orange-500 font-black text-xs ml-1.5">
                        {studyStreak?.currentStreak || 0}
                    </Text>
                </TouchableOpacity>

                {/* 3. Diesel Gems */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <Sparkles size={16} color="#06b6d4" fill="#06b6d4" />
                    <Text className="text-cyan-500 font-black text-xs ml-1.5">
                        {gameState.dieselGems}
                    </Text>
                </TouchableOpacity>

                {/* 4. League Division */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setLeagueModalVisible(true);
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30"
                >
                    <Shield size={14} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs ml-1.5 capitalize">
                        {gameState.currentLeague}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Fuel / Heart Management Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={fuelModalVisible}
                onRequestClose={() => setFuelModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/70 p-6">
                    <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl items-center">
                        <TouchableOpacity
                            onPress={() => setFuelModalVisible(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                        >
                            <X size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>

                        {/* Heart icon display */}
                        <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-3">
                            <Heart size={36} color="#ef4444" fill="#ef4444" />
                        </View>

                        <Text className="text-xl font-black text-slate-900 dark:text-white mb-1">
                            {isPremium ? 'Unlimited Fuel' : `${gameState.fuel} / ${gameState.maxFuel} Fuel Tanks`}
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6">
                            {isPremium
                                ? 'You have Pro unlimited fuel. Practice without interruptions!'
                                : gameState.fuel < gameState.maxFuel
                                    ? `Next fuel tank in ${formatCountdown(timeUntilNextFuelSec)}. Practice past mistakes to refill immediately!`
                                    : 'Your fuel tanks are full! You are ready to haul.'}
                        </Text>

                        {/* Action 1: Practice to refill */}
                        {!isPremium && gameState.fuel < gameState.maxFuel && (
                            <TouchableOpacity
                                onPress={() => {
                                    setFuelModalVisible(false);
                                    router.push('/mistake-bank');
                                }}
                                className="w-full bg-blue-600 py-3.5 rounded-2xl items-center mb-3 shadow-md shadow-blue-500/30"
                            >
                                <Text className="text-white font-bold text-sm">
                                    ⛽ Practice Mistakes to Refill
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Action 2: Buy Streak Freeze */}
                        <TouchableOpacity
                            onPress={() => {
                                if (buyStreakFreeze()) {
                                    setFuelModalVisible(false);
                                }
                            }}
                            className="w-full bg-slate-100 dark:bg-slate-800 py-3.5 rounded-2xl items-center mb-3 border border-slate-200 dark:border-slate-700"
                        >
                            <Text className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                                ❄️ Buy Streak Shield (80 Gems)
                            </Text>
                        </TouchableOpacity>

                        {/* Action 3: Upgrade to Pro */}
                        {!isPremium && (
                            <TouchableOpacity
                                onPress={() => {
                                    setFuelModalVisible(false);
                                    router.push('/paywall');
                                }}
                                className="w-full py-2.5 items-center"
                            >
                                <Text className="text-amber-500 font-bold text-xs uppercase tracking-wider">
                                    ★ Unlock Unlimited Fuel with PRO
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Trucker League Leaderboard Modal */}
            <LeagueModal
                visible={leagueModalVisible}
                onClose={() => setLeagueModalVisible(false)}
            />
        </>
    );
}
