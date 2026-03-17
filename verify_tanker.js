const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'tanker_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    console.log(`Total questions: ${questions.length}`);

    let errors = [];
    const seenIds = new Set();
    const seenQuestions = new Set();

    questions.forEach((q, index) => {
        // Check ID sequence
        if (q.id !== index + 1) {
            errors.push(`Question at index ${index} has incorrect ID: ${q.id}. Expected: ${index + 1}`);
        }

        // Check for duplicate IDs
        if (seenIds.has(q.id)) {
            errors.push(`Duplicate ID found: ${q.id}`);
        }
        seenIds.add(q.id);

        // Check for duplicate question text
        if (seenQuestions.has(q.question)) {
            errors.push(`Duplicate question text found at ID ${q.id}: "${q.question}"`);
        }
        seenQuestions.add(q.question);

        // Check for missing fields
        if (!q.category || !q.categoryId || !q.question || !q.options || !q.correct_answer || !q.explanation) {
            errors.push(`Missing fields in question ID ${q.id}`);
        }

        // Check options length
        if (q.options.length !== 4) {
            errors.push(`Question ID ${q.id} has ${q.options.length} options. Expected 4.`);
        }

        // Check if correct answer is in options
        if (!q.options.includes(q.correct_answer)) {
            errors.push(`Question ID ${q.id} correct answer not found in options.`);
        }
    });

    if (errors.length > 0) {
        console.error('Verification failed with the following errors:');
        const errorLogPath = path.join(__dirname, 'verification_errors.txt');
        fs.writeFileSync(errorLogPath, errors.join('\n'), 'utf8');
        console.log(`Errors written to ${errorLogPath}`);
        errors.forEach(e => console.error(`- ${e}`));
    } else {
        console.log('Verification successful! No errors found.');
    }

} catch (err) {
    console.error('Error reading or parsing file:', err);
}
