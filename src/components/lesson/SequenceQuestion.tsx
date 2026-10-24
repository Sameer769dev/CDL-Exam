import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, XCircle, RotateCcw, ArrowDown, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

export interface SequenceItem {
    id: string;
    text: string;
    correctOrder: number;
}

export interface SequenceQuestionProps {
    title: string;
    instruction?: string;
    items: SequenceItem[];
    onComplete: (isCorrect: boolean) => void;
}

export const SequenceQuestion: React.FC<SequenceQuestionProps> = ({
    title,
    instruction = "Tap the steps in the correct order from first to last:",
    items,
    onComplete,
}) => {
    const { isDark } = useTheme();

    // Shuffled pool of available items
    const [availableItems, setAvailableItems] = useState<SequenceItem[]>(() => {
        return [...items].sort(() => Math.random() - 0.5);
    });

    // Currently ordered slots
    const [selectedItems, setSelectedItems] = useState<SequenceItem[]>([]);
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isAllCorrect, setIsAllCorrect] = useState(false);

    const handleSelectChip = (item: SequenceItem) => {
        if (isEvaluated) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAvailableItems(prev => prev.filter(i => i.id !== item.id));
        setSelectedItems(prev => [...prev, item]);
    };

    const handleRemoveFromSlot = (item: SequenceItem) => {
        if (isEvaluated) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedItems(prev => prev.filter(i => i.id !== item.id));
        setAvailableItems(prev => [...prev, item]);
    };

    const handleReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsEvaluated(false);
        setIsAllCorrect(false);
        setAvailableItems([...items].sort(() => Math.random() - 0.5));
        setSelectedItems([]);
    };

    const handleVerify = () => {
        if (selectedItems.length !== items.length) return;

        // Check if every item is in its correct order
        const correct = selectedItems.every((item, idx) => item.correctOrder === idx);
        setIsEvaluated(true);
        setIsAllCorrect(correct);

        if (correct) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        onComplete(correct);
    };

    return (
        <View className="flex-1">
            {/* Header / Instruction */}
            <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                    <View className="bg-purple-500/10 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 mr-2">
                        <Text className="text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                            Sequence Master
                        </Text>
                    </View>
                    <Sparkles size={14} color="#a855f7" />
                </View>

                <Text className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1">
                    {title}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {instruction}
                </Text>
            </View>

            {/* Target Ordered Slots */}
            <View className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 mb-6">
                <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    Your Procedure ({selectedItems.length}/{items.length})
                </Text>

                {selectedItems.length === 0 ? (
                    <View className="py-8 items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <ArrowDown size={22} color={isDark ? '#475569' : '#94a3b8'} className="mb-2" />
                        <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                            Tap cards below in chronological order
                        </Text>
                    </View>
                ) : (
                    <View className="gap-2">
                        {selectedItems.map((item, index) => {
                            const isThisItemCorrect = isEvaluated && item.correctOrder === index;
                            const isThisItemWrong = isEvaluated && item.correctOrder !== index;

                            let borderStyle = 'border-slate-200 dark:border-slate-700';
                            let bgStyle = 'bg-white dark:bg-slate-800';

                            if (isThisItemCorrect) {
                                borderStyle = 'border-emerald-500 dark:border-emerald-500';
                                bgStyle = 'bg-emerald-50 dark:bg-emerald-950/30';
                            } else if (isThisItemWrong) {
                                borderStyle = 'border-red-500 dark:border-red-500';
                                bgStyle = 'bg-red-50 dark:bg-red-950/30';
                            }

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.8}
                                    disabled={isEvaluated}
                                    onPress={() => handleRemoveFromSlot(item)}
                                    className={`p-3.5 rounded-2xl border ${borderStyle} ${bgStyle} flex-row items-center justify-between shadow-sm`}
                                >
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View className="w-6 h-6 rounded-full bg-purple-500/10 dark:bg-purple-500/20 items-center justify-center mr-3 border border-purple-500/30">
                                            <Text className="text-purple-600 dark:text-purple-400 font-black text-xs">
                                                {index + 1}
                                            </Text>
                                        </View>
                                        <Text className="text-slate-900 dark:text-white font-semibold text-xs leading-snug flex-1">
                                            {item.text}
                                        </Text>
                                    </View>

                                    {isEvaluated ? (
                                        isThisItemCorrect ? (
                                            <CheckCircle2 size={18} color="#10b981" />
                                        ) : (
                                            <XCircle size={18} color="#ef4444" />
                                        )
                                    ) : (
                                        <Text className="text-slate-400 text-[10px] font-bold">Tap to remove</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Available Item Bank */}
            <View className="flex-1 mb-6">
                <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    Available Steps (Tap to place)
                </Text>

                <View className="gap-2.5">
                    {availableItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.75}
                            disabled={isEvaluated}
                            onPress={() => handleSelectChip(item)}
                            className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-row items-center active:scale-[0.99]"
                        >
                            <View className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-3" />
                            <Text className="text-slate-800 dark:text-slate-200 font-semibold text-xs leading-snug flex-1">
                                {item.text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Action Bar */}
            <View className="flex-row gap-3 pt-2">
                <TouchableOpacity
                    onPress={handleReset}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center active:opacity-70"
                >
                    <RotateCcw size={20} color={isDark ? '#cbd5e1' : '#475569'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={selectedItems.length !== items.length || isEvaluated}
                    className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-lg ${
                        selectedItems.length === items.length && !isEvaluated
                            ? 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700'
                            : 'bg-slate-200 dark:bg-slate-800 opacity-60'
                    }`}
                >
                    <Text className={`font-black text-sm uppercase tracking-wider ${
                        selectedItems.length === items.length && !isEvaluated ? 'text-white' : 'text-slate-400'
                    }`}>
                        {isEvaluated ? (isAllCorrect ? '✓ Verified Correct' : '✕ Try Again') : 'Check Order'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
