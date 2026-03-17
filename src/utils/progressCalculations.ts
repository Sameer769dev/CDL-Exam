/**
 * Progress Calculation Utilities
 * 
 * Pure functions for calculating progress metrics from raw data.
 * All calculations are derived from existing storage data without
 * modifying any existing code.
 */

import {
    UserProgress,
    HighScores,
    WrongAnswers,
    StudySession,
    FlashcardProgress,
    StudyStreak
} from './storage';

import {
    OverallStats,
    CategoryPerformance,
    StudyActivity,
    WeakArea,
    ProgressInsights,
    PerformanceComparison,
    StudyRecommendation,
    TimeBreakdown,
    ModeTimeBreakdown
} from '../types/progress';

// ==================== Overall Statistics ====================

/**
 * Calculate overall user statistics from all data sources
 */
export const calculateOverallStats = (
    progress: UserProgress,
    sessions: StudySession[],
    streak: StudyStreak
): OverallStats => {
    // Aggregate from sessions for most accurate data
    const totalAttempted = sessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const uniqueCategories = new Set(sessions.map(s => s.categoryId)).size;

    return {
        totalQuestionsAttempted: totalAttempted,
        totalQuestionsCorrect: totalCorrect,
        overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
        totalStudyTime: totalTime,
        totalSessions: sessions.length,
        categoriesStudied: uniqueCategories,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastStudyDate: streak.lastStudyDate
    };
};

// ==================== Category Performance ====================

/**
 * Calculate detailed performance metrics for a single category
 */
export const calculateCategoryPerformance = (
    categoryId: string,
    categoryName: string,
    progress: UserProgress,
    highScores: HighScores,
    mistakes: WrongAnswers,
    flashcards: FlashcardProgress,
    sessions: StudySession[]
): CategoryPerformance => {
    const catProgress = progress[categoryId];
    const catHighScore = highScores[categoryId];
    const catMistakes = mistakes[categoryId] || [];
    const catFlashcards = flashcards[categoryId];
    const catSessions = sessions.filter(s => s.categoryId === categoryId);

    // Calculate accuracy from progress data
    const accuracy = catProgress && catProgress.questionsAttempted > 0
        ? (catProgress.questionsCorrect / catProgress.questionsAttempted) * 100
        : 0;

    // Calculate total time from sessions
    const totalTime = catSessions.reduce((sum, s) => sum + s.timeSpent, 0);

    // Calculate trend
    const trend = calculateTrend(catSessions);

    return {
        categoryId,
        categoryName,
        questionsAttempted: catProgress?.questionsAttempted || 0,
        questionsCorrect: catProgress?.questionsCorrect || 0,
        accuracy,
        highScore: catHighScore?.percentage || 0,
        highScoreDate: catHighScore?.date || '',
        lastAttemptDate: catProgress?.lastAttemptDate || '',
        mistakeCount: catMistakes.length,
        flashcardsReviewed: catFlashcards?.cardsReviewed || 0,
        flashcardsMastered: catFlashcards?.cardsMastered || 0,
        sessionsCount: catSessions.length,
        totalTimeSpent: totalTime,
        trend
    };
};

/**
 * Calculate performance trend from session history
 */
const calculateTrend = (sessions: StudySession[]): 'improving' | 'declining' | 'stable' => {
    if (sessions.length < 6) return 'stable';

    // Sort by date (most recent first)
    const sorted = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Compare recent 5 sessions vs previous 5
    const recent = sorted.slice(0, 5);
    const previous = sorted.slice(5, 10);

    if (previous.length === 0) return 'stable';

    const recentAccuracy = recent.reduce((sum, s) =>
        sum + (s.questionsAttempted > 0 ? s.questionsCorrect / s.questionsAttempted : 0), 0
    ) / recent.length;

    const previousAccuracy = previous.reduce((sum, s) =>
        sum + (s.questionsAttempted > 0 ? s.questionsCorrect / s.questionsAttempted : 0), 0
    ) / previous.length;

    const diff = recentAccuracy - previousAccuracy;

    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
};

// ==================== Study Activity ====================

/**
 * Calculate daily study activity for the last N days
 */
export const calculateStudyActivity = (
    sessions: StudySession[],
    days: number = 7
): StudyActivity[] => {
    const activities: Map<string, StudyActivity> = new Map();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Filter and aggregate sessions by day
    sessions
        .filter(s => new Date(s.date) >= cutoffDate)
        .forEach(session => {
            const dateKey = session.date.split('T')[0]; // YYYY-MM-DD
            const existing = activities.get(dateKey);

            if (existing) {
                const totalAttempted = existing.questionsAttempted + session.questionsAttempted;
                const totalCorrect = (existing.accuracy / 100) * existing.questionsAttempted + session.questionsCorrect;

                existing.questionsAttempted = totalAttempted;
                existing.accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
                existing.timeSpent += session.timeSpent;
                existing.sessionsCount += 1;
            } else {
                activities.set(dateKey, {
                    date: dateKey,
                    questionsAttempted: session.questionsAttempted,
                    accuracy: session.questionsAttempted > 0
                        ? (session.questionsCorrect / session.questionsAttempted) * 100
                        : 0,
                    timeSpent: session.timeSpent,
                    sessionsCount: 1
                });
            }
        });

    // Fill in missing days with zero activity
    const result: StudyActivity[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];

        result.push(activities.get(dateKey) || {
            date: dateKey,
            questionsAttempted: 0,
            accuracy: 0,
            timeSpent: 0,
            sessionsCount: 0
        });
    }

    return result;
};

// ==================== Weak Areas ====================

/**
 * Identify categories that need attention
 */
export const identifyWeakAreas = (
    performances: CategoryPerformance[]
): WeakArea[] => {
    return performances
        .filter(p => p.questionsAttempted >= 5) // Only consider categories with enough attempts
        .map(p => {
            let priority: 'high' | 'medium' | 'low';
            let recommendedAction: string;

            if (p.accuracy < 60) {
                priority = 'high';
                recommendedAction = 'Review fundamentals and practice more questions';
            } else if (p.accuracy < 75) {
                priority = 'medium';
                recommendedAction = 'Focus on mistake bank to improve weak points';
            } else if (p.accuracy < 85) {
                priority = 'low';
                recommendedAction = 'Practice to reach mastery level';
            } else {
                return null; // Not a weak area
            }

            return {
                categoryId: p.categoryId,
                categoryName: p.categoryName,
                accuracy: p.accuracy,
                mistakeCount: p.mistakeCount,
                priority,
                recommendedAction
            };
        })
        .filter((w): w is WeakArea => w !== null)
        .sort((a, b) => a.accuracy - b.accuracy); // Weakest first
};

// ==================== Progress Insights ====================

/**
 * Generate comprehensive progress insights and recommendations
 */
export const generateProgressInsights = (
    overallStats: OverallStats,
    performances: CategoryPerformance[],
    weakAreas: WeakArea[]
): ProgressInsights => {
    const readinessScore = calculateReadinessScore(overallStats, performances);

    const strongest = performances
        .filter(p => p.questionsAttempted > 0)
        .reduce((max, p) =>
            p.accuracy > (max?.accuracy || 0) ? p : max,
            null as CategoryPerformance | null
        );

    const weakest = performances
        .filter(p => p.questionsAttempted > 0)
        .reduce((min, p) =>
            p.accuracy < (min?.accuracy || 100) ? p : min,
            null as CategoryPerformance | null
        );

    const recommendations = generateRecommendations(overallStats, performances, weakAreas);
    const studyConsistency = calculateStudyConsistency(overallStats);
    const passProbability = calculatePassProbability(overallStats, performances);

    return {
        readinessScore,
        strongestCategory: strongest,
        weakestCategory: weakest,
        recentImprovement: 0, // TODO: Calculate from trend
        studyConsistency,
        recommendedActions: recommendations,
        estimatedPassProbability: passProbability
    };
};

/**
 * Calculate overall exam readiness score (0-100)
 */
const calculateReadinessScore = (
    stats: OverallStats,
    performances: CategoryPerformance[]
): number => {
    // Accuracy weight: 50%
    const accuracyScore = stats.overallAccuracy;

    // Coverage weight: 30% (how many categories studied)
    const coverageScore = Math.min((stats.categoriesStudied / 8) * 100, 100);

    // Consistency weight: 20% (study streak)
    const consistencyScore = Math.min((stats.currentStreak / 7) * 100, 100);

    return accuracyScore * 0.5 + coverageScore * 0.3 + consistencyScore * 0.2;
};

/**
 * Calculate study consistency score (0-100)
 */
const calculateStudyConsistency = (stats: OverallStats): number => {
    // Based on current streak relative to a 30-day period
    return Math.min((stats.currentStreak / 30) * 100, 100);
};

/**
 * Estimate probability of passing the real exam (0-100)
 */
const calculatePassProbability = (
    stats: OverallStats,
    performances: CategoryPerformance[]
): number => {
    // Need 80% to pass
    const accuracyFactor = Math.min(stats.overallAccuracy / 80, 1);

    // Need to study all major categories
    const coverageFactor = Math.min(stats.categoriesStudied / 8, 1);

    // Need consistent practice
    const consistencyFactor = Math.min(stats.totalSessions / 20, 1);

    return (accuracyFactor * 0.6 + coverageFactor * 0.25 + consistencyFactor * 0.15) * 100;
};

/**
 * Generate personalized study recommendations
 */
const generateRecommendations = (
    stats: OverallStats,
    performances: CategoryPerformance[],
    weakAreas: WeakArea[]
): string[] => {
    const recommendations: string[] = [];

    // Accuracy-based recommendations
    if (stats.overallAccuracy < 80) {
        recommendations.push('📚 Focus on improving accuracy to reach 80% pass threshold');
    } else if (stats.overallAccuracy >= 90) {
        recommendations.push('🌟 Excellent accuracy! You\'re ready for the exam');
    }

    // Weak area recommendations
    if (weakAreas.length > 0) {
        const weakest = weakAreas[0];
        recommendations.push(`⚠️ Review ${weakest.categoryName} - your weakest area (${Math.round(weakest.accuracy)}%)`);
    }

    // Streak recommendations
    if (stats.currentStreak === 0) {
        recommendations.push('🔥 Start a study streak - consistency is key to success!');
    } else if (stats.currentStreak >= 7) {
        recommendations.push(`🎯 Amazing ${stats.currentStreak}-day streak! Keep it going!`);
    }

    // Coverage recommendations
    if (stats.categoriesStudied < 5) {
        recommendations.push('🗺️ Explore more categories to broaden your knowledge');
    }

    // Mistake bank recommendations
    const totalMistakes = performances.reduce((sum, p) => sum + p.mistakeCount, 0);
    if (totalMistakes > 20) {
        recommendations.push(`📝 Review your ${totalMistakes} saved mistakes to improve`);
    }

    // Practice recommendations
    if (stats.totalSessions < 10) {
        recommendations.push('💪 Complete more practice sessions to build confidence');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
};

// ==================== Time Formatting ====================

/**
 * Format study time in seconds to human-readable string
 */
export const formatStudyTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeDate = (dateString: string): string => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};

// ==================== Time Breakdown ====================

/**
 * Calculate time spent per category
 */
export const calculateTimeBreakdown = (
    sessions: StudySession[],
    categoryNames: Map<string, string>
): TimeBreakdown[] => {
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const categoryTimes = new Map<string, number>();

    sessions.forEach(session => {
        const current = categoryTimes.get(session.categoryId) || 0;
        categoryTimes.set(session.categoryId, current + session.timeSpent);
    });

    return Array.from(categoryTimes.entries())
        .map(([categoryId, timeSpent]) => ({
            categoryId,
            categoryName: categoryNames.get(categoryId) || categoryId,
            timeSpent,
            percentage: totalTime > 0 ? (timeSpent / totalTime) * 100 : 0
        }))
        .sort((a, b) => b.timeSpent - a.timeSpent);
};

/**
 * Calculate time spent per study mode
 */
export const calculateModeTimeBreakdown = (
    sessions: StudySession[]
): ModeTimeBreakdown[] => {
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const modeTimes = new Map<string, { time: number; count: number }>();

    sessions.forEach(session => {
        const current = modeTimes.get(session.mode) || { time: 0, count: 0 };
        modeTimes.set(session.mode, {
            time: current.time + session.timeSpent,
            count: current.count + 1
        });
    });

    return Array.from(modeTimes.entries())
        .map(([mode, data]) => ({
            mode: mode as 'quiz' | 'flashcards' | 'exam' | 'mistake_bank',
            timeSpent: data.time,
            percentage: totalTime > 0 ? (data.time / totalTime) * 100 : 0,
            sessionsCount: data.count
        }))
        .sort((a, b) => b.timeSpent - a.timeSpent);
};
