'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT, THEME_STORAGE_KEY } from './theme.constants';
import type { ThemeMode } from './theme.types';

interface ThemeContextValue {
    mode: ThemeMode;
    setMode: (nextMode: ThemeMode) => void;
    toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isThemeMode = (value: unknown): value is ThemeMode => {
    return value === 'light' || value === 'dark';
};

const resolveLegacySystemMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveStoredThemeMode = (value: unknown): ThemeMode => {
    if (isThemeMode(value)) return value;
    if (value === 'system') return resolveLegacySystemMode();
    return 'light';
};

const updateThemeColorMeta = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const themeColorValue = mode === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    const themeMetaTags = document.querySelectorAll('meta[name="theme-color"]');

    if (themeMetaTags.length === 0) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('content', themeColorValue);
        document.head.append(meta);
        return;
    }

    themeMetaTags.forEach((tag) => {
        tag.setAttribute('content', themeColorValue);
        tag.removeAttribute('media');
    });
};

const applyThemeToDocument = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;

    updateThemeColorMeta(mode);
};

const readStoredThemeMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light';

    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return resolveStoredThemeMode(stored);
    } catch {
        return 'light';
    }
};

const persistThemeMode = (mode: ThemeMode) => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        // ignore localStorage access errors
    }
};

interface ThemeProviderProps {
    children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [mode, setModeState] = useState<ThemeMode>('light');

    useEffect(() => {
        setModeState(readStoredThemeMode());
        setIsInitialized(true);
    }, []);

    const setMode = useCallback((nextMode: ThemeMode) => {
        setModeState(nextMode);
    }, []);

    const toggleMode = useCallback(() => {
        setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        persistThemeMode(mode);
        applyThemeToDocument(mode);
    }, [isInitialized, mode]);

    useEffect(() => {
        if (!isInitialized || typeof window === 'undefined') return;

        const syncThemeAcrossTabs = (event: StorageEvent) => {
            if (event.key !== THEME_STORAGE_KEY) return;
            setModeState(resolveStoredThemeMode(event.newValue));
        };

        window.addEventListener('storage', syncThemeAcrossTabs);

        return () => {
            window.removeEventListener('storage', syncThemeAcrossTabs);
        };
    }, [isInitialized]);

    const contextValue = useMemo(
        () => ({
            mode,
            setMode,
            toggleMode,
        }),
        [mode, setMode, toggleMode],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
