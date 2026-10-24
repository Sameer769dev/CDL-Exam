import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Home, BookOpen, Activity, User, Bookmark } from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface TabItemProps {
    label: string;
    icon: any;
    isActive: boolean;
    onPress: () => void;
    onLongPress: () => void;
    isDark: boolean;
}

const TabItem = ({
    label,
    icon: Icon,
    isActive,
    onPress,
    onLongPress,
    isDark,
}: TabItemProps) => {
    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = withTiming(
            isActive
                ? isDark
                    ? 'rgba(59, 130, 246, 0.16)'
                    : 'rgba(59, 130, 246, 0.10)'
                : 'transparent',
            { duration: 200 }
        );
        return { backgroundColor };
    });

    const activeColor = '#3B82F6';
    const inactiveColor = isDark ? '#94A3B8' : '#64748B';

    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onPress();
            }}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={isActive ? { selected: true } : {}}
            className="flex-1 items-center justify-center py-1"
        >
            <Animated.View
                className="items-center justify-center px-3 py-1.5 rounded-2xl min-w-[56px]"
                style={animatedContainerStyle}
            >
                <Icon
                    size={20}
                    color={isActive ? activeColor : inactiveColor}
                    strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                    numberOfLines={1}
                    className={`text-[11px] mt-1 font-semibold ${
                        isActive
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400 font-medium'
                    }`}
                >
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export const BottomNav = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { isDark } = useTheme();

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
        <View className="absolute bottom-5 left-4 right-4">
            <View
                className="flex-row justify-around items-center bg-white/95 dark:bg-slate-900/95 py-1.5 px-2 rounded-3xl shadow-xl shadow-slate-300/40 dark:shadow-none border border-slate-200/80 dark:border-slate-800"
                style={Platform.OS === 'ios' ? { shadowOpacity: 0.12, shadowRadius: 16 } : { elevation: 8 }}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const Icon = getIcon(route.name);
                    const label = (options.title ?? route.name) as string;

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
                            label={label}
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
