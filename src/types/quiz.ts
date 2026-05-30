export interface Category {
    id: string;
    name: string;
    description: string;
    isPremium: boolean;
    freeQuestionCount: number | null;
    icon: string;
    color: string;
    totalQuestions: number;
}

export interface Question {
    id: number | string;
    categoryId: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    isDynamic?: boolean;
    imageId?: string;
    imageUrl?: string;
}

export interface QuizData {
    categories: Category[];
    questions: Question[];
}
