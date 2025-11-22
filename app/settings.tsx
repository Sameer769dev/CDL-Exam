import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { BellRing, ChevronRight, Shield, Info, MoonStar, SunMedium, Smartphone, CircleHelp } from 'lucide-react-native';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';
import { TimePicker } from '../src/components/TimePicker';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
    const router = useRouter();
    const { reminderEnabled, reminderTime, updateReminderSettings } = useUser();
    const { theme, setTheme, isDark } = useTheme();

    const handleToggleReminder = async (value: boolean) => {
        await updateReminderSettings(value, reminderTime);
    };

    const handleTimeChange = async (date: Date) => {
        await updateReminderSettings(true, date);
    };

    const handleTestNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Test Notification 🔔",
                body: "This is how your study reminder will look!",
                sound: true,
            },
            trigger: null, // Immediate
        });
        Alert.alert("Notification Sent", "You should see a notification momentarily.");
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title: "Settings" }} />

            <ScrollView className="flex-1 p-6">
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-2">
                        Appearance
                    </Text>

                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => setTheme('light')}
                                className={`flex-1 p-4 items-center justify-center border-r border-slate-100 dark:border-slate-700 ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                <SunMedium size={24} color={theme === 'light' ? '#2563eb' : '#64748b'} strokeWidth={2} />
                                <Text className={`mt-2 font-semibold text-sm ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Light</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setTheme('dark')}
                                className={`flex-1 p-4 items-center justify-center border-r border-slate-100 dark:border-slate-700 ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                <MoonStar size={24} color={theme === 'dark' ? '#2563eb' : '#64748b'} strokeWidth={2} />
                                <Text className={`mt-2 font-semibold text-sm ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Dark</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setTheme('system')}
                                className={`flex-1 p-4 items-center justify-center ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                <Smartphone size={24} color={theme === 'system' ? '#2563eb' : '#64748b'} strokeWidth={2} />
                                <Text className={`mt-2 font-semibold text-sm ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>System</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-2">
                        Notifications
                    </Text>

                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <View className="p-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700">
                            <View className="flex-row items-center flex-1 mr-4">
                                <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                                    <BellRing size={20} color="#2563eb" strokeWidth={2} />
                                </View>
                                <View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Daily Study Reminder
                                    </Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                                        Get a nudge to keep your streak
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={handleToggleReminder}
                                trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
                                thumbColor={'#ffffff'}
                            />
                        </View>

                        {reminderEnabled && (
                            <View className="p-4 flex-row items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <Text className="text-slate-700 dark:text-slate-300 font-medium">
                                    Reminder Time
                                </Text>
                                <TimePicker
                                    value={reminderTime}
                                    onChange={handleTimeChange}
                                />
                            </View>
                        )}
                    </View>

                    {reminderEnabled && (
                        <TouchableOpacity
                            onPress={handleTestNotification}
                            className="mt-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center justify-center active:bg-slate-50 dark:active:bg-slate-700"
                        >
                            <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                                Test Notification
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-2">
                        About
                    </Text>

                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <TouchableOpacity
                            onPress={() => router.push('/about')}
                            className="p-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                                    <CircleHelp size={20} color="#475569" strokeWidth={2} />
                                </View>
                                <Text className="text-slate-900 dark:text-white font-medium">About & Help</Text>
                            </View>
                            <ChevronRight size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <View className="p-4 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700">
                            <View className="flex-row items-center">
                                <View className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                                    <Info size={20} color="#475569" />
                                </View>
                                <Text className="text-slate-900 dark:text-white font-medium">Version</Text>
                            </View>
                            <Text className="text-slate-500 dark:text-slate-400">1.0.0</Text>
                        </View>


                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
