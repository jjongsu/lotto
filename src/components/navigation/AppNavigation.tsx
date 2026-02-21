'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './AppNavigation.module.css';

type NavItem = {
    href: string;
    label: string;
};

const NAV_ITEMS: NavItem[] = [
    { href: '/', label: '홈' },
    { href: '/get-lotto', label: '회차 조회' },
    { href: '/recommend-lotto', label: '추천 번호' },
];

const MOBILE_BREAKPOINT = 768;
const SCROLL_TOP_THRESHOLD = 200;

const isMobileViewport = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
};

const getNavItemClassName = (pathname: string, href: string, baseClass: string, activeClass: string) => {
    return pathname === href ? `${baseClass} ${activeClass}` : baseClass;
};

export default function AppNavigation() {
    const pathname = usePathname();
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
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.bar}>
                    <Link href="/" className={styles.brand}>
                        LOTTO DASHBOARD
                    </Link>

                    <nav className={styles.desktopNav} aria-label="주요 메뉴">
                        <ul className={styles.navList}>
                            {NAV_ITEMS.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className={getNavItemClassName(pathname, item.href, styles.navLink, styles.navLinkActive)}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <button
                        type="button"
                        className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ''}`}
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav-menu"
                    >
                        <span className={styles.menuLine} aria-hidden />
                        <span className={styles.menuLine} aria-hidden />
                        <span className={styles.menuLine} aria-hidden />
                    </button>
                </div>
            </header>

            <div
                className={`${styles.mobileOverlay} ${isMenuOpen ? styles.mobileOverlayVisible : ''}`}
                onClick={() => setIsMenuOpen(false)}
                aria-hidden={!isMenuOpen}
            >
                <aside
                    id="mobile-nav-menu"
                    className={`${styles.mobilePanel} ${isMenuOpen ? styles.mobilePanelOpen : ''}`}
                    aria-label="모바일 메뉴"
                    onClick={(event) => event.stopPropagation()}
                >
                    <nav aria-label="모바일 주요 메뉴">
                        <ul className={styles.mobileNavList}>
                            {NAV_ITEMS.map((item) => (
                                <li key={`mobile-${item.href}`}>
                                    <Link
                                        href={item.href}
                                        className={getNavItemClassName(pathname, item.href, styles.mobileNavLink, styles.mobileNavLinkActive)}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>

            <button
                type="button"
                className={`${styles.scrollTopButton} ${showScrollTop ? styles.scrollTopButtonVisible : ''}`}
                onClick={handleScrollTop}
                aria-label="맨 위로 이동"
            >
                <span className={styles.scrollTopArrow} aria-hidden>
                    ↑
                </span>
                TOP
            </button>
        </>
    );
}
