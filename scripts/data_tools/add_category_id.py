import json

# Read the original air brakes data
with open('air_brakes_data.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Add categoryId to each question
for question in questions:
    question['categoryId'] = 'air_brakes'

# Write back to file
with open('air_brakes_data.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=4, ensure_ascii=False)

print(f"Successfully added categoryId to {len(questions)} questions")
