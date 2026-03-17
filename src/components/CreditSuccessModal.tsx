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
} from 'react-native-reanimated';
import { Sparkles, Ticket, Check } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface CreditSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    onStartExam?: () => void;
}

// Reuse Confetti particle component logic for consistency
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

export default function CreditSuccessModal({ visible, onClose, onStartExam }: CreditSuccessModalProps) {
    const scale = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const sparkleRotate = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            iconScale.value = withSequence(
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
            iconScale.value = 0;
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
    }));

    const sparkleStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${sparkleRotate.value}deg` }],
    }));

    const confettiColors = ['#60A5FA', '#3B82F6', '#2563EB', '#93C5FD', '#BFDBFE'];

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
                        colors={['#1e293b', '#0f172a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        {/* Sparkle background effect */}
                        <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
                            <Sparkles size={120} color="rgba(59, 130, 246, 0.1)" strokeWidth={1} />
                        </Animated.View>

                        {/* Ticket icon */}
                        <Animated.View style={[styles.iconContainer, iconStyle]}>
                            <View style={styles.iconBackground}>
                                <Ticket size={48} color="#3B82F6" strokeWidth={2} />
                            </View>
                            <View style={styles.checkBadge}>
                                <Check size={16} color="white" strokeWidth={3} />
                            </View>
                        </Animated.View>

                        {/* Success message */}
                        <Text style={styles.title}>Exam Ready! 🎫</Text>
                        <Text style={styles.subtitle}>
                            Attempt credit added successfully.
                            Good luck on your exam!
                        </Text>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={() => {
                                    onClose();
                                    if (onStartExam) onStartExam();
                                }}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#2563EB']}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.primaryButtonText}>Start Exam Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.secondaryButtonText}>Later</Text>
                            </TouchableOpacity>
                        </View>
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
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 24,
    },
    sparkleContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.5,
    },
    iconContainer: {
        marginBottom: 24,
        position: 'relative',
    },
    iconBackground: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10B981',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0f172a',
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
        color: '#94a3b8',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryButton: {
        marginBottom: 4,
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    },
});
