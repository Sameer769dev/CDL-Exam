import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

export const TimePicker = ({ value, onChange }: TimePickerProps) => {
    const [show, setShow] = useState(false);

    const handleChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || value;
        setShow(Platform.OS === 'ios');
        onChange(currentDate);
    };

    if (Platform.OS === 'android') {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => setShow(true)}
                    className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                    <Text className="text-slate-900 dark:text-white font-medium text-lg">
                        {value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={value}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={(e, date) => {
                            setShow(false);
                            handleChange(e, date);
                        }}
                    />
                )}
            </View>
        );
    }

    // iOS
    return (
        <DateTimePicker
            testID="dateTimePicker"
            value={value}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={handleChange}
            style={{ width: 120 }}
        />
    );
};
