import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

const WEEKS_TO_SHOW = 15;
const DAYS_IN_WEEK = 7;

export function HeatmapGrid() {
    const { isDark } = useTheme();
    const { studySessions } = useUser();

    const activityMap = useMemo(() => {
        const map = new Map<string, number>();
        
        studySessions.forEach(session => {
            if (!session.date) return;
            const dateStr = session.date.split('T')[0];
            const current = map.get(dateStr) || 0;
            map.set(dateStr, current + session.questionsAttempted);
        });
        
        return map;
    }, [studySessions]);

    const gridData = useMemo(() => {
        const today = new Date();
        const data = [];
        
        // Generate last N weeks of data
        for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
            const week = [];
            for (let j = 0; j < DAYS_IN_WEEK; j++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (i * 7) - (6 - j));
                const dateStr = date.toISOString().split('T')[0];
                const count = activityMap.get(dateStr) || 0;
                
                week.push({
                    date: dateStr,
                    count
                });
            }
            data.push(week);
        }
        
        return data;
    }, [activityMap]);

    const getColor = (count: number) => {
        if (count === 0) return isDark ? '#334155' : '#e2e8f0'; // slate-700 : slate-200
        if (count < 10) return isDark ? '#064e3b' : '#d1fae5'; // emerald-900 : emerald-100
        if (count < 30) return isDark ? '#047857' : '#6ee7b7'; // emerald-700 : emerald-300
        if (count < 50) return isDark ? '#10b981' : '#10b981'; // emerald-500 : emerald-500
        return isDark ? '#059669' : '#059669'; // emerald-600 : emerald-600
    };

    return (
        <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Activity Heatmap
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                <View className="flex-row">
                    {gridData.map((week, weekIndex) => (
                        <View key={weekIndex} className="mr-1">
                            {week.map((day, dayIndex) => (
                                <View 
                                    key={dayIndex}
                                    className="w-4 h-4 rounded-sm mb-1"
                                    style={{ backgroundColor: getColor(day.count) }}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
            
            <View className="flex-row items-center justify-end mt-4">
                <Text className="text-xs text-slate-500 dark:text-slate-400 mr-2">Less</Text>
                <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getColor(0) }} />
                <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getColor(5) }} />
                <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getColor(20) }} />
                <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getColor(40) }} />
                <View className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: getColor(60) }} />
                <Text className="text-xs text-slate-500 dark:text-slate-400">More</Text>
            </View>
        </View>
    );
}
