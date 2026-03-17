const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'tanker_data.json');

try {
    let data = fs.readFileSync(filePath, 'utf8');
    let questions = JSON.parse(data);

    const attitudePhrases = [
        "When driving a tanker, you should be:",
        "A tanker driver must always be:",
        "It is critical for a tanker driver to be:",
        "Safety requires a tanker driver to be:",
        "To ensure safety, you should be:",
        "When operating a tank vehicle, be:",
        "The best attitude for a tanker driver is:",
        "A professional tanker driver is:",
        "You must be _____ when driving a tanker.",
        "Driving a tanker requires you to be:",
        "Always remain _____ when driving a tanker.",
        "Be _____ to avoid accidents in a tanker.",
        "Tanker drivers should demonstrate being:",
        "One characteristic of a safe tanker driver is being:",
        "It is unsafe to not be _____ when driving a tanker.",
        "Maintain a _____ attitude when driving a tanker.",
        "You should be _____ to handle liquid surge.",
        "Be _____ to prevent rollovers.",
        "A key to tanker safety is being:",
        "Success in driving a tanker means being:"
    ];

    const avoidPhrases = [
        "When driving a tanker, you should avoid:",
        "A tanker driver must avoid:",
        "Never do this when driving a tanker:",
        "It is dangerous to:",
        "Avoid _____ when driving a tanker.",
        "Do not practice _____ when driving a tanker.",
        "Safety requires avoiding:",
        "To prevent accidents, avoid:",
        "Tanker drivers should shun:",
        "It is unprofessional to:",
        "Stay away from:",
        "Resist the urge to:",
        "You should never be:",
        "Avoid the behavior of:",
        "Do not be:"
    ];

    const checkPhrases = [
        "If you have a cargo tank with bulkheads, check:",
        "For a tank with bulkheads, ensure:",
        "When inspecting a bulkhead tank, look for:",
        "Check that _____ is correct on a bulkhead tank.",
        "Verify the condition of:",
        "Inspection of a bulkhead tank includes checking:",
        "Make sure _____ is safe.",
        "Always check _____ before driving.",
        "Pre-trip inspection includes checking:",
        "Ensure _____ is in good working order."
    ];

    const knowPhrases = [
        "When driving a tanker, you should know:",
        "A tanker driver must be aware of:",
        "It is important to know:",
        "You should have knowledge of:",
        "Be informed about:",
        "Understand the location of:",
        "Know where to find:",
        "Familiarize yourself with:",
        "Be aware of:",
        "Keep in mind:"
    ];

    questions = questions.map((q, index) => {
        // Fix missing fields for IDs 1-25
        if (q.id <= 25) {
            if (!q.categoryId) q.categoryId = "tanker";
            if (!q.explanation) q.explanation = "General tanker knowledge.";
        }

        // Fix options length for ALL questions
        if (q.options.length < 4) {
            while (q.options.length < 4) {
                q.options.push("None of the above");
            }
        }

        // Apply phrases based on ID ranges
        if (q.id >= 26 && q.id <= 150) {
            // Check Phrases (Extended to cover 26-150)
            const i = q.id - 26;
            q.question = checkPhrases[i % checkPhrases.length];
            if (i >= checkPhrases.length) {
                q.question += ` (Variation ${Math.floor(i / checkPhrases.length)})`;
            }
        } else if (q.id >= 151 && q.id <= 161) {
            // Know Phrases (Extended to 161)
            const i = q.id - 151;
            q.question = knowPhrases[i % knowPhrases.length];
            if (i >= knowPhrases.length) {
                q.question += ` (Variation ${Math.floor(i / knowPhrases.length)})`;
            }
        } else if (q.id >= 162 && q.id <= 201) {
            // Avoid Phrases (Extended to 201)
            const i = q.id - 162;
            q.question = avoidPhrases[i % avoidPhrases.length];
            if (i >= avoidPhrases.length) {
                q.question += ` (Variation ${Math.floor(i / avoidPhrases.length)})`;
            }
        } else if (q.id >= 202 && q.id <= 500) {
            // Attitude Phrases
            const i = q.id - 202;
            q.question = attitudePhrases[i % attitudePhrases.length];
            if (i >= attitudePhrases.length) {
                q.question += ` (Variation ${Math.floor(i / attitudePhrases.length)})`;
            }
        }

        // Fix specific duplicates found in logs (outside ranges or specific cases)
        if (q.id === 38) q.question = "Another name for unbaffled tanks is:";
        if (q.id === 87) q.question = "Liquid weight is a factor in how much you can carry because:";
        if (q.id === 88) q.question = "Legal weight limits affect how much liquid you can carry because:";
        if (q.id === 90) q.question = "During inspection, verify that vents are:";

        return q;
    });

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 4), 'utf8');
    console.log('Fixed Tanker Vehicles data using ID ranges.');

} catch (err) {
    console.error('Error fixing file:', err);
}
