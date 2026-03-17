import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    Truck,
    BookOpen,
    Target,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    ChevronLeft
} from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { OnboardingSlide } from '../src/components/OnboardingSlide';
import { PaginationDots } from '../src/components/PaginationDots';
import { setHasCompletedOnboarding } from '../src/utils/storage';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/context/UserContext';
import { ProfileStep } from '../src/components/onboarding/ProfileStep';
import { GoalStep } from '../src/components/onboarding/GoalStep';
import { NotificationStep } from '../src/components/onboarding/NotificationStep';
import { ReminderStep } from '../src/components/onboarding/ReminderStep';
import { StateSelectionStep } from '../src/components/onboarding/StateSelectionStep';
import { ExamDateStep } from '../src/components/onboarding/ExamDateStep';
import { ExamModeStep } from '../src/components/onboarding/ExamModeStep';
import { StudyTimeStep } from '../src/components/onboarding/StudyTimeStep';
import { ExperienceStep } from '../src/components/onboarding/ExperienceStep';
import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
    {
        icon: <Truck size={120} color="#2563eb" />,
        image: require('../assets/truck_3d.png'),
        title: "Welcome to CDL Prep 2025",
        description: "Your complete study companion for passing the Commercial Driver's License exam with confidence."
    },
    {
        icon: <BookOpen size={120} color="#2563eb" />,
        image: require('../assets/book_3d.png'),
        title: "Practice Makes Perfect",
        description: "Access hundreds of real exam questions with instant feedback and detailed explanations for every answer."
    },
    {
        icon: <Target size={120} color="#2563eb" />,
        image: require('../assets/target_3d.png'),
        title: "Smart Study Tools",
        description: "Use flashcards, bookmark questions, and review your mistakes to focus on areas that need improvement."
    },
    {
        icon: <TrendingUp size={120} color="#2563eb" />,
        image: require('../assets/chart_3d.png'),
        title: "Track Your Progress",
        description: "Monitor your performance with detailed statistics, study streaks, and category-specific analytics."
    },
    {
        icon: <CheckCircle size={120} color="#10b981" />,
        image: require('../assets/check_3d.png'),
        title: "Ready to Get Started?",
        description: "Join thousands of successful CDL students and start your journey to becoming a licensed commercial driver today!"
    }
];

type OnboardingStep = 'slides' | 'state' | 'examDate' | 'examMode' | 'studyTime' | 'experience' | 'profile' | 'goal' | 'notifications' | 'reminders';

export default function OnboardingScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { updateUserProfile, updateDailyGoal, refreshData, userProfile, updateReminderSettings } = useUser();

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('slides');
    const [currentIndex, setCurrentIndex] = useState(0);

    const scrollX = useSharedValue(0);
    const scrollViewRef = useRef<Animated.ScrollView>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleSlideNext = () => {
        if (currentIndex < slides.length - 1) {
            scrollViewRef.current?.scrollTo({
                x: (currentIndex + 1) * SCREEN_WIDTH,
                animated: true
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            // Transition to State Selection Step
            setCurrentStep('state');
        }
    };

    const handleSkip = () => {
        // Skip slides and go straight to state selection
        setCurrentStep('state');
    };

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const handleStateNext = async (stateCode: string) => {
        await updateUserProfile({ name: '', avatar: '', targetState: stateCode }); // Initialize with state
        setCurrentStep('examDate');
    };

    const handleExamDateNext = async (date: string) => {
        const currentProfile = userProfile || { name: '', avatar: '' };
        await updateUserProfile({ ...currentProfile, examDate: date });
        setCurrentStep('examMode');
    };

    const handleExamModeNext = async (mode: 'full_support' | 'no_explanations' | 'exam_style') => {
        const currentProfile = userProfile || { name: '', avatar: '' };
        await updateUserProfile({ ...currentProfile, examMode: mode });
        setCurrentStep('studyTime');
    };

    const handleStudyTimeNext = async (time: 'morning' | 'afternoon' | 'evening' | 'night' | 'no_preference') => {
        const currentProfile = userProfile || { name: '', avatar: '' };
        await updateUserProfile({ ...currentProfile, studyTime: time });
        setCurrentStep('experience');
    };

    const handleExperienceNext = async (experience: '0-2' | '2-4' | '4-6' | '6+') => {
        const currentProfile = userProfile || { name: '', avatar: '' };
        await updateUserProfile({ ...currentProfile, experienceLevel: experience });
        setCurrentStep('profile');
    };

    const handleProfileNext = async (name: string, avatar: string) => {
        const currentProfile = userProfile || { name: '', avatar: '' };
        await updateUserProfile({ ...currentProfile, name, avatar });
        setCurrentStep('goal');
    };

    const handleGoalNext = async (goal: number) => {
        await updateDailyGoal({
            questionsPerDay: goal,
            lastUpdated: new Date().toISOString()
        });
        setCurrentStep('notifications');
    };

    const handleNotificationNext = async (enabled: boolean) => {
        if (enabled) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please enable notifications in settings to receive study reminders.');
            }
        }
        setCurrentStep('reminders');
    };

    const handleReminderNext = async (times: Date[]) => {
        if (times.length > 0) {
            await updateReminderSettings(true, times);
        }
        completeOnboarding();
    };

    const completeOnboarding = async () => {
        try {

            await setHasCompletedOnboarding(true);
            await refreshData();

            router.replace('/?showPaywall=true');
        } catch (error) {
            console.error('[Onboarding] Error completing onboarding:', error);
            router.replace('/');
        }
    };

    const handleBack = () => {
        if (currentStep === 'reminders') setCurrentStep('notifications');
        else if (currentStep === 'notifications') setCurrentStep('goal');
        else if (currentStep === 'goal') setCurrentStep('profile');
        else if (currentStep === 'profile') setCurrentStep('experience');
        else if (currentStep === 'experience') setCurrentStep('studyTime');
        else if (currentStep === 'studyTime') setCurrentStep('examMode');
        else if (currentStep === 'examMode') setCurrentStep('examDate');
        else if (currentStep === 'examDate') setCurrentStep('state');
        else if (currentStep === 'state') setCurrentStep('slides');
    };

    const buttonStyle = useAnimatedStyle(() => {
        const isLastSlide = currentIndex === slides.length - 1;
        return {
            width: withSpring(isLastSlide ? 200 : 80, { damping: 20, stiffness: 100 }),
            backgroundColor: withTiming(isLastSlide ? '#10b981' : '#2563eb')
        };
    });

    const renderSlides = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1 }}>
            {/* Skip Button */}
            <View className="h-12 px-6 flex-row justify-end items-center z-10">
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip}>
                        <Text className="text-slate-400 font-medium text-base">Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Slides */}
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
                    <View key={index} style={{ width: SCREEN_WIDTH }}>
                        <OnboardingSlide
                            icon={slide.icon}
                            imageSource={slide.image}
                            title={slide.title}
                            description={slide.description}
                            isFirstSlide={index === 0}
                            index={index}
                            scrollX={scrollX}
                        />
                    </View>
                ))}
            </Animated.ScrollView>

            {/* Footer Controls */}
            <View className="pb-8 px-8 flex-row justify-between items-center">
                <PaginationDots total={slides.length} currentIndex={currentIndex} />

                <TouchableOpacity onPress={handleSlideNext}>
                    <Animated.View
                        style={[styles.button, buttonStyle]}
                        className="h-16 rounded-full items-center justify-center flex-row"
                    >
                        {currentIndex === slides.length - 1 ? (
                            <Animated.Text
                                entering={FadeIn}
                                className="text-white font-bold text-lg mr-2"
                            >
                                Get Started
                            </Animated.Text>
                        ) : (
                            <ArrowRight size={24} color="white" />
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <LinearGradient
            colors={isDark ? ['#0F172A', '#1e293b', '#020617'] : ['#F8FAFC', '#E2E8F0', '#CBD5E1']}
            style={styles.gradient}
        >
            <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                <Stack.Screen options={{ headerShown: false }} />

                {currentStep !== 'slides' && (
                    <View className="px-6 pt-2 pb-4">
                        <TouchableOpacity
                            onPress={handleBack}
                            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center"
                        >
                            <ChevronLeft size={24} color={isDark ? "#fff" : "#0f172a"} />
                        </TouchableOpacity>
                    </View>
                )}

                {currentStep === 'slides' && renderSlides()}
                {currentStep === 'state' && <StateSelectionStep onSelect={handleStateNext} />}
                {currentStep === 'examDate' && <ExamDateStep onSelect={handleExamDateNext} />}
                {currentStep === 'examMode' && <ExamModeStep onSelect={handleExamModeNext} />}
                {currentStep === 'studyTime' && <StudyTimeStep onSelect={handleStudyTimeNext} />}
                {currentStep === 'experience' && <ExperienceStep onSelect={handleExperienceNext} />}
                {currentStep === 'profile' && <ProfileStep onNext={handleProfileNext} />}
                {currentStep === 'goal' && <GoalStep onNext={handleGoalNext} />}
                {currentStep === 'notifications' && <NotificationStep onNext={handleNotificationNext} />}
                {currentStep === 'reminders' && <ReminderStep onNext={handleReminderNext} />}

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    button: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
