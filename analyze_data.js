const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/general_knowledge_data.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Analyzing ${data.length} questions...\n`);

    let answerDistribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let longestQuestion = { id: 0, length: 0, text: '' };
    let longestOption = { id: 0, length: 0, text: '' };
    let duplicateOptionsCount = 0;
    let trueFalseCount = 0;

    data.forEach(q => {
        // Answer Distribution
        const correctIndex = q.options.indexOf(q.correct_answer);
        if (correctIndex !== -1) {
            answerDistribution[correctIndex] = (answerDistribution[correctIndex] || 0) + 1;
        }

        // Length Checks
        if (q.question.length > longestQuestion.length) {
            longestQuestion = { id: q.id, length: q.question.length, text: q.question };
        }

        q.options.forEach(opt => {
            if (opt.length > longestOption.length) {
                longestOption = { id: q.id, length: opt.length, text: opt };
            }
        });

        // Duplicate Options within a question
        const uniqueOptions = new Set(q.options);
        if (uniqueOptions.size !== q.options.length) {
            console.warn(`ID ${q.id} has duplicate options!`);
            duplicateOptionsCount++;
        }

        // True/False detection
        if (q.options.length === 2 &&
            q.options.some(o => o.toLowerCase() === 'true') &&
            q.options.some(o => o.toLowerCase() === 'false')) {
            trueFalseCount++;
        }
    });

    console.log('--- Analysis Report ---');
    console.log(`Total Questions: ${data.length}`);
    console.log(`True/False Questions: ${trueFalseCount}`);
    console.log(`Multiple Choice Questions: ${data.length - trueFalseCount}`);

    console.log('\nAnswer Distribution (Index 0-3):');
    Object.keys(answerDistribution).forEach(k => {
        const percentage = ((answerDistribution[k] / data.length) * 100).toFixed(1);
        console.log(`Option ${parseInt(k) + 1}: ${answerDistribution[k]} (${percentage}%)`);
    });

    console.log('\nContent Lengths:');
    console.log(`Longest Question (ID ${longestQuestion.id}): ${longestQuestion.length} chars`);
    console.log(`"${longestQuestion.text.substring(0, 50)}..."`);
    console.log(`Longest Option (ID ${longestOption.id}): ${longestOption.length} chars`);
    console.log(`"${longestOption.text.substring(0, 50)}..."`);

    console.log(`\nIssues Found:`);
    console.log(`Questions with duplicate options: ${duplicateOptionsCount}`);

} catch (err) {
    console.error('Error:', err.message);
}
