const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'tanker_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    questions.forEach(q => {
        if (q.options && Array.isArray(q.options)) {
            shuffleArray(q.options);
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 4), 'utf8');
    console.log(`Shuffled options for ${questions.length} questions in ${filePath}`);

} catch (err) {
    console.error('Error processing file:', err);
}
