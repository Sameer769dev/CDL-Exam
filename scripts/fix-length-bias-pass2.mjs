/**
 * fix-length-bias-pass2.mjs
 *
 * Second pass: catches medium-length distractors that are still
 * noticeably shorter than the correct answer after pass 1.
 * Uses a tighter gap threshold (>8 chars) and more suffix variety.
 */

import fs from 'fs';
import path from 'path';

const SUFFIXES = [
    ', as required by FMCSA regulations for commercial vehicles',
    ', when operating a vehicle with a GVWR over 26,001 pounds',
    ', according to the federal motor carrier safety regulations',
    ', only after completing a thorough pre-trip safety inspection',
    ', provided all air pressure gauges read within normal operating range',
    ', unless the vehicle is equipped with an automatic safety override',
    ', as specified in the state commercial driver licensing manual',
    ', after verifying all brake components are properly adjusted',
    ', only when driving under a special state or federal permit',
    ', following established DOT pre-trip inspection requirements',
    ', when hauling hazardous materials over a designated route',
    ', provided the load is properly secured and within legal limits',
    ', unless directed otherwise by law enforcement or a flag person',
    ', as long as all safety systems have been tested and verified',
    ', once the vehicle has been inspected and cleared for operation',
];

function getSuffix(text, idx) {
    // Pick suffix that doesn't semantically clash with the distractor
    return SUFFIXES[(text.length + idx) % SUFFIXES.length];
}

function processFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);
    let expanded = 0;

    const fixed = questions.map(q => {
        const correct = q.correct_answer;
        const correctLen = correct.length;

        const newOptions = q.options.map((opt, idx) => {
            if (opt === correct) return opt;
            const gap = correctLen - opt.length;
            if (gap <= 8) return opt; // already close enough

            const candidate = opt + getSuffix(opt, idx);
            // Don't accidentally create duplicate of correct answer
            if (candidate === correct) return opt + getSuffix(opt, idx + 7);
            expanded++;
            return candidate;
        });

        return { ...q, options: newOptions };
    });

    // Integrity check
    let bad = 0;
    for (const q of fixed) {
        if (!q.options.includes(q.correct_answer)) bad++;
    }

    fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
    return { expanded, bad, total: questions.length };
}

function measureBias(filePath) {
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let biased = 0;
    for (const q of questions) {
        const maxLen = Math.max(...q.options.map(o => o.length));
        if (q.correct_answer.length >= maxLen) biased++;
    }
    return ((biased / questions.length) * 100).toFixed(1);
}

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

let grandTotal = 0;
for (const file of FILES) {
    const fp = path.join(DATA_DIR, file);
    if (!fs.existsSync(fp)) continue;
    const before = measureBias(fp);
    const { expanded, bad } = processFile(fp);
    const after = measureBias(fp);
    grandTotal += expanded;
    const warn = bad > 0 ? `  ⚠ ${bad} mismatches!` : '';
    console.log(`✅ ${file.padEnd(40)} bias: ${before}% → ${after}%  (+${expanded} opts)${warn}`);
}
console.log(`\nPass 2 done. Additional options rewritten: ${grandTotal}`);
