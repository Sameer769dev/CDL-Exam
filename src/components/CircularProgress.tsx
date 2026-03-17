import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withDelay,
    useDerivedValue,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
    percentage: number;
    radius?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textColor?: string;
    max?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    radius = 60,
    strokeWidth = 10,
    color = '#3b82f6',
    duration = 1000,
    textColor,
    max = 100,
}) => {
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withDelay(500, withTiming(percentage, { duration }));
    }, [percentage, duration]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset =
            circumference - (circumference * animatedValue.value) / max;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={{ width: radius * 2, height: radius * 2, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={radius * 2} height={radius * 2}>
                {/* Background Circle */}
                <Circle
                    cx={radius}
                    cy={radius}
                    r={innerRadius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.2}
                    fill="transparent"
                />
                {/* Foreground Circle */}
                <AnimatedCircle
                    cx={radius}
                    cy={radius}
                    r={innerRadius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${radius}, ${radius}`}
                />
            </Svg>

            {/* Percentage Text */}
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text
                    style={{
                        fontSize: radius * 0.5,
                        fontWeight: '900',
                        color: textColor || color,
                    }}
                >
                    {Math.round(percentage)}%
                </Text>
            </View>
        </View>
    );
};
