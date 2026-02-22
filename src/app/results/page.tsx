import type { Metadata } from 'next';
import { fontVariables } from '../fonts';
import GetLottoPage from '../../components/get-lotto/GetLottoPage';
import { createPageMetadata } from '../seo';

export const metadata: Metadata = createPageMetadata({
    title: '회차 조회',
    description: '로또 회차별 당첨번호, 1등 당첨자 수, 번호 통계를 차트로 확인하는 회차 조회 페이지입니다.',
    path: '/results',
    keywords: ['로또 회차 조회', '로또 당첨번호 조회', '로또 번호 통계'],
});

export default function Page() {
    return <GetLottoPage fontVariables={fontVariables} />;
}
