'use client';

import { useTheme } from '../../theme/useTheme';
import styles from './AppNavigation.module.css';

interface ThemeModeSwitchProps {
    className?: string;
}

export default function ThemeModeSwitch({ className }: ThemeModeSwitchProps) {
    const { mode, toggleMode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <div className={`${styles.themeSwitch} ${className ?? ''}`} role="group" aria-label="테마 선택">
            <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                className={`${styles.themeToggle} ${isDark ? styles.themeToggleDark : ''}`}
                onClick={toggleMode}
                title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
                <span className={styles.themeToggleTrack} aria-hidden>
                    <span className={`${styles.themeToggleIcon} ${styles.themeToggleSun}`}>☀</span>
                    <span className={`${styles.themeToggleIcon} ${styles.themeToggleMoon}`}>☾</span>
                </span>
                <span className={styles.themeToggleThumb} aria-hidden />
            </button>
        </div>
    );
}
