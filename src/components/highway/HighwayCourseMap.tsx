import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Sparkles, X, Gift, Zap, ShieldAlert, Award } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { HighwayNode, HighwayUnit } from '../../types/highway';
import { generateHighwayUnits } from '../../utils/highwayCourse';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { GameStatsHeader } from './GameStatsHeader';
import { UnitHeaderBanner } from './UnitHeaderBanner';
import { HighwayNodeItem } from './HighwayNodeItem';

export function HighwayCourseMap() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { gameState, completeNode, isOutOfFuel } = useGame();
    const [selectedNode, setSelectedNode] = useState<HighwayNode | null>(null);
    const [chestReward, setChestReward] = useState<{ xp: number; gems: number } | null>(null);

    const units = generateHighwayUnits(gameState.completedNodeIds, gameState.nodeStars);

    const handleNodePress = (node: HighwayNode) => {
        if (!node.isUnlocked) return;

        // Chest node unlocks immediately
        if (node.type === 'chest' && !node.isCompleted) {
            const xp = node.xpReward || 50;
            const gems = node.gemReward || 40;
            completeNode(node.id, 3, xp, gems);
            setChestReward({ xp, gems });
            return;
        }

        setSelectedNode(node);
    };

    const startNode = () => {
        if (!selectedNode) return;
        const node = selectedNode;
        setSelectedNode(null);

        // Check fuel before starting a lesson
        if (isOutOfFuel) {
            // Handled by GameStatsHeader fuel modal
            return;
        }

        if (node.type === 'boss_exam') {
            router.push('/exam-intro');
        } else if (node.type === 'scenario') {
            router.push({
                pathname: '/scenario',
                params: {
                    categoryId: node.categoryId,
                    nodeId: node.id,
                    title: node.title,
                },
            });
        } else {
            // Launch standard quiz or speed drill
            router.push({
                pathname: '/quiz',
                params: {
                    categoryId: node.categoryId,
                    mode: node.type === 'speed_drill' ? 'timed' : 'standard',
                    nodeId: node.id,
                },
            });
        }
    };

    return (
        <View className="flex-1 bg-slate-100 dark:bg-slate-950">
            {/* Top Game Bar */}
            <GameStatsHeader />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 160 }}
            >
                {units.map((unit) => (
                    <View key={unit.id} className="relative">
                        {/* Unit Title Banner */}
                        <UnitHeaderBanner unit={unit} />

                        {/* Highway Stepping-Stone Nodes */}
                        <View className="items-center py-2 relative">
                            {/* Decorative dashed road line in center */}
                            <View className="absolute top-0 bottom-0 w-2.5 bg-slate-300/40 dark:bg-slate-800/60 rounded-full" />

                            {unit.nodes.map((node, idx) => (
                                <HighwayNodeItem
                                    key={node.id}
                                    node={node}
                                    index={idx}
                                    accentColor={unit.accentColor}
                                    onPress={handleNodePress}
                                />
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Node Start Action Sheet / Dialog */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedNode}
                onRequestClose={() => setSelectedNode(null)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white dark:bg-slate-900 rounded-t-[36px] p-6 pb-12 border-t border-slate-200 dark:border-slate-800 shadow-2xl">
                        {selectedNode && (
                            <>
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                                        <Text className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                                            {selectedNode.type === 'speed_drill' ? '⚡ Speed Drill' : selectedNode.type === 'scenario' ? '🧠 AI Road Scenario' : selectedNode.type === 'boss_exam' ? '🏆 Checkpoint Boss' : '🟢 Micro-Lesson'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedNode(null)}
                                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                                    >
                                        <X size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                    {selectedNode.title}
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                    {selectedNode.subtitle} • {selectedNode.questionCount} Questions
                                </Text>

                                {/* Rewards Card */}
                                <View className="flex-row justify-around bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                                    <View className="items-center">
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Reward</Text>
                                        <Text className="text-amber-500 font-black text-base">+{selectedNode.xpReward} XP</Text>
                                    </View>
                                    <View className="w-[1px] bg-slate-200 dark:bg-slate-700" />
                                    <View className="items-center">
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Cost</Text>
                                        <Text className="text-red-500 font-black text-base">1 Fuel Tank</Text>
                                    </View>
                                </View>

                                {/* Start Button */}
                                <TouchableOpacity
                                    onPress={startNode}
                                    className="w-full bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/30 active:bg-blue-700"
                                >
                                    <Play size={20} color="white" fill="white" className="mr-2" />
                                    <Text className="text-white font-black text-base">
                                        START LESSON
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Chest Open Celebration Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={!!chestReward}
                onRequestClose={() => setChestReward(null)}
            >
                <View className="flex-1 justify-center items-center bg-black/75 p-6">
                    <ConfettiCannon count={100} origin={{ x: 200, y: 0 }} />
                    <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl items-center">
                        <View className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 items-center justify-center mb-3">
                            <Gift size={40} color="#f59e0b" />
                        </View>
                        <Text className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                            Highway Chest Opened!
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6">
                            You've earned valuable fuel and gems to keep your trucking streak alive!
                        </Text>

                        <View className="flex-row gap-4 mb-6">
                            <View className="bg-amber-500/10 px-4 py-2 rounded-xl items-center border border-amber-500/20">
                                <Text className="text-amber-500 font-black text-lg">+{chestReward?.xp} XP</Text>
                            </View>
                            <View className="bg-cyan-500/10 px-4 py-2 rounded-xl items-center border border-cyan-500/20">
                                <Text className="text-cyan-500 font-black text-lg">+{chestReward?.gems} Gems</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => setChestReward(null)}
                            className="w-full bg-blue-600 py-3.5 rounded-2xl items-center"
                        >
                            <Text className="text-white font-bold text-sm">
                                CLAIM & CONTINUE
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
