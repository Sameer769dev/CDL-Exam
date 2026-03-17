import React, { useState } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Animated, {
    FadeIn,
    SlideInUp,
    FadeInDown,
    SharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
    icon?: React.ReactNode;
    imageSource?: any;
    title: string;
    description: string;
    isFirstSlide?: boolean;
    index: number;
    scrollX: SharedValue<number>;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
    icon,
    imageSource,
    title,
    description,
    isFirstSlide = false,
    index,
    scrollX
}) => {
    const [imageError, setImageError] = useState(false);

    const imageAnimatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
        ];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [100, 0, 100],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ scale }, { translateY }],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
        ];

        const translateX = interpolate(
            scrollX.value,
            inputRange,
            [SCREEN_WIDTH * 0.5, 0, -SCREEN_WIDTH * 0.5],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0, 1, 0],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateX }],
            opacity,
        };
    });

    return (
        <View className="flex-1 items-center justify-center px-8" style={{ width: SCREEN_WIDTH }}>
            {/* Visual Content - Parallax Effect */}
            <Animated.View
                className="mb-16 items-center justify-center"
                style={[{ height: 280 }, imageAnimatedStyle]}
            >
                {imageSource && !imageError ? (
                    <Image
                        source={imageSource}
                        style={{ width: 320, height: 320 }}
                        resizeMode="contain"
                        onError={(error) => {
                            console.error('[Onboarding] Image failed to load:', error.nativeEvent.error);
                            setImageError(true);
                        }}
                    />
                ) : (
                    icon
                )}
            </Animated.View>

            {/* Text Content - Parallax Effect */}
            <View className="w-full">
                <Animated.View style={textAnimatedStyle}>
                    <Text className="text-4xl font-bold text-slate-50 text-left mb-4 tracking-tight">
                        {title}
                    </Text>
                    <Text className="text-lg text-slate-400 text-left leading-relaxed">
                        {description}
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
};
