import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withRepeat,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { Sparkles, Crown, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface PremiumSuccessModalProps {
    visible: boolean;
    onClose: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => {
    const translateY = useSharedValue(-50);
    const translateX = useSharedValue(Math.random() * width - width / 2);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        translateY.value = withTiming(height + 100, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.linear,
        });

        translateX.value = withTiming(
            translateX.value + (Math.random() - 0.5) * 200,
            { duration: 3000 + Math.random() * 2000 }
        );

        rotate.value = withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            -1
        );

        opacity.value = withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0, { duration: 2500 })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.confetti,
                animatedStyle,
                { backgroundColor: color },
            ]}
        />
    );
};

export default function PremiumSuccessModal({ visible, onClose }: PremiumSuccessModalProps) {
    const scale = useSharedValue(0);
    const crownScale = useSharedValue(0);
    const sparkleRotate = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            crownScale.value = withSequence(
                withTiming(0, { duration: 0 }),
                withTiming(1.2, { duration: 300 }),
                withSpring(1, { damping: 10 })
            );
            sparkleRotate.value = withRepeat(
                withTiming(360, { duration: 3000, easing: Easing.linear }),
                -1
            );
        } else {
            scale.value = 0;
            crownScale.value = 0;
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const crownStyle = useAnimatedStyle(() => ({
        transform: [{ scale: crownScale.value }],
    }));

    const sparkleStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${sparkleRotate.value}deg` }],
    }));

    const confettiColors = ['#FFD700', '#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Confetti particles */}
                {visible && confettiColors.map((color, index) => (
                    <ConfettiParticle key={index} delay={index * 100} color={color} />
                ))}

                <Animated.View style={[styles.container, containerStyle]}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2', '#f093fb']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        {/* Sparkle background effect */}
                        <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
                            <Sparkles size={120} color="rgba(255,255,255,0.1)" strokeWidth={1} />
                        </Animated.View>

                        {/* Crown icon */}
                        <Animated.View style={[styles.iconContainer, crownStyle]}>
                            <View style={styles.iconBackground}>
                                <Crown size={48} color="#FFD700" fill="#FFD700" strokeWidth={2} />
                            </View>
                        </Animated.View>

                        {/* Success message */}
                        <Text style={styles.title}>Welcome to Premium! 🎉</Text>
                        <Text style={styles.subtitle}>
                            Thank you for your purchase!
                        </Text>

                        {/* Premium features unlocked */}
                        <View style={styles.featuresContainer}>
                            <View style={styles.featureRow}>
                                <Star size={16} color="#FFD700" fill="#FFD700" />
                                <Text style={styles.featureText}>Unlimited Practice</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Star size={16} color="#FFD700" fill="#FFD700" />
                                <Text style={styles.featureText}>Exam Simulator</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Star size={16} color="#FFD700" fill="#FFD700" />
                                <Text style={styles.featureText}>Ad-Free Experience</Text>
                            </View>
                        </View>

                        {/* CTA Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#ffffff', '#f0f0f0']}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Let's Go! 🚀</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    gradient: {
        padding: 32,
        alignItems: 'center',
    },
    sparkleContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.3,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconBackground: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 24,
        textAlign: 'center',
    },
    featuresContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#ffffff',
        fontWeight: '600',
    },
    button: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    },
});
