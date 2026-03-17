import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const MOTIVATIONAL_MESSAGES = [
    { title: "Time to Study! 🚛", body: "Keep your streak alive! Take a quick quiz now." },
    { title: "CDL Success Awaits 🏆", body: "A few minutes a day keeps the failure away. Let's study!" },
    { title: "On the Road to Pro 🛣️", body: "Your CDL is waiting. Put in the work today!" },
    { title: "Don't Break the Chain 🔥", body: "You're on a roll! Keep your study streak going." },
    { title: "Quick Review Time ⏱️", body: "Got 5 minutes? Master a few more questions now." },
    { title: "Future Trucker! 🚛", body: "The road is calling. Answer a few questions to get ready." },
    { title: "Knowledge is Power 🧠", body: "Ace your exam with a quick study session." },
];

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

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const isNotificationSupported = () => {
    return Platform.OS !== 'web';
};

const getRandomMessage = () => {
    const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[index];
};

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

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
            return false;
        }
    } else {
        // Simulator
        console.log('Must use physical device for Push Notifications');
    }

    return true;
}

export async function scheduleReminders(times: Date[]) {
    if (!isNotificationSupported()) return;

    // Cancel existing notifications first to avoid duplicates
    await cancelAllNotifications();

    if (times.length === 0) return;

    try {
        for (const time of times) {
            const message = getRandomMessage();
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: message.title,
                    body: message.body,
                    sound: true,
                    data: { url: '/(tabs)/study' }, // Deep link to study tab
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: time.getHours(),
                    minute: time.getMinutes(),
                },
            });
        }
        return true;
    } catch (error) {
        console.error("Error scheduling notifications:", error);
        return false;
    }
}

export async function cancelAllNotifications() {
    if (!isNotificationSupported()) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications() {
    if (!isNotificationSupported()) return [];
    return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Sets up listeners for notification interactions.
 * Call this in your root layout or app entry point.
 */
export function setupNotificationListeners() {
    if (!isNotificationSupported()) return;

    // Handle user tapping on a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const url = response.notification.request.content.data?.url;
        if (url && typeof url === 'string') {
            // Navigate to the screen
            router.push(url as any);
        }
    });

    return () => {
        subscription.remove();
    };
}
