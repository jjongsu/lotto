import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import AppNavigation from './AppNavigation';

const setMobileViewport = (isMobile: boolean) => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => {
        return {
            matches: isMobile,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        } as unknown as MediaQueryList;
    });
};

describe('AppNavigation', () => {
    beforeEach(() => {
        vi.mocked(usePathname).mockReturnValue('/');
        setMobileViewport(true);
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 0,
        });
    });

    it('closes mobile menu on overlay click and Escape key', () => {
        render(<AppNavigation />);

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
        const { rerender } = render(<AppNavigation />);

        fireEvent.click(screen.getByLabelText('메뉴 열기', { selector: 'button' }));
        expect(screen.getByLabelText('메뉴 닫기', { selector: 'button' })).toBeTruthy();

        vi.mocked(usePathname).mockReturnValue('/results');
        rerender(<AppNavigation />);

        expect(screen.getByLabelText('메뉴 열기', { selector: 'button' })).toBeTruthy();
    });

    it('shows scroll-top button only on mobile viewport', () => {
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 240,
        });

        const { rerender } = render(<AppNavigation />);

        const topButton = screen.getByLabelText('맨 위로 이동', { selector: 'button' });
        expect(topButton.className).toContain('scrollTopButtonVisible');

        setMobileViewport(false);
        fireEvent(window, new Event('resize'));
        rerender(<AppNavigation />);

        expect(topButton.className).not.toContain('scrollTopButtonVisible');
    });
});
