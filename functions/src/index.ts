/**
 * CDL Prep — Modern Learning AI Gateway (Firebase Cloud Functions v2)
 *
 * Backed by Hugging Face Router (router.huggingface.co/v1) with fallback to Gemini.
 * Powers Duolingo-style micro-lessons, interactive scenario dialogues, and AI coaching.
 *
 * Endpoints (POST, JSON):
 *   /aiTutor      { question, userAnswer, correctAnswer, lang? }
 *   /aiQuestions  { categoryId, categoryName, count?, lang?, imageHint? }
 *   /hfScenario   { categoryId, difficulty?, lang? } -> Duolingo-style road scenario
 */
import { onRequest, Request } from 'firebase-functions/v2/https';
import { defineSecret, defineString, defineBoolean } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import type { Response } from 'express';
import * as admin from 'firebase-admin';
import { createHash } from 'crypto';

admin.initializeApp();

const HF_TOKEN = defineSecret('HF_TOKEN');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const GROQ_API_KEY = defineSecret('GROQ_API_KEY');

const HF_MODEL = defineString('HF_MODEL', { default: 'meta-llama/Llama-3.3-70B-Instruct:fastest' });
const GEMINI_MODEL = defineString('GEMINI_MODEL', { default: 'gemini-flash-latest' });
const ENFORCE_APP_CHECK = defineBoolean('ENFORCE_APP_CHECK', { default: false });

const DAILY_LIMITS = { tutor: 60, questions: 20, scenario: 30 } as const;
type Endpoint = keyof typeof DAILY_LIMITS;

const COMMON_OPTS = {
    region: 'us-central1',
    secrets: [HF_TOKEN, GEMINI_API_KEY, GROQ_API_KEY],
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB' as const,
};

class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

function str(v: unknown, field: string, max: number, required = true): string {
    if (v === undefined || v === null || v === '') {
        if (required) throw new HttpError(400, `Missing field: ${field}`);
        return '';
    }
    if (typeof v !== 'string') throw new HttpError(400, `Invalid field: ${field}`);
    return v.trim().slice(0, max);
}

function langName(lang: unknown): string {
    return lang === 'es' ? 'Spanish (Latin American, neutral)' : 'English';
}

async function verifyAppCheck(req: Request): Promise<void> {
    const token = req.header('X-Firebase-AppCheck');
    if (!token) {
        if (ENFORCE_APP_CHECK.value()) throw new HttpError(401, 'App Check token required');
        return;
    }
    try {
        await admin.appCheck().verifyToken(token);
    } catch {
        throw new HttpError(401, 'Invalid App Check token');
    }
}

async function enforceRateLimit(req: Request, endpoint: Endpoint): Promise<void> {
    const installId = (req.header('X-Install-Id') || '').slice(0, 64);
    const ip = (req.header('x-forwarded-for') || req.ip || 'unknown').split(',')[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    const key = createHash('sha256').update(`${installId}|${ip}`).digest('hex').slice(0, 32);
    const ref = admin.firestore().doc(`rateLimits/${endpoint}_${day}_${key}`);

    await admin.firestore().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const count = (snap.exists ? (snap.get('count') as number) : 0) + 1;
        if (count > DAILY_LIMITS[endpoint]) {
            throw new HttpError(429, 'Daily limit reached. Refuel or try again tomorrow.');
        }
        tx.set(ref, {
            count,
            expireAt: admin.firestore.Timestamp.fromMillis(Date.now() + 2 * 24 * 3600 * 1000),
        });
    });
}

const GROQ_FREE_MODELS = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
];

/**
 * Executes inference on Groq Cloud with automatic 429 rate limit handling,
 * retry-after exponential backoff, and multi-model quota rotation.
 */
async function callGroqWithRotation(
    groqKey: string,
    systemPrompt: string,
    userPrompt: string,
    jsonMode: boolean,
): Promise<string | null> {
    const finalUserPrompt = jsonMode && !userPrompt.toLowerCase().includes('json')
        ? `${userPrompt} (Format response as valid json)`
        : userPrompt;

    for (let i = 0; i < GROQ_FREE_MODELS.length; i++) {
        const model = GROQ_FREE_MODELS[i];
        let attempt = 0;

        while (attempt < 2) {
            attempt++;
            try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${groqKey.trim()}`,
                        'User-Agent': 'CDL-Prep-App/1.0',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: finalUserPrompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 480, // Optimized to conserve 8K TPM quota
                        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
                    }),
                });

                // Telemetry headers from Groq
                const remainingRPD = groqRes.headers.get('x-ratelimit-remaining-requests');
                const remainingTPM = groqRes.headers.get('x-ratelimit-remaining-tokens');
                const resetRequests = groqRes.headers.get('x-ratelimit-reset-requests');

                if (groqRes.ok) {
                    const data = (await groqRes.json()) as any;
                    const text = data?.choices?.[0]?.message?.content;
                    if (text && typeof text === 'string') {
                        logger.info(`[Groq Success] Model: ${model}`, {
                            remainingRPD,
                            remainingTPM,
                            resetRequests,
                        });
                        return text.trim();
                    }
                } else if (groqRes.status === 429) {
                    const retryAfterSec = parseFloat(groqRes.headers.get('retry-after') || '0');
                    logger.warn(`[Groq 429 Rate Limit] Model: ${model}, Retry-After: ${retryAfterSec}s, RemainingRPD: ${remainingRPD}`);

                    // Short backoff (<= 1.5s): sleep and retry once
                    if (retryAfterSec > 0 && retryAfterSec <= 1.5 && attempt === 1) {
                        await new Promise(r => setTimeout(r, retryAfterSec * 1000));
                        continue;
                    }

                    // Otherwise, rotate to next model in pool to triple quota!
                    logger.info(`[Groq Quota Rotation] Rotating from ${model} to next model in pool...`);
                    break;
                } else {
                    const errText = await groqRes.text().catch(() => '');
                    logger.warn(`[Groq Error ${groqRes.status}] on ${model}: ${errText.slice(0, 160)}`);
                    break;
                }
            } catch (err: any) {
                logger.warn(`[Groq Network Exception] on ${model}:`, err?.message);
                break;
            }
        }
    }

    return null;
}

/**
 * Universal LLM caller: Attempts Free Groq first with multi-model rotation & 429 backoff,
 * falls back to Hugging Face or Gemini if quotas are exhausted.
 */
async function callLLM(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<string> {
    let hfToken = process.env.HF_TOKEN || '';
    try {
        if (!hfToken && typeof HF_TOKEN.value === 'function') {
            hfToken = HF_TOKEN.value();
        }
    } catch {
        // Secret not bound at runtime
    }

    let geminiKey = process.env.GEMINI_API_KEY || '';
    try {
        if (!geminiKey && typeof GEMINI_API_KEY.value === 'function') {
            geminiKey = GEMINI_API_KEY.value();
        }
    } catch {
        // Secret not bound at runtime
    }

    let groqKey = process.env.GROQ_API_KEY || '';
    try {
        if (!groqKey && typeof GROQ_API_KEY.value === 'function') {
            groqKey = GROQ_API_KEY.value();
        }
    } catch {
        // Secret not bound at runtime
    }

    // 1. Try 100% Free Groq with Multi-Model Rotation & 429 Backoff
    if (groqKey && groqKey.trim().length > 0) {
        const groqResult = await callGroqWithRotation(groqKey, systemPrompt, userPrompt, jsonMode);
        if (groqResult) return groqResult;
    }

    // 2. Try Hugging Face Router
    if (hfToken && hfToken.trim().length > 0) {
        try {
            const hfRes = await fetch('https://router.huggingface.co/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${hfToken.trim()}`,
                },
                body: JSON.stringify({
                    model: HF_MODEL.value(),
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 900,
                    ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
                }),
            });

            if (hfRes.ok) {
                const data = (await hfRes.json()) as any;
                const text = data?.choices?.[0]?.message?.content;
                if (text && typeof text === 'string') return text.trim();
            } else {
                logger.warn('Hugging Face Router error, checking fallback', { status: hfRes.status });
            }
        } catch (e) {
            logger.warn('Hugging Face call failed, falling back to Gemini', e);
        }
    }

    // Fallback: Gemini API
    if (!geminiKey || geminiKey.trim().length === 0) {
        throw new HttpError(502, 'AI inference service token is not configured in Secret Manager.');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL.value()}:generateContent`;
    const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiKey.trim(),
        },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: {
                temperature: 0.7,
                ...(jsonMode ? { responseMimeType: 'application/json' } : {})
            },
        }),
    });

    if (!res.ok) {
        throw new HttpError(502, 'AI engine temporarily unavailable');
    }

    const data = (await res.json()) as any;
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new HttpError(502, 'Empty AI response');
    return text.trim();
}

function handler(endpoint: Endpoint, fn: (body: any) => Promise<unknown>) {
    return async (req: Request, res: Response) => {
        try {
            if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
            await verifyAppCheck(req);
            await enforceRateLimit(req, endpoint);
            res.status(200).json(await fn(req.body ?? {}));
        } catch (err) {
            const status = err instanceof HttpError ? err.status : 500;
            if (status === 500) logger.error(`${endpoint} failed`, err);
            res.status(status).json({ error: err instanceof Error ? err.message : 'Internal error' });
        }
    };
}

// ─── AI Tutor (Diesel Dan Persona) ──────────────────────────────────────────

export const aiTutor = onRequest(
    COMMON_OPTS,
    handler('tutor', async (body) => {
        const question = str(body.question, 'question', 1000);
        const userAnswer = str(body.userAnswer, 'userAnswer', 400);
        const correctAnswer = str(body.correctAnswer, 'correctAnswer', 400);

        const system = `You are "Diesel Dan", a 25-year veteran CDL truck driver and beloved mentor in a Duolingo-style learning app.
Your tone is friendly, encouraging, practical, and punchy.
Respond in ${langName(body.lang)}.
Do not sound like a legal textbook. Use real-world trucking logic.`;

        const prompt = `A CDL student just answered this practice question:
Question: """${question}"""
Student chose: """${userAnswer}"""
Correct answer: """${correctAnswer}"""

In 3 concise sentences:
1. Explain why the correct answer keeps them safe on the highway.
2. If their answer was wrong, explain the real-world hazard of their choice.
3. Give one memorable trucker tip/rhyme to never forget this.
Plain text only.`;

        const text = await callLLM(system, prompt, false);
        return { text };
    }),
);

// ─── Duolingo-Style Interactive Road Scenario ───────────────────────────────

interface CachedScenarioItem {
    scenario: any;
    cachedAt: number;
}
const scenarioCachePool = new Map<string, CachedScenarioItem[]>();
const SCENARIO_CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes TTL
const MAX_CACHE_ITEMS_PER_CAT = 5;

export const hfScenario = onRequest(
    COMMON_OPTS,
    handler('scenario', async (body) => {
        const categoryId = str(body.categoryId, 'categoryId', 64);
        const lang = langName(body.lang);
        const cacheKey = `${categoryId}_${body.lang || 'en'}`;

        // 1. Check in-memory rate conservation cache pool
        const existing = scenarioCachePool.get(cacheKey) || [];
        const now = Date.now();
        const valid = existing.filter(item => now - item.cachedAt < SCENARIO_CACHE_TTL_MS);

        if (valid.length >= 2 && Math.random() < 0.6) {
            const randomIndex = Math.floor(Math.random() * valid.length);
            logger.info(`[Scenario Cache Hit] Serving cached scenario for ${cacheKey}`);
            return { scenario: valid[randomIndex].scenario };
        }

        const system = `You are an expert CDL scenario designer for a Duolingo-style trucker learning game.
Generate an engaging, interactive real-world road scenario in ${lang}.
Return strictly raw JSON conforming to this schema:
{
  "scenarioTitle": string (e.g. "Runaway Ramp on Donner Pass"),
  "character": string (e.g. "Officer Miller (DOT Inspector)" or "Diesel Dan (Mentor)"),
  "storyText": string (2-3 sentences describing a vivid roadside or cab situation),
  "question": string (The dilemma to solve),
  "options": [
    { "id": "A", "text": string, "isCorrect": boolean, "feedback": string },
    { "id": "B", "text": string, "isCorrect": boolean, "feedback": string },
    { "id": "C", "text": string, "isCorrect": boolean, "feedback": string }
  ],
  "fmcsaRule": string (short FMCSA or CDL manual reference)
}`;

        const prompt = `Create a realistic mini-scenario for category "${categoryId}".
Make it exciting and practical (e.g. brake fade, scale house inspection, low clearance bridge, placarding mismatch, or wet road skid).
Exactly one option must be true for isCorrect.`;

        const raw = await callLLM(system, prompt, true);
        try {
            const parsed = JSON.parse(raw);

            // Cache in pool for quota smoothing
            valid.push({ scenario: parsed, cachedAt: now });
            if (valid.length > MAX_CACHE_ITEMS_PER_CAT) valid.shift();
            scenarioCachePool.set(cacheKey, valid);

            return { scenario: parsed };
        } catch {
            throw new HttpError(502, 'Malformed scenario response from AI');
        }
    }),
);

// ─── Dynamic Adaptive Questions ─────────────────────────────────────────────

export const aiQuestions = onRequest(
    COMMON_OPTS,
    handler('questions', async (body) => {
        const categoryId = str(body.categoryId, 'categoryId', 64);
        const categoryName = str(body.categoryName, 'categoryName', 80, false) || categoryId;
        const count = Math.min(Math.max(Number(body.count) || 5, 1), 10);
        const lang = langName(body.lang);

        const system = `You are a CDL question generator for a Duolingo-style learning app.
Generate ${count} realistic, challenging CDL multiple-choice questions for "${categoryName}" in ${lang}.
Return strictly JSON with a single "questions" array.
Each question must have:
- "categoryId": "${categoryId}"
- "question": string
- "options": exactly 4 plausible option strings (keep lengths balanced)
- "correct_answer": matching one option string exactly
- "explanation": 2-3 sentence trucker explanation
- "imageUrl": null`;

        const raw = await callLLM(system, `Generate ${count} CDL questions. Output JSON only.`, true);
        let parsed: any;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new HttpError(502, 'Malformed AI question response');
        }

        const questions = (Array.isArray(parsed?.questions) ? parsed.questions : [])
            .filter(
                (q: any) =>
                    typeof q?.question === 'string' &&
                    Array.isArray(q.options) &&
                    q.options.length === 4 &&
                    q.options.includes(q.correct_answer) &&
                    typeof q.explanation === 'string',
            );

        if (questions.length === 0) throw new HttpError(502, 'No valid questions returned');
        return { questions };
    }),
);
