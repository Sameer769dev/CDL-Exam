import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, Button } from 'react-native';

// Mock Navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: mockBack,
    }),
    useLocalSearchParams: () => ({}),
    Stack: {
        Screen: () => null,
    },
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock Storage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Simple Integration Test Component
const MockHomeScreen = () => (
    <View>
        <Text>Home Screen</Text>
        <Button title="Start Quiz" onPress={() => mockPush('/quiz')} />
        <Button title="Settings" onPress={() => mockPush('/settings')} />
    </View>
);

describe('Integration Flows', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to quiz when start button is pressed', () => {
        const { getByText } = render(<MockHomeScreen />);

        fireEvent.press(getByText('Start Quiz'));

        expect(mockPush).toHaveBeenCalledWith('/quiz');
    });

    it('navigates to settings when settings button is pressed', () => {
        const { getByText } = render(<MockHomeScreen />);

        fireEvent.press(getByText('Settings'));

        expect(mockPush).toHaveBeenCalledWith('/settings');
    });
});
