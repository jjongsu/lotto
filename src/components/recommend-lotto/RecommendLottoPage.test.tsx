import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LottoQueryData } from '../../types/lotto';
import useLottoData from '../../hooks/useLottoData';
import { generateWeightedSets } from '../../utils/recommend-lotto';
import RecommendLottoPage from './RecommendLottoPage';

vi.mock('../../hooks/useLottoData', () => {
    return {
        default: vi.fn(),
    };
});

vi.mock('../../utils/utils', () => {
    return {
        getRecentDrawList: vi.fn(() => [100, 99, 98]),
    };
});

vi.mock('../../utils/recommend-lotto', async () => {
    const actual = await vi.importActual<typeof import('../../utils/recommend-lotto')>('../../utils/recommend-lotto');
    return {
        ...actual,
        generateWeightedSets: vi.fn(actual.generateWeightedSets),
    };
});

const createSuccessDraw = (drwNo: number): LottoQueryData => {
    return {
        drwNo,
        drwNoDate: '2025-01-01',
        totSellamnt: 1_000_000,
        firstWinamnt: 2_000_000,
        firstPrzwnerCo: 5,
        firstAccumamnt: 10_000_000,
        drwtNo1: 1,
        drwtNo2: 2,
        drwtNo3: 3,
        drwtNo4: 4,
        drwtNo5: 5,
        drwtNo6: 6,
        bnusNo: 7,
        returnValue: 'success',
        isLoading: false,
    };
};

const createFailDraw = (drwNo: number): LottoQueryData => {
    return {
        drwNo,
        returnValue: 'fail',
        isLoading: false,
    };
};

describe('RecommendLottoPage', () => {
    beforeEach(() => {
        vi.mocked(useLottoData).mockReset();
        vi.mocked(generateWeightedSets).mockClear();
    });

    it('shows skeleton cards while loading', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: false,
            data: [],
        });

        render(<RecommendLottoPage fontVariables="" />);

        expect(document.querySelectorAll('[class*="skeletonCard"]').length).toBe(5);
    });

    it('recomputes recommendation sets when refresh button is clicked', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: false,
            data: [createSuccessDraw(100), createSuccessDraw(99), createSuccessDraw(98)],
        });

        render(<RecommendLottoPage fontVariables="" />);

        const initialCalls = vi.mocked(generateWeightedSets).mock.calls.length;

        fireEvent.click(screen.getByRole('button', { name: '추천 번호 다시 생성' }));

        expect(vi.mocked(generateWeightedSets).mock.calls.length).toBeGreaterThan(initialCalls);
    });

    it('shows warning banner when query reports error', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: true,
            data: [createSuccessDraw(100)],
        });

        render(<RecommendLottoPage fontVariables="" />);

        expect(screen.getByText('일부 회차 데이터를 불러오지 못해 가중치 정확도가 낮을 수 있습니다.')).toBeTruthy();
    });

    it('shows warning banner when there are no successful draws', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: false,
            data: [createFailDraw(100)],
        });

        render(<RecommendLottoPage fontVariables="" />);

        expect(screen.getByText('회차 데이터가 없어 균등 분포 기반 추천을 표시합니다.')).toBeTruthy();
    });
});
