import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { X, Sparkles, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchAITutorExplanation } from '../utils/aiClient';

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

    useEffect(() => {
        if (visible) {
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
                    setError("Could not connect to the AI Tutor. Please try again.");
                    setLoading(false);
                });
        }
    }, [visible, questionText, userAnswer, correctAnswer]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-white dark:bg-slate-900 rounded-t-3xl h-[70%] max-h-[600px] border-t border-slate-200 dark:border-slate-800 shadow-2xl">
                    
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full items-center justify-center mr-3 border border-teal-200 dark:border-teal-800">
                                <Sparkles size={20} color="#0d9488" />
                            </View>
                            <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                AI Instructor
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                        >
                            <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 40 }}>
                        <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700/50">
                            <Text className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                Context
                            </Text>
                            <Text className="text-slate-800 dark:text-slate-200 mb-4 font-medium">
                                {questionText}
                            </Text>
                            
                            <View className="flex-row items-start mb-2">
                                <View className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2" />
                                <Text className="flex-1 text-red-600 dark:text-red-400">
                                    <Text className="font-bold">You selected:</Text> {userAnswer}
                                </Text>
                            </View>
                            
                            <View className="flex-row items-start">
                                <View className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2" />
                                <Text className="flex-1 text-green-600 dark:text-green-400">
                                    <Text className="font-bold">Correct answer:</Text> {correctAnswer}
                                </Text>
                            </View>
                        </View>

                        {loading ? (
                            <View className="py-10 items-center justify-center">
                                <ActivityIndicator size="large" color="#0d9488" />
                                <Text className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
                                    Analyzing your answer...
                                </Text>
                            </View>
                        ) : error ? (
                            <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30 flex-row items-center">
                                <AlertCircle size={24} color="#ef4444" className="mr-3" />
                                <Text className="flex-1 text-red-600 dark:text-red-400 font-medium">
                                    {error}
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase tracking-wider">
                                    Instructor's Explanation
                                </Text>
                                <Text className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {explanation}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
