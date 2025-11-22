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
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4 shadow-sm active:opacity-90"
            style={{ opacity: isLocked && (!category.freeQuestionCount || category.freeQuestionCount === 0) ? 0.6 : 1 }}
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                    {/* Category Icon Circle - Subtler */}
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${category.color}15` }}
                    >
                        <View
                            className="w-5 h-5 rounded-full opacity-80"
                            style={{ backgroundColor: category.color }}
                        />
                    </View>

                    {/* Category Info */}
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-900 dark:text-white mb-0.5 leading-snug">
                            {category.name}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed" numberOfLines={1}>
                            {category.description}
                        </Text>
                    </View>
                </View>

                {/* Lock or Check Icon */}
                {isLocked && category.isPremium ? (
                    <Lock size={20} color="#94a3b8" />
                ) : progress === 100 ? (
                    <BadgeCheck size={20} color="#16a34a" strokeWidth={2} />
                ) : null}
            </View>

            {/* Progress Bar - Slimmer */}
            {!isLocked && progress > 0 && (
                <View className="mt-3">
                    <View className="flex-row justify-between mb-1.5">
                        <Text className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Progress</Text>
                        <Text className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {Math.round(progress)}%
                        </Text>
                    </View>
                    <View className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: category.color,
                            }}
                        />
                    </View>
                </View>
            )}

            {/* Question Count */}
            <View className="mt-3 flex-row items-center">
                <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {category.totalQuestions > 0
                        ? `${category.totalQuestions} Questions`
                        : 'Coming Soon'}
                </Text>
                {category.isPremium && !isLocked && (
                    <View className="ml-2 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] font-bold text-blue-600 dark:text-blue-400">PRO</Text>
                    </View>
                )}
                {category.isPremium && isLocked && category.freeQuestionCount && category.freeQuestionCount > 0 && (
                    <View className="ml-2 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            {category.freeQuestionCount} Free
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});
