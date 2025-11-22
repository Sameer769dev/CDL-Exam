module.exports = {
    preset: "jest-expo",
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|lucide-react-native|react-native-worklets-core|react-native-reanimated)",
    ],
    moduleNameMapper: {
        "react-native-worklets/plugin": "react-native-worklets-core/plugin",
        "react-native-reanimated": "<rootDir>/__mocks__/react-native-reanimated.js",
        "react-native-worklets-core": "<rootDir>/__mocks__/react-native-worklets-core.js",
    },
    setupFiles: ["./jest.setup.js"],
};
