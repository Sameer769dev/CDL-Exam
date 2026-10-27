import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { X, Sparkles, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchAITutorExplanation, AIError } from '../utils/aiClient';

interface AITutorModalProps {
    visible: boolean;
    onClose: () => void;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
}

export function AITutorModal({ visible, onClose, questionText, userAnswer, correctAnswer }: AITutorModalProps) {
    const { isDark } = useTheme();
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadExplanation = () => {
        setExplanation(null);
        setError(null);
        setLoading(true);

        fetchAITutorExplanation(questionText, userAnswer, correctAnswer)
            .then(text => {
                setExplanation(text);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load AI Tutor:", err);
                setError(err instanceof AIError ? err.message : "Could not connect to the AI Tutor. Please try again.");
                setLoading(false);
            });
    };

    useEffect(() => {
        if (visible) {
            loadExplanation();
        }
    }, [visible, questionText, userAnswer, correctAnswer]);

    // Renders markdown bold segments (**text**) into styled React Native Text components
    const renderFormattedText = (raw: string) => {
        const paragraphs = raw.split('\n\n');
        return paragraphs.map((para, pIdx) => {
            const parts = para.split(/\*\*(.*?)\*\*/g);
            return (
                <Text key={pIdx} className="text-base text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
                    {parts.map((part, idx) => {
                        const isBold = idx % 2 === 1;
                        return (
                            <Text key={idx} className={isBold ? "font-bold text-teal-800 dark:text-teal-300" : "font-normal"}>
                                {part}
                            </Text>
                        );
                    })}
                </Text>
            );
        });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-white dark:bg-slate-900 rounded-t-3xl h-[75%] max-h-[640px] border-t border-slate-200 dark:border-slate-800 shadow-2xl">
                    
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                        <View className="flex-row items-center">
                            <View className="w-11 h-11 bg-teal-100 dark:bg-teal-900/40 rounded-full items-center justify-center mr-3 border border-teal-300 dark:border-teal-700">
                                <Sparkles size={22} color="#0d9488" />
                            </View>
                            <View>
                                <Text className="text-lg font-black text-slate-900 dark:text-white">
                                    Diesel Dan
                                </Text>
                                <Text className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                                    Master CDL Instructor • AI
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full"
                        >
                            <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 40 }}>
                        <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-5 border border-slate-100 dark:border-slate-700/50">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                                Question Context
                            </Text>
                            <Text className="text-slate-800 dark:text-slate-200 mb-3 font-semibold text-sm leading-snug">
                                {questionText}
                            </Text>
                            
                            <View className="flex-row items-start mb-2">
                                <View className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 mr-2" />
                                <Text className="flex-1 text-rose-600 dark:text-rose-400 text-xs">
                                    <Text className="font-bold">You selected:</Text> {userAnswer}
                                </Text>
                            </View>
                            
                            <View className="flex-row items-start">
                                <View className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 mr-2" />
                                <Text className="flex-1 text-emerald-600 dark:text-emerald-400 text-xs">
                                    <Text className="font-bold">Correct answer:</Text> {correctAnswer}
                                </Text>
                            </View>
                        </View>

                        {loading ? (
                            <View className="py-12 items-center justify-center">
                                <ActivityIndicator size="large" color="#0d9488" />
                                <Text className="mt-4 text-slate-600 dark:text-slate-300 font-bold text-base">
                                    Diesel Dan is reviewing your answer...
                                </Text>
                                <Text className="text-slate-400 text-xs mt-1">
                                    Checking FMCSA regulations and road safety rules
                                </Text>
                            </View>
                        ) : error ? (
                            <View className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/40">
                                <View className="flex-row items-center mb-3">
                                    <AlertCircle size={22} color="#f43f5e" className="mr-2" />
                                    <Text className="text-rose-700 dark:text-rose-300 font-bold text-base">
                                        Could not load explanation
                                    </Text>
                                </View>
                                <Text className="text-rose-600 dark:text-rose-400 font-medium text-sm mb-4">
                                    {error}
                                </Text>
                                <TouchableOpacity
                                    onPress={loadExplanation}
                                    className="bg-rose-600 p-3 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="bg-teal-50/50 dark:bg-teal-950/20 p-5 rounded-2xl border border-teal-100 dark:border-teal-900/40">
                                <Text className="text-xs text-teal-800 dark:text-teal-300 font-black mb-3 uppercase tracking-wider">
                                    Instructor's Road Breakdown
                                </Text>
                                {explanation ? renderFormattedText(explanation) : null}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
