import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, Platform } from 'react-native';
import { X, Play, Pause, SkipForward, SkipBack, Volume2, Sparkles, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Question } from '../types/quiz';
import { audioStudy } from '../utils/audioStudy';
import { useTheme } from '../context/ThemeContext';

interface AudioPlayerModalProps {
    visible: boolean;
    onClose: () => void;
    questions: Question[];
    initialIndex?: number;
}

export function AudioPlayerModal({
    visible,
    onClose,
    questions,
    initialIndex = 0,
}: AudioPlayerModalProps) {
    const { isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioState, setAudioState] = useState<'idle' | 'speaking_question' | 'waiting_answer' | 'speaking_answer'>('idle');
    const [speed, setSpeed] = useState<number>(0.95);
    const [autoAdvance, setAutoAdvance] = useState(true);

    const pulseScale = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withRepeat(withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true) }]
        };
    });

    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        if (visible && currentQuestion) {
            setCurrentIndex(initialIndex);
            startPlayback(initialIndex);
        } else {
            stopPlayback();
        }

        return () => {
            stopPlayback();
        };
    }, [visible]);

    const stopPlayback = () => {
        audioStudy.stop();
        setIsPlaying(false);
        setAudioState('idle');
    };

    const startPlayback = (index: number) => {
        const q = questions[index];
        if (!q) return;

        setIsPlaying(true);
        audioStudy.setRate(speed);
        audioStudy.playQuestionFlow(q, {
            rate: speed,
            onStateChange: (state) => {
                setAudioState(state);
            },
            onCompleted: () => {
                if (autoAdvance) {
                    handleNext(index);
                } else {
                    setIsPlaying(false);
                    setAudioState('idle');
                }
            }
        });
    };

    const togglePlay = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback(currentIndex);
        }
    };

    const handleNext = (fromIndex: number = currentIndex) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (fromIndex < questions.length - 1) {
            const nextIdx = fromIndex + 1;
            setCurrentIndex(nextIdx);
            startPlayback(nextIdx);
        } else {
            stopPlayback();
        }
    };

    const handlePrev = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            startPlayback(prevIdx);
        }
    };

    const toggleSpeed = () => {
        Haptics.selectionAsync().catch(() => {});
        const nextSpeed = speed === 0.95 ? 1.2 : speed === 1.2 ? 0.8 : 0.95;
        setSpeed(nextSpeed);
        audioStudy.setRate(nextSpeed);
    };

    if (!currentQuestion) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                stopPlayback();
                onClose();
            }}
        >
            <View className="flex-1 justify-end bg-black/80">
                <View className="bg-slate-900 border-t border-slate-800 rounded-t-[36px] p-6 pb-10 shadow-2xl">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 items-center justify-center mr-3">
                                <Volume2 size={20} color="#60a5fa" />
                            </View>
                            <View>
                                <Text className="text-white font-black text-lg">
                                    Hands-Free Audio Mode
                                </Text>
                                <Text className="text-slate-400 text-xs font-semibold">
                                    Question {currentIndex + 1} of {questions.length}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                stopPlayback();
                                onClose();
                            }}
                            className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
                        >
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {/* Question Card */}
                    <View className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 mb-6">
                        {/* Status Indicator */}
                        <View className="flex-row items-center mb-3">
                            {isPlaying && (
                                <Animated.View style={pulseScale} className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-2" />
                            )}
                            <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                                {audioState === 'speaking_question' && '🎙️ Reading Question...'}
                                {audioState === 'waiting_answer' && '⏳ Think of your answer...'}
                                {audioState === 'speaking_answer' && '💡 Explaining Solution...'}
                                {audioState === 'idle' && (isPlaying ? 'Ready' : 'Paused')}
                            </Text>
                        </View>

                        <Text className="text-white text-lg font-bold leading-relaxed mb-4">
                            {currentQuestion.question}
                        </Text>

                        {/* Reveal answer on speaking_answer */}
                        {(audioState === 'speaking_answer' || !isPlaying) && (
                            <Animated.View entering={FadeIn.duration(300)} className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mt-2">
                                <View className="flex-row items-center mb-1">
                                    <CheckCircle2 size={16} color="#34d399" className="mr-1.5" />
                                    <Text className="text-emerald-400 text-xs font-black uppercase tracking-wider">
                                        Correct Answer
                                    </Text>
                                </View>
                                <Text className="text-white font-semibold text-sm">
                                    {currentQuestion.correct_answer}
                                </Text>
                            </Animated.View>
                        )}
                    </View>

                    {/* Settings bar (speed + auto-advance) */}
                    <View className="flex-row justify-between items-center bg-slate-800/40 rounded-2xl px-4 py-2.5 mb-6 border border-slate-700/40">
                        <TouchableOpacity
                            onPress={toggleSpeed}
                            className="bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-600"
                        >
                            <Text className="text-white font-bold text-xs">
                                Speed: {speed === 0.95 ? '1.0x' : `${speed}x`}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center">
                            <Text className="text-slate-300 text-xs font-medium mr-2">
                                Auto-Advance
                            </Text>
                            <Switch
                                value={autoAdvance}
                                onValueChange={setAutoAdvance}
                                trackColor={{ false: '#334155', true: '#2563eb' }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Playback Controls */}
                    <View className="flex-row justify-center items-center gap-6">
                        <TouchableOpacity
                            onPress={handlePrev}
                            disabled={currentIndex === 0}
                            className={`w-12 h-12 rounded-full bg-slate-800 border border-slate-700 items-center justify-center ${currentIndex === 0 ? 'opacity-40' : 'active:bg-slate-700'}`}
                        >
                            <SkipBack size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={togglePlay}
                            className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause size={30} color="white" />
                            ) : (
                                <Play size={30} color="white" style={{ marginLeft: 3 }} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleNext()}
                            disabled={currentIndex >= questions.length - 1}
                            className={`w-12 h-12 rounded-full bg-slate-800 border border-slate-700 items-center justify-center ${currentIndex >= questions.length - 1 ? 'opacity-40' : 'active:bg-slate-700'}`}
                        >
                            <SkipForward size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
