/**
 * Progress Tracking Type Definitions
 * 
 * Defines all types for the comprehensive progress tracking system.
 * These types aggregate data from existing storage and provide
 * computed metrics for display across the app.
 */

// ==================== Core Statistics ====================

/**
 * Overall user statistics aggregated across all categories
 */
export interface OverallStats {
    totalQuestionsAttempted: number;
    totalQuestionsCorrect: number;
    overallAccuracy: number; // 0-100
    totalStudyTime: number; // in seconds
    totalSessions: number;
    categoriesStudied: number;
    currentStreak: number; // consecutive days
    longestStreak: number; // best streak ever
    lastStudyDate: string; // ISO date string
}

/**
 * Detailed performance metrics for a single category
 */
export interface CategoryPerformance {
    categoryId: string;
    categoryName: string;
    questionsAttempted: number;
    questionsCorrect: number;
    accuracy: number; // 0-100
    highScore: number; // 0-100
    highScoreDate: string; // ISO date string
    lastAttemptDate: string; // ISO date string
    mistakeCount: number;
    flashcardsReviewed: number;
    flashcardsMastered: number;
    sessionsCount: number;
    totalTimeSpent: number; // in seconds
    trend: 'improving' | 'declining' | 'stable';
}

// ==================== Activity Tracking ====================

/**
 * Study activity for a single day
 */
export interface StudyActivity {
    date: string; // YYYY-MM-DD format
    questionsAttempted: number;
    accuracy: number; // 0-100
    timeSpent: number; // in seconds
    sessionsCount: number;
}

/**
 * Weekly activity summary
 */
export interface WeeklyActivity {
    weekStartDate: string; // ISO date string
    totalQuestions: number;
    averageAccuracy: number;
    totalTime: number;
    daysStudied: number;
    dailyActivities: StudyActivity[];
}

// ==================== Insights & Recommendations ====================

/**
 * Identified weak area requiring attention
 */
export interface WeakArea {
    categoryId: string;
    categoryName: string;
    accuracy: number; // 0-100
    mistakeCount: number;
    priority: 'high' | 'medium' | 'low';
    recommendedAction: string;
}

/**
 * Comprehensive progress insights and recommendations
 */
export interface ProgressInsights {
    readinessScore: number; // 0-100, overall exam readiness
    strongestCategory: CategoryPerformance | null;
    weakestCategory: CategoryPerformance | null;
    recentImprovement: number; // percentage change over last week
    studyConsistency: number; // 0-100, based on streak
    recommendedActions: string[];
    estimatedPassProbability: number; // 0-100
}

// ==================== Achievements & Milestones ====================

/**
 * Achievement types
 */
export type AchievementType =
    | 'perfect_score'
    | 'week_streak'
    | 'month_streak'
    | 'category_master'
    | 'speed_demon'
    | 'mistake_crusher'
    | 'flashcard_expert';

/**
 * User achievement
 */
export interface Achievement {
    id: string;
    type: AchievementType;
    title: string;
    description: string;
    earnedDate: string; // ISO date string
    icon: string; // emoji or icon name
    categoryId?: string; // if category-specific
}

/**
 * Milestone progress
 */
export interface Milestone {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
    icon: string;
}

// ==================== Comparison & Trends ====================

/**
 * Performance comparison between two time periods
 */
export interface PerformanceComparison {
    metric: string;
    previousValue: number;
    currentValue: number;
    change: number; // percentage change
    trend: 'up' | 'down' | 'stable';
}

/**
 * Trend data point for charts
 */
export interface TrendDataPoint {
    date: string; // YYYY-MM-DD
    value: number;
    label?: string;
}

/**
 * Category trend over time
 */
export interface CategoryTrend {
    categoryId: string;
    categoryName: string;
    dataPoints: TrendDataPoint[];
    overallTrend: 'improving' | 'declining' | 'stable';
}

// ==================== Study Recommendations ====================

/**
 * Personalized study recommendation
 */
export interface StudyRecommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: {
        type: 'quiz' | 'flashcards' | 'exam' | 'mistake_bank' | 'bookmarks';
        categoryId?: string;
        label: string;
    };
    reason: string;
}

// ==================== Time-based Analytics ====================

/**
 * Study time breakdown by category
 */
export interface TimeBreakdown {
    categoryId: string;
    categoryName: string;
    timeSpent: number; // seconds
    percentage: number; // of total time
}

/**
 * Study time by mode
 */
export interface ModeTimeBreakdown {
    mode: 'quiz' | 'flashcards' | 'exam' | 'mistake_bank' | 'bookmarks';
    timeSpent: number; // seconds
    percentage: number; // of total time
    sessionsCount: number;
}

// ==================== Export Types ====================

/**
 * Complete progress report for export
 */
export interface ProgressReport {
    generatedDate: string;
    overallStats: OverallStats;
    categoryPerformances: CategoryPerformance[];
    weeklyActivity: WeeklyActivity;
    insights: ProgressInsights;
    achievements: Achievement[];
    recommendations: StudyRecommendation[];
}

// ==================== Helper Types ====================

/**
 * Date range for filtering
 */
export interface DateRange {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
}

/**
 * Sorting options for category performance
 */
export type CategorySortBy =
    | 'accuracy'
    | 'questionsAttempted'
    | 'lastAttempted'
    | 'mistakeCount'
    | 'name';

/**
 * Filter options for study sessions
 */
export interface SessionFilter {
    categoryId?: string;
    mode?: 'quiz' | 'flashcards' | 'exam' | 'mistake_bank' | 'bookmarks';
    dateRange?: DateRange;
    minAccuracy?: number;
    maxAccuracy?: number;
}
