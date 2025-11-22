import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    value,
    label,
    color = '#2563eb',
    trend
}) => {
    return (
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex-1 mx-1.5">
            <View className="flex-row items-center justify-between mb-3">
                <View
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${color}10` }}
                >
                    <Icon size={20} color={color} strokeWidth={2.5} />
                </View>
                {trend && (
                    <View className={`px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-50 dark:bg-green-900/30' :
                        trend === 'down' ? 'bg-red-50 dark:bg-red-900/30' :
                            'bg-slate-50 dark:bg-slate-800'
                        }`}>
                        <Text className={`text-[10px] font-bold ${trend === 'up' ? 'text-green-600 dark:text-green-400' :
                            trend === 'down' ? 'text-red-600 dark:text-red-400' :
                                'text-slate-500 dark:text-slate-400'
                            }`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
                        </Text>
                    </View>
                )}
            </View>
            <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-0.5 tracking-tight leading-none">
                {value}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
                {label}
            </Text>
        </View>
    );
};
