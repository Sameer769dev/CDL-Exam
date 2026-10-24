const fs = require('fs');

const filePath = './src/data/doubles_triples_data.json';
const errorLogPath = './verification_errors.txt';

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    let errors = [];

    // Check for duplicates
    const seenIds = new Set();
    const seenQuestions = new Set();

    questions.forEach((q, index) => {
        // Check ID
        if (seenIds.has(q.id)) {
            errors.push(`Duplicate ID found: ${q.id} at index ${index}`);
        }
        seenIds.add(q.id);

        // Check Question Text
        if (seenQuestions.has(q.question)) {
            errors.push(`Duplicate question text found: "${q.question}" at ID ${q.id}`);
        }
        seenQuestions.add(q.question);

        // Check Options Count
        if (q.options.length !== 4) {
            errors.push(`Incorrect option count for ID ${q.id}: Found ${q.options.length}, expected 4`);
        }

        // Check Correct Answer
        if (!q.options.includes(q.correct_answer)) {
            errors.push(`Correct answer not found in options for ID ${q.id}: "${q.correct_answer}"`);
        }

        // Check Category ID
        if (q.categoryId !== 'doubles_triples') {
            errors.push(`Incorrect categoryId for ID ${q.id}: Found "${q.categoryId}", expected "doubles_triples"`);
        }
    });

    if (errors.length > 0) {
        console.error('Verification failed with errors:');
        errors.forEach(e => console.error(e));
        fs.writeFileSync(errorLogPath, errors.join('\n'));
    } else {
        console.log('Verification successful! No errors found.');
        if (fs.existsSync(errorLogPath)) {
            fs.unlinkSync(errorLogPath);
        }
    }

} catch (error) {
    console.error('Error verifying data:', error);
}
