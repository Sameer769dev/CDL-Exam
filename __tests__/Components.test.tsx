import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OptionButton } from '../src/components/OptionButton';
import { ProgressBar } from '../src/components/ProgressBar';
import { StatCard } from '../src/components/StatCard';
import { Truck } from 'lucide-react-native';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

describe('OptionButton', () => {
    it('renders correctly in default state', () => {
        const { toJSON } = render(
            <OptionButton
                text="Option A"
                onPress={() => { }}
                state="default"
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it('renders correctly in correct state', () => {
        const { toJSON } = render(
            <OptionButton
                text="Option B"
                onPress={() => { }}
                state="correct"
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it('renders correctly in incorrect state', () => {
        const { toJSON } = render(
            <OptionButton
                text="Option C"
                onPress={() => { }}
                state="incorrect"
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        const { getByText } = render(
            <OptionButton
                text="Press Me"
                onPress={mockOnPress}
                state="default"
            />
        );

        fireEvent.press(getByText('Press Me'));
        expect(mockOnPress).toHaveBeenCalled();
    });
});

describe('ProgressBar', () => {
    it('renders correctly with 50% progress', () => {
        const { toJSON } = render(
            <ProgressBar current={5} total={10} />
        );
        expect(toJSON()).toMatchSnapshot();
    });
});

describe('StatCard', () => {
    it('renders correctly with trend', () => {
        const { toJSON } = render(
            <StatCard
                icon={Truck}
                label="Total Questions"
                value="150"
                trend="up"
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });
});
