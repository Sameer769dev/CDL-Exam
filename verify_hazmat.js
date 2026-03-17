const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'hazmat_data.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const errors = [];
    const seenIds = new Set();
    const seenQuestions = new Set();

    console.log(`Verifying ${data.length} questions in ${filePath}...`);

    data.forEach((item, index) => {
        // Check ID sequence
        if (item.id !== index + 1) {
            errors.push(`ID mismatch at index ${index}: expected ${index + 1}, found ${item.id}`);
        }

        // Check for duplicate IDs
        if (seenIds.has(item.id)) {
            errors.push(`Duplicate ID found: ${item.id}`);
        }
        seenIds.add(item.id);

        // Check for duplicate questions
        if (seenQuestions.has(item.question)) {
            errors.push(`Duplicate question found at ID ${item.id}: "${item.question}"`);
        }
        seenQuestions.add(item.question);

        // Check structure
        if (!item.category || !item.categoryId || !item.question || !item.options || !item.correct_answer || !item.explanation) {
            errors.push(`Missing fields at ID ${item.id}`);
        }

        // Check options length
        if (item.options.length !== 4) {
            errors.push(`Incorrect number of options at ID ${item.id}: found ${item.options.length}`);
        }

        // Check if correct answer is in options
        if (!item.options.includes(item.correct_answer)) {
            errors.push(`Correct answer not found in options at ID ${item.id}`);
        }
    });

    if (errors.length > 0) {
        console.error('Verification failed with errors:');
        errors.forEach(err => console.error(`- ${err}`));
    } else {
        console.log('Verification successful! No errors found.');
    }

} catch (error) {
    console.error('Error verifying data:', error);
}
