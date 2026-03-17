import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Home, BookOpen, Activity, User, Bookmark } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isDark } = useTheme();

    const tabs = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Study', icon: BookOpen, path: '/categories' },
        { name: 'Saved', icon: Bookmark, path: '/bookmarks' },
        { name: 'Stats', icon: Activity, path: '/stats' },
        { name: 'Profile', icon: User, path: '/settings' },
    ];

    return (
        <View className="absolute bottom-6 left-6 right-6">
            <View
                className="flex-row justify-between items-center bg-white/90 dark:bg-slate-900/90 p-4 rounded-3xl shadow-lg shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800"
                style={Platform.OS === 'ios' ? { shadowOpacity: 0.1, shadowRadius: 10 } : { elevation: 5 }}
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
                    const Icon = tab.icon;

                    const handlePress = () => {
                        // Don't navigate if already on the target route
                        if (pathname === tab.path) {
                            return;
                        }
                        router.push(tab.path as any);
                    };

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            onPress={handlePress}
                            className={`items-center justify-center px-4 py-2 rounded-2xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <Icon
                                size={24}
                                color={isActive ? '#3B82F6' : isDark ? '#94A3B8' : '#64748B'}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isActive && (
                                <View className="h-1 w-1 bg-blue-500 rounded-full mt-1" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
