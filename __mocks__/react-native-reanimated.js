const Reanimated = require('react-native-reanimated/mock');
const { View, Text, Image, ScrollView } = require('react-native');

if (Reanimated && Reanimated.default) {
    Reanimated.default.call = () => { };
}

View.displayName = 'View';
Text.displayName = 'Text';
Image.displayName = 'Image';
ScrollView.displayName = 'ScrollView';

const Animated = {
    ...Reanimated.default,
    View,
    Text,
    Image,
    ScrollView,
    createAnimatedComponent: (c) => c,
};

const createAnimationMock = () => {
    const chainable = () => chainable;
    chainable.duration = jest.fn(() => chainable);
    chainable.delay = jest.fn(() => chainable);
    chainable.springify = jest.fn(() => chainable);
    chainable.damping = jest.fn(() => chainable);
    chainable.mass = jest.fn(() => chainable);
    chainable.stiffness = jest.fn(() => chainable);
    chainable.overshootClamping = jest.fn(() => chainable);
    chainable.restDisplacementThreshold = jest.fn(() => chainable);
    chainable.restSpeedThreshold = jest.fn(() => chainable);
    chainable.withInitialValues = jest.fn(() => chainable);
    chainable.build = jest.fn(() => ({}));
    return chainable;
};

module.exports = {
    ...Reanimated,
    default: Animated,
    View,
    Text,
    Image,
    ScrollView,
    createAnimatedComponent: (c) => c,
    useSharedValue: jest.fn((init) => ({ value: init ?? 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    useDerivedValue: jest.fn((fn) => ({ value: typeof fn === 'function' ? fn() : 0 })),
    useAnimatedScrollHandler: jest.fn(() => () => { }),
    useAnimatedProps: jest.fn(() => ({})),
    withTiming: jest.fn((toValue) => toValue),
    withSpring: jest.fn((toValue) => toValue),
    withDelay: jest.fn((_, animation) => animation),
    withSequence: jest.fn((...animations) => animations[animations.length - 1]),
    FadeIn: createAnimationMock(),
    FadeInDown: createAnimationMock(),
    FadeInUp: createAnimationMock(),
    FadeOut: createAnimationMock(),
    FadeOutDown: createAnimationMock(),
    FadeOutUp: createAnimationMock(),
    SlideInRight: createAnimationMock(),
    SlideInLeft: createAnimationMock(),
    SlideInUp: createAnimationMock(),
    SlideInDown: createAnimationMock(),
    SlideOutRight: createAnimationMock(),
    SlideOutLeft: createAnimationMock(),
    ZoomIn: createAnimationMock(),
    ZoomOut: createAnimationMock(),
    Layout: createAnimationMock(),
};
