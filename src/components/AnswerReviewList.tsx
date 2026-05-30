import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface ReviewData {
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    userAnswer: string | null;
}

interface AnswerReviewListProps {
    data: ReviewData[];
}

export function AnswerReviewList({ data }: AnswerReviewListProps) {
    const { isDark } = useTheme();
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (!data || data.length === 0) return null;

    return (
        <View className="mt-8">
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-4">
                Review Answers
            </Text>

            {data.map((item, index) => {
                const isCorrect = item.userAnswer === item.correct_answer;
                const isExpanded = expandedIds.has(item.id);
                const isUnanswered = item.userAnswer === null;

                return (
                    <Animated.View
                        key={item.id}
                        entering={FadeInDown.delay(index * 50).springify()}
                        layout={Layout.springify()}
                        className={`mb-3 bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden ${isCorrect ? 'border-green-100 dark:border-green-900/30' : isUnanswered ? 'border-slate-200 dark:border-slate-700' : 'border-red-100 dark:border-red-900/30'}`}
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => toggleExpand(item.id)}
                            className="p-4 flex-row items-start justify-between"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row flex-1 mr-3">
                                <View className="mt-0.5 mr-3">
                                    {isCorrect ? (
                                        <CheckCircle size={20} color="#10b981" />
                                    ) : (
                                        <XCircle size={20} color={isUnanswered ? (isDark ? '#94a3b8' : '#64748b') : '#ef4444'} />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                                        Question {index + 1}
                                    </Text>
                                    <Text className="text-base font-medium text-slate-900 dark:text-white" numberOfLines={isExpanded ? undefined : 2}>
                                        {item.question}
                                    </Text>
                                </View>
                            </View>
                            
                            <View className="p-1 bg-slate-50 dark:bg-slate-700/50 rounded-full">
                                {isExpanded ? (
                                    <ChevronUp size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                                ) : (
                                    <ChevronDown size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                                )}
                            </View>
                        </TouchableOpacity>

                        {isExpanded && (
                            <View className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                <View className="space-y-2 mb-4">
                                    {item.options.map((option, idx) => {
                                        const isThisCorrect = option === item.correct_answer;
                                        const isThisSelected = option === item.userAnswer;
                                        
                                        let bgClass = "bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700";
                                        let textClass = "text-slate-700 dark:text-slate-300";
                                        
                                        if (isThisCorrect) {
                                            bgClass = "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                                            textClass = "text-green-800 dark:text-green-300 font-bold";
                                        } else if (isThisSelected) {
                                            bgClass = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                                            textClass = "text-red-800 dark:text-red-300 font-medium";
                                        }

                                        return (
                                            <View key={idx} className={`p-3 rounded-xl border ${bgClass}`}>
                                                <Text className={textClass}>{option}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                
                                {item.explanation && (
                                    <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                        <Text className="text-blue-800 dark:text-blue-300 font-bold mb-1">Explanation</Text>
                                        <Text className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                            {item.explanation}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </Animated.View>
                );
            })}
        </View>
    );
}
