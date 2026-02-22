export interface NavItem {
    href: string;
    label: string;
}

export const NAV_ITEMS: NavItem[] = [
    { href: '/', label: '홈' },
    { href: '/results', label: '회차 조회' },
    { href: '/recommendations', label: '추천 번호' },
];

export const MOBILE_BREAKPOINT = 768;
export const SCROLL_TOP_THRESHOLD = 200;
export const MOBILE_NAV_MENU_ID = 'mobile-nav-menu';
