import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Award } from 'lucide-react-native';
import { HighwayUnit } from '../../types/highway';

interface UnitHeaderBannerProps {
    unit: HighwayUnit;
}

export function UnitHeaderBanner({ unit }: UnitHeaderBannerProps) {
    const completedCount = unit.nodes.filter(n => n.isCompleted).length;
    const totalCount = unit.nodes.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const getGradientColors = (num: number): [string, string] => {
        switch (num) {
            case 1: return ['#1e40af', '#1e3a8a']; // Blue
            case 2: return ['#0369a1', '#075985']; // Sky / Cyan
            case 3: return ['#b91c1c', '#991b1b']; // Red
            case 4: return ['#047857', '#065f46']; // Emerald
            default: return ['#334155', '#1e293b'];
        }
    };

    return (
        <View className="mx-5 my-6 rounded-3xl overflow-hidden shadow-lg shadow-slate-300/30 dark:shadow-none">
            <LinearGradient
                colors={getGradientColors(unit.unitNumber)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5 relative"
            >
                {/* Decorative background watermark */}
                <View className="absolute -bottom-6 -right-6 opacity-10">
                    <Award size={110} color="white" />
                </View>

                {/* Top Label */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                            Unit {unit.unitNumber}
                        </Text>
                    </View>

                    <Text className="text-white/80 font-bold text-xs">
                        {completedCount} / {totalCount} Done ({progressPercent}%)
                    </Text>
                </View>

                {/* Unit Name */}
                <Text className="text-white font-black text-xl leading-tight mb-1">
                    {unit.title}
                </Text>
                <Text className="text-white/80 text-xs font-medium">
                    {unit.subtitle}
                </Text>

                {/* Progress Mini Bar */}
                <View className="w-full h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                    <View
                        className="h-full bg-white rounded-full"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                </View>
            </LinearGradient>
        </View>
    );
}
