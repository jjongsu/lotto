import type { Metadata } from 'next';
import { fontVariables } from './fonts';
import HomePage from '../components/home/HomePage';
import { createPageMetadata } from './seo';

export const metadata: Metadata = createPageMetadata({
    title: '홈',
    description: '로또 6/45 최신 흐름과 회차별 결과를 한 화면에서 빠르게 확인하는 메인 페이지입니다.',
    path: '/',
    keywords: ['로또 홈', '로또 메인', '로또 빠른 조회'],
});

export default function Page() {
    return <HomePage fontVariables={fontVariables} />;
}
