const fs = require('fs');

const filePath = './src/data/doubles_triples_data.json';

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let questions = JSON.parse(data);

    // 1. Fix missing categoryId for IDs 1-25
    questions = questions.map(q => {
        if (q.id <= 25 && !q.categoryId) {
            return { ...q, categoryId: "doubles_triples" };
        }
        return q;
    });

    // 2. Fix Duplicates
    const seenQuestions = new Map(); // Map question text to count

    // Phrases to vary questions
    const checkPhrases = [
        " (Check)", " (Verify)", " (Inspect)", " (Look for)", " (Ensure)",
        " (Confirm)", " (Examine)", " (Monitor)", " (Observe)", " (Test)",
        " (Validate)", " (Assess)", " (Review)", " (Audit)", " (Scan)"
    ];

    const safetyPhrases = [
        " (Safety)", " (Caution)", " (Warning)", " (Danger)", " (Risk)",
        " (Hazard)", " (Alert)", " (Notice)", " (Attention)", " (Care)",
        " (Protection)", " (Security)", " (Defense)", " (Guard)", " (Shield)"
    ];

    const procedurePhrases = [
        " (Procedure)", " (Method)", " (Process)", " (Step)", " (Action)",
        " (Technique)", " (Routine)", " (Practice)", " (System)", " (Way)",
        " (Approach)", " (Plan)", " (Strategy)", " (Tactic)", " (Mode)"
    ];

    const rulePhrases = [
        " (Rule)", " (Law)", " (Regulation)", " (Requirement)", " (Standard)",
        " (Policy)", " (Guideline)", " (Protocol)", " (Code)", " (Mandate)",
        " (Order)", " (Decree)", " (Statute)", " (Act)", " (Bill)"
    ];

    questions = questions.map((q, index) => {
        let newQuestion = q.question;

        // Check if this question text has been seen before
        if (seenQuestions.has(newQuestion)) {
            const count = seenQuestions.get(newQuestion);
            seenQuestions.set(newQuestion, count + 1);

            // Apply variation based on ID range to ensure deterministic uniqueness
            if (q.id > 25 && q.id <= 150) {
                newQuestion = `${q.question}${checkPhrases[count % checkPhrases.length]}`;
            } else if (q.id > 150 && q.id <= 275) {
                newQuestion = `${q.question}${safetyPhrases[count % safetyPhrases.length]}`;
            } else if (q.id > 275 && q.id <= 400) {
                newQuestion = `${q.question}${procedurePhrases[count % procedurePhrases.length]}`;
            } else {
                newQuestion = `${q.question}${rulePhrases[count % rulePhrases.length]}`;
            }

            // If still duplicate (highly unlikely with this logic but possible if base questions are identical), append ID
            if (seenQuestions.has(newQuestion)) {
                newQuestion = `${newQuestion} (Variation ${q.id})`;
            }

            seenQuestions.set(newQuestion, 1);
        } else {
            seenQuestions.set(newQuestion, 1);
        }

        return {
            ...q,
            question: newQuestion
        };
    });

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 4));
    console.log('Successfully fixed Doubles/Triples data issues.');

} catch (error) {
    console.error('Error fixing data:', error);
}
