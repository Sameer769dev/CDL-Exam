/**
 * Progress Tracking Context
 * 
 * Central context that aggregates all user progress data and provides
 * computed metrics to the entire app. This context sits on top of
 * UserContext and doesn't modify any existing code.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { getCategories } from '../utils/dataLoader';
import {
    calculateOverallStats,
    calculateCategoryPerformance,
    calculateStudyActivity,
    identifyWeakAreas,
    generateProgressInsights
} from '../utils/progressCalculations';
import {
    OverallStats,
    CategoryPerformance,
    StudyActivity,
    WeakArea,
    ProgressInsights
} from '../types/progress';

// ==================== Context Type ====================

interface ProgressTrackingContextType {
    // Core Statistics
    overallStats: OverallStats;
    categoryPerformances: CategoryPerformance[];

    // Activity & History
    recentActivity: StudyActivity[]; // Last 7 days

    // Insights & Recommendations
    weakAreas: WeakArea[];
    insights: ProgressInsights;

    // State
    isLoading: boolean;
    lastUpdated: Date | null;

    // Actions
    refreshProgress: () => Promise<void>;
    getCategoryPerformance: (categoryId: string) => CategoryPerformance | undefined;
    getActivityForDays: (days: number) => StudyActivity[];
}

// ==================== Context Creation ====================

const ProgressTrackingContext = createContext<ProgressTrackingContextType | undefined>(undefined);

// ==================== Provider Component ====================

export const ProgressTrackingProvider = ({ children }: { children: ReactNode }) => {
    // Get data from existing UserContext
    const {
        progress,
        highScores,
        mistakeBank,
        flashcardProgress,
        studySessions,
        studyStreak,
        isLoading: userLoading
    } = useUser();

    // State for computed metrics
    const [overallStats, setOverallStats] = useState<OverallStats>({
        totalQuestionsAttempted: 0,
        totalQuestionsCorrect: 0,
        overallAccuracy: 0,
        totalStudyTime: 0,
        totalSessions: 0,
        categoriesStudied: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: ''
    });

    const [categoryPerformances, setCategoryPerformances] = useState<CategoryPerformance[]>([]);
    const [recentActivity, setRecentActivity] = useState<StudyActivity[]>([]);
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
    const [insights, setInsights] = useState<ProgressInsights>({
        readinessScore: 0,
        strongestCategory: null,
        weakestCategory: null,
        recentImprovement: 0,
        studyConsistency: 0,
        recommendedActions: [],
        estimatedPassProbability: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Recalculate all metrics when source data changes
    useEffect(() => {
        if (!userLoading) {
            calculateAllMetrics();
        }
    }, [
        progress,
        highScores,
        mistakeBank,
        flashcardProgress,
        studySessions,
        studyStreak,
        userLoading
    ]);

    /**
     * Calculate all progress metrics from source data
     */
    const calculateAllMetrics = async () => {
        setIsLoading(true);

        try {
            // 1. Calculate overall statistics
            const overall = calculateOverallStats(progress, studySessions, studyStreak);
            setOverallStats(overall);

            // 2. Calculate per-category performance
            const categories = getCategories();
            const performances = categories.map(cat =>
                calculateCategoryPerformance(
                    cat.id,
                    cat.name,
                    progress,
                    highScores,
                    mistakeBank,
                    flashcardProgress,
                    studySessions
                )
            );
            setCategoryPerformances(performances);

            // 3. Calculate recent activity (last 7 days)
            const activity = calculateStudyActivity(studySessions, 7);
            setRecentActivity(activity);

            // 4. Identify weak areas
            const weak = identifyWeakAreas(performances);
            setWeakAreas(weak);

            // 5. Generate insights and recommendations
            const progressInsights = generateProgressInsights(overall, performances, weak);
            setInsights(progressInsights);

            // Update timestamp
            setLastUpdated(new Date());

        } catch (error) {
            console.error('[ProgressTracking] Error calculating metrics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Manually refresh all progress data
     */
    const refreshProgress = async () => {
        await calculateAllMetrics();
    };

    /**
     * Get performance data for a specific category
     */
    const getCategoryPerformance = (categoryId: string): CategoryPerformance | undefined => {
        return categoryPerformances.find(p => p.categoryId === categoryId);
    };

    /**
     * Get activity for a custom number of days
     */
    const getActivityForDays = (days: number): StudyActivity[] => {
        return calculateStudyActivity(studySessions, days);
    };

    // Context value
    const value: ProgressTrackingContextType = {
        overallStats,
        categoryPerformances,
        recentActivity,
        weakAreas,
        insights,
        isLoading,
        lastUpdated,
        refreshProgress,
        getCategoryPerformance,
        getActivityForDays
    };

    return (
        <ProgressTrackingContext.Provider value={value}>
            {children}
        </ProgressTrackingContext.Provider>
    );
};

// ==================== Hook ====================

/**
 * Hook to access progress tracking data
 * 
 * @throws Error if used outside of ProgressTrackingProvider
 */
export const useProgressTracking = (): ProgressTrackingContextType => {
    const context = useContext(ProgressTrackingContext);

    if (context === undefined) {
        throw new Error('useProgressTracking must be used within a ProgressTrackingProvider');
    }

    return context;
};

// ==================== Export ====================

export default ProgressTrackingContext;
