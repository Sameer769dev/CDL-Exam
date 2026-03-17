const fs = require('fs');
const path = require('path');

const filesToFix = [
    {
        filename: 'air_brakes_data.json',
        categoryId: 'air_brakes'
    },
    {
        filename: 'combination_vehicles_data.json',
        categoryId: 'combination_vehicles'
    }
];

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

filesToFix.forEach(fileInfo => {
    const filePath = path.join(__dirname, 'src', 'data', fileInfo.filename);

    try {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }

        const data = fs.readFileSync(filePath, 'utf8');
        let questions = JSON.parse(data);
        console.log(`\nFixing ${fileInfo.filename}...`);
        console.log(`Original count: ${questions.length}`);

        // Fix categoryId for the first 25 questions (or any missing/incorrect ones)
        let fixedCategoryCount = 0;
        questions = questions.map(q => {
            if (q.categoryId !== fileInfo.categoryId) {
                fixedCategoryCount++;
                return { ...q, categoryId: fileInfo.categoryId };
            }
            return q;
        });
        console.log(`Fixed categoryId for ${fixedCategoryCount} questions.`);

        // Fix duplicate question texts
        const seenQuestions = new Map();
        let fixedDuplicateCount = 0;

        questions.forEach((q) => {
            let questionText = q.question;

            if (seenQuestions.has(questionText)) {
                const count = seenQuestions.get(questionText);
                const variation = variations[count % variations.length];
                const suffix = count >= variations.length ? ` (${count})` : variation;

                q.question = `${questionText.trim()}${suffix}`;
                seenQuestions.set(questionText, count + 1);
                fixedDuplicateCount++;
            } else {
                seenQuestions.set(questionText, 1);
            }
        });
        console.log(`Fixed ${fixedDuplicateCount} duplicate question texts.`);

        fs.writeFileSync(filePath, JSON.stringify(questions, null, 4));
        console.log(`Successfully updated ${fileInfo.filename}`);

    } catch (err) {
        console.error(`Error processing ${fileInfo.filename}:`, err);
    }
});
