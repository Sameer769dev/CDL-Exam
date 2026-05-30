import { Category, Question } from '../types/quiz';

// ─── Option Shuffling ────────────────────────────────────────────────────────
// Randomises the order of answer options while keeping correct_answer unchanged
// (correct_answer is matched by string value, not index — so this is safe).
export function shuffleQuestionOptions(question: Question): Question {
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);
    return { ...question, options: shuffled };
}

// Shuffle an array of questions' options in one pass
export function shuffleAllOptions(questions: Question[]): Question[] {
    return questions.map(shuffleQuestionOptions);
}
import categoriesData from '../data/categories.json';
import airBrakesData from '../data/air_brakes_data.json';
import generalKnowledgeData from '../data/general_knowledge_data.json';
import hazmatData from '../data/hazmat_data.json';
import tankerData from '../data/tanker_data.json';
import doublesTriplesData from '../data/doubles_triples_data.json';
import passengerTransportData from '../data/passenger_transport_data.json';
import schoolBusData from '../data/school_bus_data.json';
import combinationVehiclesData from '../data/combination_vehicles_data.json';

// Load all categories
export const getCategories = (): Category[] => {
    return categoriesData as Category[];
};

// Get a specific category by ID
export const getCategoryById = (categoryId: string): Category | undefined => {
    return categoriesData.find((cat: any) => cat.id === categoryId) as Category | undefined;
};

// Load questions for a specific category
export const getQuestionsByCategory = (categoryId: string): Question[] => {
    switch (categoryId) {
        case 'air_brakes':
            return airBrakesData.map((q: any) => ({
                ...q,
                categoryId: 'air_brakes',
            })) as Question[];

        case 'general_knowledge':
            return generalKnowledgeData.map((q: any) => ({
                ...q,
                categoryId: 'general_knowledge',
            })) as Question[];

        case 'hazmat':
            return hazmatData.map((q: any) => ({
                ...q,
                categoryId: 'hazmat',
            })) as Question[];

        case 'tanker':
            return tankerData.map((q: any) => ({
                ...q,
                categoryId: 'tanker',
            })) as Question[];

        case 'doubles_triples':
            return doublesTriplesData.map((q: any) => ({
                ...q,
                categoryId: 'doubles_triples',
            })) as Question[];

        case 'passenger_transport':
            return passengerTransportData.map((q: any) => ({
                ...q,
                categoryId: 'passenger_transport',
            })) as Question[];

        case 'school_bus':
            return schoolBusData.map((q: any) => ({
                ...q,
                categoryId: 'school_bus',
            })) as Question[];

        case 'combination_vehicles':
            return combinationVehiclesData.map((q: any) => ({
                ...q,
                categoryId: 'combination_vehicles',
            })) as Question[];

        default:
            return [];
    }
};

// Get all questions across all categories
export const getAllQuestions = (): Question[] => {
    const categories = getCategories();
    return categories.flatMap(cat => getQuestionsByCategory(cat.id));
};

// Get questions by IDs (for mistake bank)
export const getQuestionsByIds = (categoryId: string, questionIds: (number | string)[]): Question[] => {
    const allQuestions = getQuestionsByCategory(categoryId);
    return allQuestions.filter(q => questionIds.includes(q.id as number));
};

// Check if a category is available (not premium or user has premium)
export const isCategoryAvailable = (
    category: Category,
    isPremium: boolean,
    unlockedCategories: string[]
): boolean => {
    if (!category.isPremium) {
        return true; // Free categories are always available
    }

    if (isPremium) {
        return true; // Premium users have access to everything
    }

    return unlockedCategories.includes(category.id); // Check if individually unlocked
};

// Get the number of questions a user can access in a category
export const getAccessibleQuestionCount = (
    category: Category,
    isPremium: boolean
): number => {
    if (!category.isPremium || isPremium) {
        return category.totalQuestions; // Full access
    }

    return category.freeQuestionCount || 0; // Limited access
};

// Generate a random set of questions for the exam simulator
// Options are shuffled so the correct answer is never in the same position.
export const generateExamQuestions = (count: number = 50): Question[] => {
    const allQuestions = getAllQuestions();

    // Fisher-Yates shuffle (question order)
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    // Also shuffle each question's answer options
    return shuffleAllOptions(allQuestions.slice(0, count));
};
