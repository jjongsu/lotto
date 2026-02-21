import type { Metadata } from 'next';
import AppNavigation from '../components/navigation/AppNavigation';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
    title: 'Lotto Dashboard',
    description: 'Lotto(6/45) dashboard',
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
