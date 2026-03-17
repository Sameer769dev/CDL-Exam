import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Linking, Share, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
    BellRing,
    ChevronRight,
    Shield,
    Info,
    MoonStar,
    SunMedium,
    Smartphone,
    Crown,
    Star,
    MessageCircle,
    FileText,
    ShieldCheck,
    RotateCcw,
    Trash2,
    Share2,
    CheckCircle2,
    User,
    Plus
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../src/context/UserContext';
import { useTheme } from '../../src/context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { getAvatarSource } from '../../src/utils/avatars';

export default function SettingsScreen() {
    const router = useRouter();
    const { reminderEnabled, reminderTimes, updateReminderSettings, isPremium, restorePurchases, refreshData, userProfile } = useUser();
    const { theme, setTheme, isDark } = useTheme();
    const [isRestoring, setIsRestoring] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const handleToggleReminder = async (value: boolean) => {
        await updateReminderSettings(value, reminderTimes);
    };

    const handleAddTime = async (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate) {
            // Check if time already exists
            const exists = reminderTimes.some(t =>
                t.getHours() === selectedDate.getHours() &&
                t.getMinutes() === selectedDate.getMinutes()
            );

            if (!exists) {
                const newTimes = [...reminderTimes, selectedDate].sort((a, b) => a.getTime() - b.getTime());
                await updateReminderSettings(true, newTimes);
            }
        }
    };

    const handleRemoveTime = async (index: number) => {
        const newTimes = [...reminderTimes];
        newTimes.splice(index, 1);
        await updateReminderSettings(true, newTimes);
    };

    const handleRestorePurchases = async () => {
        try {
            setIsRestoring(true);
            const restored = await restorePurchases();
            if (restored) {
                Alert.alert('Success', 'Your purchases have been restored!');
            } else {
                Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore purchases. Please try again.');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleRateApp = () => {
        const url = 'https://play.google.com/store/apps/details?id=com.protimeworld.cdl';
        Linking.openURL(url);
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Check out CDL Exam Prep - the best way to prepare for your CDL exam! https://play.google.com/store/apps/details?id=com.protimeworld.cdl',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear App Data',
            'This will reset your progress, bookmarks, and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything', style: 'destructive', onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            await refreshData(); // Reload context
                            Alert.alert('Success', 'App data has been reset.');
                        } catch (error) {
                            console.error('Error clearing cache:', error);
                            Alert.alert('Error', 'Failed to clear data.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 140 }}
                >
                    {/* Header */}
                    <View className="px-6 pt-6 pb-4">
                        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                            Settings
                        </Text>
                        <Text className="text-base text-slate-600 dark:text-slate-300">
                            Customize your experience
                        </Text>
                    </View>

                    {/* Profile Section */}
                    <View className="px-6 mb-6">
                        <View className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm flex-row items-center">
                            <View className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-600 mr-4 items-center justify-center">
                                <Image
                                    source={getAvatarSource(userProfile?.avatar)}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                    Profile
                                </Text>
                                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                    {userProfile?.name || 'Driver'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Premium Status (if premium) */}
                    {isPremium && (
                        <View className="px-6 mb-6">
                            <View className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[32px] shadow-xl shadow-amber-500/10 overflow-hidden relative border border-slate-800 dark:border-slate-700">
                                {/* Golden Glow Effect */}
                                <View className="absolute top-0 right-0 w-full h-full bg-amber-500/5" />
                                <View className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full" />

                                <View className="flex-row items-center justify-between relative z-10">
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center mb-3">
                                            <View className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 flex-row items-center">
                                                <CheckCircle2 size={12} color="#f59e0b" strokeWidth={3} style={{ marginRight: 6 }} />
                                                <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                                                    Active
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-white font-black text-2xl mb-2">
                                            Premium Member
                                        </Text>
                                        <Text className="text-slate-400 text-sm font-medium leading-relaxed">
                                            You have full access to all features. Thank you for your support!
                                        </Text>
                                    </View>

                                    <View className="bg-amber-500 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-amber-500/40">
                                        <Crown size={28} color="#fff" fill="#fff" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Appearance */}
                    <View className="px-6 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Appearance
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <View className="flex-row">
                                <TouchableOpacity
                                    onPress={() => setTheme('light')}
                                    className={`flex-1 p-5 items-center justify-center border-r border-slate-100 dark:border-slate-700 ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <SunMedium size={28} color={theme === 'light' ? '#3b82f6' : isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    <Text className={`mt-2 font-bold text-sm ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                        Light
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTheme('dark')}
                                    className={`flex-1 p-5 items-center justify-center border-r border-slate-100 dark:border-slate-700 ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <MoonStar size={28} color={theme === 'dark' ? '#3b82f6' : isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    <Text className={`mt-2 font-bold text-sm ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                        Dark
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTheme('system')}
                                    className={`flex-1 p-5 items-center justify-center ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <Smartphone size={28} color={theme === 'system' ? '#3b82f6' : isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    <Text className={`mt-2 font-bold text-sm ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                        System
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Notifications */}
                    <View className="px-6 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Notifications
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <View className="p-5 flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 mr-4">
                                    <View className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <BellRing size={24} color="#3b82f6" strokeWidth={2.5} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 dark:text-white font-bold text-base mb-1">
                                            Daily Study Reminders
                                        </Text>
                                        <Text className="text-slate-600 dark:text-slate-400 text-sm">
                                            Get nudges to keep your streak
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={reminderEnabled}
                                    onValueChange={handleToggleReminder}
                                    trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                                    thumbColor={'#ffffff'}
                                />
                            </View>

                            {reminderEnabled && (
                                <View className="px-5 pb-5 pt-2 bg-slate-50 dark:bg-slate-900/50">
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                                        Reminder Times
                                    </Text>

                                    {reminderTimes.map((time, index) => (
                                        <View key={index} className="flex-row items-center justify-between mb-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <Text className="text-slate-900 dark:text-white font-bold text-lg">
                                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveTime(index)}
                                                className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        onPress={() => setShowTimePicker(true)}
                                        className="flex-row items-center justify-center py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl active:bg-slate-100 dark:active:bg-slate-800"
                                    >
                                        <Plus size={20} color="#94a3b8" />
                                        <Text className="text-slate-500 font-semibold ml-2">Add Time</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {showTimePicker && (
                        <DateTimePicker
                            value={tempDate}
                            mode="time"
                            display="default"
                            onChange={handleAddTime}
                        />
                    )}

                    {/* Premium & Account */}
                    {!isPremium && (
                        <View className="px-6 mb-6">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Premium
                            </Text>

                            <TouchableOpacity
                                onPress={() => router.push('/paywall')}
                                className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[32px] shadow-xl shadow-amber-500/10 active:scale-[0.98] overflow-hidden relative border border-slate-800 dark:border-slate-700"
                            >
                                {/* Golden Glow Effect */}
                                <View className="absolute top-0 right-0 w-full h-full bg-amber-500/5" />
                                <View className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full" />

                                <View className="flex-row items-center justify-between relative z-10">
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center mb-3">
                                            <View className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                                                <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                                                    Premium Access
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-white font-black text-2xl mb-2">
                                            Unlock Everything
                                        </Text>
                                        <Text className="text-slate-400 text-sm font-medium leading-relaxed">
                                            Get unlimited access to all categories, exam simulator, and ad-free experience.
                                        </Text>
                                    </View>

                                    <View className="bg-amber-500 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-amber-500/40">
                                        <Crown size={28} color="#fff" fill="#fff" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Account Actions */}
                    <View className="px-6 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Account
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <TouchableOpacity
                                onPress={handleRestorePurchases}
                                disabled={isRestoring}
                                className="p-5 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <RotateCcw size={24} color="#16a34a" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Support */}
                    <View className="px-6 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Support
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <TouchableOpacity
                                onPress={handleRateApp}
                                className="p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <Star size={24} color="#eab308" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Rate App
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleShareApp}
                                className="p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <Share2 size={24} color="#3b82f6" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Share App
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Linking.openURL('mailto:cdlexampreps10@gmail.com')}
                                className="p-5 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <MessageCircle size={24} color="#9333ea" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Contact Support
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Legal */}
                    <View className="px-6 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Legal
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://cdlprep2025.vercel.app/privacy.html')}
                                className="p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-slate-100 dark:bg-slate-700 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <ShieldCheck size={24} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Privacy Policy
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://cdlprep2025.vercel.app/terms.html')}
                                className="p-5 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-slate-100 dark:bg-slate-700 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <FileText size={24} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Terms of Service
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Other */}
                    <View className="px-6 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Other
                        </Text>

                        <View className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                            <TouchableOpacity
                                onPress={() => router.push('/about')}
                                className="p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-slate-100 dark:bg-slate-700 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <Info size={24} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        About & Help
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleClearCache}
                                className="p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <Trash2 size={24} color="#dc2626" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Clear App Data
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <View className="p-5 flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-slate-100 dark:bg-slate-700 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <Info size={24} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                                        Version
                                    </Text>
                                </View>
                                <Text className="text-slate-600 dark:text-slate-400 font-semibold">
                                    1.0.6
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
