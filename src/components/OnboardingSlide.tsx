import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

interface OnboardingSlideProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
    icon,
    title,
    description
}) => {
    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            className="flex-1 items-center justify-center px-8"
        >
            <Animated.View
                entering={SlideInRight.delay(200).springify()}
                className="mb-12"
            >
                {icon}
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400)}>
                <Text className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">
                    {title}
                </Text>
                <Text className="text-lg text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                    {description}
                </Text>
            </Animated.View>
        </Animated.View>
    );
};
