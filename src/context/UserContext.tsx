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
    ReminderSettings,
    getFlashcardProgress,
    updateFlashcardProgress as updateFlashcardProgressInStorage,
    FlashcardProgress,
    StudySession,
    StudyStreak,
    ActiveSession,
    CategoryCompletion,
    getActiveSession,
    saveActiveSession,
    clearActiveSession,
    getCategoryCompletion,
    updateCategoryCompletion,
    getUserProfile,
    saveUserProfile,
    getDailyGoal,
    saveDailyGoal,
    UserProfile,
    DailyGoal,
    getHasCompletedOnboarding,
    getExamCredits,
    addExamCredit,
    useExamCredit,
    getQuestionMastery,
    saveQuestionMastery,
    QuestionMastery
} from '../utils/storage';
import { checkPurchaseStatus, purchaseProduct, restorePurchases as restoreBillingPurchases, PRODUCT_IDS, SubscriptionType } from '../utils/billing';
import { setUserPremiumStatus } from '../utils/analytics';
import { registerForPushNotificationsAsync, scheduleReminders, cancelAllNotifications } from '../utils/notifications';

interface UserContextType {
    isPremium: boolean;
    subscriptionType: SubscriptionType;
    examCredits: number;
    progress: UserProgress;
    flashcardProgress: FlashcardProgress;
    highScores: HighScores;
    mistakeBank: WrongAnswers;
    isLoading: boolean;
    unlockPremium: () => Promise<void>;
    purchaseExamAttempt: () => Promise<boolean>;
    spendExamCredit: () => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
    updateProgress: (categoryId: string, attempted: number, correct: number) => Promise<void>;
    updateFlashcardProgress: (categoryId: string, reviewed: number, mastered: number) => Promise<void>;
    saveScore: (categoryId: string, score: number, total: number) => Promise<void>;
    addToMistakeBank: (categoryId: string, questionId: number | string) => Promise<void>;
    removeFromMistakeBank: (categoryId: string, questionId: number | string) => Promise<void>;
    refreshData: () => Promise<void>;
    bookmarks: (number | string)[];
    toggleBookmark: (questionId: number | string) => Promise<void>;
    isBookmarked: (questionId: number | string) => boolean;
    reminderEnabled: boolean;
    reminderTimes: Date[];
    updateReminderSettings: (enabled: boolean, times: Date[]) => Promise<void>;
    studySessions: StudySession[];
    studyStreak: StudyStreak;
    trackSession: (data: any) => Promise<void>;
    activeSession: ActiveSession | null;
    syncActiveSession: (session: ActiveSession) => Promise<void>;
    finishActiveSession: () => Promise<void>;
    getSmartQuestions: (categoryId: string, allQuestions: any[], count: number) => Promise<any[]>;
    userProfile: UserProfile | null;
    updateUserProfile: (profile: UserProfile) => Promise<void>;
    dailyGoal: DailyGoal;
    updateDailyGoal: (goal: DailyGoal) => Promise<void>;
    hasCompletedOnboarding: boolean;
    questionMastery: QuestionMastery;
    updateQuestionMastery: (questionId: number | string, isCorrect: boolean) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('none');
    const [progress, setProgress] = useState<UserProgress>({});
    const [flashcardProgress, setFlashcardProgress] = useState<FlashcardProgress>({});
    const [highScores, setHighScores] = useState<HighScores>({});
    const [mistakeBank, setMistakeBank] = useState<WrongAnswers>({});
    const [bookmarks, setBookmarks] = useState<number[]>([]);
    const [studySessions, setStudySessions] = useState<any[]>([]);
    const [studyStreak, setStudyStreak] = useState<any>(null);
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [categoryCompletion, setCategoryCompletion] = useState<CategoryCompletion>({});
    const [isLoading, setIsLoading] = useState(true);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTimes, setReminderTimes] = useState<Date[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ questionsPerDay: 10, lastUpdated: new Date().toISOString() });
    const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);
    const [examCredits, setExamCredits] = useState(0);
    const [questionMastery, setQuestionMastery] = useState<QuestionMastery>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Check Google Play Billing status
            const subType = await checkPurchaseStatus();
            const hasPurchasedPremium = subType !== 'none';

            const [
                localPremium,
                userProgress,
                flashcards,
                scores,
                mistakes,
                savedBookmarks,
                sessions,
                streakData,
                reminderData,
                savedSession,
                completionData,
                userProfileData,
                dailyGoalData,
                onboardingStatus,
                credits,
                lastMonthlyGrant,
                questionMasteryData
            ] = await Promise.all([
                getPremiumStatus(),
                getUserProgress(),
                getFlashcardProgress(),
                getHighScores(),
                getWrongAnswers(),
                getBookmarkedQuestions(),
                getStudySessions(),
                getStudyStreak(),
                getReminderSettings(),
                getActiveSession(),
                getCategoryCompletion(),
                getUserProfile(),
                getDailyGoal(),
                getHasCompletedOnboarding(),
                getExamCredits(),
                import('../utils/storage').then(m => m.getLastMonthlyGrantDate()),
                getQuestionMastery()
            ]);

            // Migration: Check both Google Play and local storage (for RevenueCat users)
            // After migration period, you can remove the localPremium check
            const isPremiumUser = hasPurchasedPremium || localPremium;

            // Sync local storage with Google Play status
            if (hasPurchasedPremium && !localPremium) {
                await setPremiumStatusInStorage(true);
            }

            setIsPremium(isPremiumUser);
            setSubscriptionType(subType);

            // Handle Monthly Credits
            let currentCredits = credits;
            if (subType === 'monthly') {
                const now = new Date();
                const lastGrant = lastMonthlyGrant ? new Date(lastMonthlyGrant) : null;

                // Grant if never granted or > 30 days ago
                if (!lastGrant || (now.getTime() - lastGrant.getTime() > 30 * 24 * 60 * 60 * 1000)) {
                    const { addExamCredit, setLastMonthlyGrantDate } = await import('../utils/storage');
                    await addExamCredit(10); // Grant 10 credits
                    await setLastMonthlyGrantDate(now.toISOString());
                    currentCredits += 10;
                    console.log('Granted monthly exam credits');
                }
            }

            // Track premium status in analytics
            setUserPremiumStatus(isPremiumUser);
            setProgress(userProgress);
            setFlashcardProgress(flashcards);
            setHighScores(scores);
            setMistakeBank(mistakes);
            setBookmarks(savedBookmarks);
            setStudySessions(sessions);
            setStudyStreak(streakData);
            setActiveSession(savedSession);
            setCategoryCompletion(completionData);
            setUserProfile(userProfileData || null);
            setDailyGoal(dailyGoalData || { questionsPerDay: 10, lastUpdated: new Date().toISOString() });
            setHasCompletedOnboardingState(!!onboardingStatus);
            setExamCredits(currentCredits);
            setQuestionMastery(questionMasteryData || {});

            setReminderEnabled(reminderData.enabled);
            setReminderTimes(reminderData.times.map(t => new Date(t)));

        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const unlockPremium = async () => {
        try {
            // Get the premium product first
            const { getPremiumProduct } = await import('../utils/billing');
            const product = await getPremiumProduct();

            if (!product) {
                throw new Error('Premium product not available');
            }

            const initialPremium = await import('../utils/storage').then(m => m.getPremiumStatus());

            // Purchase premium via Google Play Billing
            const requestSent = await purchaseProduct(product);
            
            if (!requestSent) {
                throw new Error('Purchase cancelled or failed');
            }

            // Wait for the background billing listener to process the transaction and update storage
            return new Promise<void>((resolve, reject) => {
                let attempts = 0;
                const interval = setInterval(async () => {
                    attempts++;
                    const currentPremium = await import('../utils/storage').then(m => m.getPremiumStatus());
                    
                    if (currentPremium && !initialPremium) {
                        clearInterval(interval);
                        setIsPremium(true);
                        setUserPremiumStatus(true);
                        resolve();
                    } else if (attempts > 60) { // 2 minutes max
                        clearInterval(interval);
                        reject(new Error('Purchase timed out. If you were charged, try restarting the app.'));
                    }
                }, 2000);
            });

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

                return true;
            } else {

                return false;
            }
        } catch (error) {
            console.error('[UserContext] Restore failed:', error);
            throw error;
        }
    };

    const updateProgress = async (categoryId: string, questionsAnswered: number, correctAnswers: number) => {
        // Get existing progress or default to 0
        const existing = progress[categoryId] || { questionsAttempted: 0, questionsCorrect: 0 };

        // Use Math.max to ensure progress only increases (never decreases)
        const newProgress = {
            ...progress,
            [categoryId]: {
                questionsAttempted: Math.max(existing.questionsAttempted, questionsAnswered),
                questionsCorrect: Math.max(existing.questionsCorrect, correctAnswers),
                lastAttemptDate: new Date().toISOString()
            }
        };
        setProgress(newProgress);
        await saveUserProgress(newProgress);
    };

    const updateFlashcardProgress = async (categoryId: string, cardsReviewed: number, cardsMastered: number) => {
        await updateFlashcardProgressInStorage(categoryId, cardsReviewed, cardsMastered);
        // Reload to get updated progress
        const updated = await getFlashcardProgress();
        setFlashcardProgress(updated);
    };

    const updateQuestionMastery = async (questionId: number, isCorrect: boolean) => {
        const existing = questionMastery[questionId] || { attempts: 0, correct: 0, lastSeen: new Date().toISOString(), difficulty: 'new' };
        
        const attempts = existing.attempts + 1;
        const correct = existing.correct + (isCorrect ? 1 : 0);
        const accuracy = attempts > 0 ? (correct / attempts) : 0;
        
        let difficulty: 'new' | 'learning' | 'mastered' = 'learning';
        
        if (attempts >= 3 && accuracy >= 0.8) {
            difficulty = 'mastered';
        } else if (attempts === 0) {
            difficulty = 'new';
        }
        
        const newMasteryState = {
            ...questionMastery,
            [questionId]: {
                attempts,
                correct,
                lastSeen: new Date().toISOString(),
                difficulty
            }
        };
        
        setQuestionMastery(newMasteryState);
        await saveQuestionMastery(newMasteryState);
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

    const addToMistakeBank = async (categoryId: string, questionId: number | string) => {
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

    const removeFromMistakeBank = async (categoryId: string, questionId: number | string) => {
        const currentMistakes = mistakeBank[categoryId] || [];
        const newMistakes = {
            ...mistakeBank,
            [categoryId]: currentMistakes.filter(id => id !== questionId)
        };
        setMistakeBank(newMistakes);
        await removeWrongAnswerFromStorage(categoryId, questionId);
    };

    const toggleBookmark = async (questionId: number | string) => {
        console.log('[UserContext] Toggle bookmark called for question:', questionId);
        console.log('[UserContext] Current bookmarks state:', bookmarks);

        // Optimistic Update: Update UI immediately
        const isCurrentlyBookmarked = bookmarks.includes(questionId);
        let newBookmarks;

        if (isCurrentlyBookmarked) {
            newBookmarks = bookmarks.filter(id => id !== questionId);
            console.log('[UserContext] Removing bookmark, new array:', newBookmarks);
        } else {
            newBookmarks = [...bookmarks, questionId];
            console.log('[UserContext] Adding bookmark, new array:', newBookmarks);
        }

        setBookmarks(newBookmarks);

        // Perform storage operation in background
        try {
            const result = await toggleBookmarkInStorage(questionId);
            console.log('[UserContext] Storage operation result:', result);
        } catch (error) {
            console.error("[UserContext] Failed to save bookmark, reverting UI", error);
            // Revert on failure
            setBookmarks(bookmarks);
        }
    };

    const isBookmarked = (questionId: number | string) => {
        return bookmarks.includes(questionId);
    };

    const updateReminderSettings = async (enabled: boolean, times: Date[]) => {
        setReminderEnabled(enabled);
        setReminderTimes(times);

        await saveReminderSettings({ enabled, times: times.map(t => t.toISOString()) });

        if (enabled && times.length > 0) {
            const permission = await registerForPushNotificationsAsync();
            if (permission) {
                await scheduleReminders(times);
            } else {
                // If permission denied, revert state
                setReminderEnabled(false);
                await saveReminderSettings({ enabled: false, times: times.map(t => t.toISOString()) });
                alert("Notification permissions are required for reminders.");
            }
        } else {
            await cancelAllNotifications();
        }
    };

    const trackSession = async (data: any) => {
        // Ensure date is present
        const sessionData = {
            ...data,
            date: data.date || new Date().toISOString()
        };

        // 1. Save to storage
        await saveStudySession(sessionData);

        // 2. Update local state (append new session)
        const newSession = { ...sessionData, id: Date.now().toString() };
        setStudySessions(prev => [newSession, ...prev]);

        // 3. Update Streak
        const newStreak = await getStudyStreak();
        setStudyStreak(newStreak);

        // 4. Update Category Completion (if applicable)
        if (data.questionsCorrect > 0 && data.mode !== 'exam') {
            // Note: This assumes we have the IDs of correct questions. 
            // Since trackSession interface is generic, we might need to handle this separately 
            // or pass IDs in data. For now, we rely on finishActiveSession to handle completion.
        }
    };

    const syncActiveSession = async (session: ActiveSession) => {
        setActiveSession(session);
        await saveActiveSession(session);
    };

    const finishActiveSession = async () => {
        if (activeSession) {
            // Identify correctly answered questions
            const correctIds = Object.entries(activeSession.answers)
                .filter(([_, isCorrect]) => isCorrect)
                .map(([id]) => parseInt(id));

            if (correctIds.length > 0) {
                await updateCategoryCompletion(activeSession.categoryId, correctIds);

                // Update local state
                const completion = await getCategoryCompletion();
                setCategoryCompletion(completion);
            }

            // Clear session
            await clearActiveSession();
            setActiveSession(null);
        }
    };

    const getSmartQuestions = async (categoryId: string, allQuestions: any[], count: number) => {
        // 1. Check for active session first
        if (activeSession && activeSession.categoryId === categoryId) {
            // Return questions in the saved order
            const sessionQuestions = allQuestions.filter(q => activeSession.questionIds.includes(q.id));
            sessionQuestions.sort((a, b) => {
                return activeSession.questionIds.indexOf(a.id) - activeSession.questionIds.indexOf(b.id);
            });
            return sessionQuestions;
        }

        // 2. Adaptive Difficulty / Spaced Repetition Logic
        // We categorize questions based on their mastery level.
        const categorized = {
            new: [] as any[],
            learning: [] as any[],
            mastered: [] as any[]
        };
        
        allQuestions.forEach(q => {
            const mastery = questionMastery[q.id];
            if (!mastery || mastery.difficulty === 'new') {
                categorized.new.push(q);
            } else if (mastery.difficulty === 'learning') {
                categorized.learning.push(q);
            } else {
                categorized.mastered.push(q);
            }
        });
        
        // Shuffle each bucket
        const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
        shuffle(categorized.new);
        shuffle(categorized.learning);
        shuffle(categorized.mastered);
        
        let selected: any[] = [];
        
        // Strategy: 
        // 50% from 'learning' (things user is struggling with)
        // 40% from 'new' (unseen questions)
        // 10% from 'mastered' (review/reinforcement)
        
        const targetLearning = Math.floor(count * 0.5);
        const targetNew = Math.floor(count * 0.4);
        
        // Try to fill learning bucket
        selected.push(...categorized.learning.splice(0, targetLearning));
        
        // Try to fill new bucket
        selected.push(...categorized.new.splice(0, targetNew));
        
        // Fill remainder with whatever is available, prioritizing learning -> new -> mastered
        while (selected.length < count) {
            if (categorized.learning.length > 0) {
                selected.push(categorized.learning.shift());
            } else if (categorized.new.length > 0) {
                selected.push(categorized.new.shift());
            } else if (categorized.mastered.length > 0) {
                selected.push(categorized.mastered.shift());
            } else {
                break; // No more questions
            }
        }
        
        // Final shuffle so the distribution isn't predictable
        return shuffle(selected);
    };

    const updateUserProfile = async (profile: UserProfile) => {
        setUserProfile(profile);
        await saveUserProfile(profile);
    };

    const updateDailyGoal = async (goal: DailyGoal) => {
        setDailyGoal(goal);
        await saveDailyGoal(goal);
    };

    const purchaseExamAttempt = async (): Promise<boolean> => {
        try {
            const { getAvailableProducts } = await import('../utils/billing');
            const products = await getAvailableProducts();
            const product = products.find(p => ((p as any).productId || (p as any).id) === PRODUCT_IDS.EXAM_ATTEMPT);

            if (!product) {
                console.error('Exam attempt product not found');
                return false;
            }

            const initialCredits = await import('../utils/storage').then(m => m.getExamCredits());

            const requestSent = await purchaseProduct(product);
            
            if (!requestSent) {
                return false; // User cancelled or error
            }

            // Wait for the background billing listener to process the transaction and update storage
            return new Promise<boolean>((resolve) => {
                let attempts = 0;
                const interval = setInterval(async () => {
                    attempts++;
                    const currentCredits = await import('../utils/storage').then(m => m.getExamCredits());
                    
                    if (currentCredits > initialCredits) {
                        clearInterval(interval);
                        setExamCredits(currentCredits);
                        resolve(true);
                    } else if (attempts > 60) { // 2 minutes max
                        clearInterval(interval);
                        console.error('Purchase timed out');
                        resolve(false);
                    }
                }, 2000);
            });
            
        } catch (error) {
            console.error('Error purchasing exam attempt:', error);
            return false;
        }
    };

    const spendExamCredit = async (): Promise<boolean> => {
        const success = await useExamCredit();
        if (success) {
            setExamCredits(prev => Math.max(0, prev - 1));
        }
        return success;
    };

    return (
        <UserContext.Provider value={{
            isPremium,
            progress,
            flashcardProgress,
            highScores,
            mistakeBank,
            isLoading,
            unlockPremium,
            restorePurchases: restorePremiumPurchases,
            updateProgress,
            updateFlashcardProgress,
            saveScore,
            addToMistakeBank,
            removeFromMistakeBank,
            refreshData: loadData,
            bookmarks,
            toggleBookmark,
            isBookmarked,
            reminderEnabled,
            reminderTimes,
            updateReminderSettings,
            studySessions,
            studyStreak,
            trackSession,
            activeSession,
            syncActiveSession,
            finishActiveSession,
            getSmartQuestions,
            userProfile,
            updateUserProfile,
            dailyGoal,
            updateDailyGoal,
            hasCompletedOnboarding,
            subscriptionType,
            examCredits,
            purchaseExamAttempt,
            spendExamCredit,
            questionMastery,
            updateQuestionMastery
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
