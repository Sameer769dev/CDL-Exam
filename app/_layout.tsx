import { Stack, useRouter, useSegments } from "expo-router";
import { UserProvider } from "../src/context/UserContext";
import { ProgressTrackingProvider } from "../src/context/ProgressTrackingContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

import { initBilling } from "../src/utils/billing";
import { initAds } from "../src/utils/ads";
import { setupNotificationListeners } from "../src/utils/notifications";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { getHasCompletedOnboarding, incrementSessionCount, getPremiumStatus } from "../src/utils/storage";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import "../global.css";

export default function Layout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        // Initialize billing and ads with error handling
        const initMonetization = async () => {
            // Helper function to add timeout to promises
            const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
                return Promise.race([
                    promise,
                    new Promise<T>((_, reject) =>
                        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
                    )
                ]);
            };

            // Initialize billing with error handling
            try {

                await withTimeout(initBilling(), 5000);

            } catch (error) {
                console.error('[App] Failed to initialize billing:', error);

            }

            // Initialize ads with error handling
            try {

                await withTimeout(initAds(), 5000);

            } catch (error) {
                console.error('[App] Failed to initialize ads:', error);

            }
        };

        // Run monetization initialization without blocking app startup
        initMonetization().catch((error) => {
            console.error('[App] Unexpected error in monetization initialization:', error);
        });

        // Setup notifications with error handling
        let cleanupNotifications: (() => void) | undefined;
        try {
            cleanupNotifications = setupNotificationListeners();
        } catch (error) {
            console.error('[App] Failed to setup notification listeners:', error);
        }

        return () => {
            if (cleanupNotifications) {
                try {
                    cleanupNotifications();
                } catch (error) {
                    console.error('[App] Error during cleanup:', error);
                }
            }
        };
    }, []);

    if (!fontsLoaded) {
        return null; // Or a loading screen
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <UserProvider>
                    <ProgressTrackingProvider>
                        <OnboardingCheck />
                    </ProgressTrackingProvider>
                </UserProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

function OnboardingCheck() {
    const router = useRouter();
    const segments = useSegments();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {

            const hasCompleted = await getHasCompletedOnboarding();


            // Only redirect if we're not already on the onboarding screen
            const inOnboarding = segments[0] === 'onboarding';

            if (!hasCompleted && !inOnboarding) {

                router.replace('/onboarding');
            } else if (hasCompleted) {


                // Handle session counting and periodic paywall
                await handleSession();
            }
        } catch (error) {
            console.error('[App] Error checking onboarding:', error);
            // Safe default: show onboarding on error
            try {
                router.replace('/onboarding');
            } catch (navError) {
                console.error('[App] Error navigating to onboarding:', navError);
            }
        } finally {
            setIsReady(true);
        }
    };

    const handleSession = async () => {
        try {
            // Increment session count
            const count = await incrementSessionCount();


            // Check if we should show paywall (every 3rd session)
            // Skip session 1 as onboarding handles that
            if (count > 1 && count % 3 === 0) {
                const isPremium = await getPremiumStatus();
                if (!isPremium) {

                    // Small delay to let the app load first
                    setTimeout(() => {
                        router.push('/paywall');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('[App] Error handling session:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ThemedStack />
            {!isReady && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0f172a',
                    zIndex: 9999
                }}>
                    {/* Simple loading indicator - can be replaced with a proper Splash Screen */}
                </View>
            )}
        </View>
    );
}

function ThemedStack() {
    const { isDark } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                },
                headerTintColor: isDark ? "#f8fafc" : "#0f172a",
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                },
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
    );
}
