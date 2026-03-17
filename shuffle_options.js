const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/general_knowledge_data.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Shuffling options for ${data.length} questions...`);

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    data.forEach(q => {
        const correctAnswerText = q.correct_answer;
        q.options = shuffleArray([...q.options]);

        if (!q.options.includes(correctAnswerText)) {
            console.error(`CRITICAL: Correct answer lost for ID ${q.id}`);
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log('Shuffling complete. Saved updated file.');

} catch (err) {
    console.error('Error:', err.message);
}
