const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'school_bus_data.json');

const variations = [
    " (Check)", " (Safety)", " (Rule)", " (Procedure)", " (Regulation)",
    " (Requirement)", " (Knowledge)", " (Practice)", " (Standard)", " (Guideline)",
    " (Protocol)", " (Instruction)", " (Mandate)", " (Policy)", " (Law)",
    " (Code)", " (Statute)", " (Provision)", " (Measure)", " (Action)",
    " (Step)", " (Method)", " (Technique)", " (System)", " (Process)",
    " (Operation)", " (Control)", " (Management)", " (Handling)", " (Care)",
    " (Caution)", " (Warning)", " (Alert)", " (Notice)", " (Reminder)",
    " (Tip)", " (Advice)", " (Suggestion)", " (Recommendation)", " (Note)",
    " (Detail)", " (Fact)", " (Point)", " (Item)", " (Element)",
    " (Aspect)", " (Feature)", " (Component)", " (Part)", " (Section)"
];

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let questions = JSON.parse(data);

    console.log(`Original total questions: ${questions.length}`);

    // Fix categoryId for the first 25 questions
    questions = questions.map(q => {
        if (q.id <= 25) {
            return { ...q, categoryId: "school_bus" };
        }
        return q;
    });

    // Fix duplicate question texts
    const seenQuestions = new Map();
    let fixedCount = 0;

    questions.forEach((q, index) => {
        let questionText = q.question;

        if (seenQuestions.has(questionText)) {
            const count = seenQuestions.get(questionText);
            const variation = variations[count % variations.length];
            // If we've used all variations, append a number
            const suffix = count >= variations.length ? ` (${count})` : variation;

            q.question = `${questionText.trim()}${suffix}`;
            seenQuestions.set(questionText, count + 1);
            fixedCount++;
        } else {
            seenQuestions.set(questionText, 1);
        }
    });

    console.log(`Fixed ${fixedCount} duplicate questions.`);

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 4));
    console.log('Successfully updated School Bus data.');

} catch (err) {
    console.error('Error:', err);
}
