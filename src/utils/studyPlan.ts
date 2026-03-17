import { getCategories } from './dataLoader';
import { Category } from '../types/quiz';

export interface DailyTask {
    id: string;
    type: 'quiz' | 'flashcards' | 'review';
    categoryId: string;
    title: string;
    description: string;
    completed: boolean;
    estimatedTime: number; // minutes
}

export interface StudyPlanDay {
    date: string; // ISO date string (YYYY-MM-DD)
    tasks: DailyTask[];
    isRestDay: boolean;
}

export const generateStudyPlan = (examDateStr: string): StudyPlanDay[] => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const categories = getCategories();
    const plan: StudyPlanDay[] = [];

    // Calculate total days
    const diffTime = Math.abs(examDate.getTime() - today.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If exam is in the past or today, return empty or simple plan
    if (totalDays <= 0) return [];

    let currentCategoryIndex = 0;

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Simple logic: 1 category per day, rotate through them
        // Every 7th day is a review/rest day
        const isRestDay = (i + 1) % 7 === 0;
        const tasks: DailyTask[] = [];

        if (!isRestDay) {
            const category = categories[currentCategoryIndex % categories.length];

            // Task 1: Flashcards
            tasks.push({
                id: `flashcards-${dateStr}-${category.id}`,
                type: 'flashcards',
                categoryId: category.id,
                title: `${category.name} Flashcards`,
                description: 'Review key concepts and terms.',
                completed: false,
                estimatedTime: 15
            });

            // Task 2: Quiz
            tasks.push({
                id: `quiz-${dateStr}-${category.id}`,
                type: 'quiz',
                categoryId: category.id,
                title: `${category.name} Practice Quiz`,
                description: 'Test your knowledge with 10 questions.',
                completed: false,
                estimatedTime: 20
            });

            currentCategoryIndex++;
        } else {
            // Review Day
            tasks.push({
                id: `review-${dateStr}`,
                type: 'review',
                categoryId: 'mistake_bank',
                title: 'Weekly Review',
                description: 'Go through your mistake bank and difficult topics.',
                completed: false,
                estimatedTime: 30
            });
        }

        plan.push({
            date: dateStr,
            tasks,
            isRestDay
        });
    }

    // Add Exam Day
    const examDateStrIso = examDate.toISOString().split('T')[0];
    plan.push({
        date: examDateStrIso,
        tasks: [{
            id: `exam-${examDateStrIso}`,
            type: 'quiz',
            categoryId: 'exam_simulator',
            title: 'The Big Day!',
            description: 'Good luck! You are ready.',
            completed: false,
            estimatedTime: 0
        }],
        isRestDay: false
    });

    return plan;
};
