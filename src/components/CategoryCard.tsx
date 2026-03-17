import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lock, BadgeCheck, ChevronRight, Trophy } from 'lucide-react-native';
import { Category } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { useCategoryStats } from '../hooks/useCategoryStats';
import { AccuracyBadge } from './progress/AccuracyBadge';
import { HighScoreBadge } from './progress/HighScoreBadge';
import { CategoryInfo } from './progress/CategoryInfo'; // NEW
import { getCategoryHistory } from '../utils/progressComparison'; // NEW
import { useUser } from '../context/UserContext'; // NEW

interface CategoryCardProps {
    category: Category;
    progress?: number; // 0-100
    isLocked: boolean;
    onPress: () => void;
    mode?: 'quiz' | 'flashcards';
}

export const CategoryCard = React.memo(({
    category,
    progress = 0,
    isLocked,
    onPress,
    mode = 'quiz'
}: CategoryCardProps) => {
    const { isDark } = useTheme();
    const { performance } = useCategoryStats(category.id);
    const { studySessions, mistakeBank } = useUser(); // NEW
    const history = getCategoryHistory(category.id, studySessions); // NEW

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-slate-800 rounded-2xl mb-4 shadow-md active:scale-[0.98] overflow-hidden border-2 border-slate-100 dark:border-slate-700"
            style={{
                minHeight: 88,
                shadowColor: isDark ? '#000' : '#64748b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            <View className="flex-1 flex-row items-center px-5 py-4 relative">
                {/* Category Icon - Larger and more prominent */}
                <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm"
                    style={{
                        backgroundColor: isLocked ? '#e2e8f0' : `${category.color}20`,
                        borderWidth: 2,
                        borderColor: isLocked ? '#cbd5e1' : `${category.color}40`,
                    }}
                >
                    <View
                        className="w-6 h-6 rounded-full"
                        style={{
                            backgroundColor: isLocked ? '#94a3b8' : category.color,
                            opacity: isLocked ? 0.4 : 1,
                        }}
                    />
                </View>

                {/* Content */}
                <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                            <Text
                                className={`text-lg font-bold leading-tight mb-1 ${isLocked
                                    ? 'text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                    }`}
                                numberOfLines={1}
                            >
                                {category.name}
                            </Text>
                            <View className="flex-row items-center">
                                <Text
                                    className={`text-sm font-medium ${isLocked
                                        ? 'text-slate-400 dark:text-slate-500'
                                        : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    {category.totalQuestions} Questions
                                </Text>
                                {progress > 0 && !isLocked && (
                                    <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400 ml-2">
                                        • {Math.round(progress)}% {mode === 'flashcards' ? 'Mastered' : 'Complete'}
                                    </Text>
                                )}
                            </View>

                            {/* Performance Badges - Quiz Only */}
                            {!isLocked && mode === 'quiz' && performance && performance.questionsAttempted > 0 && (
                                <View className="flex-row items-center gap-2 mt-2">
                                    <AccuracyBadge accuracy={performance.accuracy} size="small" />
                                    {performance.highScore > 0 && (
                                        <HighScoreBadge score={performance.highScore} size="small" />
                                    )}
                                </View>
                            )}

                            {/* Category Info - NEW */}
                            {!isLocked && (
                                <View className="mt-3">
                                    <CategoryInfo
                                        lastAttemptDate={history.lastAttemptDate}
                                        timeSpent={history.totalTime}
                                        mistakeCount={mode === 'flashcards' ? 0 : (mistakeBank[category.id]?.length || 0)}
                                        compact
                                    />
                                </View>
                            )}
                        </View>

                        {/* Status Icon - Larger and more visible */}
                        {isLocked ? (
                            <View className="flex-row items-center bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                <Lock size={14} color="#fbbf24" strokeWidth={2.5} style={{ marginRight: 6 }} />
                                <Text className="text-amber-500 font-bold text-[10px] tracking-widest uppercase">
                                    PRO
                                </Text>
                            </View>
                        ) : progress === 100 ? (
                            <View className="flex-row items-center bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                <Trophy size={14} color="#fbbf24" strokeWidth={2.5} style={{ marginRight: 6 }} />
                                <Text className="text-amber-500 font-bold text-[10px] tracking-widest uppercase">
                                    MASTERED
                                </Text>
                            </View>
                        ) : (
                            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                        )}
                    </View>
                </View>
            </View>

            {/* Bottom Progress Bar - Thicker and more visible */}
            {!isLocked && progress > 0 && (
                <View className="h-1.5 bg-slate-100 dark:bg-slate-700">
                    <View
                        className="h-full rounded-full"
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
