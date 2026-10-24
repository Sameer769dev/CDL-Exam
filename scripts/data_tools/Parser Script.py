import json
import re

# NOTE: In a real scenario, you would use a library like 'pypdf' or 'pdfplumber'
# to extract raw text from the PDF, and then send that text to an LLM API.
# This script simulates the output you would get from an LLM prompt.

def parse_cdl_content(raw_text):
    """
    Simulates parsing raw text into structured JSON.
    In production, this function would call an LLM API (OpenAI/Gemini).
    """
    
    # This is the "Prompt" you would send to the AI:
    prompt = f"""
    Read the following text from the CDL manual:
    '{raw_text}'
    
    Create 2 multiple choice questions based on this text.
    Format the output as a JSON array with 'id', 'question', 'options', 'correct_answer', and 'explanation'.
    """
    
    # SIMULATED RESPONSE from the AI (The "Golden" data)
    # This represents the structure you want your AI to return.
    ai_response = [
        {
            "id": 101,
            "category": "Hazmat",
            "question": "Who is responsible for checking shipping papers for hazardous materials?",
            "options": ["The Shipper", "The Carrier", "The Driver", "The Receiver"],
            "correct_answer": "The Driver",
            "explanation": "Drivers must check that the shipper has correctly named, labeled, and marked the hazardous materials."
        },
        {
            "id": 102,
            "category": "Hazmat",
            "question": "Placards must be placed on how many sides of the vehicle?",
            "options": ["1", "2", "3", "4"],
            "correct_answer": "4",
            "explanation": "You must attach placards to all four sides of your vehicle (front, rear, and both sides)."
        }
    ]
    
    return json.dumps(ai_response, indent=2)

# Example Usage
if __name__ == "__main__":
    # 1. Load your text (simulated here)
    sample_text = "Hazmat rules require placards on 4 sides..."
    
    # 2. Parse it
    json_output = parse_cdl_content(sample_text)
    
    # 3. Save to file
    with open("new_questions.json", "w") as f:
        f.write(json_output)
        
    print("Successfully generated JSON from text!")