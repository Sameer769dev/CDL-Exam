/**
 * useStudyHistory Hook
 * 
 * Provides access to study activity history with flexible date ranges.
 */

import { useProgressTracking } from '../context/ProgressTrackingContext';
import { formatStudyTime } from '../utils/progressCalculations';

export const useStudyHistory = (days: number = 7) => {
    const { recentActivity, getActivityForDays, isLoading } = useProgressTracking();

    // Get activity for requested number of days
    const activity = days === 7 ? recentActivity : getActivityForDays(days);

    // Calculate aggregates
    const totalQuestions = activity.reduce((sum, a) => sum + a.questionsAttempted, 0);
    const totalTime = activity.reduce((sum, a) => sum + a.timeSpent, 0);
    const totalSessions = activity.reduce((sum, a) => sum + a.sessionsCount, 0);
    const daysWithActivity = activity.filter(a => a.questionsAttempted > 0).length;

    const averageAccuracy = daysWithActivity > 0
        ? activity
            .filter(a => a.questionsAttempted > 0)
            .reduce((sum, a) => sum + a.accuracy, 0) / daysWithActivity
        : 0;

    return {
        // Raw activity data
        activity,

        // Aggregates
        totalQuestions,
        totalTime,
        totalSessions,
        daysWithActivity,
        averageAccuracy: Math.round(averageAccuracy),

        // Formatted values
        formattedTotalTime: formatStudyTime(totalTime),

        // State
        isLoading,
        hasActivity: totalQuestions > 0,

        // Computed helpers
        consistency: daysWithActivity / days, // 0-1
        consistencyPercentage: Math.round((daysWithActivity / days) * 100),
        isConsistent: daysWithActivity >= Math.ceil(days * 0.7), // 70% of days

        // Get specific day
        getDay: (dateString: string) => activity.find(a => a.date === dateString),

        // Get most active day
        mostActiveDay: activity.reduce((max, a) =>
            a.questionsAttempted > (max?.questionsAttempted || 0) ? a : max,
            activity[0]
        ),

        // Get best accuracy day
        bestAccuracyDay: activity
            .filter(a => a.questionsAttempted > 0)
            .reduce((max, a) =>
                a.accuracy > (max?.accuracy || 0) ? a : max,
                activity[0]
            )
    };
};
