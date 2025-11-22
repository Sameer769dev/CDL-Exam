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
    id: number;
    categoryId: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

export interface QuizData {
    categories: Category[];
    questions: Question[];
}
