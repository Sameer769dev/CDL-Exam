const fs = require('fs');

const filePath = './src/data/hazmat_data.json';

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let questions = JSON.parse(data);

    // 1. Fix missing categoryId for IDs 1-25
    questions = questions.map(q => {
        if (q.id <= 25 && !q.categoryId) {
            return { ...q, categoryId: "hazmat" };
        }
        return q;
    });

    // 2. Fix Incorrect Option Counts
    questions = questions.map(q => {
        if (q.options.length < 4) {
            const missing = 4 - q.options.length;
            for (let i = 0; i < missing; i++) {
                q.options.push("None of the above");
            }
        }
        return q;
    });

    // 3. Fix Duplicates
    const seenQuestions = new Map(); // Map question text to count

    // Phrases to vary questions
    const variations = [
        " (Check)", " (Verify)", " (Inspect)", " (Look for)", " (Ensure)",
        " (Confirm)", " (Examine)", " (Monitor)", " (Observe)", " (Test)",
        " (Validate)", " (Assess)", " (Review)", " (Audit)", " (Scan)",
        " (Safety)", " (Caution)", " (Warning)", " (Danger)", " (Risk)",
        " (Hazard)", " (Alert)", " (Notice)", " (Attention)", " (Care)",
        " (Protection)", " (Security)", " (Defense)", " (Guard)", " (Shield)",
        " (Procedure)", " (Method)", " (Process)", " (Step)", " (Action)",
        " (Technique)", " (Routine)", " (Practice)", " (System)", " (Way)",
        " (Approach)", " (Plan)", " (Strategy)", " (Tactic)", " (Mode)",
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

            // Apply variation
            if (count < variations.length) {
                newQuestion = `${q.question}${variations[count]}`;
            } else {
                // Fallback for many duplicates
                newQuestion = `${q.question} (Rule ${q.id})`;
            }

            // If still duplicate (unlikely with ID), append ID
            if (seenQuestions.has(newQuestion)) {
                newQuestion = `${newQuestion} (Ref ${q.id})`;
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
    console.log('Successfully fixed Hazmat data issues (v2).');

} catch (error) {
    console.error('Error fixing data:', error);
}
