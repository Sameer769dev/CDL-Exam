import { Stack, useRouter, useSegments } from "expo-router";
import { UserProvider } from "../src/context/UserContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { initBilling } from "../src/utils/billing";
import { initAds } from "../src/utils/ads";
import { useEffect, useState } from "react";
import { getHasCompletedOnboarding } from "../src/utils/storage";
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
        // Initialize billing and ads
        const initMonetization = async () => {
            await initBilling();
            await initAds();
        };

        initMonetization();
    }, []);

    if (!fontsLoaded) {
        return null; // Or a loading screen
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <UserProvider>
                    <OnboardingCheck />
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
        const hasCompleted = await getHasCompletedOnboarding();

        // Only redirect if we're not already on the onboarding screen
        const inOnboarding = segments[0] === 'onboarding';

        if (!hasCompleted && !inOnboarding) {
            router.replace('/onboarding');
        }

        setIsReady(true);
    };

    if (!isReady) {
        return null; // Or a loading screen
    }

    return <ThemedStack />;
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
        />
    );
}
