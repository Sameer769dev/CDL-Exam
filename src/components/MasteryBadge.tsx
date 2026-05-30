import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Circle, HelpCircle } from 'lucide-react-native';

export type MasteryLevel = 'new' | 'learning' | 'mastered';

interface MasteryBadgeProps {
    level: MasteryLevel;
}

export function MasteryBadge({ level }: MasteryBadgeProps) {
    if (level === 'mastered') {
        return (
            <View className="flex-row items-center bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} color="#10b981" />
                <Text className="ml-1 text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    Mastered
                </Text>
            </View>
        );
    }
    
    if (level === 'learning') {
        return (
            <View className="flex-row items-center bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">
                <Circle size={12} color="#f59e0b" />
                <Text className="ml-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Learning
                </Text>
            </View>
        );
    }
    
    // new
    return (
        <View className="flex-row items-center bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
            <HelpCircle size={12} color="#3b82f6" />
            <Text className="ml-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                New
            </Text>
        </View>
    );
}
