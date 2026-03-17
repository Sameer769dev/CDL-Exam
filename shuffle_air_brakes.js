const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'air_brakes_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    questions.forEach(q => {
        // Fisher-Yates shuffle
        for (let i = q.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 4));
    console.log(`Shuffled options for ${questions.length} questions in ${filePath}`);

} catch (err) {
    console.error('Error:', err);
}
