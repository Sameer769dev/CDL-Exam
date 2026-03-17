const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'passenger_transport_data.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    const shuffledQuestions = questions.map(q => {
        // Create a copy of options and shuffle them
        const shuffledOptions = [...q.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        return {
            ...q,
            options: shuffledOptions
        };
    });

    fs.writeFileSync(filePath, JSON.stringify(shuffledQuestions, null, 4));
    console.log('Successfully shuffled options for Passenger Transport questions.');

} catch (err) {
    console.error('Error:', err);
}
