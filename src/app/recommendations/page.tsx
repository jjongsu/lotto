import type { Metadata } from 'next';
import { fontVariables } from '../fonts';
import RecommendLottoPage from '../../components/recommend-lotto/RecommendLottoPage';
import { createPageMetadata } from '../seo';

export const metadata: Metadata = createPageMetadata({
    title: '추천 번호',
    description: '최근 출현 빈도 기반으로 로또 번호 5세트를 추천받고 상위 출현 번호 통계를 확인하는 페이지입니다.',
    path: '/recommendations',
    keywords: ['로또 추천번호', '로또 번호 추천', '로또 빈도 기반 추천'],
});

export default function Page() {
    return <RecommendLottoPage fontVariables={fontVariables} />;
}
