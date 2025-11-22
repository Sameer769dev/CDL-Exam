import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lock, BadgeCheck } from 'lucide-react-native';
import { Category } from '../types/quiz';

interface CategoryCardProps {
    category: Category;
    progress?: number; // 0-100
    isLocked: boolean;
    onPress: () => void;
}

export const CategoryCard = React.memo(({
    category,
    progress = 0,
    isLocked,
    onPress,
}: CategoryCardProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-slate-800 rounded-2xl mb-3 shadow-sm active:opacity-90 overflow-hidden border border-slate-100 dark:border-slate-700"
            style={{ height: 80 }}
        >
            <View className="flex-1 flex-row items-center px-4 relative">
                {/* Category Icon */}
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${category.color}15` }}
                >
                    <View
                        className="w-5 h-5 rounded-full opacity-80"
                        style={{ backgroundColor: category.color }}
                    />
                </View>

                {/* Content */}
                <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-2">
                            <Text
                                className={`text-base font-bold text-slate-900 dark:text-white leading-tight ${isLocked ? 'opacity-40 blur-sm' : ''}`}
                                numberOfLines={1}
                            >
                                {category.name}
                            </Text>
                            <Text
                                className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${isLocked ? 'opacity-40 blur-sm' : ''}`}
                            >
                                {category.totalQuestions} Questions
                            </Text>
                        </View>

                        {/* Status Icon */}
                        {isLocked ? (
                            <View className="absolute inset-0 items-center justify-center">
                                <View className="bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-full backdrop-blur-sm">
                                    <Lock size={18} color="#94a3b8" />
                                </View>
                            </View>
                        ) : progress === 100 ? (
                            <BadgeCheck size={20} color="#16a34a" strokeWidth={2} />
                        ) : null}
                    </View>
                </View>
            </View>

            {/* Bottom Progress Bar */}
            {!isLocked && progress > 0 && (
                <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-slate-700">
                    <View
                        className="h-full"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: category.color,
                        }}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
});
