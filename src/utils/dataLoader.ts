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

// ─── Lazy question banks ──────────────────────────────────────────────────────────
// Each bank is only required (parsed) the first time it is needed, then cached.
// This keeps ~2.6 MB of JSON off the startup path.
const BANK_LOADERS: Record<string, () => any[]> = {
    air_brakes: () => require('../data/air_brakes_data.json'),
    general_knowledge: () => require('../data/general_knowledge_data.json'),
    hazmat: () => require('../data/hazmat_data.json'),
    tanker: () => require('../data/tanker_data.json'),
    doubles_triples: () => require('../data/doubles_triples_data.json'),
    passenger_transport: () => require('../data/passenger_transport_data.json'),
    school_bus: () => require('../data/school_bus_data.json'),
    combination_vehicles: () => require('../data/combination_vehicles_data.json'),
};

const bankCache = new Map<string, Question[]>();
const idIndexCache = new Map<string, Map<number | string, Question>>();

function loadBank(categoryId: string): Question[] {
    let bank = bankCache.get(categoryId);
    if (!bank) {
        const loader = BANK_LOADERS[categoryId];
        bank = loader
            ? (loader().map((q: any) => ({ ...q, categoryId })) as Question[])
            : [];
        bankCache.set(categoryId, bank);
    }
    return bank;
}

function loadIdIndex(categoryId: string): Map<number | string, Question> {
    let index = idIndexCache.get(categoryId);
    if (!index) {
        index = new Map(loadBank(categoryId).map(q => [q.id, q] as const));
        idIndexCache.set(categoryId, index);
    }
    return index;
}

// Load all categories
export const getCategories = (): Category[] => {
    return categoriesData as Category[];
};

// Get a specific category by ID
export const getCategoryById = (categoryId: string): Category | undefined => {
    return categoriesData.find((cat: any) => cat.id === categoryId) as Category | undefined;
};

// Load questions for a specific category.
// Returns a shallow copy of the cached array so callers may sort/splice safely.
export const getQuestionsByCategory = (categoryId: string): Question[] => {
    return loadBank(categoryId).slice();
};

// Get all questions across all categories
export const getAllQuestions = (): Question[] => {
    const categories = getCategories();
    return categories.flatMap(cat => getQuestionsByCategory(cat.id));
};

// Get questions by IDs (for mistake bank / bookmarks) — O(n) via cached id index
export const getQuestionsByIds = (categoryId: string, questionIds: (number | string)[]): Question[] => {
    const index = loadIdIndex(categoryId);
    const result: Question[] = [];
    for (const id of new Set(questionIds)) {
        const q = index.get(id);
        if (q) result.push(q);
    }
    return result;
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
