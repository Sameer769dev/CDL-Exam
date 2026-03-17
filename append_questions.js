const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'school_bus_data.json');
const newQuestionsPath = path.join(__dirname, 'new_questions_temp.json');

try {
    const existingData = fs.readFileSync(filePath, 'utf8');
    const existingQuestions = JSON.parse(existingData);

    const newData = fs.readFileSync(newQuestionsPath, 'utf8');
    const newQuestions = JSON.parse(newData);

    const updatedQuestions = [...existingQuestions, ...newQuestions];

    fs.writeFileSync(filePath, JSON.stringify(updatedQuestions, null, 4));
    console.log(`Added ${newQuestions.length} questions. Total: ${updatedQuestions.length}`);

} catch (err) {
    console.error('Error:', err);
}
