/**
 * useWeakAreas Hook
 * 
 * Provides access to identified weak areas and personalized recommendations.
 */

import { useProgressTracking } from '../context/ProgressTrackingContext';

export const useWeakAreas = () => {
    const { weakAreas, insights, isLoading } = useProgressTracking();

    return {
        // Weak areas data
        weakAreas,

        // Categorized by priority
        highPriority: weakAreas.filter(w => w.priority === 'high'),
        mediumPriority: weakAreas.filter(w => w.priority === 'medium'),
        lowPriority: weakAreas.filter(w => w.priority === 'low'),

        // Insights
        recommendations: insights.recommendedActions,
        readinessScore: Math.round(insights.readinessScore),
        passProbability: Math.round(insights.estimatedPassProbability),
        studyConsistency: Math.round(insights.studyConsistency),

        // Category insights
        strongestCategory: insights.strongestCategory,
        weakestCategory: insights.weakestCategory,

        // State
        isLoading,

        // Computed helpers
        hasWeakAreas: weakAreas.length > 0,
        needsAttention: weakAreas.filter(w => w.priority === 'high').length > 0,
        totalWeakAreas: weakAreas.length,

        // Readiness assessment
        isReady: insights.readinessScore >= 80,
        readinessLevel: getReadinessLevel(insights.readinessScore),

        // Get specific weak area
        getWeakArea: (categoryId: string) =>
            weakAreas.find(w => w.categoryId === categoryId),

        // Check if category is weak
        isWeakCategory: (categoryId: string) =>
            weakAreas.some(w => w.categoryId === categoryId)
    };
};

/**
 * Helper to determine readiness level
 */
const getReadinessLevel = (score: number): 'not-ready' | 'needs-work' | 'almost-ready' | 'ready' => {
    if (score >= 80) return 'ready';
    if (score >= 65) return 'almost-ready';
    if (score >= 50) return 'needs-work';
    return 'not-ready';
};
