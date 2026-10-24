import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldCheck, ChevronRight, Award, AlertTriangle, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useWeakAreas } from '../hooks/useWeakAreas';
import { ProgressRing } from './progress/ProgressRing';
import { useTheme } from '../context/ThemeContext';

export function PassReadinessHeroCard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { readinessScore, passProbability, isReady, readinessLevel, totalWeakAreas } = useWeakAreas();

    const getStatusDetails = () => {
        if (readinessScore >= 80) {
            return {
                title: 'DMV Ready',
                subtitle: 'High probability of passing on your first attempt',
                badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                badgeText: '🏆 Exam Ready',
                ringColor: '#10b981',
                icon: Award,
            };
        }
        if (readinessScore >= 65) {
            return {
                title: 'On Track',
                subtitle: `${totalWeakAreas > 0 ? `${totalWeakAreas} weak topics to polish` : 'Practice mock exams to reach 80%+'}`,
                badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                badgeText: '⚡ On Track',
                ringColor: '#3b82f6',
                icon: ShieldCheck,
            };
        }
        return {
            title: 'Building Readiness',
            subtitle: 'Take endorsement quizzes to calculate accurate passing odds',
            badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            badgeText: '🎯 Starting Out',
            ringColor: '#f59e0b',
            icon: Sparkles,
        };
    };

    const status = getStatusDetails();
    const StatusIcon = status.icon;

    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.push('/cross-verify');
            }}
            activeOpacity={0.9}
            className="rounded-[32px] overflow-hidden shadow-xl shadow-slate-300/40 dark:shadow-none border border-slate-200/80 dark:border-slate-800"
        >
            <LinearGradient
                colors={isDark ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f8fafc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5"
            >
                {/* Header row */}
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 items-center justify-center mr-2.5">
                            <ShieldCheck size={18} color="#3b82f6" />
                        </View>
                        <Text className="text-slate-900 dark:text-white font-bold text-base">
                            Pass Readiness Score
                        </Text>
                    </View>

                    <View className={`px-2.5 py-1 rounded-full border ${status.badgeColor}`}>
                        <Text className="text-[11px] font-bold">
                            {status.badgeText}
                        </Text>
                    </View>
                </View>

                {/* Main Body */}
                <View className="flex-row items-center justify-between my-2">
                    <View className="flex-1 mr-4">
                        <Text className="text-slate-900 dark:text-white text-2xl font-black mb-1">
                            {status.title}
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-3">
                            {status.subtitle}
                        </Text>

                        {/* Call to action pill */}
                        <View className="self-start flex-row items-center bg-blue-600 dark:bg-blue-500 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-xs font-bold mr-1">
                                Verify Readiness
                            </Text>
                            <ChevronRight size={14} color="white" />
                        </View>
                    </View>

                    {/* Progress Ring */}
                    <View className="items-center justify-center">
                        <ProgressRing
                            progress={Math.max(readinessScore, 5)}
                            size={92}
                            strokeWidth={8}
                            color={status.ringColor}
                            backgroundColor={isDark ? '#334155' : '#e2e8f0'}
                            showPercentage={true}
                        />
                    </View>
                </View>

                {/* Footer insight */}
                <View className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-row items-center justify-between">
                    <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Estimated DMV pass odds: <Text className="font-bold text-slate-800 dark:text-slate-200">{passProbability}%</Text>
                    </Text>
                    <Text className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        Full Report →
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}
