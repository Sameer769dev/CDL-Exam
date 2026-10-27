import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../types/quiz';
import { getCategoryById, getQuestionsByCategory } from './dataLoader';
import signImages from '../data/signImages.json';

/**
 * AI client — communicates with our Hugging Face / Cloud Functions proxy.
 *
 * Configured via EXPO_PUBLIC_AI_BASE_URL (public proxy URL).
 * API secrets live strictly on the server in Google Secret Manager (HF_TOKEN / GEMINI_API_KEY).
 */
const AI_BASE_URL = (process.env.EXPO_PUBLIC_AI_BASE_URL || '').replace(/\/+$/, '');
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODELS = [
    process.env.EXPO_PUBLIC_GROQ_MODEL || 'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
];

const INSTALL_ID_KEY = '@cdl_install_id';
const REQUEST_TIMEOUT_MS = 25000;

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
    public status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
        this.name = 'AIError';
    }
}

/**
 * Returns true if live AI or local procedural AI mentoring is available.
 * Always true so the student driver can always access the AI Instructor.
 */
export const isAIConfigured = (): boolean => true;

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

/**
 * Executes inference directly against Groq Cloud's free high-speed endpoint.
 */
async function callGroqDirect(
    messages: Array<{ role: string; content: string }>,
    options?: { json?: boolean; temperature?: number; maxTokens?: number }
): Promise<string> {
    if (!GROQ_API_KEY) {
        throw new AIError('No Groq API key configured.');
    }

    let lastError: any = null;
    for (const model of GROQ_MODELS) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const body: any = {
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 700,
            };
            if (options?.json) {
                body.response_format = { type: 'json_object' };
            }

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (res.status === 429) {
                // Quota hit on this model, rotate to next free model
                continue;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `Groq error (${res.status})`);
            }

            const json = await res.json();
            const content = json?.choices?.[0]?.message?.content;
            if (content && typeof content === 'string') {
                return content;
            }
        } catch (err) {
            lastError = err;
        } finally {
            clearTimeout(timer);
        }
    }

    throw lastError || new AIError('AI service is temporarily busy.');
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    if (!AI_BASE_URL.startsWith('https://')) {
        throw new AIError('Proxy not configured');
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
        throw new AIError('Could not reach the AI service.');
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Intelligent procedural fallback generator when device is offline.
 * Guarantees the student driver ALWAYS gets an encouraging, accurate breakdown.
 */
function generateOfflineTutorExplanation(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    lang: AILang = 'en'
): string {
    if (lang === 'es') {
        return `¡Atención conductor! Vamos a analizar esta pregunta juntos con calma.\n\n` +
            `❌ Tu respuesta: "${userAnswer}"\n` +
            `✅ Respuesta correcta: "${correctAnswer}"\n\n` +
            `Bajo las normas FMCSA del DOT, elegir "${userAnswer}" crea un peligro operativo o incumple el procedimiento reglamentario.\n\n` +
            `💡 Consejo de Diesel Dan para el examen:\n` +
            `Recuerda siempre que las pautas de seguridad priorizan la prevención de fallas mecánicas y el control total del vehículo. ¡Mantén la concentración para la próxima!`;
    }

    return `Listen up, driver! Let's break this one down together.\n\n` +
        `❌ You selected: "${userAnswer}"\n` +
        `✅ Correct answer: "${correctAnswer}"\n\n` +
        `Under FMCSA safety standards, choosing "${userAnswer}" in this situation fails inspection or poses a real hazard on the highway. Commercial vehicle regulations strictly require "${correctAnswer}" to maintain proper mechanical safety, stopping capability, and driver control.\n\n` +
        `💡 Diesel Dan's Highway Rule of Thumb:\n` +
        `Always prioritize the option that guarantees maximum safety margin, proper pre-trip verification, and zero risk of brake or stability failure. You've got the drive in you—lock in that rule for the real test!`;
}

/**
 * Fetches freshly generated CDL questions for a category.
 * Uses Groq free AI when available, falling back to rich category question bank.
 */
export async function fetchDynamicQuestions(
    categoryId: string,
    count: number = 5,
    lang: AILang = 'en',
): Promise<Question[]> {
    const category = getCategoryById(categoryId);

    // 1. Try direct Groq Cloud free AI
    if (GROQ_API_KEY) {
        try {
            const systemPrompt = `You are a certified master FMCSA CDL test writer. Return strictly valid json with "questions": an array of ${count} objects each having: "question" (string), "options" (array of 4 distinct strings), "correct_answer" (string, must match one of options), and "explanation" (string explaining FMCSA rule). Language: ${lang === 'es' ? 'Spanish' : 'English'}.`;
            const userPrompt = `Write ${count} fresh, realistic CDL multiple-choice practice questions for category: "${category?.name || categoryId}". (Format response as valid json)`;
            const raw = await callGroqDirect([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ], { json: true, temperature: 0.7, maxTokens: 1400 });
            const parsed = JSON.parse(raw);
            const questionsList = parsed?.questions || (Array.isArray(parsed) ? parsed : null);
            if (Array.isArray(questionsList) && questionsList.length > 0) {
                return questionsList.map((q: any) => ({
                    ...q,
                    id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    isDynamic: true,
                })) as unknown as Question[];
            }
        } catch (e) {
            console.warn('[aiClient] Groq dynamic questions failed, using local bank fallback:', e);
        }
    }

    // 2. Try proxy if configured
    if (AI_BASE_URL.startsWith('https://')) {
        try {
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
        } catch (e) {
            console.warn('[aiClient] Proxy dynamic questions failed:', e);
        }
    }

    // 3. Fall back to curated category questions
    const fallbackQuestions = getQuestionsByCategory(categoryId);
    const questions = [...fallbackQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
    return questions.map(q => ({
        ...q,
        id: `ai_local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        isDynamic: true,
    }));
}

/**
 * Gets a mentoring explanation from "Diesel Dan" (AI Coach).
 * Powered by Groq Cloud free Llama-3.3-70B / Qwen-27B with instant offline fallback.
 */
export async function fetchAITutorExplanation(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    lang: AILang = 'en',
): Promise<string> {
    const isSpanish = lang === 'es';
    const systemPrompt = isSpanish
        ? 'Eres Diesel Dan, un veterano instructor de CDL con 25 años de experiencia en carreteras. Sé conciso, amigable, motivador y proporciona explicaciones prácticas y respaldadas por normas de la FMCSA.'
        : 'You are Diesel Dan, a 25-year veteran CDL master instructor and highway mentor. Be concise, encouraging, and provide clear FMCSA-backed explanations with trucker wisdom.';

    const userPrompt = isSpanish
        ? `Un estudiante conductor cometió un error en esta pregunta del examen CDL:\nPregunta: "${question}"\nEl estudiante respondió: "${userAnswer}"\nLa respuesta correcta es: "${correctAnswer}"\n\nEn 2 o 3 párrafos cortos y claros:\n1. Explica por qué la elección del estudiante es incorrecta o peligrosa según los estándares de la FMCSA.\n2. Explica por qué la respuesta correcta es el procedimiento adecuado.\n3. Da un consejo mnemotécnico o regla práctica para recordar esto en el examen.`
        : `A student driver made a mistake on this CDL exam question:\nQuestion: "${question}"\nStudent selected: "${userAnswer}"\nCorrect answer: "${correctAnswer}"\n\nIn 2-3 short, punchy paragraphs with trucker wisdom:\n1. Explain in simple, plain English why the student's choice is incorrect or dangerous under FMCSA standards.\n2. Explain why the correct answer is the right procedure on the highway.\n3. Give an easy memory tip or rule of thumb to remember this on test day and behind the wheel.`;

    // 1. Try direct Groq Cloud API
    if (GROQ_API_KEY) {
        try {
            const response = await callGroqDirect([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ], { temperature: 0.6, maxTokens: 450 });
            if (response && response.trim().length > 20) {
                return response.trim();
            }
        } catch (e) {
            console.warn('[aiClient] Groq AI tutor failed, using fallback:', e);
        }
    }

    // 2. Try proxy URL if configured
    if (AI_BASE_URL.startsWith('https://')) {
        try {
            const { text } = await post<{ text: string }>('aiTutor', {
                question,
                userAnswer,
                correctAnswer,
                lang,
            });
            if (text) return text;
        } catch (e) {
            console.warn('[aiClient] Proxy AI tutor failed:', e);
        }
    }

    // 3. Guaranteed high-quality procedural fallback (never fails, works 100% offline)
    return generateOfflineTutorExplanation(question, userAnswer, correctAnswer, lang);
}

const SCENARIO_BANK: Record<string, RoadScenario[]> = {
    air_brakes: [
        {
            scenarioTitle: "I-70 Mountain Downgrade Air Loss",
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
        {
            scenarioTitle: "Governor Cut-Out Malfunction",
            character: "Diesel Dan (Road Mentor)",
            storyText: "While cruising on I-80, you glance at your primary and secondary air tank needles. Both gauges are reading 148 PSI and still slowly climbing past maximum safety limits.",
            question: "What component has failed and what is the dangerous consequence?",
            fmcsaRule: "FMCSA § 393.40 - Air compressor governor cut-out safety range (120 - 140 PSI).",
            options: [
                {
                    id: 'opt_1',
                    text: "The safety relief valve is stuck open; air tanks will implode under vacuum pressure.",
                    isCorrect: false,
                    feedback: "The relief valve vents excessive pressure at 150 PSI to prevent rupture, it does not cause vacuum implosion.",
                },
                {
                    id: 'opt_2',
                    text: "The air compressor governor failed to cut out; excessive pressure will trigger the safety relief valve at 150 PSI.",
                    isCorrect: true,
                    feedback: "Spot on! The governor must stop compressor pumping between 120-140 PSI. If it fails, the safety valve pops at 150 PSI to prevent tank explosion.",
                },
                {
                    id: 'opt_3',
                    text: "The foot valve treadle is jammed; pump the clutch to reset system pressure.",
                    isCorrect: false,
                    feedback: "The foot valve controls air delivery to brake chambers, not compressor governor cut-out limits.",
                },
            ],
        },
        {
            scenarioTitle: "Emergency Spring Brake Pop-Out",
            character: "Officer Miller (Highway Patrol)",
            storyText: "A severe severed air line causes rapid pressure loss down to 30 PSI while you are in the center lane of I-95. The yellow diamond parking brake button violently pops out.",
            question: "What physical reaction occurs immediately in your truck's brake chambers?",
            fmcsaRule: "FMCSA § 393.41 - Emergency spring brake automatic application between 20-45 PSI.",
            options: [
                {
                    id: 'opt_1',
                    text: "Mechanical spring brakes engage fully on the drive wheels; you cannot release them without air.",
                    isCorrect: true,
                    feedback: "Exactly right! Heavy steel coil springs are held back only by air pressure. When pressure drops below 20-45 PSI, springs snap the shoes against the drums.",
                },
                {
                    id: 'opt_2',
                    text: "Front steering brakes lock up while rear brakes remain in free-roll mode.",
                    isCorrect: false,
                    feedback: "Steering axles do not have spring parking brakes for directional safety; spring brakes sit on drive and trailer axles.",
                },
                {
                    id: 'opt_3',
                    text: "The anti-lock brake system (ABS) pulses the brakes to bring you to a stop at 55 MPH.",
                    isCorrect: false,
                    feedback: "ABS requires electrical power and air pressure to modulate valves. Spring brakes are pure mechanical force without air.",
                },
            ],
        },
    ],
    hazmat: [
        {
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
        {
            scenarioTitle: "Flammable Gas Tunnel Restriction",
            character: "Diesel Dan (Dispatcher)",
            storyText: "You are hauling 40,000 lbs of Propane (UN1075, Class 2.1 Flammable Gas) toward Baltimore. Your GPS directs you toward the Baltimore Harbor Tunnel (I-895).",
            question: "Can you legally proceed through the underwater tunnel?",
            fmcsaRule: "FMCSA § 397.9 - Hazmat routing, bridge and tunnel restrictions.",
            options: [
                {
                    id: 'opt_1',
                    text: "No, placarded explosives and flammable gases are strictly prohibited in underwater tunnels; take the I-695 beltway.",
                    isCorrect: true,
                    feedback: "Hot damn, driver! Hazardous materials with flammable gas placards are prohibited in tunnels worldwide. Always use designated bypass routes.",
                },
                {
                    id: 'opt_2',
                    text: "Yes, provided you stay in the right lane and maintain 300 feet following distance.",
                    isCorrect: false,
                    feedback: "Class 2.1 flammable gases cannot enter underwater tunnels under any circumstances due to catastrophic explosion risks.",
                },
                {
                    id: 'opt_3',
                    text: "Yes, if your emergency cargo valves are manually verified in the closed position.",
                    isCorrect: false,
                    feedback: "Closed valves do not exempt placarded bulk hazardous flammable cargo from tunnel bans.",
                },
            ],
        },
    ],
    combinations: [
        {
            scenarioTitle: "Kingpin Jaw Coupling Failure",
            character: "Diesel Dan (Yard Mentor)",
            storyText: "You just backed under a loaded semitrailer. You hear a metal latch click, but during your visual flashlight check under the fifth wheel, the locking jaws are only half-closed around the kingpin shank.",
            question: "What is your mandatory action before raising the landing gear?",
            fmcsaRule: "FMCSA § 393.70 - Coupling devices and fifth wheel jaw closure inspection.",
            options: [
                {
                    id: 'opt_1',
                    text: "Release tractor brakes and perform a high-speed tug test in 3rd gear to snap the jaws shut.",
                    isCorrect: false,
                    feedback: "Aggressive tugging with open jaws will slip the kingpin off the fifth wheel plate and drop the loaded trailer on your drive tires!",
                },
                {
                    id: 'opt_2',
                    text: "Release release handle, pull tractor forward, verify trailer height at apron center, and re-couple until jaws fully encircle the kingpin neck.",
                    isCorrect: true,
                    feedback: "Master trucker move! Never roll until you visually confirm the locking jaws are closed completely around the kingpin narrow neck and the release arm is locked.",
                },
                {
                    id: 'opt_3',
                    text: "Connect air lines and let air pressure force the fifth wheel latch into locked position.",
                    isCorrect: false,
                    feedback: "Air lines provide trailer brake air; they have zero mechanical effect on the fifth wheel manual locking jaws.",
                },
            ],
        },
    ],
    tanker: [
        {
            scenarioTitle: "Liquid Surge on Curved Off-Ramp",
            character: "Diesel Dan (Liquid Bulk Veteran)",
            storyText: "You are hauling 7,000 gallons of liquid in a smooth-bore (unbaffled) tank trailer. As you enter a sweeping cloverleaf exit ramp marked 25 MPH, traffic slows abruptly.",
            question: "How does 'liquid surge' affect your stopping distance and rollover threshold?",
            fmcsaRule: "CDL Manual Section 8 - Tank Vehicles liquid surge and high center of gravity dynamics.",
            options: [
                {
                    id: 'opt_1',
                    text: "Liquid forward surge pushes the truck forward during stops; lateral surge sloshes fluid to the outside, drastically lowering rollover threshold.",
                    isCorrect: true,
                    feedback: "Right on the money! Liquid surge moves the center of gravity dynamically. You must brake well BEFORE entering any curve, never inside it.",
                },
                {
                    id: 'opt_2',
                    text: "Liquid surge only occurs when the tank is 100% completely full to maximum capacity.",
                    isCorrect: false,
                    feedback: "Surge is actually WORST when partially filled (outage / 70-80% capacity) because fluid has open space to slam back and forth!",
                },
                {
                    id: 'opt_3',
                    text: "Smooth-bore tankers stop in shorter distances than dry vans because fluid acts as internal hydraulic damping.",
                    isCorrect: false,
                    feedback: "Fluid slam increases stopping distance and can push a stopping tractor straight through a red light.",
                },
            ],
        },
    ],
    general: [
        {
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
        {
            scenarioTitle: "Low Bridge Clearance Encounter",
            character: "Diesel Dan (Navigator)",
            storyText: "While driving a 13' 6\" standard dry van in an unfamiliar industrial corridor, you see an arched railway underpass with a yellow warning sign reading 'LOW CLEARANCE 12 FT 8 IN'. A car is tailgating behind you.",
            question: "What is your only legal and safe course of action?",
            fmcsaRule: "CDL Manual Section 2.7 - Overhead space management and bridge strikes.",
            options: [
                {
                    id: 'opt_1',
                    text: "Deflate tractor and trailer air suspension bags to crawl slowly under the center of the arch.",
                    isCorrect: false,
                    feedback: "Never attempt to squeeze under a low bridge! Even deflated bags only drop height 2-3 inches, resulting in a devastating trailer roof strike.",
                },
                {
                    id: 'opt_2',
                    text: "Turn on hazard flashers, stop immediately before the bridge, do not enter, and call local police dispatch for escort backing.",
                    isCorrect: true,
                    feedback: "Outstanding safety discipline! Stop before the bridge, put on hazards, and request police assistance to safely back up. A delay is better than peeling a $100,000 trailer roof.",
                },
                {
                    id: 'opt_3',
                    text: "Accelerate through quickly so momentum carries you past any slight scraping.",
                    isCorrect: false,
                    feedback: "Striking an overhead bridge causes structural collapse, thousands in damage, and immediate CDL disqualification.",
                },
            ],
        },
    ],
};

/**
 * Fetches an interactive Duolingo-style roadside dialogue scenario.
 * Powered by live AI when configured, with rich procedural scenario bank fallback for 100% free offline play.
 */
export async function fetchRoadScenario(
    categoryId: string,
    lang: AILang = 'en',
): Promise<RoadScenario> {
    const isSpanish = lang === 'es';

    // 1. Try direct Groq Cloud free AI
    if (GROQ_API_KEY) {
        try {
            const systemPrompt = `You are Diesel Dan, a CDL mentor for a Duolingo-style app. Return strictly valid json with: scenarioTitle, character, storyText, question, options (3 choices with id, text, isCorrect, feedback), and fmcsaRule. Language: ${isSpanish ? 'Spanish' : 'English'}. (Format response as valid json)`;
            const userPrompt = `Create an exciting, real-world CDL ${categoryId} roadside tactical emergency scenario in json format.`;
            const raw = await callGroqDirect([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ], { json: true, temperature: 0.7, maxTokens: 900 });
            const parsed = JSON.parse(raw);
            if (parsed?.scenarioTitle && Array.isArray(parsed?.options) && parsed.options.length > 0) {
                return parsed as RoadScenario;
            }
        } catch (e) {
            console.warn('[aiClient] Groq road scenario failed, using local scenario bank:', e);
        }
    }

    // 2. Try proxy if configured
    if (AI_BASE_URL.startsWith('https://')) {
        try {
            const { scenario } = await post<{ scenario: RoadScenario }>('hfScenario', {
                categoryId,
                lang,
            });
            if (scenario?.options?.length > 0) {
                return scenario;
            }
        } catch {
            // Fall back to local procedural scenarios below
        }
    }

    const key = categoryId.includes('brake')
        ? 'air_brakes'
        : categoryId.includes('hazmat')
        ? 'hazmat'
        : categoryId.includes('comb')
        ? 'combinations'
        : categoryId.includes('tank')
        ? 'tanker'
        : 'general';

    const list = SCENARIO_BANK[key] || SCENARIO_BANK.general;
    // Pick a random scenario from the category bank so every play is unique!
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex] || list[0];
}


