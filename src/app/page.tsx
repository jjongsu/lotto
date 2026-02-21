import { Noto_Sans_KR, Orbitron } from 'next/font/google';
import HomePage from '../components/home/HomePage';

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['600', '700', '800'],
    display: 'swap',
    variable: '--font-lotto-display',
});

const notoSansKr = Noto_Sans_KR({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    display: 'swap',
    variable: '--font-lotto-body',
});

export default function Page() {
    return <HomePage fontVariables={`${orbitron.variable} ${notoSansKr.variable}`} />;
}
