import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
    interpolateColor,
    Easing
} from 'react-native-reanimated';
import { CheckCircle2, HelpCircle } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
    question: string;
    answer: string;
    onSwipeRight: () => void;
    onSwipeLeft: () => void;
    index: number;
    disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
    question,
    answer,
    onSwipeRight,
    onSwipeLeft,
    index,
    disabled = false
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotateY = useSharedValue(0); // For flip
    const [isFlipped, setIsFlipped] = useState(false);

    // Reset state when question changes
    useEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
        rotateY.value = 0;
        setIsFlipped(false);
    }, [question]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY * 0.2; // Limit vertical movement
        })
        .onEnd(() => {
            if (translateX.value > SWIPE_THRESHOLD) {
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(onSwipeRight)();
                });
            } else if (translateX.value < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(onSwipeLeft)();
                });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            rotateY.value = withTiming(isFlipped ? 0 : 180, {
                duration: 500,
                easing: Easing.out(Easing.cubic)
            }, () => {
                runOnJS(setIsFlipped)(!isFlipped);
            });
        });

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    const cardStyle = useAnimatedStyle(() => {
        const rotateZ = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [-15, 0, 15],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotateZ: `${rotateZ}deg` },
            ],
        };
    });

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotateY.value, [0, 180], [0, 180]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateValue}deg` }
            ],
            opacity: rotateValue >= 90 ? 0 : 1,
            zIndex: rotateValue >= 90 ? 0 : 1,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotateY.value, [0, 180], [180, 360]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateValue}deg` }
            ],
            opacity: rotateValue >= 270 ? 1 : 0, // Visible when flipped
            zIndex: rotateValue >= 270 ? 1 : 0,
        };
    });

    // Overlay Opacity Styles
    const likeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    }));

    const nopeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    }));

    return (
        <GestureDetector gesture={disabled ? Gesture.Native() : composedGesture}>
            <Animated.View style={[styles.container, cardStyle]}>
                {/* Front Side (Question) */}
                <Animated.View style={[styles.card, frontAnimatedStyle]} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700">
                    <View className="bg-blue-100 dark:bg-blue-500/20 p-5 rounded-full mb-8">
                        <HelpCircle size={48} color="#3b82f6" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center leading-9 px-2">
                        {question}
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-center mt-auto font-medium text-sm uppercase tracking-wider">
                        Tap to flip • Swipe to decide
                    </Text>

                    {/* Overlays */}
                    <Animated.View style={[styles.overlay, styles.likeOverlay, likeOpacityStyle]}>
                        <Text style={styles.overlayText}>👍</Text>
                    </Animated.View>
                    <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOpacityStyle]}>
                        <Text style={styles.overlayText}>👎</Text>
                    </Animated.View>
                </Animated.View>

                {/* Back Side (Answer) */}
                <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]} className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <View className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-6">
                        <CheckCircle2 size={40} color="#16a34a" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center leading-9">
                        {answer}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-center mt-8 font-medium">
                        Swipe Right if you knew it!
                    </Text>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 4 / 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardBack: {
        // position absolute is already set in card
    },
    overlay: {
        position: 'absolute',
        top: 20,
        padding: 10,
        borderRadius: 10,
        borderWidth: 4,
        zIndex: 100,
    },
    likeOverlay: {
        left: 20,
        borderColor: '#22c55e',
        transform: [{ rotate: '-15deg' }],
    },
    nopeOverlay: {
        right: 20,
        borderColor: '#ef4444',
        transform: [{ rotate: '15deg' }],
    },
    overlayText: {
        fontSize: 40,
        fontWeight: 'bold',
    }
});
