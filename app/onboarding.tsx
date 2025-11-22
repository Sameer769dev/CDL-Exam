import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    Truck,
    BookOpen,
    Target,
    TrendingUp,
    CheckCircle
} from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    FadeIn,
    SlideInDown
} from 'react-native-reanimated';
import { OnboardingSlide } from '../src/components/OnboardingSlide';
import { PaginationDots } from '../src/components/PaginationDots';
import { setHasCompletedOnboarding } from '../src/utils/storage';
import { useTheme } from '../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
    {
        icon: <Truck size={120} color="#2563eb" />,
        title: "Welcome to CDL Prep 2025",
        description: "Your complete study companion for passing the Commercial Driver's License exam with confidence."
    },
    {
        icon: <BookOpen size={120} color="#2563eb" />,
        title: "Practice Makes Perfect",
        description: "Access hundreds of real exam questions with instant feedback and detailed explanations for every answer."
    },
    {
        icon: <Target size={120} color="#2563eb" />,
        title: "Smart Study Tools",
        description: "Use flashcards, bookmark questions, and review your mistakes to focus on areas that need improvement."
    },
    {
        icon: <TrendingUp size={120} color="#2563eb" />,
        title: "Track Your Progress",
        description: "Monitor your performance with detailed statistics, study streaks, and category-specific analytics."
    },
    {
        icon: <CheckCircle size={120} color="#10b981" />,
        title: "Ready to Get Started?",
        description: "Join thousands of successful CDL students and start your journey to becoming a licensed commercial driver today!"
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleSkip = async () => {
        await setHasCompletedOnboarding(true);
        router.replace('/');
    };

    const handleGetStarted = async () => {
        await setHasCompletedOnboarding(true);
        router.replace('/');
    };

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    return (
        <LinearGradient
            colors={['#0F172A', '#020617']}
            style={styles.gradient}
        >
            <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Skip Button */}
                {currentIndex < slides.length - 1 && (
                    <Animated.View
                        entering={FadeIn}
                        className="absolute top-4 right-6 z-10"
                    >
                        <TouchableOpacity onPress={handleSkip}>
                            <Text className="text-slate-400 font-medium text-lg">
                                Skip
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Slides */}
                <Animated.ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={scrollHandler}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    className="flex-1"
                >
                    {slides.map((slide, index) => (
                        <View key={index} style={{ width: SCREEN_WIDTH }}>
                            <OnboardingSlide
                                icon={slide.icon}
                                imageSource={index === 0 ? require('../assets/truck_3d.png') : undefined}
                                title={slide.title}
                                description={slide.description}
                                isFirstSlide={index === 0}
                            />
                        </View>
                    ))}
                </Animated.ScrollView>

                {/* Pagination & Button */}
                <View className="pb-8 px-6">
                    <View className="mb-8 items-center">
                        <PaginationDots total={slides.length} currentIndex={currentIndex} />
                    </View>

                    {currentIndex === slides.length - 1 ? (
                        <Animated.View entering={SlideInDown.delay(700).springify().damping(15)}>
                            <TouchableOpacity
                                onPress={handleGetStarted}
                                className="bg-blue-600 py-5 rounded-3xl items-center"
                                style={styles.button}
                            >
                                <Text className="text-white font-bold text-xl">
                                    Get Started
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ) : (
                        <View className="h-[68px]" />
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    button: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
});
