import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';

const mockUsePathname = vi.fn(() => '/');

vi.mock('next/navigation', () => {
    return {
        usePathname: mockUsePathname,
    };
});

vi.mock('next/link', () => {
    return {
        default: ({ href, children, ...props }: { href: string | { pathname?: string }; children?: React.ReactNode; [key: string]: unknown }) => {
            const resolvedHref = typeof href === 'string' ? href : href?.pathname ?? '';
            return React.createElement('a', { ...props, href: resolvedHref }, children);
        },
    };
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => {
        return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        };
    }),
});

Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
});

afterEach(() => {
    cleanup();
});
