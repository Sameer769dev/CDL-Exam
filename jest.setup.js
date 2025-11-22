// // Mock Worklets Core
// jest.mock('react-native-worklets-core', () => ({
//   Worklets: {
//     createWorklet: jest.fn(),
//     context: jest.fn(),
//   },
// }));

// // Mock Reanimated
// jest.mock('react-native-reanimated', () => {
//   const Reanimated = require('react-native-reanimated/mock');

//   // The mock for `call` immediately calls the callback which is incorrect
//   // So we override it with a no-op
//   Reanimated.default.call = () => {};

//   return {
//     ...Reanimated,
//     useSharedValue: jest.fn(() => ({ value: 0 })),
//     useAnimatedStyle: jest.fn(() => ({})),
//     useDerivedValue: jest.fn(() => ({ value: 0 })),
//     useAnimatedScrollHandler: jest.fn(() => () => {}),
//     useAnimatedProps: jest.fn(() => ({})),
//     withTiming: jest.fn((toValue) => toValue),
//     withSpring: jest.fn((toValue) => toValue),
//     withDelay: jest.fn((_, animation) => animation),
//     withSequence: jest.fn((...animations) => animations[animations.length - 1]),
//     FadeIn: { duration: jest.fn(() => ({ delay: jest.fn(() => ({})) })) },
//     FadeInDown: { duration: jest.fn(() => ({ delay: jest.fn(() => ({})) })) },
//     SlideInRight: { delay: jest.fn(() => ({ springify: jest.fn(() => ({})) })) },
//     Layout: { springify: jest.fn(() => ({})) },
//   };
// });

// // Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
