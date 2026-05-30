import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../types/quiz';

const AI_CACHE_KEY = '@cdl_ai_cache';

export async function saveDynamicQuestions(questions: Question[]): Promise<void> {
    try {
        const existingData = await AsyncStorage.getItem(AI_CACHE_KEY);
        let cache: Record<string, Question[]> = existingData ? JSON.parse(existingData) : {};
        
        // Group by category
        for (const q of questions) {
            if (!cache[q.categoryId]) cache[q.categoryId] = [];
            // Make sure we don't duplicate somehow
            if (!cache[q.categoryId].find(existing => existing.id === q.id)) {
                cache[q.categoryId].push(q);
            }
        }
        
        await AsyncStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Failed to save AI questions to cache', e);
    }
}

export async function getCachedDynamicQuestions(categoryId: string, maxCount: number = 5): Promise<Question[]> {
    try {
        const data = await AsyncStorage.getItem(AI_CACHE_KEY);
        if (!data) return [];
        
        const cache: Record<string, Question[]> = JSON.parse(data);
        const categoryQuestions = cache[categoryId] || [];
        
        // Randomly pick maxCount questions
        if (categoryQuestions.length === 0) return [];
        
        const shuffled = categoryQuestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, maxCount);
    } catch (e) {
        console.error('Failed to get AI questions from cache', e);
        return [];
    }
}
