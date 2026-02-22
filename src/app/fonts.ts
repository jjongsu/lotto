import { Noto_Sans_KR, Orbitron } from 'next/font/google';

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

export const fontVariables = `${orbitron.variable} ${notoSansKr.variable}`;
