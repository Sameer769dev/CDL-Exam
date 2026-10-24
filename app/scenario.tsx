import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Radio, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Sparkles, Volume2, ArrowRight } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../src/context/ThemeContext';
import { useGame } from '../src/context/GameContext';
import { fetchRoadScenario, RoadScenario, RoadScenarioOption } from '../src/utils/aiClient';
import { DieselDanMascot } from '../src/components/highway/DieselDanMascot';

export default function ScenarioScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { consumeFuel, completeNode, addXP, addGems, gameState } = useGame();
    const params = useLocalSearchParams<{ categoryId?: string; nodeId?: string; title?: string }>();

    const categoryId = params.categoryId || 'air_brakes';
    const nodeId = params.nodeId;

    const [loading, setLoading] = useState(true);
    const [scenario, setScenario] = useState<RoadScenario | null>(null);
    const [selectedOption, setSelectedOption] = useState<RoadScenarioOption | null>(null);
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadScenario = async () => {
            setLoading(true);
            try {
                const data = await fetchRoadScenario(categoryId);
                if (isMounted) {
                    setScenario(data);
                }
            } catch {
                // Handled by aiClient fallback
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadScenario();
        return () => {
            isMounted = false;
            Speech.stop();
        };
    }, [categoryId]);

    const handleSelectOption = (option: RoadScenarioOption) => {
        if (isEvaluated) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOption(option);
    };

    const handleConfirmDecision = () => {
        if (!selectedOption || isEvaluated) return;

        setIsEvaluated(true);
        if (selectedOption.isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowConfetti(true);
            const xp = 35;
            const gems = 15;
            addXP(xp);
            addGems(gems);
            if (nodeId) {
                completeNode(nodeId, 3, xp, gems);
            }
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            consumeFuel();
        }
    };

    const toggleAudio = () => {
        if (!scenario) return;
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        const narration = `Roadside scenario: ${scenario.scenarioTitle}. ${scenario.storyText}. Tactical question: ${scenario.question}`;
        Speech.speak(narration, {
            rate: 0.95,
            pitch: 0.95,
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
            {showConfetti && <ConfettiCannon count={90} origin={{ x: 200, y: 0 }} />}

            {/* Top Navigation Bar */}
            <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800 bg-slate-900/90">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-slate-800 items-center justify-center border border-slate-700"
                >
                    <ChevronLeft size={22} color="#fff" />
                </TouchableOpacity>

                {/* AI Model Badge */}
                <View className="flex-row items-center bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                    <Radio size={14} color="#60a5fa" className="mr-1.5" />
                    <Text className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                        HF Llama-3.3
                    </Text>
                </View>

                {/* Fuel Tanks */}
                <View className="flex-row items-center bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                    <Text className="text-sm mr-1">⛽</Text>
                    <Text className="text-white font-black text-xs">{gameState.fuel}/{gameState.maxFuel}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center p-8">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-white font-bold text-base mt-4 text-center">
                        Contacting Roadside Dispatch...
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1 text-center">
                        Simulating live FMCSA highway conditions with Hugging Face AI
                    </Text>
                </View>
            ) : scenario ? (
                <ScrollView
                    className="flex-1 px-5 pt-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 160 }}
                >
                    {/* Diesel Dan Road Mentor */}
                    <DieselDanMascot
                        emotion={isEvaluated ? (selectedOption?.isCorrect ? 'celebrating' : 'warning') : 'encouragement'}
                        message={
                            isEvaluated
                                ? selectedOption?.feedback
                                : `Dispatcher radio open. Read the road situation carefully before making your tactical call.`
                        }
                    />

                    {/* Scenario Situation Card */}
                    <View className="bg-slate-800/90 rounded-3xl p-5 border border-slate-700 mb-6 shadow-xl relative overflow-hidden">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <AlertTriangle size={18} color="#f59e0b" className="mr-2" />
                                <Text className="text-amber-400 font-black text-xs uppercase tracking-wider">
                                    Live Road Incident
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={toggleAudio}
                                className="flex-row items-center bg-slate-700/60 px-2.5 py-1 rounded-xl"
                            >
                                <Volume2 size={14} color={isSpeaking ? '#60a5fa' : '#94a3b8'} className="mr-1" />
                                <Text className="text-slate-300 font-bold text-[10px] uppercase">
                                    {isSpeaking ? 'Listening' : 'Audio Mode'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-white text-xl font-black mb-2">
                            {scenario.scenarioTitle}
                        </Text>
                        <Text className="text-slate-300 text-sm font-medium leading-relaxed mb-4">
                            {scenario.storyText}
                        </Text>

                        {/* Question Prompt */}
                        <View className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60">
                            <Text className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                                Tactical Driver Decision:
                            </Text>
                            <Text className="text-white text-base font-bold">
                                {scenario.question}
                            </Text>
                        </View>
                    </View>

                    {/* Tactical Options */}
                    <View className="gap-3 mb-6">
                        {scenario.options.map((option, index) => {
                            const isSelected = selectedOption?.id === option.id;
                            let cardStyle = 'bg-slate-800/80 border-slate-700';

                            if (isEvaluated) {
                                if (option.isCorrect) {
                                    cardStyle = 'bg-emerald-950/40 border-emerald-500';
                                } else if (isSelected && !option.isCorrect) {
                                    cardStyle = 'bg-red-950/40 border-red-500';
                                }
                            } else if (isSelected) {
                                cardStyle = 'bg-blue-900/30 border-blue-500 shadow-md shadow-blue-500/20';
                            }

                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    activeOpacity={0.8}
                                    disabled={isEvaluated}
                                    onPress={() => handleSelectOption(option)}
                                    className={`p-4 rounded-2xl border ${cardStyle} flex-row items-start`}
                                >
                                    <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 border ${
                                        isSelected ? 'bg-blue-600 border-blue-400' : 'bg-slate-700 border-slate-600'
                                    }`}>
                                        <Text className="text-white font-black text-xs">
                                            {String.fromCharCode(65 + index)}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-sm leading-snug">
                                            {option.text}
                                        </Text>
                                    </View>

                                    {isEvaluated && option.isCorrect && (
                                        <CheckCircle2 size={20} color="#10b981" className="ml-2" />
                                    )}
                                    {isEvaluated && isSelected && !option.isCorrect && (
                                        <XCircle size={20} color="#ef4444" className="ml-2" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* FMCSA Legal Citation */}
                    {isEvaluated && scenario.fmcsaRule && (
                        <View className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-6 flex-row items-center">
                            <ShieldCheck size={20} color="#60a5fa" className="mr-3" />
                            <View className="flex-1">
                                <Text className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                                    FMCSA Safety Standard
                                </Text>
                                <Text className="text-slate-300 text-xs font-medium mt-0.5">
                                    {scenario.fmcsaRule}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            ) : null}

            {/* Bottom Confirmation Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 p-5 bg-slate-900/95 border-t border-slate-800">
                {!isEvaluated ? (
                    <TouchableOpacity
                        onPress={handleConfirmDecision}
                        disabled={!selectedOption}
                        className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg ${
                            selectedOption
                                ? 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700'
                                : 'bg-slate-800 opacity-50'
                        }`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-wider">
                            CONFIRM TACTICAL DECISION
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-full py-4 rounded-2xl bg-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/30 flex-row"
                    >
                        <Text className="text-white font-black text-base mr-2 uppercase tracking-wider">
                            COMPLETE LESSON
                        </Text>
                        <ArrowRight size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}
