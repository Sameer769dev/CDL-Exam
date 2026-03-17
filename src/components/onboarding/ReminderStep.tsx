import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { BellRing, Plus, Trash2, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ReminderStepProps {
    onNext: (times: Date[]) => void;
}

export const ReminderStep: React.FC<ReminderStepProps> = ({ onNext }) => {
    // Default to 9:00 AM if no times set
    const [times, setTimes] = useState<Date[]>([new Date(new Date().setHours(9, 0, 0, 0))]);
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const handleAddTime = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            // Check if time already exists (simple check)
            const exists = times.some(t =>
                t.getHours() === selectedDate.getHours() &&
                t.getMinutes() === selectedDate.getMinutes()
            );

            if (!exists) {
                setTimes([...times, selectedDate].sort((a, b) => a.getTime() - b.getTime()));
            }
        }
    };

    const removeTime = (index: number) => {
        const newTimes = [...times];
        newTimes.splice(index, 1);
        setTimes(newTimes);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View className="flex-1">
            <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-8">
                <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-6">
                    <BellRing size={40} color="#3b82f6" />
                </View>
                <Text className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">
                    Daily Reminders
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-center text-lg px-4">
                    Set times to study and keep your streak alive.
                </Text>
            </Animated.View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {times.map((time, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(200 + (index * 100)).springify()}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-5 flex-row items-center justify-between border border-slate-100 dark:border-slate-700 shadow-md shadow-slate-200/50"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl mr-4">
                                <Clock size={24} color="#3b82f6" />
                            </View>
                            <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                {formatTime(time)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => removeTime(index)}
                            className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl"
                        >
                            <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    className="flex-row items-center justify-center py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl mb-8 active:bg-slate-50 dark:active:bg-slate-800"
                >
                    <Plus size={24} color="#94a3b8" />
                    <Text className="text-slate-500 font-semibold ml-2">Add Another Time</Text>
                </TouchableOpacity>
            </ScrollView>

            <View className="p-6">
                <TouchableOpacity
                    onPress={() => onNext(times)}
                    className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-500/30"
                >
                    <Text className="text-white font-bold text-lg">
                        Continue
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onNext([])}
                    className="w-full py-4 items-center mt-2"
                >
                    <Text className="text-slate-400 font-semibold">
                        Skip for now
                    </Text>
                </TouchableOpacity>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display="default"
                    onChange={handleAddTime}
                />
            )}
        </View>
    );
};
