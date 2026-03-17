import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Home, BookOpen, Activity, User, Bookmark } from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
    useAnimatedStyle,
    withTiming,
    ZoomIn
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const TabItem = ({
    icon: Icon,
    isActive,
    onPress,
    onLongPress,
    isDark
}: {
    icon: any,
    isActive: boolean,
    onPress: () => void,
    onLongPress: () => void,
    isDark: boolean
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = withTiming(isActive ? (isDark ? 'rgba(30, 58, 138, 0.2)' : '#eff6ff') : 'transparent', { duration: 200 });
        return { backgroundColor };
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
        >
            <Animated.View
                className="items-center justify-center px-4 py-2 rounded-2xl"
                style={animatedStyle}
            >
                <Icon
                    size={24}
                    color={isActive ? '#3B82F6' : isDark ? '#94A3B8' : '#64748B'}
                    strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                    <Animated.View
                        entering={ZoomIn.duration(200)}
                        className="h-1 w-1 bg-blue-500 rounded-full mt-1"
                    />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export const BottomNav = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { isDark } = useTheme();

    // Map route names to icons
    const getIcon = (routeName: string) => {
        switch (routeName) {
            case 'index': return Home;
            case 'study': return BookOpen;
            case 'bookmarks': return Bookmark;
            case 'stats': return Activity;
            case 'settings': return User;
            default: return Home;
        }
    };

    return (
        <View className="absolute bottom-6 left-6 right-6">
            <View
                className="flex-row justify-between items-center bg-white/90 dark:bg-slate-900/90 p-4 rounded-3xl shadow-lg shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800"
                style={Platform.OS === 'ios' ? { shadowOpacity: 0.1, shadowRadius: 10 } : { elevation: 5 }}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const Icon = getIcon(route.name);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TabItem
                            key={route.key}
                            icon={Icon}
                            isActive={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            isDark={isDark}
                        />
                    );
                })}
            </View>
        </View>
    );
};
