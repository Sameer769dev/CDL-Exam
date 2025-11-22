import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Helper to check if notifications are supported
const isNotificationSupported = () => {
    return Platform.OS !== 'web';
};

export async function registerForPushNotificationsAsync() {
    if (!isNotificationSupported()) {
        console.warn('Notifications are not supported on web');
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-study', {
            name: 'Daily Study Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return null;
        }
    }

    return true;
}

export async function scheduleDailyReminder(hour: number, minute: number) {
    if (!isNotificationSupported()) {
        console.warn('Notifications are not supported on web');
        return;
    }

    // Cancel existing notifications first to avoid duplicates
    await cancelAllNotifications();

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Time to Study! 🚛",
            body: "Keep your streak alive! Take a quick quiz now.",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hour,
            minute: minute,
        },
    });

    return identifier;
}

export async function cancelAllNotifications() {
    if (!isNotificationSupported()) {
        console.warn('Notifications are not supported on web');
        return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications() {
    if (!isNotificationSupported()) {
        console.warn('Notifications are not supported on web');
        return [];
    }

    return await Notifications.getAllScheduledNotificationsAsync();
}
