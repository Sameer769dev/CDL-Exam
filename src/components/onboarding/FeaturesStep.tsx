import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    withSpring,
    FadeIn
} from 'react-native-reanimated';
import { BookOpen, Target, TrendingUp, ArrowRight } from 'lucide-react-native';
import { PaginationDots } from '../PaginationDots';

import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturesStepProps {
    onNext: () => void;
}

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ onNext }) => {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const scrollViewRef = useRef<Animated.ScrollView>(null);

    const slides = [
        {
            icon: <BookOpen size={100} color={colors.primary.main} />,
            title: "Practice Questions",
            description: "Access hundreds of real exam questions with detailed explanations."
        },
        {
            icon: <Target size={100} color={colors.primary.main} />,
            title: "Smart Study",
            description: "Focus on your weak areas with our intelligent mistake bank."
        },
        {
            icon: <TrendingUp size={100} color={colors.primary.main} />,
            title: "Track Progress",
            description: "Monitor your improvement with detailed statistics and analytics."
        }
    ];

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const handleNextSlide = () => {
        if (currentIndex < slides.length - 1) {
            scrollViewRef.current?.scrollTo({
                x: (currentIndex + 1) * SCREEN_WIDTH,
                animated: true
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            onNext();
        }
    };

    return (
        <View className="flex-1">
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                className="flex-1"
            >
                {slides.map((slide, index) => (
                    <View key={index} style={{ width: SCREEN_WIDTH }} className="items-center justify-center px-8">
                        <View className="mb-12 items-center">
                            <View
                                className="w-48 h-48 rounded-full items-center justify-center mb-8 border shadow-sm"
                                style={{
                                    backgroundColor: colors.background.card,
                                    borderColor: colors.border.default
                                }}
                            >
                                {slide.icon}
                            </View>
                            <Text className="text-3xl font-bold text-center mb-4" style={{ color: colors.text.primary }}>
                                {slide.title}
                            </Text>
                            <Text className="text-lg text-center leading-7" style={{ color: colors.text.secondary }}>
                                {slide.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </Animated.ScrollView>

            <View className="pb-12 px-8 flex-row justify-between items-center">
                <PaginationDots total={slides.length} currentIndex={currentIndex} />

                <TouchableOpacity onPress={handleNextSlide}>
                    <View
                        className="h-14 w-14 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: colors.primary.main,
                            shadowColor: colors.primary.main,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4
                        }}
                    >
                        <ArrowRight size={24} color={colors.text.inverse} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};
