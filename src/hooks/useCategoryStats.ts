/**
 * useCategoryStats Hook
 * 
 * Provides access to category-specific performance data.
 * Can be used for a single category or all categories.
 */

import { useProgressTracking } from '../context/ProgressTrackingContext';
import { CategoryPerformance } from '../types/progress';

/**
 * Get statistics for a specific category
 */
export const useCategoryStats = (categoryId?: string) => {
    const {
        categoryPerformances,
        getCategoryPerformance,
        isLoading
    } = useProgressTracking();

    // Single category mode
    if (categoryId) {
        const performance = getCategoryPerformance(categoryId);

        return {
            performance,
            isLoading,
            hasData: performance !== undefined && performance.questionsAttempted > 0,
            accuracy: performance ? Math.round(performance.accuracy) : 0,
            highScore: performance ? Math.round(performance.highScore) : 0,
            mistakeCount: performance?.mistakeCount || 0,
            trend: performance?.trend || 'stable'
        };
    }

    // All categories mode
    return {
        performances: categoryPerformances,
        isLoading,

        // Sorted lists
        byAccuracy: [...categoryPerformances]
            .filter(p => p.questionsAttempted > 0)
            .sort((a, b) => b.accuracy - a.accuracy),

        byProgress: [...categoryPerformances]
            .filter(p => p.questionsAttempted > 0)
            .sort((a, b) => b.questionsAttempted - a.questionsAttempted),

        byRecent: [...categoryPerformances]
            .filter(p => p.lastAttemptDate)
            .sort((a, b) =>
                new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime()
            ),

        // Aggregates
        totalCategories: categoryPerformances.length,
        studiedCategories: categoryPerformances.filter(p => p.questionsAttempted > 0).length,
        masteredCategories: categoryPerformances.filter(p => p.accuracy >= 90).length,
        improvingCategories: categoryPerformances.filter(p => p.trend === 'improving').length
    };
};
