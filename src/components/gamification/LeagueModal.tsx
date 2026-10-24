import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Shield, Trophy, ArrowUp, ArrowDown, Sparkles, Clock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useGame } from '../../context/GameContext';
import { TruckerLeague } from '../../types/highway';

export interface LeagueModalProps {
    visible: boolean;
    onClose: () => void;
}

interface Competitor {
    id: string;
    name: string;
    avatar: string;
    xp: number;
    isUser?: boolean;
}

const LEAGUE_INFO: Record<TruckerLeague, { name: string; color: string; border: string; icon: string }> = {
    'Rookie Hauler': { name: 'Rookie Hauler', color: '#cd7f32', border: '#b87333', icon: '🥉' },
    'Local Carrier': { name: 'Local Carrier', color: '#94a3b8', border: '#64748b', icon: '🥈' },
    'Regional Express': { name: 'Regional Express', color: '#eab308', border: '#ca8a04', icon: '🥇' },
    'Interstate Heavy': { name: 'Interstate Heavy', color: '#06b6d4', border: '#0891b2', icon: '💎' },
    'Diamond Captain': { name: 'Diamond Captain', color: '#a855f7', border: '#9333ea', icon: '👑' },
};

const SAMPLE_DRIVERS = [
    { name: 'Peterbilt_Pete', avatar: '🚛' },
    { name: 'LoneStar_Dan', avatar: '🤠' },
    { name: 'Mack_Freight', avatar: '🚚' },
    { name: 'HighwayQueen_TX', avatar: '👑' },
    { name: 'Kenworth_Kenny', avatar: '⚡' },
    { name: 'Diesel_Dave', avatar: '🔧' },
    { name: 'Route66_Runner', avatar: '🛣️' },
    { name: 'SteelHauler_Joe', avatar: '🏗️' },
    { name: 'Smokey_Bear_99', avatar: '🐻' },
    { name: 'Freightliner_Phil', avatar: '📦' },
    { name: 'Turnpike_Tom', avatar: '🏁' },
    { name: 'BigRig_Betty', avatar: '🌟' },
    { name: 'Logbook_Larry', avatar: '📋' },
    { name: 'BrakeCheck_Ben', avatar: '🛑' },
    { name: 'CB_Radio_Charlie', avatar: '📻' },
];

export const LeagueModal: React.FC<LeagueModalProps> = ({ visible, onClose }) => {
    const { isDark } = useTheme();
    const { gameState } = useGame();
    const currentLeague = gameState.currentLeague || 'Rookie Hauler';
    const leagueMeta = LEAGUE_INFO[currentLeague] || LEAGUE_INFO['Rookie Hauler'];

    // Build the 30-driver weekly bracket dynamically based on user's weeklyXP
    const leaderboard = useMemo<Competitor[]>(() => {
        const userXP = gameState.weeklyXP || 0;
        const competitors: Competitor[] = [];

        // Generate competitors around the user
        SAMPLE_DRIVERS.forEach((d, idx) => {
            const baseMultiplier = (15 - idx) * 35;
            competitors.push({
                id: `driver_${idx}`,
                name: d.name,
                avatar: d.avatar,
                xp: Math.max(10, baseMultiplier + ((idx * 17) % 40)),
            });
        });

        // Add user
        competitors.push({
            id: 'user_driver',
            name: 'You (Driver)',
            avatar: '⭐',
            xp: userXP,
            isUser: true,
        });

        // Sort descending by XP
        competitors.sort((a, b) => b.xp - a.xp);
        return competitors;
    }, [gameState.weeklyXP]);

    const userRank = leaderboard.findIndex(d => d.isUser) + 1;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/75">
                <View className="bg-white dark:bg-slate-900 rounded-t-[36px] max-h-[85%] border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <View className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Text className="text-2xl mr-2">{leagueMeta.icon}</Text>
                                <View>
                                    <Text className="text-xl font-black text-slate-900 dark:text-white">
                                        {leagueMeta.name}
                                    </Text>
                                    <View className="flex-row items-center mt-0.5">
                                        <Clock size={12} color={isDark ? '#94a3b8' : '#64748b'} className="mr-1" />
                                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                            Resets Sunday at 11:59 PM
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={onClose}
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                            >
                                <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                            </TouchableOpacity>
                        </View>

                        {/* Promotion & Demotion Info Banner */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 flex-row items-center bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-2 rounded-xl border border-emerald-500/30">
                                <ArrowUp size={16} color="#10b981" className="mr-1.5" />
                                <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                                    Top 5 Promoted
                                </Text>
                            </View>

                            <View className="flex-1 flex-row items-center bg-red-500/10 dark:bg-red-500/20 px-3 py-2 rounded-xl border border-red-500/30">
                                <ArrowDown size={16} color="#ef4444" className="mr-1.5" />
                                <Text className="text-red-700 dark:text-red-400 font-bold text-xs">
                                    Bottom 5 Demoted
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Scrollable Leaderboard Bracket */}
                    <ScrollView
                        className="flex-1 px-5"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 12 }}
                    >
                        {leaderboard.map((driver, index) => {
                            const rank = index + 1;
                            const isPromoteZone = rank <= 5;
                            const isDemoteZone = rank > leaderboard.length - 3;
                            const isUser = driver.isUser;

                            let rowStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800';
                            if (isUser) {
                                rowStyle = 'bg-blue-600 border-blue-500 shadow-md shadow-blue-500/30';
                            } else if (rank === 1) {
                                rowStyle = 'bg-amber-500/10 border-amber-500/30';
                            }

                            return (
                                <View
                                    key={driver.id}
                                    className={`flex-row items-center p-3.5 rounded-2xl border mb-2 ${rowStyle}`}
                                >
                                    {/* Rank Medal / Number */}
                                    <View className="w-8 items-center justify-center mr-3">
                                        {rank === 1 ? (
                                            <Text className="text-lg">🥇</Text>
                                        ) : rank === 2 ? (
                                            <Text className="text-lg">🥈</Text>
                                        ) : rank === 3 ? (
                                            <Text className="text-lg">🥉</Text>
                                        ) : (
                                            <Text className={`font-black text-sm ${isUser ? 'text-white' : 'text-slate-400'}`}>
                                                {rank}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Avatar */}
                                    <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center mr-3">
                                        <Text className="text-lg">{driver.avatar}</Text>
                                    </View>

                                    {/* Driver Name & Status */}
                                    <View className="flex-1">
                                        <Text className={`font-black text-sm ${isUser ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                            {driver.name}
                                        </Text>
                                        <Text className={`text-[10px] font-bold ${
                                            isUser
                                                ? 'text-blue-100'
                                                : isPromoteZone
                                                ? 'text-emerald-500'
                                                : isDemoteZone
                                                ? 'text-red-400'
                                                : 'text-slate-400'
                                        }`}>
                                            {isPromoteZone ? '↑ Promotion Zone' : isDemoteZone ? '↓ Relegation Zone' : 'Safe Zone'}
                                        </Text>
                                    </View>

                                    {/* XP Total */}
                                    <View className="items-end">
                                        <Text className={`font-black text-sm ${isUser ? 'text-amber-300' : 'text-amber-500'}`}>
                                            {driver.xp} XP
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* Footer Status Pill */}
                    <View className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Sparkles size={16} color="#3b82f6" className="mr-2" />
                            <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold">
                                You are #{userRank} of {leaderboard.length} drivers
                            </Text>
                        </View>
                        <Text className="text-blue-600 dark:text-blue-400 font-black text-xs">
                            {userRank <= 5 ? 'Promoting!' : 'Need more XP'}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
