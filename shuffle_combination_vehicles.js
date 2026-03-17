const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'combination_vehicles_data.json');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let questions = JSON.parse(data);

    questions = questions.map(q => {
        if (q.options && Array.isArray(q.options)) {
            q.options = shuffleArray(q.options);
        }
        return q;
    });

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 4));
    console.log(`Shuffled options for ${questions.length} questions in Combination Vehicles.`);

} catch (err) {
    console.error('Error shuffling options:', err);
}
