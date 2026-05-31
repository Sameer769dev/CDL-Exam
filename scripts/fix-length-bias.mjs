/**
 * fix-length-bias.mjs
 *
 * Fixes the "correct answer is always the longest" bias in CDL question data.
 *
 * Strategy:
 * For each question where the correct answer is significantly longer than all
 * distractors, we pad the distractors by expanding them with realistic
 * CDL-domain context phrases that match the semantic category of the distractor
 * while keeping them clearly wrong.
 *
 * Rules:
 * - If a distractor is a pure joke (≤10 chars, e.g. "Drive fast", "Guess", "Sleep")
 *   it gets replaced with a plausible-sounding but wrong full-length statement.
 * - If a distractor is medium length but the correct answer is ≥30 chars longer,
 *   it gets a clarifying suffix added.
 * - We never modify the correct_answer field.
 * - The new distractor must NOT be the same as the correct answer.
 */

import fs from 'fs';
import path from 'path';

// ─── Expansion maps ────────────────────────────────────────────────────────
// Maps short joke answers to realistic-sounding but wrong alternatives.
// Keys are lowercase trimmed originals; values are the replacement text.
const JOKE_MAP = {
    'drive fast': 'Accelerate quickly to build up system pressure before stopping',
    'drive': 'Drive the vehicle at highway speed without applying brakes',
    'drive away': 'Drive the vehicle away immediately after uncoupling the trailer',
    'drive away fast': 'Drive the vehicle away at full speed without securing the load',
    'go fast': 'Increase vehicle speed to generate enough braking force',
    'go home': 'Return to the terminal without completing the pre-trip inspection',
    'sleep': 'Rest in the sleeper berth until the situation resolves itself',
    'just back up': 'Back the vehicle up slowly until the kingpin snaps into place',
    'push knob': 'Push the trailer air supply knob in to release the spring brakes',
    'pull knob': 'Pull the parking brake knob out before checking air pressure',
    'push it': 'Push the brake pedal firmly to the floor and hold for 10 seconds',
    'pump them': 'Pump the brake pedal rapidly to build air pressure in the system',
    'look at them': 'Visually inspect the brake drums from outside the vehicle',
    'guess': 'Estimate the weight distribution based on the load appearance',
    "don't check": 'Proceed without inspection if the last driver reported no defects',
    'ask someone': 'Ask another driver or bystander to verify the coupling is secure',
    'use any truck': 'Use whichever tractor is available at the terminal for the haul',
    'halfway is okay': 'Lower the landing gear halfway to reduce wind resistance while driving',
    'can be down': 'Leave the landing gear down if the trailer is lightly loaded',
    'remove it': 'Remove the component if it appears worn or damaged during inspection',
    'drop trailer': 'Drop the trailer without lowering the landing gear or disconnecting airlines',
    'park on hill': 'Park on a steep grade and observe whether the vehicle rolls forward',
    'a road': 'A designated access road leading to the loading dock area',
    'a tool': 'A tool used during pre-trip inspection to measure brake adjustment',
    'a garment': 'A protective garment worn by hazmat handlers during loading',
    'a bolt': 'A large bolt securing the trailer frame to the undercarriage assembly',
    'a screw': 'A locking screw used to secure cargo restraints to the trailer floor',
    'a lock': 'A padlock device used to secure the trailer doors during transport',
    'pliers': 'Pliers used to tighten the locking jaws on the fifth wheel assembly',
    'brakes': 'Hydraulic brake components attached to the fifth wheel mounting plate',
    'teeth': 'Serrated teeth on the coupling plate that grip the kingpin flange',
    'steering': 'A secondary steering mechanism used on multi-axle trailer configurations',
    'brake': 'The primary brake actuator connected to the trailer service brake circuit',
    'door handle': 'A safety handle mounted near the trailer door for driver assistance',
    'false': 'False — a small gap is acceptable during normal coupling operations',
    'true': 'True — all coupling components must be inspected after every trip',
    'pull forward': 'Pull the tractor forward sharply to test the security of the coupling',
    'leave lines connected': 'Leave the airline connections attached when dropping the trailer overnight',
    'drive away fast': 'Accelerate quickly away from the dock once the dock plate is clear',
    'just back up': 'Back slowly until contact is made with the trailer without checking alignment',
};

// Suffix expansions for medium-length distractors
const CATEGORY_SUFFIXES = [
    ', according to standard pre-trip inspection procedures',
    ', as required by FMCSA regulations for commercial vehicles',
    ', only if the vehicle is equipped with the proper safety equipment',
    ', after confirming all safety checks have been completed',
    ', unless operating under a state-issued special permit',
    ', when the vehicle gross weight exceeds 26,001 pounds',
    ', provided all air lines are properly connected and tested',
    ', following the manufacturer\'s recommended maintenance schedule',
    ', only when operating in a posted school or construction zone',
    ', as outlined in the federal motor carrier safety regulations',
];

// ─── Core logic ────────────────────────────────────────────────────────────
function getSuffix(index) {
    return CATEGORY_SUFFIXES[index % CATEGORY_SUFFIXES.length];
}

function expandDistractor(text, correctAnswer, idx) {
    const lower = text.toLowerCase().trim();

    // Check direct joke map first
    if (JOKE_MAP[lower]) {
        return JOKE_MAP[lower];
    }

    // If very short (≤12 chars) and not in map, build generic expansion
    if (text.length <= 12) {
        return text + getSuffix(idx);
    }

    // Medium length — just add a clarifying suffix
    return text + getSuffix(idx);
}

function fixQuestion(q, stats) {
    const correct = q.correct_answer;
    const correctLen = correct.length;

    const newOptions = q.options.map((opt, idx) => {
        if (opt === correct) return opt; // never touch correct answer

        const optLen = opt.length;
        const gap = correctLen - optLen;

        // Only expand if correct is significantly longer (>15 chars gap)
        if (gap <= 15) return opt;

        const expanded = expandDistractor(opt, correct, idx);

        // Safety: if expansion accidentally matches correct answer, add suffix
        if (expanded === correct) {
            return opt + getSuffix(idx + 4);
        }

        stats.expanded++;
        return expanded;
    });

    return { ...q, options: newOptions };
}

function processFile(filePath, stats) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);

    const fixed = questions.map(q => fixQuestion(q, stats));

    // Verify correct_answer still exists in options for every question
    let mismatches = 0;
    for (const q of fixed) {
        if (!q.options.includes(q.correct_answer)) {
            mismatches++;
            console.error(`  ⚠ ID ${q.id}: correct_answer not in options after fix!`);
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
    return { total: questions.length, mismatches };
}

// ─── Measure bias before and after ─────────────────────────────────────────
function measureBias(questions) {
    let biased = 0;
    for (const q of questions) {
        const correctLen = q.correct_answer.length;
        const maxLen = Math.max(...q.options.map(o => o.length));
        if (correctLen >= maxLen) biased++;
    }
    return ((biased / questions.length) * 100).toFixed(1);
}

// ─── Main ────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const FILES = [
    'general_knowledge_data.json',
    'air_brakes_data.json',
    'combination_vehicles_data.json',
    'doubles_triples_data.json',
    'hazmat_data.json',
    'passenger_transport_data.json',
    'school_bus_data.json',
    'tanker_data.json',
];

let totalExpanded = 0;
let totalMismatches = 0;

for (const file of FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) { console.log(`  SKIP (not found): ${file}`); continue; }

    // Measure before
    const before = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const biasBefore = measureBias(before);

    const stats = { expanded: 0 };
    const result = processFile(filePath, stats);

    // Measure after
    const after = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const biasAfter = measureBias(after);

    totalExpanded += stats.expanded;
    totalMismatches += result.mismatches;

    console.log(`✅ ${file.padEnd(40)} bias: ${biasBefore}% → ${biasAfter}%  (${stats.expanded} options expanded)`);
    if (result.mismatches > 0) console.log(`   ⚠  ${result.mismatches} answer mismatches!`);
}

console.log(`\nDone. Total options rewritten: ${totalExpanded}. Mismatches: ${totalMismatches}`);
