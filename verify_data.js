const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/general_knowledge_data.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${data.length} questions.`);

    const ids = new Set();
    const questions = new Set();
    let errors = 0;
    let warnings = 0;
    let sequenceErrors = 0;

    data.forEach((item, index) => {
        // Check for duplicate IDs
        if (ids.has(item.id)) {
            console.error(`Duplicate ID found: ${item.id} at index ${index}`);
            errors++;
        }
        ids.add(item.id);

        // Check sequence (should be sequential from 1001 onwards)
        const expectedId = 1001 + index;
        if (item.id !== expectedId) {
            console.warn(`ID sequence issue at index ${index}: expected ${expectedId}, found ${item.id}`);
            sequenceErrors++;
        }

        if (questions.has(item.question)) {
            console.warn(`Potential duplicate question text: "${item.question.substring(0, 50)}..." at ID ${item.id}`);
            warnings++;
        }
        questions.add(item.question);

        if (!item.category || !item.categoryId || !item.question || !item.options || !item.correct_answer || !item.explanation) {
            console.error(`Missing fields at ID ${item.id}`);
            errors++;
        }

        if (!Array.isArray(item.options) || (item.options.length !== 4 && item.options.length !== 2)) {
            console.warn(`ID ${item.id} has ${item.options ? item.options.length : 0} options (expected 4 or 2 for T/F).`);
            warnings++;
        }

        if (!item.options.includes(item.correct_answer)) {
            console.error(`ID ${item.id}: Correct answer not found in options.`);
            errors++;
        }
    });

    console.log(`\nVerification Summary:`);
    console.log(`Total Questions: ${data.length}`);
    console.log(`Unique IDs: ${ids.size}`);
    console.log(`Sequence Errors: ${sequenceErrors}`);
    console.log(`Errors: ${errors}`);
    console.log(`Warnings: ${warnings}`);

    if (errors === 0 && sequenceErrors === 0) {
        console.log('\n✓ Verification PASSED: No critical errors or sequence issues found.');
    } else {
        console.log(`\n✗ Verification FAILED: ${errors} errors and ${sequenceErrors} sequence issues found.`);
    }

} catch (err) {
    console.error('Error reading or parsing file:', err.message);
}
