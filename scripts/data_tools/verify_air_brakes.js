const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'air_brakes_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    console.log(`Verifying ${questions.length} questions in ${filePath}...`);

    const ids = new Set();
    let errors = 0;

    questions.forEach((q, index) => {
        // Check ID uniqueness
        if (ids.has(q.id)) {
            console.error(`Duplicate ID found: ${q.id}`);
            errors++;
        }
        ids.add(q.id);

        // Check sequence (optional, but good for order)
        if (q.id !== index + 1) {
            // console.warn(`ID mismatch at index ${index}: Expected ${index + 1}, found ${q.id}`);
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
        console.error(`Found ${errors} errors.`);
    }

} catch (err) {
    console.error('Error:', err);
}
