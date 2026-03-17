import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { User, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface ProfileStepProps {
    onNext: (name: string, avatar: string) => void;
}

import { AVATARS } from '../../utils/avatars';

export const ProfileStep: React.FC<ProfileStepProps> = ({ onNext }) => {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);

    const handleNext = () => {
        if (name.trim()) {
            onNext(name, selectedAvatar);
        }
    };

    return (
        <View className="flex-1 px-6 pt-8">
            <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Text className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    Create Profile
                </Text>
                <Text className="text-lg mb-8" style={{ color: colors.text.secondary }}>
                    Let's personalize your experience.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-8">
                <Text className="text-base font-semibold mb-4" style={{ color: colors.text.primary }}>
                    Choose your avatar
                </Text>
                <View className="flex-row flex-wrap justify-between">
                    {AVATARS.map((avatar, index) => {
                        const isSelected = selectedAvatar === avatar.id;
                        return (
                            <Animated.View
                                key={avatar.id}
                                entering={FadeInRight.delay(500 + (index * 100)).springify()}
                                className="mb-4"
                            >
                                <TouchableOpacity
                                    onPress={() => setSelectedAvatar(avatar.id)}
                                    activeOpacity={0.8}
                                    className="w-20 h-20 rounded-full items-center justify-center border-2 overflow-hidden"
                                    style={{
                                        borderColor: isSelected ? colors.primary.main : 'transparent',
                                        backgroundColor: colors.background.card,
                                        shadowColor: isSelected ? colors.primary.main : '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: isSelected ? 0.3 : 0.1,
                                        shadowRadius: 8,
                                        elevation: isSelected ? 8 : 2
                                    }}
                                >
                                    <Image
                                        source={avatar.source}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    {isSelected && (
                                        <View
                                            className="absolute inset-0 bg-black/20 items-center justify-center"
                                        >
                                            <View className="bg-white rounded-full p-1">
                                                <Check size={16} color={colors.primary.main} strokeWidth={3} />
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).springify()} className="flex-1">
                <Text className="text-base font-semibold mb-3" style={{ color: colors.text.primary }}>
                    What should we call you?
                </Text>
                <View
                    className="flex-row items-center h-14 rounded-2xl px-4 border"
                    style={{
                        backgroundColor: colors.background.card,
                        borderColor: name.trim() ? colors.primary.main : colors.border.default
                    }}
                >
                    <User size={20} color={name.trim() ? colors.primary.main : colors.icon.default} />
                    <TextInput
                        className="flex-1 ml-3 text-lg font-medium"
                        style={{ color: colors.text.primary }}
                        placeholder="Enter your name"
                        placeholderTextColor={colors.text.tertiary}
                        value={name}
                        onChangeText={setName}
                        autoCorrect={false}
                        returnKeyType="done"
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(800).springify()} className="pb-8">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!name.trim()}
                    className="h-16 rounded-3xl items-center justify-center transition-all"
                    style={{
                        backgroundColor: name.trim() ? colors.primary.main : colors.background.card,
                        opacity: name.trim() ? 1 : 0.7,
                        shadowColor: name.trim() ? colors.primary.main : 'transparent',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: name.trim() ? 8 : 0
                    }}
                >
                    <Text
                        className="text-xl font-bold"
                        style={{ color: name.trim() ? colors.text.inverse : colors.text.disabled }}
                    >
                        Continue
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
