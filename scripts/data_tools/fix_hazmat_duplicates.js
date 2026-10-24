const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'hazmat_data.json');

const replacements = {
    421: {
        question: "When transporting Division 1.1 explosives, you must not park within ____ feet of a bridge, tunnel, or building.",
        options: ["300", "100", "500", "200"],
        correct_answer: "300",
        explanation: "Safety distance from structures."
    },
    422: {
        question: "If you are transporting Division 1.1 explosives, you must have a written route plan that includes:",
        options: ["All stops and the destination", "Lunch spots", "Scenic views", "Gas stations only"],
        correct_answer: "All stops and the destination",
        explanation: "Route plan requirements."
    },
    423: {
        question: "A vehicle transporting Division 1.1 explosives may be left unattended:",
        options: ["Only at a safe haven", "Anywhere", "At a mall", "At a park"],
        correct_answer: "Only at a safe haven",
        explanation: "Unattended vehicle rule."
    },
    424: {
        question: "When parking a vehicle with Division 1.1 explosives, you must ensure:",
        options: ["The vehicle is parked on private property if possible", "The vehicle is on the road", "The vehicle is in a ditch", "The vehicle is hidden"],
        correct_answer: "The vehicle is parked on private property if possible",
        explanation: "Parking preference."
    },
    425: {
        question: "If you are transporting explosives and break down, you should:",
        options: ["Notify the police and fire department", "Call a friend", "Walk home", "Sleep"],
        correct_answer: "Notify the police and fire department",
        explanation: "Breakdown procedure."
    },
    433: {
        question: "You must not smoke within 25 feet of a vehicle containing:",
        options: ["Explosives, flammables, or oxidizers", "Corrosives", "Poisons", "Radioactive material"],
        correct_answer: "Explosives, flammables, or oxidizers",
        explanation: "Smoking restriction."
    },
    478: {
        question: "Class 7 materials are:",
        options: ["Radioactive", "Corrosive", "Explosive", "Flammable"],
        correct_answer: "Radioactive",
        explanation: "Class 7 definition."
    },
    479: {
        question: "Class 8 materials are:",
        options: ["Corrosive", "Radioactive", "Explosive", "Flammable"],
        correct_answer: "Corrosive",
        explanation: "Class 8 definition."
    },
    480: {
        question: "Class 9 materials are:",
        options: ["Miscellaneous hazardous materials", "Corrosive", "Radioactive", "Explosive"],
        correct_answer: "Miscellaneous hazardous materials",
        explanation: "Class 9 definition."
    },
    483: {
        question: "The Hazardous Materials Table is found in:",
        options: ["49 CFR 172.101", "The Bible", "The dictionary", "The newspaper"],
        correct_answer: "49 CFR 172.101",
        explanation: "Regulation reference."
    },
    494: {
        question: "You must check the cargo securement of a hazmat load:",
        options: ["Within the first 50 miles", "Within the first 100 miles", "Within the first 200 miles", "Never"],
        correct_answer: "Within the first 50 miles",
        explanation: "Securement check."
    }
};

// New unique questions to replace the duplicates
const newQuestions = {
    421: {
        question: "What is the primary danger of Class 1 explosives?",
        options: ["Explosion", "Fire", "Corrosion", "Radiation"],
        correct_answer: "Explosion",
        explanation: "Class 1 is explosives."
    },
    422: {
        question: "Which of the following is a Class 2 hazardous material?",
        options: ["Propane", "Gasoline", "Battery Acid", "Dynamite"],
        correct_answer: "Propane",
        explanation: "Propane is a flammable gas (Class 2)."
    },
    423: {
        question: "Class 3 hazardous materials are:",
        options: ["Flammable liquids", "Gases", "Explosives", "Radioactive"],
        correct_answer: "Flammable liquids",
        explanation: "Class 3 is flammable liquids."
    },
    424: {
        question: "What is the main hazard of Class 4 materials?",
        options: ["Flammable solids", "Explosion", "Poison", "Corrosion"],
        correct_answer: "Flammable solids",
        explanation: "Class 4 is flammable solids."
    },
    425: {
        question: "Class 5 materials include:",
        options: ["Oxidizers and Organic Peroxides", "Explosives", "Gases", "Liquids"],
        correct_answer: "Oxidizers and Organic Peroxides",
        explanation: "Class 5 covers oxidizers."
    },
    433: {
        question: "If you are transporting Division 1.1 explosives, you must not park within ____ feet of a bridge, tunnel, or building.",
        options: ["300", "100", "500", "200"],
        correct_answer: "300",
        explanation: "Safety distance."
    },
    478: {
        question: "What label must be on a package containing radioactive material?",
        options: ["Radioactive", "Corrosive", "Explosive", "Flammable"],
        correct_answer: "Radioactive",
        explanation: "Labeling requirement."
    },
    479: {
        question: "Which class includes sulfuric acid?",
        options: ["Class 8", "Class 3", "Class 1", "Class 9"],
        correct_answer: "Class 8",
        explanation: "Sulfuric acid is corrosive."
    },
    480: {
        question: "Dry ice is an example of which class?",
        options: ["Class 9", "Class 8", "Class 1", "Class 3"],
        correct_answer: "Class 9",
        explanation: "Miscellaneous hazardous material."
    },
    483: {
        question: "Where can you find the Hazardous Materials Table?",
        options: ["49 CFR 172.101", "The driver's manual", "The truck cab", "The police station"],
        correct_answer: "49 CFR 172.101",
        explanation: "Regulatory source."
    },
    494: {
        question: "How often must you check the tires on a placarded vehicle?",
        options: ["Every 2 hours or 100 miles", "Every 4 hours", "Every day", "Never"],
        correct_answer: "Every 2 hours or 100 miles",
        explanation: "Tire check rule."
    }
};


try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updatedCount = 0;

    const updatedData = data.map(item => {
        if (newQuestions[item.id]) {
            updatedCount++;
            return {
                ...item,
                ...newQuestions[item.id]
            };
        }
        return item;
    });

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 4), 'utf8');
    console.log(`Successfully replaced ${updatedCount} duplicate questions in ${filePath}`);

} catch (error) {
    console.error('Error processing file:', error);
}
