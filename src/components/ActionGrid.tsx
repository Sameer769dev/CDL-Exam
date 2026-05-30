import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BrainCircuit, Layers, AlertOctagon, Award, Lock, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';

export const ActionGrid = () => {
    const router = useRouter();
    const { isPremium } = useUser();

    const actions = [
        {
            title: 'Practice Quiz',
            icon: BrainCircuit,
            gradient: ['#3b82f6', '#2563eb'] as const, // Blue
            iconColor: '#ffffff',
            path: '/categories?mode=quiz',
            delay: 100
        },
        {
            title: 'Flashcards',
            icon: Layers,
            gradient: ['#8b5cf6', '#7c3aed'] as const, // Violet
            iconColor: '#ffffff',
            path: '/categories?mode=flashcards',
            delay: 200
        },
        {
            title: 'Mistakes',
            icon: AlertOctagon,
            gradient: ['#ef4444', '#dc2626'] as const, // Red
            iconColor: '#ffffff',
            path: '/mistake-bank',
            delay: 300
        },
        {
            title: 'Simulator',
            icon: Award,
            gradient: ['#64748b', '#475569'] as const, // Slate
            iconColor: '#ffffff',
            path: '/exam-intro',
            delay: 400
        },
        {
            title: 'AI Endless Mode',
            icon: Sparkles,
            gradient: ['#0f766e', '#0d9488'] as const, // Teal
            iconColor: '#ffffff',
            path: '/categories?mode=ai_endless',
            delay: 500
        }
    ];

    return (
        <View className="flex-row flex-wrap justify-between gap-y-4">
            {actions.map((action, index) => {
                const Icon = action.icon;
                const isLocked = (action as any).isPremium && !isPremium;

                // Premium Colors & Gradients
                let gradientColors = ['#1e293b', '#0f172a']; // Default Slate
                let shadowColor = 'shadow-slate-500/20';
                let accentColor = '#94a3b8';

                if (action.title === 'Practice Quiz') {
                    gradientColors = ['#1e3a8a', '#172554']; // Deep Blue (Sapphire)
                    shadowColor = 'shadow-blue-500/30';
                    accentColor = '#60a5fa';
                } else if (action.title === 'Flashcards') {
                    gradientColors = ['#5b21b6', '#4c1d95']; // Deep Violet
                    shadowColor = 'shadow-violet-500/30';
                    accentColor = '#a78bfa';
                } else if (action.title === 'Mistakes') {
                    gradientColors = ['#991b1b', '#7f1d1d']; // Deep Red (Crimson)
                    shadowColor = 'shadow-red-500/30';
                    accentColor = '#f87171';
                } else if (action.title === 'Simulator') {
                    gradientColors = ['#334155', '#1e293b']; // Metallic / Dark Charcoal
                    shadowColor = 'shadow-slate-500/30';
                    accentColor = '#cbd5e1';
                } else if (action.title === 'AI Endless Mode') {
                    gradientColors = ['#0f766e', '#0d9488']; // Teal AI Glow
                    shadowColor = 'shadow-teal-500/40';
                    accentColor = '#5eead4';
                }

                const isFullWidth = action.title === 'AI Endless Mode';

                return (
                    <Animated.View
                        key={index}
                        entering={FadeInUp.delay(action.delay).springify()}
                        className={isFullWidth ? "w-full" : "w-[48%]"}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                if (isLocked) {
                                    router.push('/paywall');
                                    return;
                                }

                                if (action.path.includes('?')) {
                                    const [pathname, params] = action.path.split('?');
                                    const searchParams = new URLSearchParams(params);
                                    router.push({ pathname: pathname as any, params: Object.fromEntries(searchParams) });
                                } else {
                                    router.push(action.path as any);
                                }
                            }}
                            activeOpacity={0.9}
                            className={`rounded-[32px] ${shadowColor} shadow-lg active:scale-[0.98] transition-transform`}
                        >
                            <LinearGradient
                                colors={gradientColors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="h-40 p-5 justify-between relative overflow-hidden rounded-[32px] border border-white/10"
                            >
                                {/* Glass/Noise Texture Overlay (Simulated with white opacity) */}
                                <View className="absolute inset-0 bg-white/5" />

                                {/* Watermark Icon */}
                                <View className="absolute -bottom-4 -right-4 opacity-10 transform rotate-[-15deg]">
                                    <Icon size={80} color="white" />
                                </View>

                                {/* Header */}
                                <View className="flex-row justify-between items-start z-10">
                                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center backdrop-blur-md border border-white/10">
                                        <Icon size={20} color="white" strokeWidth={1.5} />
                                    </View>
                                    {isLocked && (
                                        <View className="bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                                            <Text className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                                PRO
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Content */}
                                <View className="z-10">
                                    <Text className="text-white font-bold text-lg leading-tight mb-3 tracking-tight">
                                        {action.title}
                                    </Text>

                                    {isLocked ? (
                                        <View className="flex-row items-center">
                                            <Lock size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                                            <Text className="text-amber-400 text-[10px] font-bold tracking-[2px] uppercase">
                                                LOCKED
                                            </Text>
                                        </View>
                                    ) : (
                                        <View className="self-start bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                                            <Text className="text-white text-[10px] font-bold tracking-[2px] uppercase">
                                                BEGIN
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};
