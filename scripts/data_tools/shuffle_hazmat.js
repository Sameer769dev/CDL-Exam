const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'hazmat_data.json');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updatedCount = 0;

    const updatedData = data.map(item => {
        // Keep track of the correct answer text
        const correctAnswerText = item.correct_answer;

        // Shuffle the options
        const shuffledOptions = shuffleArray([...item.options]);

        // Update the item
        return {
            ...item,
            options: shuffledOptions
        };
    });

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 4), 'utf8');
    console.log(`Successfully shuffled options for ${updatedData.length} questions in ${filePath}`);

} catch (error) {
    console.error('Error processing file:', error);
}
