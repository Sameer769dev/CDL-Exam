import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
    USER_PROGRESS: '@cdl_prep:user_progress',
    HIGH_SCORES: '@cdl_prep:high_scores',
    WRONG_ANSWERS: '@cdl_prep:wrong_answers',
    UNLOCKED_CATEGORIES: '@cdl_prep:unlocked_categories',
    PREMIUM_STATUS: '@cdl_prep:premium_status',
    STUDY_SESSIONS: '@cdl_prep:study_sessions',
    STUDY_STREAK: '@cdl_prep:study_streak',
    BOOKMARKED_QUESTIONS: '@cdl_prep:bookmarked_questions',
    REMINDER_SETTINGS: '@cdl_prep:reminder_settings',
    THEME_PREFERENCE: '@cdl_prep:theme_preference',
    HAS_COMPLETED_ONBOARDING: '@cdl_prep:has_completed_onboarding',
} as const;

// Types
export interface UserProgress {
    [categoryId: string]: {
        questionsAttempted: number;
        questionsCorrect: number;
        lastAttemptDate: string;
    };
}

export interface HighScores {
    [categoryId: string]: {
        score: number;
        total: number;
        percentage: number;
        date: string;
    };
}

export interface WrongAnswers {
    [categoryId: string]: number[]; // Array of question IDs
}

export interface StudySession {
    id: string;
    date: string;
    categoryId: string;
    questionsAttempted: number;
    questionsCorrect: number;
    timeSpent: number; // in seconds
    mode: 'quiz' | 'flashcards' | 'exam' | 'mistake_bank';
}

export interface StudyStreak {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
}

export interface CategoryStats {
    categoryId: string;
    totalAttempted: number;
    totalCorrect: number;
    accuracy: number;
    lastAttemptDate: string;
    sessionsCount: number;
}

// User Progress
export const getUserProgress = async (): Promise<UserProgress> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error getting user progress:', error);
        return {};
    }
};

export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch (error) {
        console.error('Error saving user progress:', error);
    }
};

export const updateCategoryProgress = async (
    categoryId: string,
    questionsAttempted: number,
    questionsCorrect: number
): Promise<void> => {
    try {
        const progress = await getUserProgress();
        progress[categoryId] = {
            questionsAttempted,
            questionsCorrect,
            lastAttemptDate: new Date().toISOString(),
        };
        await saveUserProgress(progress);
    } catch (error) {
        console.error('Error updating category progress:', error);
    }
};

// High Scores
export const getHighScores = async (): Promise<HighScores> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error getting high scores:', error);
        return {};
    }
};

export const saveHighScore = async (
    categoryId: string,
    score: number,
    total: number
): Promise<void> => {
    try {
        const highScores = await getHighScores();
        const percentage = (score / total) * 100;

        // Only save if it's a new high score
        if (!highScores[categoryId] || percentage > highScores[categoryId].percentage) {
            highScores[categoryId] = {
                score,
                total,
                percentage,
                date: new Date().toISOString(),
            };
            await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(highScores));
        }
    } catch (error) {
        console.error('Error saving high score:', error);
    }
};

// Wrong Answers (Mistake Bank)
export const getWrongAnswers = async (): Promise<WrongAnswers> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.WRONG_ANSWERS);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error getting wrong answers:', error);
        return {};
    }
};

export const addWrongAnswer = async (categoryId: string, questionId: number): Promise<void> => {
    try {
        const wrongAnswers = await getWrongAnswers();
        if (!wrongAnswers[categoryId]) {
            wrongAnswers[categoryId] = [];
        }
        if (!wrongAnswers[categoryId].includes(questionId)) {
            wrongAnswers[categoryId].push(questionId);
            await AsyncStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers));
        }
    } catch (error) {
        console.error('Error adding wrong answer:', error);
    }
};

export const removeWrongAnswer = async (categoryId: string, questionId: number): Promise<void> => {
    try {
        const wrongAnswers = await getWrongAnswers();
        if (wrongAnswers[categoryId]) {
            wrongAnswers[categoryId] = wrongAnswers[categoryId].filter(id => id !== questionId);
            await AsyncStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers));
        }
    } catch (error) {
        console.error('Error removing wrong answer:', error);
    }
};

export const clearWrongAnswers = async (categoryId?: string): Promise<void> => {
    try {
        if (categoryId) {
            const wrongAnswers = await getWrongAnswers();
            delete wrongAnswers[categoryId];
            await AsyncStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers));
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.WRONG_ANSWERS);
        }
    } catch (error) {
        console.error('Error clearing wrong answers:', error);
    }
};

// Premium Status
export const getPremiumStatus = async (): Promise<boolean> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
        return data === 'true';
    } catch (error) {
        console.error('Error getting premium status:', error);
        return false;
    }
};

export const setPremiumStatus = async (isPremium: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, isPremium ? 'true' : 'false');
    } catch (error) {
        console.error('Error setting premium status:', error);
    }
};

// Unlocked Categories
export const getUnlockedCategories = async (): Promise<string[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_CATEGORIES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting unlocked categories:', error);
        return [];
    }
};

export const unlockCategory = async (categoryId: string): Promise<void> => {
    try {
        const unlocked = await getUnlockedCategories();
        if (!unlocked.includes(categoryId)) {
            unlocked.push(categoryId);
            await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_CATEGORIES, JSON.stringify(unlocked));
        }
    } catch (error) {
        console.error('Error unlocking category:', error);
    }
};

// Study Sessions
export const getStudySessions = async (): Promise<StudySession[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting study sessions:', error);
        return [];
    }
};

export const saveStudySession = async (session: Omit<StudySession, 'id'>): Promise<void> => {
    try {
        const sessions = await getStudySessions();
        const newSession: StudySession = {
            ...session,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        // Keep only last 100 sessions to avoid storage bloat
        const updatedSessions = [newSession, ...sessions].slice(0, 100);
        await AsyncStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updatedSessions));

        // Update study streak
        await updateStudyStreak();
    } catch (error) {
        console.error('Error saving study session:', error);
    }
};

export const getRecentSessions = async (days: number = 7): Promise<StudySession[]> => {
    try {
        const sessions = await getStudySessions();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return sessions.filter(session => new Date(session.date) >= cutoffDate);
    } catch (error) {
        console.error('Error getting recent sessions:', error);
        return [];
    }
};

// Study Streak
export const getStudyStreak = async (): Promise<StudyStreak> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_STREAK);
        return data ? JSON.parse(data) : {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: '',
        };
    } catch (error) {
        console.error('Error getting study streak:', error);
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: '',
        };
    }
};

const updateStudyStreak = async (): Promise<void> => {
    try {
        const streak = await getStudyStreak();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastDate = streak.lastStudyDate ? streak.lastStudyDate.split('T')[0] : '';

        if (lastDate === today) {
            // Already studied today, no change
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak: StudyStreak;

        if (lastDate === yesterdayStr) {
            // Consecutive day
            newStreak = {
                currentStreak: streak.currentStreak + 1,
                longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
                lastStudyDate: new Date().toISOString(),
            };
        } else {
            // Streak broken, start new
            newStreak = {
                currentStreak: 1,
                longestStreak: Math.max(streak.longestStreak, 1),
                lastStudyDate: new Date().toISOString(),
            };
        }

        await AsyncStorage.setItem(STORAGE_KEYS.STUDY_STREAK, JSON.stringify(newStreak));
    } catch (error) {
        console.error('Error updating study streak:', error);
    }
};

// Category Statistics
export const getCategoryStats = async (): Promise<CategoryStats[]> => {
    try {
        const sessions = await getStudySessions();
        const statsMap = new Map<string, CategoryStats>();

        sessions.forEach(session => {
            const existing = statsMap.get(session.categoryId);

            if (existing) {
                existing.totalAttempted += session.questionsAttempted;
                existing.totalCorrect += session.questionsCorrect;
                existing.sessionsCount += 1;
                existing.accuracy = (existing.totalCorrect / existing.totalAttempted) * 100;
                if (new Date(session.date) > new Date(existing.lastAttemptDate)) {
                    existing.lastAttemptDate = session.date;
                }
            } else {
                statsMap.set(session.categoryId, {
                    categoryId: session.categoryId,
                    totalAttempted: session.questionsAttempted,
                    totalCorrect: session.questionsCorrect,
                    accuracy: (session.questionsCorrect / session.questionsAttempted) * 100,
                    lastAttemptDate: session.date,
                    sessionsCount: 1,
                });
            }
        });

        return Array.from(statsMap.values());
    } catch (error) {
        console.error('Error getting category stats:', error);
        return [];
    }
};

// Overall Statistics
export interface OverallStats {
    totalQuestionsAttempted: number;
    totalQuestionsCorrect: number;
    overallAccuracy: number;
    totalSessions: number;
    totalTimeSpent: number;
    categoriesStudied: number;
}

export const getOverallStats = async (): Promise<OverallStats> => {
    try {
        const sessions = await getStudySessions();

        if (sessions.length === 0) {
            return {
                totalQuestionsAttempted: 0,
                totalQuestionsCorrect: 0,
                overallAccuracy: 0,
                totalSessions: 0,
                totalTimeSpent: 0,
                categoriesStudied: 0,
            };
        }

        const totalAttempted = sessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
        const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
        const uniqueCategories = new Set(sessions.map(s => s.categoryId)).size;

        return {
            totalQuestionsAttempted: totalAttempted,
            totalQuestionsCorrect: totalCorrect,
            overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
            totalSessions: sessions.length,
            totalTimeSpent: totalTime,
            categoriesStudied: uniqueCategories,
        };
    } catch (error) {
        console.error('Error getting overall stats:', error);
        return {
            totalQuestionsAttempted: 0,
            totalQuestionsCorrect: 0,
            overallAccuracy: 0,
            totalSessions: 0,
            totalTimeSpent: 0,
            categoriesStudied: 0,
        };
    }
};

// Bookmarked Questions
export const getBookmarkedQuestions = async (): Promise<number[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting bookmarked questions:', error);
        return [];
    }
};

export const toggleBookmark = async (questionId: number): Promise<boolean> => {
    try {
        const bookmarks = await getBookmarkedQuestions();
        const index = bookmarks.indexOf(questionId);
        let isBookmarked = false;

        if (index >= 0) {
            // Remove bookmark
            bookmarks.splice(index, 1);
            isBookmarked = false;
        } else {
            // Add bookmark
            bookmarks.push(questionId);
            isBookmarked = true;
        }

        await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS, JSON.stringify(bookmarks));
        return isBookmarked;
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return false;
    }
};

export const isBookmarked = async (questionId: number): Promise<boolean> => {
    try {
        const bookmarks = await getBookmarkedQuestions();
        return bookmarks.includes(questionId);
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return false;
    }
};

// Reminder Settings
export interface ReminderSettings {
    enabled: boolean;
    time: string; // ISO string
}

export const getReminderSettings = async (): Promise<ReminderSettings> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
        return data ? JSON.parse(data) : { enabled: false, time: new Date().toISOString() };
    } catch (error) {
        console.error('Error getting reminder settings:', error);
        return { enabled: false, time: new Date().toISOString() };
    }
};

export const saveReminderSettings = async (settings: ReminderSettings): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving reminder settings:', error);
    }
};

// Theme Preference
export type ThemePreference = 'light' | 'dark' | 'system';

export const getThemePreference = async (): Promise<ThemePreference> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
        return (data as ThemePreference) || 'system';
    } catch (error) {
        console.error('Error getting theme preference:', error);
        return 'system';
    }
};

export const saveThemePreference = async (theme: ThemePreference): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
    } catch (error) {
        console.error('Error saving theme preference:', error);
    }
};

// ==================== Onboarding ====================

export const getHasCompletedOnboarding = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
        return value === 'true';
    } catch (error) {
        console.error('Error getting onboarding status:', error);
        return false;
    }
};

export const setHasCompletedOnboarding = async (completed: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, completed.toString());
    } catch (error) {
        console.error('Error saving onboarding status:', error);
    }
};

// Clear all data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
        console.error('Error clearing all data:', error);
    }
};
