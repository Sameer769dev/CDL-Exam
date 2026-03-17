const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const categoriesFile = path.join(dataDir, 'categories.json');

const categoryFiles = {
    'air_brakes': 'air_brakes_data.json',
    'combination_vehicles': 'combination_vehicles_data.json',
    'doubles_triples': 'doubles_triples_data.json',
    'general_knowledge': 'general_knowledge_data.json',
    'hazmat': 'hazmat_data.json',
    'passenger_transport': 'passenger_transport_data.json',
    'school_bus': 'school_bus_data.json',
    'tanker': 'tanker_data.json'
};

try {
    const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
    console.log('Loaded categories.json');

    let allPassed = true;

    for (const cat of categoriesData) {
        const filename = categoryFiles[cat.id];
        if (!filename) {
            console.warn(`Warning: No data file mapped for category ID: ${cat.id}`);
            continue;
        }

        const filePath = path.join(dataDir, filename);
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found for ${cat.name}: ${filename}`);
            allPassed = false;
            continue;
        }

        try {
            const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`\nVerifying ${cat.name} (${filename})...`);
            console.log(`Expected count: ${cat.totalQuestions}, Actual count: ${questions.length}`);

            if (questions.length !== cat.totalQuestions) {
                console.error(`❌ Count mismatch! Expected ${cat.totalQuestions}, found ${questions.length}`);
                allPassed = false;
            } else {
                console.log(`✅ Count matches.`);
            }

            const ids = new Set();
            const duplicates = [];
            const missingFields = [];
            const invalidCategory = [];
            const questionTexts = new Set();
            const duplicateTexts = [];

            questions.forEach(q => {
                // Check IDs
                if (ids.has(q.id)) duplicates.push(q.id);
                ids.add(q.id);

                // Check Fields
                if (!q.question || !q.options || !q.correct_answer || !q.explanation) {
                    missingFields.push(q.id);
                }

                // Check Category ID
                if (q.categoryId !== cat.id) {
                    invalidCategory.push({ id: q.id, found: q.categoryId, expected: cat.id });
                }

                // Check Duplicate Text
                if (questionTexts.has(q.question)) {
                    duplicateTexts.push(q.id);
                }
                questionTexts.add(q.question);
            });

            if (duplicates.length > 0) {
                console.error(`❌ Duplicate IDs found: ${duplicates.length}`);
                allPassed = false;
            }
            if (missingFields.length > 0) {
                console.error(`❌ Missing fields found: ${missingFields.length}`);
                allPassed = false;
            }
            if (invalidCategory.length > 0) {
                console.error(`❌ Invalid categoryId found: ${invalidCategory.length}`);
                allPassed = false;
            }
            if (duplicateTexts.length > 0) {
                console.warn(`⚠️ Duplicate question texts found: ${duplicateTexts.length}`);
                // Not failing strictly on duplicate texts for now, but good to know
            }

            if (duplicates.length === 0 && missingFields.length === 0 && invalidCategory.length === 0) {
                console.log(`✅ Data integrity checks passed.`);
            }

        } catch (e) {
            console.error(`Error parsing ${filename}:`, e.message);
            allPassed = false;
        }
    }

    if (allPassed) {
        console.log('\n🎉 ALL CATEGORIES VERIFIED SUCCESSFULLY!');
    } else {
        console.error('\n❌ SOME CHECKS FAILED.');
    }

} catch (err) {
    console.error('Error reading categories.json:', err);
}
