import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sparkles, Layers, AlertOctagon, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const ActionGrid = () => {
    const router = useRouter();

    const actions = [
        {
            title: 'Practice Quiz',
            icon: Sparkles,
            color: 'blue',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: '#3B82F6',
            path: '/categories?mode=quiz',
            delay: 100
        },
        {
            title: 'Flashcards',
            icon: Layers,
            color: 'indigo',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconColor: '#6366F1',
            path: '/categories?mode=flashcards',
            delay: 200
        },
        {
            title: 'Mistakes',
            icon: AlertOctagon,
            color: 'red',
            bg: 'bg-red-50 dark:bg-red-900/20',
            iconColor: '#EF4444',
            path: '/mistake-bank',
            delay: 300
        },
        {
            title: 'Simulator',
            icon: Award,
            color: 'slate',
            bg: 'bg-slate-100 dark:bg-slate-800',
            iconColor: '#64748B', // Slate-500
            path: '/exam-intro',
            delay: 400
        }
    ];

    return (
        <View className="flex-row flex-wrap justify-between gap-y-4">
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(action.delay).springify()}
                        className="w-[48%]"
                    >
                        <TouchableOpacity
                            onPress={() => {
                                if (action.path.includes('?')) {
                                    const [pathname, params] = action.path.split('?');
                                    const searchParams = new URLSearchParams(params);
                                    router.push({ pathname: pathname as any, params: Object.fromEntries(searchParams) });
                                } else {
                                    router.push(action.path as any);
                                }
                            }}
                            className={`p-5 rounded-3xl ${action.bg} border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform`}
                        >
                            <View className={`w-10 h-10 rounded-full bg-white dark:bg-slate-900 items-center justify-center mb-3 shadow-sm`}>
                                <Icon size={20} color={action.iconColor} strokeWidth={2} />
                            </View>
                            <Text className="text-slate-900 dark:text-white font-bold text-base leading-tight">
                                {action.title}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};
