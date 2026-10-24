import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, Sparkles } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTheme } from '../../context/ThemeContext';

export interface DieselDanProps {
    message?: string;
    subMessage?: string;
    emotion?: 'greeting' | 'encouragement' | 'warning' | 'celebrating' | 'tip';
    showAudioButton?: boolean;
    compact?: boolean;
    onPress?: () => void;
}

const DEFAULT_MESSAGES = {
    greeting: "Hey driver! Ready to clock in some miles and nail that CDL exam?",
    encouragement: "Keep that momentum going! Every question builds your road confidence.",
    warning: "Keep your eyes on the gauges! Review that rule before the state examiner catches it.",
    celebrating: "Hot damn! That's master-driver material right there!",
    tip: "Pro Tip: Always check your low-air warning alarm at 55 to 75 PSI before rolling out.",
};

export const DieselDanMascot: React.FC<DieselDanProps> = ({
    message,
    subMessage,
    emotion = 'encouragement',
    showAudioButton = true,
    compact = false,
    onPress,
}) => {
    const { isDark } = useTheme();
    const [isSpeaking, setIsSpeaking] = useState(false);

    const activeText = message || DEFAULT_MESSAGES[emotion];

    const speakMessage = async () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        Speech.speak(activeText, {
            rate: 1.0,
            pitch: 0.95,
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    };

    if (compact) {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress || speakMessage}
                className="flex-row items-center bg-white/95 dark:bg-slate-900/95 p-3 rounded-2xl border border-blue-500/20 shadow-md shadow-blue-500/10 mb-3"
            >
                <Image
                    source={require('../../../assets/diesel_dan.png')}
                    className="w-12 h-12 rounded-full mr-3 border-2 border-blue-500/30"
                    resizeMode="cover"
                />
                <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                        <Text className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider mr-1.5">
                            Diesel Dan
                        </Text>
                        <Sparkles size={12} color="#3b82f6" />
                    </View>
                    <Text
                        className="text-slate-800 dark:text-slate-200 text-xs font-semibold leading-snug mt-0.5"
                        numberOfLines={2}
                    >
                        "{activeText}"
                    </Text>
                </View>
                {showAudioButton && (
                    <View className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                        {isSpeaking ? (
                            <VolumeX size={16} color="#3b82f6" />
                        ) : (
                            <Volume2 size={16} color="#3b82f6" />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <View className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 dark:bg-slate-900/90 rounded-[28px] p-4 border border-blue-500/20 shadow-lg shadow-blue-500/10 mb-4">
            <View className="flex-row items-center">
                {/* 3D Mascot Character */}
                <View className="relative">
                    <Image
                        source={require('../../../assets/diesel_dan.png')}
                        className="w-20 h-20 rounded-2xl border-2 border-blue-500/40 shadow-sm"
                        resizeMode="cover"
                    />
                    <View className="absolute -bottom-1.5 -right-1 bg-amber-500 px-1.5 py-0.5 rounded-full border border-white dark:border-slate-900">
                        <Text className="text-white text-[9px] font-black uppercase">5M MI</Text>
                    </View>
                </View>

                {/* Duolingo-style Speech Bubble */}
                <View className="flex-1 ml-3.5 bg-white dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm relative">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                            <Text className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                                Diesel Dan
                            </Text>
                            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold ml-1.5">
                                • Road Mentor
                            </Text>
                        </View>
                        {showAudioButton && (
                            <TouchableOpacity
                                onPress={speakMessage}
                                className="p-1 rounded-full bg-slate-100 dark:bg-slate-700/60 active:scale-95"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                {isSpeaking ? (
                                    <VolumeX size={14} color="#3b82f6" />
                                ) : (
                                    <Volume2 size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text className="text-slate-900 dark:text-white text-sm font-semibold leading-relaxed">
                        "{activeText}"
                    </Text>

                    {subMessage && (
                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                            {subMessage}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};
