/**
 * Progress Comparison Utilities
 * 
 * Calculate comparisons between current and previous attempts.
 * Provides historical context to show users their improvement.
 */

import { StudySession, HighScores } from './storage';

// ==================== Types ====================

export interface AttemptComparison {
    // Current attempt
    currentScore: number;
    currentPercentage: number;

    // Previous attempt
    previousScore: number | null;
    previousPercentage: number | null;

    // High score
    highScore: number;
    highScorePercentage: number;

    // Analysis
    improvement: number | null; // percentage points change
    isNewHighScore: boolean;
    isPassing: boolean; // >= 80%
    attemptsCount: number;

    // Trend
    trend: 'improving' | 'declining' | 'stable' | 'first_attempt';
}

export interface CategoryHistory {
    totalSessions: number;
    totalTime: number; // seconds
    lastAttemptDate: string | null;
    averageAccuracy: number; // 0-100
    recentSessions: StudySession[]; // Last 5
    bestSession: StudySession | null;
    worstSession: StudySession | null;
}

// ==================== Comparison Functions ====================

/**
 * Compare current attempt to previous attempts and high score
 * 
 * @param categoryId - Category being compared
 * @param currentScore - Current score (correct answers)
 * @param currentTotal - Current total questions
 * @param sessions - All study sessions
 * @param highScores - High scores record
 * @returns Detailed comparison data
 */
export const compareAttempt = (
    categoryId: string,
    currentScore: number,
    currentTotal: number,
    sessions: StudySession[],
    highScores: HighScores
): AttemptComparison => {
    const currentPercentage = currentTotal > 0 ? (currentScore / currentTotal) * 100 : 0;

    // Get previous attempts for this category (excluding flashcards)
    const categoryAttempts = sessions
        .filter(s =>
            s.categoryId === categoryId &&
            s.mode !== 'flashcards' &&
            s.questionsAttempted > 0
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Previous attempt (most recent)
    const previousAttempt = categoryAttempts[0];
    const previousPercentage = previousAttempt && previousAttempt.questionsAttempted > 0
        ? (previousAttempt.questionsCorrect / previousAttempt.questionsAttempted) * 100
        : null;
    const previousScore = previousAttempt?.questionsCorrect || null;

    // High score
    const highScore = highScores[categoryId];
    const highScorePercentage = highScore?.percentage || 0;
    const isNewHighScore = currentPercentage > highScorePercentage;

    // Improvement calculation
    const improvement = previousPercentage !== null
        ? currentPercentage - previousPercentage
        : null;

    // Trend analysis
    let trend: AttemptComparison['trend'] = 'first_attempt';
    if (categoryAttempts.length > 0) {
        if (improvement === null) {
            trend = 'stable';
        } else if (improvement > 5) {
            trend = 'improving';
        } else if (improvement < -5) {
            trend = 'declining';
        } else {
            trend = 'stable';
        }
    }

    return {
        currentScore,
        currentPercentage,
        previousScore,
        previousPercentage,
        highScore: highScore?.score || 0,
        highScorePercentage,
        improvement,
        isNewHighScore,
        isPassing: currentPercentage >= 80,
        attemptsCount: categoryAttempts.length + 1, // +1 for current
        trend
    };
};

/**
 * Get detailed history for a category
 * 
 * @param categoryId - Category to analyze
 * @param sessions - All study sessions
 * @returns Category history data
 */
export const getCategoryHistory = (
    categoryId: string,
    sessions: StudySession[]
): CategoryHistory => {
    const categorySessions = sessions
        .filter(s => s.categoryId === categoryId && s.questionsAttempted > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (categorySessions.length === 0) {
        return {
            totalSessions: 0,
            totalTime: 0,
            lastAttemptDate: null,
            averageAccuracy: 0,
            recentSessions: [],
            bestSession: null,
            worstSession: null
        };
    }

    // Calculate totals
    const totalTime = categorySessions.reduce((sum, s) => sum + s.timeSpent, 0);

    // Calculate average accuracy
    const accuracies = categorySessions.map(s =>
        s.questionsAttempted > 0 ? (s.questionsCorrect / s.questionsAttempted) * 100 : 0
    );
    const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

    // Find best and worst sessions
    const bestSession = categorySessions.reduce((best, s) => {
        const sAccuracy = s.questionsAttempted > 0
            ? (s.questionsCorrect / s.questionsAttempted) * 100
            : 0;
        const bestAccuracy = best.questionsAttempted > 0
            ? (best.questionsCorrect / best.questionsAttempted) * 100
            : 0;
        return sAccuracy > bestAccuracy ? s : best;
    });

    const worstSession = categorySessions.reduce((worst, s) => {
        const sAccuracy = s.questionsAttempted > 0
            ? (s.questionsCorrect / s.questionsAttempted) * 100
            : 0;
        const worstAccuracy = worst.questionsAttempted > 0
            ? (worst.questionsCorrect / worst.questionsAttempted) * 100
            : 100;
        return sAccuracy < worstAccuracy ? s : worst;
    });

    return {
        totalSessions: categorySessions.length,
        totalTime,
        lastAttemptDate: categorySessions[0].date,
        averageAccuracy,
        recentSessions: categorySessions.slice(0, 5),
        bestSession,
        worstSession
    };
};

/**
 * Calculate improvement rate over time
 * 
 * @param categoryId - Category to analyze
 * @param sessions - All study sessions
 * @param days - Number of days to look back (default: 7)
 * @returns Improvement percentage
 */
export const calculateImprovementRate = (
    categoryId: string,
    sessions: StudySession[],
    days: number = 7
): number | null => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSessions = sessions
        .filter(s =>
            s.categoryId === categoryId &&
            new Date(s.date) >= cutoffDate &&
            s.questionsAttempted > 0
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recentSessions.length < 2) {
        return null; // Not enough data
    }

    // Compare first half vs second half
    const midpoint = Math.floor(recentSessions.length / 2);
    const firstHalf = recentSessions.slice(0, midpoint);
    const secondHalf = recentSessions.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, s) =>
        sum + (s.questionsCorrect / s.questionsAttempted), 0
    ) / firstHalf.length * 100;

    const secondAvg = secondHalf.reduce((sum, s) =>
        sum + (s.questionsCorrect / s.questionsAttempted), 0
    ) / secondHalf.length * 100;

    return secondAvg - firstAvg;
};

/**
 * Get comparison message for display
 * 
 * @param comparison - Attempt comparison data
 * @returns User-friendly message
 */
export const getComparisonMessage = (comparison: AttemptComparison): string => {
    if (comparison.isNewHighScore) {
        return '🎉 New High Score!';
    }

    if (comparison.trend === 'first_attempt') {
        return '🎯 First attempt - great start!';
    }

    if (comparison.improvement === null) {
        return 'Keep practicing!';
    }

    if (comparison.improvement > 10) {
        return `🚀 Excellent! +${comparison.improvement.toFixed(1)}% improvement`;
    }

    if (comparison.improvement > 0) {
        return `📈 Good progress! +${comparison.improvement.toFixed(1)}%`;
    }

    if (comparison.improvement < -10) {
        return `📉 Don't worry, review and try again`;
    }

    if (comparison.improvement < 0) {
        return `⚠️ Slight dip of ${Math.abs(comparison.improvement).toFixed(1)}%`;
    }

    return '➡️ Same as last time';
};

/**
 * Check if user is ready for exam based on category performance
 * 
 * @param sessions - All study sessions
 * @param requiredCategories - Categories that must be studied
 * @returns Readiness assessment
 */
export const assessExamReadiness = (
    sessions: StudySession[],
    requiredCategories: string[]
): {
    isReady: boolean;
    studiedCategories: number;
    averageAccuracy: number;
    weakCategories: string[];
} => {
    const categoryAccuracies = new Map<string, number[]>();

    // Group sessions by category
    sessions.forEach(session => {
        if (session.questionsAttempted === 0) return;

        const accuracy = (session.questionsCorrect / session.questionsAttempted) * 100;
        const existing = categoryAccuracies.get(session.categoryId) || [];
        existing.push(accuracy);
        categoryAccuracies.set(session.categoryId, existing);
    });

    // Calculate average accuracy per category
    const categoryAverages = new Map<string, number>();
    categoryAccuracies.forEach((accuracies, categoryId) => {
        const avg = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        categoryAverages.set(categoryId, avg);
    });

    // Check required categories
    const studiedCategories = requiredCategories.filter(cat =>
        categoryAverages.has(cat)
    ).length;

    // Calculate overall average
    const allAverages = Array.from(categoryAverages.values());
    const averageAccuracy = allAverages.length > 0
        ? allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length
        : 0;

    // Find weak categories (< 75%)
    const weakCategories = Array.from(categoryAverages.entries())
        .filter(([_, avg]) => avg < 75)
        .map(([cat, _]) => cat);

    // Ready if: studied all required categories AND average >= 80% AND no weak categories
    const isReady =
        studiedCategories === requiredCategories.length &&
        averageAccuracy >= 80 &&
        weakCategories.length === 0;

    return {
        isReady,
        studiedCategories,
        averageAccuracy,
        weakCategories
    };
};

// ==================== Export ====================

export default {
    compareAttempt,
    getCategoryHistory,
    calculateImprovementRate,
    getComparisonMessage,
    assessExamReadiness
};
