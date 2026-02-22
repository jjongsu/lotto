import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';

const mockUsePathname = vi.fn(() => '/');

type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

interface MatchMediaState {
    matches: boolean;
    listeners: Set<MediaQueryChangeListener>;
}

const matchMediaState = new Map<string, MatchMediaState>();

const getMatchMediaState = (query: string): MatchMediaState => {
    const existing = matchMediaState.get(query);
    if (existing) return existing;

    const nextState: MatchMediaState = {
        matches: false,
        listeners: new Set(),
    };

    matchMediaState.set(query, nextState);
    return nextState;
};

export const setMatchMediaState = (query: string, matches: boolean) => {
    const state = getMatchMediaState(query);
    state.matches = matches;

    const event = {
        matches,
        media: query,
    } as MediaQueryListEvent;

    state.listeners.forEach((listener) => {
        listener(event);
    });
};

export const resetMatchMediaState = () => {
    matchMediaState.clear();
};

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
        const state = getMatchMediaState(query);

        return {
            get matches() {
                return state.matches;
            },
            media: query,
            onchange: null,
            addListener: (listener: MediaQueryChangeListener) => {
                state.listeners.add(listener);
            },
            removeListener: (listener: MediaQueryChangeListener) => {
                state.listeners.delete(listener);
            },
            addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
                if (type !== 'change') return;
                if (typeof listener === 'function') {
                    state.listeners.add(listener as MediaQueryChangeListener);
                }
            },
            removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
                if (type !== 'change') return;
                if (typeof listener === 'function') {
                    state.listeners.delete(listener as MediaQueryChangeListener);
                }
            },
            dispatchEvent: (event: Event) => {
                if (event.type !== 'change') return true;
                const mediaEvent = event as MediaQueryListEvent;
                state.listeners.forEach((listener) => listener(mediaEvent));
                return true;
            },
        } as MediaQueryList;
    }),
});

Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
});

afterEach(() => {
    cleanup();
    resetMatchMediaState();
});
