import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react-native";

interface ResultCardProps {
    score: number;
    total: number;
    onRetake: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
    score,
    total,
    onRetake,
}) => {
    const percentage = (score / total) * 100;
    const isPass = percentage >= 80;

    return (
        <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 items-center w-full max-w-sm">
            <View className="mb-6">
                {isPass ? (
                    <CheckCircle size={80} color="#16a34a" />
                ) : (
                    <XCircle size={80} color="#dc2626" />
                )}
            </View>

            <Text className="text-3xl font-bold text-slate-900 mb-2">
                {isPass ? "Passed!" : "Failed"}
            </Text>

            <Text className="text-slate-500 text-center mb-8 text-lg">
                {isPass
                    ? "Great job! You're ready for the real exam."
                    : "Keep studying! You need 80% to pass."}
            </Text>

            <View className="w-full bg-slate-50 rounded-2xl p-6 mb-8 items-center">
                <Text className="text-slate-400 text-sm uppercase font-bold tracking-wider mb-1">
                    Your Score
                </Text>
                <Text className="text-5xl font-black text-slate-900">
                    {Math.round(percentage)}%
                </Text>
                <Text className="text-slate-500 mt-2 font-medium">
                    {score} out of {total} correct
                </Text>
            </View>

            <TouchableOpacity
                onPress={onRetake}
                className="flex-row items-center justify-center bg-blue-600 py-4 px-8 rounded-xl w-full active:bg-blue-700"
            >
                <RotateCcw size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg ml-2">Retake Quiz</Text>
            </TouchableOpacity>
        </View>
    );
};
