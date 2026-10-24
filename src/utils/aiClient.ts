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


