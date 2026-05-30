import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function WeeklyBarChart() {
    const { isDark } = useTheme();
    const { studySessions } = useUser();

    const chartData = useMemo(() => {
        const data = [];
        const today = new Date();
        const maxDays = 7;
        let maxCount = 0;
        
        // Map sessions by date string
        const activityMap = new Map<string, number>();
        studySessions.forEach(session => {
            if (!session.date) return;
            const dateStr = session.date.split('T')[0];
            const current = activityMap.get(dateStr) || 0;
            activityMap.set(dateStr, current + session.questionsAttempted);
        });
        
        // Generate last 7 days
        for (let i = maxDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = activityMap.get(dateStr) || 0;
            
            if (count > maxCount) maxCount = count;
            
            data.push({
                dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count
            });
        }
        
        return { data, maxCount };
    }, [studySessions]);

    // Ensure we don't divide by zero
    const maxBarHeight = 100;
    const safeMax = Math.max(chartData.maxCount, 10);

    return (
        <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Questions Answered (Past 7 Days)
            </Text>
            
            <View className="flex-row items-end justify-between h-[120px] pb-2 border-b border-slate-100 dark:border-slate-700">
                {chartData.data.map((item, index) => {
                    const height = (item.count / safeMax) * maxBarHeight;
                    const isToday = index === chartData.data.length - 1;
                    
                    return (
                        <View key={index} className="items-center w-[12%]">
                            <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-2">
                                {item.count > 0 ? item.count : ''}
                            </Text>
                            <Animated.View 
                                entering={FadeInUp.delay(index * 100).springify()}
                                className={`w-full rounded-t-lg ${isToday ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-900/40'}`}
                                style={{ height: Math.max(height, 4) }}
                            />
                        </View>
                    );
                })}
            </View>
            
            <View className="flex-row justify-between pt-2">
                {chartData.data.map((item, index) => (
                    <Text 
                        key={index} 
                        className={`text-xs font-bold w-[12%] text-center ${
                            index === chartData.data.length - 1 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-slate-400 dark:text-slate-500'
                        }`}
                        numberOfLines={1}
                    >
                        {item.dayLabel}
                    </Text>
                ))}
            </View>
        </View>
    );
}
