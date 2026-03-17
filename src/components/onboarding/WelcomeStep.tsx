import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Truck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';

interface WelcomeStepProps {
    onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
    const { colors } = useTheme();

    return (
        <View className="flex-1 items-center justify-center px-6">
            <Animated.View
                entering={FadeInDown.delay(200).springify()}
                className="items-center mb-12"
            >
                <View
                    className="w-40 h-40 rounded-full items-center justify-center mb-8"
                    style={{ backgroundColor: colors.primary.light }}
                >
                    <Truck size={80} color={colors.primary.main} />
                </View>
                <Text className="text-4xl font-bold text-center mb-4" style={{ color: colors.text.inverse }}>
                    CDL Prep 2025
                </Text>
                <Text className="text-lg text-center px-4" style={{ color: colors.text.secondary }}>
                    Your journey to becoming a professional driver starts here.
                </Text>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.delay(400).springify()}
                className="w-full"
            >
                <TouchableOpacity
                    onPress={onNext}
                    className="h-16 rounded-2xl items-center justify-center shadow-lg"
                    style={{
                        backgroundColor: colors.primary.main,
                        shadowColor: colors.primary.main,
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 5
                    }}
                >
                    <Text className="text-xl font-bold" style={{ color: colors.text.inverse }}>Get Started</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
