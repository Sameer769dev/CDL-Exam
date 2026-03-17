import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Search, MapPin, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { US_STATES } from '../../data/states';

interface StateSelectionStepProps {
    selectedState?: string;
    onSelect: (stateCode: string) => void;
}

export const StateSelectionStep: React.FC<StateSelectionStepProps> = ({ selectedState, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStates = useMemo(() => {
        return US_STATES.filter(state =>
            state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            state.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const renderItem = ({ item, index }: { item: typeof US_STATES[0], index: number }) => {
        const isSelected = selectedState === item.code;

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 30).springify()}
                className="flex-1 mb-3 mx-1.5"
            >
                <TouchableOpacity
                    onPress={() => onSelect(item.code)}
                    activeOpacity={0.8}
                    className={`p-4 rounded-2xl border flex-row items-center justify-between ${isSelected
                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/40'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-200/50'
                        }`}
                >
                    <View className="flex-1">
                        <Text className={`text-sm font-bold mb-1 ${isSelected ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                            {item.code}
                        </Text>
                        <Text className={`text-base font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                            }`} numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>
                    {isSelected && (
                        <View className="bg-white/20 p-1 rounded-full">
                            <Check size={14} color="white" strokeWidth={3} />
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 px-6">
            <View className="mb-6">
                <Text className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                    Where are you taking the exam?
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                    We'll customize your study plan for your state's specific requirements.
                </Text>
            </View>

            {/* Search Bar */}
            <View className="mb-6">
                <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 border border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-200/50">
                    <Search size={20} color="#64748b" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-slate-900 dark:text-white font-medium"
                        placeholder="Search state..."
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredStates}
                renderItem={renderItem}
                keyExtractor={item => item.code}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 4, paddingHorizontal: 2 }}
                className="flex-1 -mx-2"
            />
        </View>
    );
};
