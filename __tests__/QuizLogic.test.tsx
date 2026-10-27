import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuizScreen from '../app/quiz';
import { UserProvider } from '../src/context/UserContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { GameProvider } from '../src/context/GameContext';

const renderQuiz = () => render(
    <ThemeProvider>
        <UserProvider>
            <GameProvider>
                <QuizScreen />
            </GameProvider>
        </UserProvider>
    </ThemeProvider>
);

// Mock Expo Router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({ categoryId: 'air_brakes', mode: 'standard' }),
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
    beforeEach(async () => {
        await AsyncStorage.clear();
        jest.clearAllMocks();
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the first question correctly', async () => {
        const { findByText, getByText } = renderQuiz();
        expect(await findByText('Test Question 1')).toBeTruthy();
        expect(getByText('Option A')).toBeTruthy();
        expect(getByText('Option B')).toBeTruthy();
    });

    it('shows explanation when an answer is selected', async () => {
        const { findByText } = renderQuiz();

        // Select an option
        const optionA = await findByText('Option A');
        fireEvent.press(optionA);

        // Explanation should appear
        expect(await findByText('Explanation 1')).toBeTruthy();
    });

    it('shows "Continue" button after answering', async () => {
        const { findByText, queryByText, getByText } = renderQuiz();

        await findByText('Test Question 1');
        // Before answering, button should not exist
        const continueBtnBefore = queryByText('Continue');
        expect(continueBtnBefore).toBeNull();

        // Answer
        fireEvent.press(getByText('Option B'));

        // Button should appear
        expect(await findByText('Continue')).toBeTruthy();
    });

    it('advances to the next question when "Continue" is pressed', async () => {
        const { findByText, getByText } = renderQuiz();

        await findByText('Test Question 1');
        // Answer Question 1
        fireEvent.press(getByText('Option B'));
        const nextBtn = await findByText('Continue');
        fireEvent.press(nextBtn);

        // Should now see Question 2
        expect(await findByText('Test Question 2')).toBeTruthy();
    });
});
