import { Tabs, useRouter, useNavigationContainerRef } from 'expo-router';
import { BottomNav } from '../../src/components/BottomNav';
import { useUser } from '../../src/context/UserContext';
import { useEffect } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';


export default function TabsLayout() {
    const { isPremium, isLoading } = useUser();
    const router = useRouter();
    const navigationRef = useNavigationContainerRef();



    // Double back to exit - only on root tab screens
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        let lastBackPressed = 0;
        const onBackPress = () => {
            // Check if we can go back in navigation
            const canGoBack = navigationRef?.canGoBack();

            // If we can go back, allow default back behavior
            if (canGoBack) {
                return false; // Let the default back handler work
            }

            // We're on a root tab screen, implement double-tap to exit
            const now = Date.now();
            if (lastBackPressed && now - lastBackPressed < 2000) {
                BackHandler.exitApp();
                return true;
            }
            lastBackPressed = now;
            ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [navigationRef]);

    return (
        <Tabs
            tabBar={props => <BottomNav {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                }}
            />
            <Tabs.Screen
                name="study"
                options={{
                    title: "Study",
                }}
            />
            <Tabs.Screen
                name="bookmarks"
                options={{
                    title: "Saved",
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Profile",
                }}
            />
        </Tabs>
    );
}
