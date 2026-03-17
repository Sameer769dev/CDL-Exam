import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import { getThemePreference, saveThemePreference, ThemePreference } from '../utils/storage';

interface Colors {
    primary: {
        main: string;
        light: string;
        dark: string;
    };
    secondary: {
        main: string;
        light: string;
    };
    background: {
        main: string;
        card: string;
        modal: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        disabled: string;
    };
    border: {
        default: string;
        focus: string;
    };
    semantic: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    icon: {
        default: string;
        active: string;
    };
}

const themeColors: { light: Colors; dark: Colors } = {
    light: {
        primary: { main: '#3b82f6', light: '#eff6ff', dark: '#1e40af' },
        secondary: { main: '#64748b', light: '#f1f5f9' },
        background: { main: '#f8fafc', card: '#ffffff', modal: '#ffffff' },
        text: { primary: '#0f172a', secondary: '#64748b', tertiary: '#94a3b8', inverse: '#ffffff', disabled: '#cbd5e1' },
        border: { default: '#e2e8f0', focus: '#3b82f6' },
        semantic: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
        icon: { default: '#64748b', active: '#3b82f6' }
    },
    dark: {
        primary: { main: '#3b82f6', light: 'rgba(59, 130, 246, 0.2)', dark: '#1e3a8a' },
        secondary: { main: '#94a3b8', light: '#1e293b' },
        background: { main: '#0f172a', card: '#1e293b', modal: '#1e293b' },
        text: { primary: '#ffffff', secondary: '#94a3b8', tertiary: '#64748b', inverse: '#0f172a', disabled: '#475569' },
        border: { default: '#334155', focus: '#60a5fa' },
        semantic: { success: '#34d399', warning: '#fbbf24', error: '#f87171', info: '#60a5fa' },
        icon: { default: '#94a3b8', active: '#60a5fa' }
    }
};

interface ThemeContextType {
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => Promise<void>;
    isDark: boolean;
    colors: Colors;
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
    const colors = isDark ? themeColors.dark : themeColors.light;

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark, colors }}>
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
