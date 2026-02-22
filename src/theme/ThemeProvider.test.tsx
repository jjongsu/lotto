import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ThemeProvider from './ThemeProvider';
import { THEME_STORAGE_KEY } from './theme.constants';
import { useTheme } from './useTheme';

function ThemeConsumer() {
    const { mode, setMode, toggleMode } = useTheme();

    return (
        <div>
            <span data-testid="mode">{mode}</span>
            <button type="button" onClick={() => setMode('light')}>
                set-light
            </button>
            <button type="button" onClick={() => setMode('dark')}>
                set-dark
            </button>
            <button type="button" onClick={toggleMode}>
                toggle-mode
            </button>
        </div>
    );
}

describe('ThemeProvider', () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
    });

    it('defaults to light mode when there is no stored value', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('light');
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
        });
    });

    it('restores dark mode from localStorage', async () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('dark');
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        });
    });

    it('updates mode and persists values when setMode is called', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'set-dark' }));

        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('dark');
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        });

        fireEvent.click(screen.getByRole('button', { name: 'set-light' }));

        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('light');
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
        });
    });

    it('toggles between light and dark mode', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'toggle-mode' }));

        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('dark');
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        });

        fireEvent.click(screen.getByRole('button', { name: 'toggle-mode' }));

        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('light');
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        });
    });
});
