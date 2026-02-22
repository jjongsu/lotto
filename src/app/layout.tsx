import type { Metadata, Viewport } from 'next';
import AppNavigation from '../components/navigation/AppNavigation';
import './globals.css';
import Providers from './providers';
import { ROOT_METADATA } from './seo';
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT, THEME_STORAGE_KEY } from '../theme/theme.constants';

export const metadata: Metadata = ROOT_METADATA;

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
        { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
    ],
    colorScheme: 'light dark',
};

const THEME_INITIALIZER_SCRIPT = `(function(){try{var stored=localStorage.getItem('${THEME_STORAGE_KEY}');var mode='light';if(stored==='dark'){mode='dark';}else if(stored==='system'){mode=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var root=document.documentElement;root.setAttribute('data-theme',mode);root.classList.toggle('dark',mode==='dark');root.style.colorScheme=mode;var themeColor=mode==='dark'?'${THEME_COLOR_DARK}':'${THEME_COLOR_LIGHT}';var tags=document.querySelectorAll('meta[name="theme-color"]');if(!tags.length){var meta=document.createElement('meta');meta.setAttribute('name','theme-color');meta.setAttribute('content',themeColor);document.head.appendChild(meta);}else{tags.forEach(function(tag){tag.setAttribute('content',themeColor);tag.removeAttribute('media');});}}catch(error){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning data-theme="light">
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INITIALIZER_SCRIPT }} />
            </head>
            <body>
                <Providers>
                    <AppNavigation />
                    <div className="appContent">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
