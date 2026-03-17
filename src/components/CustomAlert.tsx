import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    primaryButtonText: string;
    secondaryButtonText?: string;
    onPrimaryPress: () => void;
    onSecondaryPress?: () => void;
    primaryButtonColor?: string; // e.g., 'bg-blue-600'
    type?: 'default' | 'danger' | 'success';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    primaryButtonText,
    secondaryButtonText,
    onPrimaryPress,
    onSecondaryPress,
    type = 'default'
}) => {
    const { isDark } = useTheme();
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 200 });
            scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        } else {
            opacity.value = withTiming(0, { duration: 150 });
            scale.value = withTiming(0.8, { duration: 150 });
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (!visible) return null;

    const getPrimaryColor = () => {
        switch (type) {
            case 'danger': return 'bg-red-500 dark:bg-red-600';
            case 'success': return 'bg-green-500 dark:bg-green-600';
            default: return 'bg-blue-600 dark:bg-blue-600';
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            <View className="flex-1 justify-center items-center">
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={onSecondaryPress}>
                    <Animated.View
                        style={[containerStyle, { position: 'absolute', width: '100%', height: '100%' }]}
                    >
                        <BlurView
                            intensity={20}
                            tint={isDark ? 'dark' : 'light'}
                            style={{ flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>

                {/* Alert Content */}
                <Animated.View
                    style={[contentStyle, { width: '85%', maxWidth: 340 }]}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700"
                >
                    <Text className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">
                        {title}
                    </Text>
                    <Text className="text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                        {message}
                    </Text>

                    <View className="flex-row space-x-4 gap-4">
                        {secondaryButtonText && (
                            <TouchableOpacity
                                onPress={onSecondaryPress}
                                className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 active:opacity-80"
                            >
                                <Text className="text-slate-700 dark:text-slate-200 font-bold text-center">
                                    {secondaryButtonText}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onPrimaryPress}
                            className={`flex-1 py-3.5 rounded-2xl ${getPrimaryColor()} active:opacity-90 shadow-lg shadow-blue-500/20`}
                        >
                            <Text className="text-white font-bold text-center">
                                {primaryButtonText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};
