const fs = require('fs');

const filePath = './src/data/doubles_triples_data.json';

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);

    const shuffledQuestions = questions.map(q => {
        // Create a copy of options to shuffle
        const shuffledOptions = [...q.options];

        // Fisher-Yates shuffle
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
    console.log('Successfully shuffled options for Doubles/Triples questions.');

} catch (error) {
    console.error('Error shuffling options:', error);
}
