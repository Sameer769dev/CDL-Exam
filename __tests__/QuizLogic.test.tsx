import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import QuizScreen from '../app/quiz';

// Mock Expo Router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
    Stack: {
        Screen: () => null,
    },
}));

// Mock Data to ensure consistent tests
jest.mock('../src/data/air_brakes_data.json', () => [
    {
        "id": 1,
        "category": "Air Brakes",
        "question": "Test Question 1",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option B",
        "explanation": "Explanation 1"
    },
    {
        "id": 2,
        "category": "Air Brakes",
        "question": "Test Question 2",
        "options": ["Option X", "Option Y"],
        "correct_answer": "Option X",
        "explanation": "Explanation 2"
    }
]);

describe('QuizScreen Logic', () => {
    it('renders the first question correctly', () => {
        render(<QuizScreen />);
        expect(screen.getByText('Test Question 1')).toBeTruthy();
        expect(screen.getByText('Option A')).toBeTruthy();
        expect(screen.getByText('Option B')).toBeTruthy();
    });

    it('shows explanation when an answer is selected', () => {
        render(<QuizScreen />);

        // Select an option
        fireEvent.press(screen.getByText('Option A'));

        // Explanation should appear
        expect(screen.getByText('Explanation 1')).toBeTruthy();
    });

    it('shows "Next Question" button after answering', () => {
        render(<QuizScreen />);

        // Before answering, button should not exist (or be hidden logic dependent, usually conditional render)
        // Based on code: {isAnswered && ...}
        const nextButtonBefore = screen.queryByText('Next Question');
        expect(nextButtonBefore).toBeNull();

        // Answer
        fireEvent.press(screen.getByText('Option B'));

        // Button should appear
        expect(screen.getByText('Next Question')).toBeTruthy();
    });

    it('advances to the next question when "Next Question" is pressed', () => {
        render(<QuizScreen />);

        // Answer Question 1
        fireEvent.press(screen.getByText('Option B'));
        fireEvent.press(screen.getByText('Next Question'));

        // Should now see Question 2
        expect(screen.getByText('Test Question 2')).toBeTruthy();
    });
});
