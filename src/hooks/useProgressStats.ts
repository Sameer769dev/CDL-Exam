/**
 * useProgressStats Hook
 * 
 * Provides access to overall user statistics with formatted values
 * and convenience getters for common use cases.
 */

import { useProgressTracking } from '../context/ProgressTrackingContext';
import { formatStudyTime } from '../utils/progressCalculations';

export const useProgressStats = () => {
    const { overallStats, isLoading } = useProgressTracking();

    return {
        // Raw stats object
        stats: overallStats,

        // Formatted values
        formattedTime: formatStudyTime(overallStats.totalStudyTime),

        // Convenience getters (rounded for display)
        accuracy: Math.round(overallStats.overallAccuracy),
        totalQuestions: overallStats.totalQuestionsAttempted,
        totalCorrect: overallStats.totalQuestionsCorrect,
        currentStreak: overallStats.currentStreak,
        longestStreak: overallStats.longestStreak,
        sessionsCount: overallStats.totalSessions,
        categoriesStudied: overallStats.categoriesStudied,

        // State
        isLoading,

        // Computed helpers
        hasStudied: overallStats.totalQuestionsAttempted > 0,
        hasActiveStreak: overallStats.currentStreak > 0,
        isOnFire: overallStats.currentStreak >= 7, // Week streak
        isPassing: overallStats.overallAccuracy >= 80
    };
};
