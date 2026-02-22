import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT, SCROLL_TOP_THRESHOLD } from './navigation.constants';

const isMobileViewport = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
};

export default function useNavigationState(pathname: string) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const syncViewportState = () => {
            const mobile = isMobileViewport();
            if (!mobile) {
                setIsMenuOpen(false);
            }

            setShowScrollTop(mobile && window.scrollY > SCROLL_TOP_THRESHOLD);
        };

        syncViewportState();
        window.addEventListener('scroll', syncViewportState, { passive: true });
        window.addEventListener('resize', syncViewportState);

        return () => {
            window.removeEventListener('scroll', syncViewportState);
            window.removeEventListener('resize', syncViewportState);
        };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const previousOverflow = document.body.style.overflow;

        if (isMenuOpen && isMobileViewport()) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = previousOverflow;
            };
        }

        return undefined;
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        isMenuOpen,
        showScrollTop,
        toggleMenu,
        closeMenu,
        scrollToTop,
    };
}
