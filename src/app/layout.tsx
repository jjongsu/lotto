import type { Metadata, Viewport } from 'next';
import AppNavigation from '../components/navigation/AppNavigation';
import './globals.css';
import Providers from './providers';
import { ROOT_METADATA } from './seo';

export const metadata: Metadata = ROOT_METADATA;

export const viewport: Viewport = {
    themeColor: '#0c1424',
    colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                <Providers>
                    <AppNavigation />
                    <div className="appContent">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
