const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'school_bus_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    console.log(`Total questions: ${questions.length}`);

    const ids = new Set();
    const duplicates = [];
    const missingFields = [];
    const invalidCategory = [];

    questions.forEach((q, index) => {
        if (ids.has(q.id)) {
            duplicates.push(q.id);
        }
        ids.add(q.id);

        if (!q.question || !q.options || !q.correct_answer || !q.explanation) {
            missingFields.push(q.id);
        }

        if (q.categoryId !== 'school_bus') {
            invalidCategory.push({ id: q.id, categoryId: q.categoryId });
        }

        if (!q.options.includes(q.correct_answer)) {
            console.error(`Question ${q.id} has correct answer not in options`);
        }
    });

    if (duplicates.length > 0) {
        console.error('Duplicate IDs found:', duplicates);
    } else {
        console.log('No duplicate IDs found.');
    }

    if (missingFields.length > 0) {
        console.error('Questions with missing fields:', missingFields);
    } else {
        console.log('No questions with missing fields.');
    }

    if (invalidCategory.length > 0) {
        console.error('Questions with invalid categoryId:', invalidCategory);
    } else {
        console.log('All questions have correct categoryId.');
    }

    // Check for duplicate question texts
    const questionTexts = new Set();
    const duplicateTexts = [];
    questions.forEach(q => {
        if (questionTexts.has(q.question)) {
            duplicateTexts.push(q.id);
        }
        questionTexts.add(q.question);
    });

    if (duplicateTexts.length > 0) {
        console.warn(`Found ${duplicateTexts.length} duplicate question texts.`);
    } else {
        console.log('No duplicate question texts found.');
    }


} catch (err) {
    console.error('Error:', err);
}
