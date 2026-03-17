import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ExamDateStepProps {
    selectedDate?: string;
    onSelect: (date: string) => void;
}

export const ExamDateStep: React.FC<ExamDateStepProps> = ({ selectedDate, onSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month, 1).getDay();
    }, [currentMonth]);

    const monthName = useMemo(() => {
        return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [currentMonth]);

    const handlePrevMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
    };

    const handleDateSelect = (day: number) => {
        const date = new Date(currentMonth);
        date.setDate(day);
        onSelect(date.toISOString());
    };

    const renderCalendar = () => {
        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={{ width: '14.28%' }} className="aspect-square" />);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentMonth);
            date.setDate(i);
            const dateString = date.toISOString().split('T')[0];
            const isSelected = selectedDate ? selectedDate.split('T')[0] === dateString : false;
            const isToday = new Date().toISOString().split('T')[0] === dateString;
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            days.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => !isPast && handleDateSelect(i)}
                    disabled={isPast}
                    style={{ width: '14.28%' }}
                    className="aspect-square items-center justify-center mb-2"
                >
                    <View className={`w-9 h-9 items-center justify-center rounded-full ${isSelected
                        ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                        : isToday
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : ''
                        } ${isPast ? 'opacity-30' : ''}`}>
                        <Text className={`font-bold text-sm ${isSelected
                            ? 'text-white'
                            : isToday
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                            {i}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return days;
    };

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <View className="flex-1 px-6">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                className="flex-1"
            >
                <View className="mb-6">
                    <Text className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                        When is your exam?
                    </Text>
                    <Text className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                        We'll build a personalized study plan to ensure you're ready by this date.
                    </Text>
                </View>

                {/* Calendar Card */}
                <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md shadow-slate-200/50 border border-slate-100 dark:border-slate-700">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full border border-slate-100 dark:border-slate-600">
                            <ChevronLeft size={20} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">
                            {monthName}
                        </Text>
                        <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full border border-slate-100 dark:border-slate-600">
                            <ChevronRight size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Week Days */}
                    <View className="flex-row mb-3">
                        {weekDays.map(day => (
                            <View key={day} style={{ width: '14.28%' }} className="items-center">
                                <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Days Grid */}
                    <View className="flex-row flex-wrap">
                        {renderCalendar()}
                    </View>
                </View>

                {/* No Date Option */}
                <TouchableOpacity
                    onPress={() => {
                        // Set date to 30 days from now
                        const date = new Date();
                        date.setDate(date.getDate() + 30);
                        onSelect(date.toISOString());
                    }}
                    activeOpacity={0.8}
                    className="mt-6 flex-row items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-200/50"
                >
                    <Clock size={20} color="#64748b" />
                    <Text className="ml-2 font-bold text-slate-700 dark:text-slate-300 text-base">
                        I don't have a date yet
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
