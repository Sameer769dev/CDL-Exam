import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import * as Haptics from 'expo-haptics';

interface BookmarkButtonProps {
    questionId: number;
    size?: number;
    color?: string;
    activeColor?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    questionId,
    size = 24,
    color = '#94a3b8',
    activeColor = '#f59e0b'
}) => {
    const { isBookmarked, toggleBookmark } = useUser();
    const bookmarked = isBookmarked(questionId);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePress = async () => {
        // Haptic feedback
        if (bookmarked) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Removing bookmark
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Adding bookmark
        }

        // Animate
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        await toggleBookmark(questionId);
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Bookmark
                    size={size}
                    color={bookmarked ? activeColor : color}
                    fill={bookmarked ? activeColor : 'transparent'}
                    strokeWidth={2}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};
