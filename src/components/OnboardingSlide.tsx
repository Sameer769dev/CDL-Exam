import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Animated, { FadeIn, SlideInUp, FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
    icon?: React.ReactNode;
    imageSource?: any;
    title: string;
    description: string;
    isFirstSlide?: boolean;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
    icon,
    imageSource,
    title,
    description,
    isFirstSlide = false
}) => {
    return (
        <View className="flex-1 items-center justify-center px-8" style={{ width: SCREEN_WIDTH }}>
            {/* Visual Content - Appears First */}
            <Animated.View
                entering={FadeIn.delay(200).duration(800)}
                className="mb-16 items-center justify-center"
                style={{ height: 280 }}
            >
                {isFirstSlide && imageSource ? (
                    <Image
                        source={imageSource}
                        style={{ width: 320, height: 320 }}
                        resizeMode="contain"
                    />
                ) : (
                    icon
                )}
            </Animated.View>

            {/* Text Content - Staggered Entrance */}
            <View className="w-full">
                <Animated.Text
                    entering={SlideInUp.delay(400).springify().damping(20).stiffness(80)}
                    className="text-5xl font-bold text-slate-50 text-left mb-4 tracking-tight"
                >
                    {title}
                </Animated.Text>
                <Animated.Text
                    entering={FadeInDown.delay(600).duration(800)}
                    className="text-lg text-slate-400 text-left leading-relaxed"
                >
                    {description}
                </Animated.Text>
            </View>
        </View>
    );
};
