/**
 * Enhanced Session Tracking Utility
 * 
 * Ensures ALL study activities are properly logged to session history.
 * This fixes the critical gap where exam and flashcard sessions weren't being saved.
 */

import { saveStudySession } from './storage';

// ==================== Types ====================

export interface SessionData {
    categoryId: string;
    questionsAttempted: number;
    questionsCorrect: number;
    timeSpent: number; // in seconds
    mode: 'quiz' | 'exam' | 'flashcards' | 'mistake_bank' | 'bookmarks';
}

// ==================== Core Tracking Function ====================

/**
 * Universal session tracker - use this everywhere to ensure consistency
 * 
 * @param data - Session data to save
 * @returns Promise that resolves when session is saved
 */
export const trackSession = async (data: SessionData): Promise<void> => {
    try {
        await saveStudySession({
            date: new Date().toISOString(),
            categoryId: data.categoryId,
            questionsAttempted: data.questionsAttempted,
            questionsCorrect: data.questionsCorrect,
            timeSpent: data.timeSpent,
            mode: data.mode
        });

        console.log(`[SessionTracking] ✅ Saved ${data.mode} session for ${data.categoryId}:`, {
            questions: `${data.questionsCorrect}/${data.questionsAttempted}`,
            time: `${data.timeSpent}s`,
            accuracy: `${((data.questionsCorrect / data.questionsAttempted) * 100).toFixed(1)}%`
        });
    } catch (error) {
        console.error('[SessionTracking] ❌ Failed to save session:', error);
        // Don't throw - we don't want to break the user flow if tracking fails
    }
};

// ==================== Specialized Tracking Functions ====================

/**
 * Track exam completion
 * 
 * @param score - Number of correct answers
 * @param total - Total number of questions
 * @param timeSpent - Time spent in seconds
 */
export const trackExamSession = async (
    score: number,
    total: number,
    timeSpent: number
): Promise<void> => {
    await trackSession({
        categoryId: 'exam_simulator',
        questionsAttempted: total,
        questionsCorrect: score,
        timeSpent,
        mode: 'exam'
    });
};

/**
 * Track flashcard study session
 * 
 * @param categoryId - Category being studied
 * @param cardsReviewed - Number of cards reviewed
 * @param cardsMastered - Number of cards marked as mastered
 * @param timeSpent - Time spent in seconds
 */
export const trackFlashcardSession = async (
    categoryId: string,
    cardsReviewed: number,
    cardsMastered: number,
    timeSpent: number
): Promise<void> => {
    await trackSession({
        categoryId,
        questionsAttempted: cardsReviewed,
        questionsCorrect: cardsMastered,
        timeSpent,
        mode: 'flashcards'
    });
};

/**
 * Track quiz session (standard quiz mode)
 * 
 * @param categoryId - Category being studied
 * @param score - Number of correct answers
 * @param total - Total number of questions
 * @param timeSpent - Time spent in seconds
 * @param mode - Quiz mode (quiz, mistake_bank, bookmarks)
 */
export const trackQuizSession = async (
    categoryId: string,
    score: number,
    total: number,
    timeSpent: number,
    mode: 'quiz' | 'mistake_bank' | 'bookmarks' = 'quiz'
): Promise<void> => {
    await trackSession({
        categoryId,
        questionsAttempted: total,
        questionsCorrect: score,
        timeSpent,
        mode
    });
};

// ==================== Helper Functions ====================

/**
 * Calculate time spent from start timestamp
 * 
 * @param startTime - Timestamp when activity started (Date.now())
 * @returns Time spent in seconds
 */
export const calculateTimeSpent = (startTime: number): number => {
    const endTime = Date.now();
    const milliseconds = endTime - startTime;
    return Math.floor(milliseconds / 1000);
};

/**
 * Create a time tracker that can be started and stopped
 * 
 * @returns Object with start() and getElapsed() methods
 */
export const createTimeTracker = () => {
    let startTime: number | null = null;

    return {
        start: () => {
            startTime = Date.now();
        },
        getElapsed: (): number => {
            if (startTime === null) {
                console.warn('[SessionTracking] Timer not started');
                return 0;
            }
            return calculateTimeSpent(startTime);
        },
        reset: () => {
            startTime = null;
        }
    };
};

// ==================== Validation ====================

/**
 * Validate session data before saving
 * 
 * @param data - Session data to validate
 * @returns true if valid, false otherwise
 */
export const validateSessionData = (data: SessionData): boolean => {
    if (!data.categoryId || data.categoryId.trim() === '') {
        console.error('[SessionTracking] Invalid categoryId');
        return false;
    }

    if (data.questionsAttempted < 0 || data.questionsCorrect < 0) {
        console.error('[SessionTracking] Invalid question counts');
        return false;
    }

    if (data.questionsCorrect > data.questionsAttempted) {
        console.error('[SessionTracking] Correct answers cannot exceed attempted');
        return false;
    }

    if (data.timeSpent < 0) {
        console.error('[SessionTracking] Invalid time spent');
        return false;
    }

    return true;
};

// ==================== Export ====================

export default {
    trackSession,
    trackExamSession,
    trackFlashcardSession,
    trackQuizSession,
    calculateTimeSpent,
    createTimeTracker,
    validateSessionData
};
