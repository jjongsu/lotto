'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV_MENU_ID, NAV_ITEMS } from './navigation.constants';
import useNavigationState from './useNavigationState';
import ThemeModeSwitch from './ThemeModeSwitch';
import styles from './AppNavigation.module.css';

const getNavItemClassName = (pathname: string, href: string, baseClass: string, activeClass: string) => {
    return pathname === href ? `${baseClass} ${activeClass}` : baseClass;
};

export default function AppNavigation() {
    const pathname = usePathname();
    const { isMenuOpen, showScrollTop, toggleMenu, closeMenu, scrollToTop } = useNavigationState(pathname);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.bar}>
                    <Link href="/" className={styles.brand} aria-label="LOTTO DASHBOARD 홈으로 이동">
                        <span className={styles.brandWordmark} aria-hidden />
                        <span className={styles.srOnly}>LOTTO DASHBOARD 홈으로 이동</span>
                    </Link>

                    <div className={styles.headerActions}>
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

                        <ThemeModeSwitch className={styles.desktopThemeSwitch} />

                        <button
                            type="button"
                            className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ''}`}
                            onClick={toggleMenu}
                            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                            aria-expanded={isMenuOpen}
                            aria-controls={MOBILE_NAV_MENU_ID}
                        >
                            <span className={styles.menuLine} aria-hidden />
                            <span className={styles.menuLine} aria-hidden />
                            <span className={styles.menuLine} aria-hidden />
                        </button>
                    </div>
                </div>
            </header>

            <div className={`${styles.mobileOverlay} ${isMenuOpen ? styles.mobileOverlayVisible : ''}`} onClick={closeMenu} aria-hidden={!isMenuOpen}>
                <aside
                    id={MOBILE_NAV_MENU_ID}
                    className={`${styles.mobilePanel} ${isMenuOpen ? styles.mobilePanelOpen : ''}`}
                    aria-label="모바일 메뉴"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className={styles.mobilePanelHeader}>
                        <ThemeModeSwitch className={styles.mobileThemeSwitch} />
                    </div>

                    <nav aria-label="모바일 주요 메뉴">
                        <ul className={styles.mobileNavList}>
                            {NAV_ITEMS.map((item) => (
                                <li key={`mobile-${item.href}`}>
                                    <Link
                                        href={item.href}
                                        className={getNavItemClassName(pathname, item.href, styles.mobileNavLink, styles.mobileNavLinkActive)}
                                        onClick={closeMenu}
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
                onClick={scrollToTop}
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
