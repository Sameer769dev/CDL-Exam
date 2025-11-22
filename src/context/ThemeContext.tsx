import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import { getThemePreference, saveThemePreference, ThemePreference } from '../utils/storage';

interface ThemeContextType {
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => Promise<void>;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [theme, setThemeState] = useState<ThemePreference>('system');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        const savedTheme = await getThemePreference();
        setThemeState(savedTheme);
        applyTheme(savedTheme);
    };

    const applyTheme = (newTheme: ThemePreference) => {
        if (newTheme === 'system') {
            setColorScheme('system');
        } else {
            setColorScheme(newTheme);
        }
    };

    const setTheme = async (newTheme: ThemePreference) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        await saveThemePreference(newTheme);
    };

    const isDark = colorScheme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
