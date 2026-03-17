import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakHeatmapProps {
    streak: number;
    last7Days?: boolean[]; // Array of true/false for the last 7 days
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ streak, last7Days = [false, false, false, false, false, false, false] }) => {
    // Mock data generation if not provided (simulating "Calendar Heatmap")
    // In a real app, this would come from the user's study history
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mr-3">
                        <Flame size={20} color="#f97316" fill="#f97316" />
                    </View>
                    <View>
                        <Text className="text-slate-900 dark:text-white font-bold text-lg">
                            {streak} Day Streak
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs">
                            Keep it up!
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                {days.map((day, index) => {
                    // Simulating active state based on index for now, or using prop
                    // For demo purposes, let's make the last few days active
                    const isActive = last7Days[index];

                    return (
                        <View key={index} className="items-center">
                            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mb-2">
                                {day}
                            </Text>
                            <View
                                className={`w-8 h-8 rounded-lg items-center justify-center ${isActive
                                    ? 'bg-orange-500 shadow-sm shadow-orange-200 dark:shadow-none'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                            >
                                {isActive && (
                                    <View className="w-2 h-2 bg-white rounded-full opacity-50" />
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};
