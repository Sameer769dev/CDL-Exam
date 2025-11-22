import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getUserProgress,
    getHighScores,
    getWrongAnswers,
    getPremiumStatus,
    saveUserProgress,
    saveHighScore,
    addWrongAnswer as addWrongAnswerToStorage,
    removeWrongAnswer as removeWrongAnswerFromStorage,
    setPremiumStatus as setPremiumStatusInStorage,
    UserProgress,
    HighScores,
    WrongAnswers,
    getBookmarkedQuestions,
    toggleBookmark as toggleBookmarkInStorage,
    saveStudySession,
    getStudySessions,
    getStudyStreak,
    getReminderSettings,
    saveReminderSettings,
    ReminderSettings
} from '../utils/storage';
import { checkPurchaseStatus, purchasePremium, restorePurchases as restoreBillingPurchases } from '../utils/billing';
import { setUserPremiumStatus } from '../utils/analytics';
import { registerForPushNotificationsAsync, scheduleDailyReminder, cancelAllNotifications } from '../utils/notifications';

interface UserContextType {
    isPremium: boolean;
    progress: UserProgress;
    highScores: HighScores;
    mistakeBank: WrongAnswers;
    isLoading: boolean;
    unlockPremium: () => Promise<void>;
    restorePurchases: () => Promise<boolean>;
    updateProgress: (categoryId: string, attempted: number, correct: number) => Promise<void>;
    saveScore: (categoryId: string, score: number, total: number) => Promise<void>;
    addToMistakeBank: (categoryId: string, questionId: number) => Promise<void>;
    removeFromMistakeBank: (categoryId: string, questionId: number) => Promise<void>;
    refreshData: () => Promise<void>;
    bookmarks: number[];
    toggleBookmark: (questionId: number) => Promise<void>;
    isBookmarked: (questionId: number) => boolean;
    reminderEnabled: boolean;
    reminderTime: Date;
    updateReminderSettings: (enabled: boolean, time: Date) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [progress, setProgress] = useState<UserProgress>({});
    const [highScores, setHighScores] = useState<HighScores>({});
    const [mistakeBank, setMistakeBank] = useState<WrongAnswers>({});
    const [bookmarks, setBookmarks] = useState<number[]>([]);
    const [studySessions, setStudySessions] = useState<any[]>([]);
    const [studyStreak, setStudyStreak] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Check Google Play Billing status
            const hasPurchasedPremium = await checkPurchaseStatus();

            const [
                localPremium,
                userProgress,
                scores,
                mistakes,
                savedBookmarks,
                sessions,
                streakData,
                reminderData
            ] = await Promise.all([
                getPremiumStatus(),
                getUserProgress(),
                getHighScores(),
                getWrongAnswers(),
                getBookmarkedQuestions(),
                getStudySessions(),
                getStudyStreak(),
                getReminderSettings()
            ]);

            // Migration: Check both Google Play and local storage (for RevenueCat users)
            // After migration period, you can remove the localPremium check
            const isPremiumUser = hasPurchasedPremium || localPremium;

            // Sync local storage with Google Play status
            if (hasPurchasedPremium && !localPremium) {
                await setPremiumStatusInStorage(true);
            }

            setIsPremium(isPremiumUser);

            // Track premium status in analytics
            setUserPremiumStatus(isPremiumUser);
            setProgress(userProgress);
            setHighScores(scores);
            setMistakeBank(mistakes);
            setBookmarks(savedBookmarks);
            setStudySessions(sessions);
            setStudyStreak(streakData);

            setReminderEnabled(reminderData.enabled);
            setReminderTime(new Date(reminderData.time));

        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const unlockPremium = async () => {
        try {
            // Purchase premium via Google Play Billing
            const purchase = await purchasePremium();

            if (purchase) {
                // Purchase successful
                await setPremiumStatusInStorage(true);
                setIsPremium(true);
                setUserPremiumStatus(true);
                console.log('[UserContext] Premium unlocked successfully');
            } else {
                // Purchase was cancelled
                console.log('[UserContext] Purchase cancelled by user');
            }
        } catch (error) {
            console.error('[UserContext] Purchase failed:', error);
            throw error;
        }
    };

    const restorePremiumPurchases = async () => {
        try {
            const restored = await restoreBillingPurchases();

            if (restored) {
                await setPremiumStatusInStorage(true);
                setIsPremium(true);
                setUserPremiumStatus(true);
                console.log('[UserContext] Purchases restored successfully');
                return true;
            } else {
                console.log('[UserContext] No purchases to restore');
                return false;
            }
        } catch (error) {
            console.error('[UserContext] Restore failed:', error);
            throw error;
        }
    };

    const updateProgress = async (categoryId: string, attempted: number, correct: number) => {
        const newProgress = {
            ...progress,
            [categoryId]: {
                questionsAttempted: attempted,
                questionsCorrect: correct,
                lastAttemptDate: new Date().toISOString()
            }
        };
        setProgress(newProgress);
        await saveUserProgress(newProgress);
    };

    const saveScore = async (categoryId: string, score: number, total: number) => {
        const percentage = (score / total) * 100;
        const currentHigh = highScores[categoryId];

        if (!currentHigh || percentage > currentHigh.percentage) {
            const newHighScores = {
                ...highScores,
                [categoryId]: {
                    score,
                    total,
                    percentage,
                    date: new Date().toISOString()
                }
            };
            setHighScores(newHighScores);
            await saveHighScore(categoryId, score, total);
        }
    };

    const addToMistakeBank = async (categoryId: string, questionId: number) => {
        const currentMistakes = mistakeBank[categoryId] || [];
        if (!currentMistakes.includes(questionId)) {
            const newMistakes = {
                ...mistakeBank,
                [categoryId]: [...currentMistakes, questionId]
            };
            setMistakeBank(newMistakes);
            await addWrongAnswerToStorage(categoryId, questionId);
        }
    };

    const removeFromMistakeBank = async (categoryId: string, questionId: number) => {
        const currentMistakes = mistakeBank[categoryId] || [];
        const newMistakes = {
            ...mistakeBank,
            [categoryId]: currentMistakes.filter(id => id !== questionId)
        };
        setMistakeBank(newMistakes);
        await removeWrongAnswerFromStorage(categoryId, questionId);
    };

    const toggleBookmark = async (questionId: number) => {
        const isNowBookmarked = await toggleBookmarkInStorage(questionId);
        if (isNowBookmarked) {
            setBookmarks([...bookmarks, questionId]);
        } else {
            setBookmarks(bookmarks.filter(id => id !== questionId));
        }
    };

    const isBookmarked = (questionId: number) => {
        return bookmarks.includes(questionId);
    };

    const updateReminderSettings = async (enabled: boolean, time: Date) => {
        setReminderEnabled(enabled);
        setReminderTime(time);

        await saveReminderSettings({ enabled, time: time.toISOString() });

        if (enabled) {
            const permission = await registerForPushNotificationsAsync();
            if (permission) {
                await scheduleDailyReminder(time.getHours(), time.getMinutes());
            } else {
                // If permission denied, revert state
                setReminderEnabled(false);
                await saveReminderSettings({ enabled: false, time: time.toISOString() });
                alert("Notification permissions are required for reminders.");
            }
        } else {
            await cancelAllNotifications();
        }
    };

    return (
        <UserContext.Provider value={{
            isPremium,
            progress,
            highScores,
            mistakeBank,
            isLoading,
            unlockPremium,
            restorePurchases: restorePremiumPurchases,
            updateProgress,
            saveScore,
            addToMistakeBank,
            removeFromMistakeBank,
            refreshData: loadData,
            bookmarks,
            toggleBookmark,
            isBookmarked,
            reminderEnabled,
            reminderTime,
            updateReminderSettings
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
