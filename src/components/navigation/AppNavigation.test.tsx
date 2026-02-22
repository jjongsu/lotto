import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import ThemeProvider from '../../theme/ThemeProvider';
import { THEME_STORAGE_KEY } from '../../theme/theme.constants';
import { setMatchMediaState } from '../../test/setup';
import AppNavigation from './AppNavigation';
import { MOBILE_BREAKPOINT, MOBILE_NAV_MENU_ID } from './navigation.constants';

const MOBILE_VIEWPORT_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`;

const setMobileViewport = (isMobile: boolean) => {
    setMatchMediaState(MOBILE_VIEWPORT_QUERY, isMobile);
};

const renderNavigation = () => {
    return render(
        <ThemeProvider>
            <AppNavigation />
        </ThemeProvider>,
    );
};

describe('AppNavigation', () => {
    beforeEach(() => {
        vi.mocked(usePathname).mockReturnValue('/');
        window.localStorage.clear();
        setMobileViewport(true);

        Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 0,
        });
    });

    it('closes mobile menu on overlay click and Escape key', () => {
        renderNavigation();

        fireEvent.click(screen.getByLabelText('메뉴 열기', { selector: 'button' }));
        expect(screen.getByLabelText('메뉴 닫기', { selector: 'button' })).toBeTruthy();

        const overlay = document.querySelector('div[aria-hidden="false"]');
        expect(overlay).toBeTruthy();
        fireEvent.click(overlay as Element);

        expect(screen.getByLabelText('메뉴 열기', { selector: 'button' })).toBeTruthy();

        fireEvent.click(screen.getByLabelText('메뉴 열기', { selector: 'button' }));
        fireEvent.keyDown(window, { key: 'Escape' });

        expect(screen.getByLabelText('메뉴 열기', { selector: 'button' })).toBeTruthy();
    });

    it('closes mobile menu when pathname changes', () => {
        const { rerender } = renderNavigation();

        fireEvent.click(screen.getByLabelText('메뉴 열기', { selector: 'button' }));
        expect(screen.getByLabelText('메뉴 닫기', { selector: 'button' })).toBeTruthy();

        vi.mocked(usePathname).mockReturnValue('/results');
        rerender(
            <ThemeProvider>
                <AppNavigation />
            </ThemeProvider>,
        );

        expect(screen.getByLabelText('메뉴 열기', { selector: 'button' })).toBeTruthy();
    });

    it('shows scroll-top button only on mobile viewport', () => {
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 240,
        });

        const { rerender } = renderNavigation();

        const topButton = screen.getByLabelText('맨 위로 이동', { selector: 'button' });
        expect(topButton.className).toContain('scrollTopButtonVisible');

        setMobileViewport(false);
        fireEvent(window, new Event('resize'));
        rerender(
            <ThemeProvider>
                <AppNavigation />
            </ThemeProvider>,
        );

        expect(topButton.className).not.toContain('scrollTopButtonVisible');
    });

    it('renders theme switches in header and mobile panel, and updates theme attributes', async () => {
        renderNavigation();

        expect(screen.getAllByRole('group', { name: '테마 선택' })).toHaveLength(1);

        fireEvent.click(screen.getByLabelText('메뉴 열기', { selector: 'button' }));
        expect(screen.getAllByRole('group', { name: '테마 선택' })).toHaveLength(2);

        fireEvent.click(screen.getAllByRole('switch')[0]);

        await waitFor(() => {
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        });
    });

    it('allows changing theme from mobile panel switch', async () => {
        renderNavigation();

        fireEvent.click(screen.getByLabelText('메뉴 열기', { selector: 'button' }));

        const mobilePanel = document.getElementById(MOBILE_NAV_MENU_ID);
        expect(mobilePanel).toBeTruthy();

        const toggle = within(mobilePanel as HTMLElement).getByRole('switch');
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        });
    });
});
