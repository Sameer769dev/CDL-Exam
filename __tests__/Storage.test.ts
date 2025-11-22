import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getHasCompletedOnboarding,
    setHasCompletedOnboarding,
    getThemePreference,
    saveThemePreference
} from '../src/utils/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

describe('Storage Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Onboarding Status', () => {
        it('should return false when onboarding status is not set', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
            const result = await getHasCompletedOnboarding();
            expect(result).toBe(false);
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@cdl_prep:has_completed_onboarding');
        });

        it('should return true when onboarding is completed', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
            const result = await getHasCompletedOnboarding();
            expect(result).toBe(true);
        });

        it('should save onboarding status correctly', async () => {
            await setHasCompletedOnboarding(true);
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('@cdl_prep:has_completed_onboarding', 'true');
        });
    });

    describe('Theme Preference', () => {
        it('should return "system" as default theme', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
            const result = await getThemePreference();
            expect(result).toBe('system');
        });

        it('should return saved theme preference', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');
            const result = await getThemePreference();
            expect(result).toBe('dark');
        });

        it('should save theme preference correctly', async () => {
            await saveThemePreference('light');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('@cdl_prep:theme_preference', 'light');
        });
    });
});
