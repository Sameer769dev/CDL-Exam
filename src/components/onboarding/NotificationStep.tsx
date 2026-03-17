import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, ShieldCheck } from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';

interface NotificationStepProps {
    onNext: (enabled: boolean) => void;
}

export const NotificationStep: React.FC<NotificationStepProps> = ({ onNext }) => {
    const { colors } = useTheme();

    return (
        <View className="flex-1 px-6 pt-12 items-center">
            <Animated.View
                entering={FadeInDown.delay(200).springify()}
                className="items-center mb-8"
            >
                <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-6"
                    style={{ backgroundColor: colors.primary.light }}
                >
                    <Bell size={64} color={colors.primary.main} />
                </View>
                <Text className="text-3xl font-bold text-center mb-2" style={{ color: colors.text.primary }}>
                    Stay on Track
                </Text>
                <Text className="text-lg text-center" style={{ color: colors.text.secondary }}>
                    Enable notifications to get daily study reminders and keep your streak alive.
                </Text>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.delay(400).springify()}
                className="w-full rounded-2xl p-6 border mb-8"
                style={{
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.default
                }}
            >
                <View className="flex-row items-center mb-4">
                    <ShieldCheck size={24} color={colors.semantic.success} />
                    <Text className="font-bold text-lg ml-3" style={{ color: colors.text.primary }}>No Spam Promise</Text>
                </View>
                <Text className="leading-6" style={{ color: colors.text.secondary }}>
                    We only send notifications for:
                </Text>
                <View className="mt-4 space-y-2">
                    <Text style={{ color: colors.text.secondary }}>• Daily study reminders</Text>
                    <Text style={{ color: colors.text.secondary }}>• Streak protection alerts</Text>
                    <Text style={{ color: colors.text.secondary }}>• New feature updates</Text>
                </View>
            </Animated.View>

            <View className="flex-1" />

            <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full pb-8 space-y-4">
                <TouchableOpacity
                    onPress={() => onNext(true)}
                    className="h-16 rounded-2xl items-center justify-center"
                    style={{
                        backgroundColor: colors.primary.main,
                        shadowColor: colors.primary.main,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4
                    }}
                >
                    <Text className="text-xl font-bold" style={{ color: colors.text.inverse }}>Enable Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onNext(false)}
                    className="h-12 items-center justify-center"
                >
                    <Text className="font-medium" style={{ color: colors.text.secondary }}>Maybe Later</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
