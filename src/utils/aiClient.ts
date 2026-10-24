import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../types/quiz';
import { getCategoryById } from './dataLoader';
import signImages from '../data/signImages.json';

/**
 * AI client — communicates with our Hugging Face / Cloud Functions proxy.
 *
 * Configured via EXPO_PUBLIC_AI_BASE_URL (public proxy URL).
 * API secrets live strictly on the server in Google Secret Manager (HF_TOKEN / GEMINI_API_KEY).
 */
const AI_BASE_URL = (process.env.EXPO_PUBLIC_AI_BASE_URL || '').replace(/\/+$/, '');
const INSTALL_ID_KEY = '@cdl_install_id';
const REQUEST_TIMEOUT_MS = 30000;

export type AILang = 'en' | 'es';

export interface RoadScenarioOption {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
}

export interface RoadScenario {
    scenarioTitle: string;
    character: string;
    storyText: string;
    question: string;
    options: RoadScenarioOption[];
    fmcsaRule: string;
}

export class AIError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'AIError';
    }
}

export const isAIConfigured = (): boolean => AI_BASE_URL.startsWith('https://');

let installIdPromise: Promise<string> | null = null;
/** Anonymous, random per-install ID used only for server-side rate limiting. */
function getInstallId(): Promise<string> {
    if (!installIdPromise) {
        installIdPromise = (async () => {
            const existing = await AsyncStorage.getItem(INSTALL_ID_KEY);
            if (existing) return existing;
            const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
            await AsyncStorage.setItem(INSTALL_ID_KEY, id);
            return id;
        })().catch(() => 'unknown');
    }
    return installIdPromise;
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    if (!isAIConfigured()) {
        throw new AIError('AI service is not configured.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(`${AI_BASE_URL}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Install-Id': await getInstallId(),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new AIError(json?.error || `AI request failed (${res.status})`, res.status);
        }
        return json as T;
    } catch (e: any) {
        if (e instanceof AIError) throw e;
        if (e?.name === 'AbortError') throw new AIError('The AI took too long to respond.');
        throw new AIError('Could not reach the AI service. Check your connection.');
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Fetches freshly generated CDL questions for a category.
 */
export async function fetchDynamicQuestions(
    categoryId: string,
    count: number = 5,
    lang: AILang = 'en',
): Promise<Question[]> {
    const category = getCategoryById(categoryId);

    let imageHint: { name: string; url: string } | undefined;
    if (signImages.length > 0 && (Math.random() < 0.4 || categoryId === 'signs')) {
        imageHint = signImages[Math.floor(Math.random() * signImages.length)];
    }

    const { questions } = await post<{ questions: Omit<Question, 'id'>[] }>('aiQuestions', {
        categoryId,
        categoryName: category?.name ?? categoryId,
        count,
        lang,
        imageHint,
    });

    return questions.map(q => ({
        ...q,
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        isDynamic: true,
    })) as unknown as Question[];
}

/**
 * Gets a mentoring explanation from "Diesel Dan" (AI Coach).
 */
export async function fetchAITutorExplanation(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    lang: AILang = 'en',
): Promise<string> {
    if (!isAIConfigured()) {
        throw new AIError('The AI Instructor is temporarily unavailable.');
    }
    const { text } = await post<{ text: string }>('aiTutor', {
        question,
        userAnswer,
        correctAnswer,
        lang,
    });
    return text;
}

const FALLBACK_SCENARIOS: Record<string, RoadScenario> = {
    air_brakes: {
        scenarioTitle: "I-70 Mountain Downgrade Air Drop",
        character: "Diesel Dan (Dispatcher)",
        storyText: "You're descending a 6% grade on I-70 West toward Silverthorne with 78,000 lbs gross weight. Your speedometer reads 48 MPH, but your air gauges are dropping steadily toward 75 PSI, and the low-pressure warning light just flashed.",
        question: "What is your immediate, safest tactical action?",
        fmcsaRule: "FMCSA § 393.51 - Low air warning systems & emergency downhill stopping procedures.",
        options: [
            {
                id: 'opt_1',
                text: "Ride the service brake pedal continuously to slow the rig to 25 MPH.",
                isCorrect: false,
                feedback: "Continuous brake riding creates extreme friction heat (brake fade), causing linings to glaze and total brake loss down the mountain!",
            },
            {
                id: 'opt_2',
                text: "Downshift to a lower gear, use snub braking down to safe speed, and head for the runaway truck ramp if pressure drops to 60 PSI.",
                isCorrect: true,
                feedback: "Right on the money, driver! Engine braking plus 5-second snub applications keeps drums cool, and the runaway ramp is your life-saving escape.",
            },
            {
                id: 'opt_3',
                text: "Yank the red trailer air supply knob immediately while traveling 48 MPH.",
                isCorrect: false,
                feedback: "Pulling the trailer supply knob at highway speed locks the trailer brakes instantly, inducing a violent trailer jackknife!",
            },
        ],
    },
    hazmat: {
        scenarioTitle: "Corrosive Liquid Leak at Scale House",
        character: "DOT Inspector Miller & Dan",
        storyText: "During a Level 1 DOT roadside inspection, the inspector notices clear liquid dripping from under your trailer placarded with Class 8 Corrosives. There is a faint pungent chemical odor.",
        question: "What must you do first according to the Emergency Response Guidebook (ERG)?",
        fmcsaRule: "FMCSA § 397.13 & ERG Guide 153 - Hazardous Materials Emergency Response.",
        options: [
            {
                id: 'opt_1',
                text: "Open the trailer rear swing doors immediately to inspect the leaking container.",
                isCorrect: false,
                feedback: "Never open the trailer doors without proper PPE! Inhaling corrosive vapors can cause permanent respiratory tract burn injuries.",
            },
            {
                id: 'opt_2',
                text: "Secure the area, isolate at least 150 feet upwind, notify dispatcher, and contact CHEMTREC with the shipping paper UN number.",
                isCorrect: true,
                feedback: "Outstanding safety protocol! Upwind isolation and immediate CHEMTREC activation prevents toxic exposure and coordinates professional response.",
            },
            {
                id: 'opt_3',
                text: "Wash the spilled liquid down the weigh station storm drain with a garden hose.",
                isCorrect: false,
                feedback: "Flushing hazardous chemicals into public drainage causes severe environmental contamination and is a major federal violation.",
            },
        ],
    },
    general: {
        scenarioTitle: "Pre-Trip Steer Axle Defect Encounter",
        character: "Diesel Dan (Road Mentor)",
        storyText: "You are conducting your pre-trip walkaround inspection at dawn. You notice that your front steering axle left tire has 3/32 inch tread depth remaining, and you spot a nail head embedded near the sidewall shoulder.",
        question: "Can you legally dispatch this commercial vehicle onto the highway?",
        fmcsaRule: "FMCSA § 393.75 - Minimum tire tread depth requirements (4/32 inch on steering axle).",
        options: [
            {
                id: 'opt_1',
                text: "Yes, 3/32 inch is legal as long as the tire is holding at least 100 PSI cold pressure.",
                isCorrect: false,
                feedback: "Incorrect! Federal regulations strictly mandate at least 4/32 inch tread depth on front steer tires (2/32 inch on all other tires).",
            },
            {
                id: 'opt_2',
                text: "No, place the vehicle Out of Service until the steer tire is replaced by road service.",
                isCorrect: true,
                feedback: "Spot on, driver! Steer axle tires must have at least 4/32 inch tread and NO sidewall damage. Rolling on this would be an immediate Out of Service (OOS) order.",
            },
            {
                id: 'opt_3',
                text: "Yes, you can swap it to the drive axle without replacing it.",
                isCorrect: false,
                feedback: "Tires with embedded objects in the shoulder are prone to catastrophic blowout under load and must be inspected and replaced.",
            },
        ],
    },
};

/**
 * Fetches an interactive Duolingo-style roadside dialogue scenario from Hugging Face AI.
 * Falls back to high-yield CDL scenarios if AI proxy is offline or not configured.
 */
export async function fetchRoadScenario(
    categoryId: string,
    lang: AILang = 'en',
): Promise<RoadScenario> {
    if (isAIConfigured()) {
        try {
            const { scenario } = await post<{ scenario: RoadScenario }>('hfScenario', {
                categoryId,
                lang,
            });
            if (scenario?.options?.length > 0) {
                return scenario;
            }
        } catch {
            // Fall back to curated scenarios below
        }
    }

    const key = categoryId.includes('brake')
        ? 'air_brakes'
        : categoryId.includes('hazmat')
        ? 'hazmat'
        : 'general';

    return FALLBACK_SCENARIOS[key] || FALLBACK_SCENARIOS.general;
}

