import type { Metadata } from 'next';

const SITE_NAME = '로또 대시보드';
const DEFAULT_SITE_URL = 'http://localhost:3000';
const OG_IMAGE_PATH = '/favicon/android-chrome-512x512.png';

const parseSiteUrl = (value?: string): string => {
    if (!value) return DEFAULT_SITE_URL;

    try {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        return new URL(normalized).toString();
    } catch {
        return DEFAULT_SITE_URL;
    }
};

export const SITE_URL = parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim());
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const NAVER_SITE_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim();
export const GOOGLE_ADSENSE_CLIENT = 'ca-pub-3984267493776789';

const ROOT_VERIFICATION: Metadata['verification'] = {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(NAVER_SITE_VERIFICATION ? { other: { 'naver-site-verification': NAVER_SITE_VERIFICATION } } : {}),
};

export const SEO_BASE: Pick<Metadata, 'metadataBase'> = {
    metadataBase: new URL(SITE_URL),
};

export const DEFAULT_KEYWORDS = [
    '로또',
    '로또 6/45',
    '로또 당첨번호',
    '로또 회차 조회',
    '로또 통계',
    '로또 추천번호',
    '로또 대시보드',
];

const DEFAULT_DESCRIPTION = '로또 6/45 회차 조회, 번호 통계 분석, 추천 번호 생성까지 한 번에 확인하는 로또 대시보드입니다.';

export const ROOT_METADATA: Metadata = {
    ...SEO_BASE,
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: DEFAULT_KEYWORDS,
    creator: SITE_NAME,
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        url: '/',
        images: [
            {
                url: OG_IMAGE_PATH,
                width: 512,
                height: 512,
                alt: `${SITE_NAME} 대표 이미지`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        images: [OG_IMAGE_PATH],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
            { url: '/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
        ],
        apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
        shortcut: ['/favicon.ico'],
    },
    manifest: '/favicon/site.webmanifest',
    category: 'lottery',
    formatDetection: {
        telephone: false,
        address: false,
        email: false,
    },
    other: {
        'google-adsense-account': GOOGLE_ADSENSE_CLIENT,
    },
    ...(Object.keys(ROOT_VERIFICATION).length > 0 ? { verification: ROOT_VERIFICATION } : {}),
};

interface CreatePageMetadataInput {
    title: string;
    description: string;
    path: string;
    keywords?: string[];
}

export const createPageMetadata = ({ title, description, path, keywords = [] }: CreatePageMetadataInput): Metadata => ({
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
        canonical: path,
    },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        siteName: SITE_NAME,
        title,
        description,
        url: path,
        images: [
            {
                url: OG_IMAGE_PATH,
                width: 512,
                height: 512,
                alt: `${SITE_NAME} 대표 이미지`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [OG_IMAGE_PATH],
    },
});
