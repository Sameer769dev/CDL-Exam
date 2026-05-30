import { Question } from '../types/quiz';
import { getCategoryById } from './dataLoader';
import signImages from '../data/signImages.json';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface AIQuestionResponse {
    questions: Omit<Question, 'id'>[];
}

/**
 * Fetches dynamic CDL questions from Gemini API.
 * Uses structured JSON output.
 */
export async function fetchDynamicQuestions(categoryId: string, count: number = 5): Promise<Question[]> {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        throw new Error('Gemini API key is not configured. Please add it to your .env file.');
    }

    const category = getCategoryById(categoryId);
    const categoryName = category ? category.name : categoryId;

    // Decide whether to include an image in this batch
    // We'll give it a 40% chance of injecting an image context, or 100% if category is "signs"
    const useImage = Math.random() < 0.4 || categoryId === 'signs';
    let imageContext = '';
    let imageConstraint = '- "imageUrl": (optional) null or empty string if not applicable';

    if (useImage) {
        const randomImage = signImages[Math.floor(Math.random() * signImages.length)];
        imageContext = `
        CRITICAL INSTRUCTION: You MUST make at least one question specifically about this road sign/scenario: 
        Name: "${randomImage.name}"
        URL: "${randomImage.url}"
        For this specific question, you MUST set the "imageUrl" field to exactly "${randomImage.url}".
        `;
        imageConstraint = `- "imageUrl": "${randomImage.url}" (only for the question about the sign, otherwise null)`;
    }

    const prompt = `
    You are an expert CDL (Commercial Driver's License) instructor.
    Generate ${count} unique, high-quality, realistic CDL exam questions for the category: "${categoryName}".
    Make them challenging and based on actual Federal Motor Carrier Safety Administration (FMCSA) rules.
    Include practical, real-world driving scenarios.
    ${imageContext}
    
    Return the response as a strict JSON object with a single "questions" array.
    Each question object must have:
    - "categoryId": "${categoryId}"
    - "question": The question text
    - "options": An array of exactly 4 plausible answer strings
    - "correct_answer": The exact string of the correct option
    - "explanation": A detailed, educational explanation of why the answer is correct
    ${imageConstraint}
    
    Output ONLY raw JSON, with no markdown formatting or backticks.
    `;

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textContent) {
            throw new Error('Invalid response format from Gemini API');
        }

        const parsedData = JSON.parse(textContent) as AIQuestionResponse;
        
        // Map to standard Question format, generate unique string IDs
        return parsedData.questions.map(q => ({
            ...q,
            id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            isDynamic: true // Custom flag to indicate AI generated
        })) as any as Question[];

    } catch (error) {
        console.error('Failed to fetch AI questions:', error);
        throw error;
    }
}

/**
 * Gets a tutoring explanation for a wrong answer.
 */
export async function fetchAITutorExplanation(question: string, userAnswer: string, correctAnswer: string): Promise<string> {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        return "The AI Instructor is currently offline. Please configure your API key in the .env file.";
    }

    const prompt = `
    You are a friendly, encouraging CDL instructor. 
    A student just answered a question incorrectly.
    
    Question: "${question}"
    Student's Answer: "${userAnswer}"
    Correct Answer: "${correctAnswer}"
    
    Explain specifically why the student's answer is wrong, and why the correct answer is right. 
    Keep it concise, supportive, and under 4 sentences.
    `;

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                }
            })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate an explanation right now.";
    } catch (error) {
        console.error('AI Tutor error:', error);
        return "I'm sorry, I couldn't connect to the server to generate an explanation. Please try again later.";
    }
}
