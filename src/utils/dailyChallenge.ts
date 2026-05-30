import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllQuestions } from './dataLoader';
import { Question } from '../types/quiz';

const DAILY_CHALLENGE_STREAK_KEY = 'cdl_daily_challenge_streak';
const DAILY_CHALLENGE_LAST_PLAYED_KEY = 'cdl_daily_challenge_last_played';

// Generate a deterministic seed based on date string (YYYY-MM-DD)
function seededRandom(seed: number) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export function getTodaysDailyChallengeKey(): string {
    const today = new Date();
    // YYYY-MM-DD
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
}

export function getDailyChallengeQuestions(): Question[] {
    const allQuestions = getAllQuestions();
    const todayKey = getTodaysDailyChallengeKey();
    
    // Create a numerical seed from the date string
    const numericSeed = todayKey.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    // Group questions by category to ensure variety
    const categories = Array.from(new Set(allQuestions.map(q => q.categoryId)));
    let challengeQuestions: Question[] = [];
    
    let currentSeed = numericSeed;
    
    // Pick 1-2 questions from each category
    categories.forEach(catId => {
        if (challengeQuestions.length >= 10) return;
        
        const catQuestions = allQuestions.filter(q => q.categoryId === catId);
        if (catQuestions.length > 0) {
            const r1 = seededRandom(currentSeed++);
            const idx1 = Math.floor(r1 * catQuestions.length);
            challengeQuestions.push(catQuestions[idx1]);
        }
    });
    
    // If we still need more, pick randomly from all
    while (challengeQuestions.length < 10 && allQuestions.length > 0) {
        const r = seededRandom(currentSeed++);
        const idx = Math.floor(r * allQuestions.length);
        const q = allQuestions[idx];
        if (!challengeQuestions.find(existing => existing.id === q.id)) {
            challengeQuestions.push(q);
        }
    }
    
    // Shuffle the final 10 deterministically
    for (let i = challengeQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(currentSeed++) * (i + 1));
        [challengeQuestions[i], challengeQuestions[j]] = [challengeQuestions[j], challengeQuestions[i]];
    }
    
    // We do NOT deterministically shuffle options here. 
    // They will be dynamically shuffled by the quiz component.
    return challengeQuestions.slice(0, 10);
}

export async function hasDailyChallengePlayed(key: string): Promise<boolean> {
    try {
        const lastPlayed = await AsyncStorage.getItem(DAILY_CHALLENGE_LAST_PLAYED_KEY);
        return lastPlayed === key;
    } catch (e) {
        return false;
    }
}

export async function getDailyChallengeStreak(): Promise<number> {
    try {
        const val = await AsyncStorage.getItem(DAILY_CHALLENGE_STREAK_KEY);
        return val ? parseInt(val) : 0;
    } catch (e) {
        return 0;
    }
}

export async function saveDailyChallengeResult(key: string, passed: boolean): Promise<number> {
    try {
        await AsyncStorage.setItem(DAILY_CHALLENGE_LAST_PLAYED_KEY, key);
        
        // If they played, we increment streak. If they missed a day, logic elsewhere resets it.
        // For simplicity, any play today maintains/increments streak.
        let streak = await getDailyChallengeStreak();
        
        // Very simple streak logic: if passed, increment.
        if (passed) {
            streak += 1;
        }
        
        await AsyncStorage.setItem(DAILY_CHALLENGE_STREAK_KEY, streak.toString());
        return streak;
    } catch (e) {
        return 0;
    }
}
