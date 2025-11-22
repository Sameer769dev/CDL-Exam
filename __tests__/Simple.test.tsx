import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View, Text } from 'react-native';

describe('Simple Test', () => {
    it('renders correctly', () => {
        render(
            <View>
                <Text>Hello World</Text>
            </View>
        );
        expect(screen.getByText('Hello World')).toBeTruthy();
    });
});
