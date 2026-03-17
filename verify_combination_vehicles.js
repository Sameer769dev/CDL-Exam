const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'combination_vehicles_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    console.log(`Verifying ${questions.length} questions...`);

    const seenIds = new Set();
    let errors = 0;

    questions.forEach((q, index) => {
        // Check ID uniqueness
        if (seenIds.has(q.id)) {
            console.error(`Duplicate ID found: ${q.id}`);
            errors++;
        }
        seenIds.add(q.id);

        // Check ID sequence (optional but good)
        if (q.id !== index + 1) {
            // console.warn(`ID mismatch at index ${index}: expected ${index + 1}, found ${q.id}`);
        }

        // Check required fields
        if (!q.question || !q.options || !q.correct_answer || !q.explanation) {
            console.error(`Missing fields in question ID ${q.id}`);
            errors++;
        }

        // Check if correct answer is in options
        if (!q.options.includes(q.correct_answer)) {
            console.error(`Correct answer not found in options for ID ${q.id}`);
            errors++;
        }
    });

    if (errors === 0) {
        console.log('Verification successful! No errors found.');
    } else {
        console.error(`Verification failed with ${errors} errors.`);
    }

} catch (err) {
    console.error('Error verifying data:', err);
}
