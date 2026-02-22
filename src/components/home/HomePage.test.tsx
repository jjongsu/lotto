import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LottoQueryData } from '../../types/lotto';
import HomePage from './HomePage';
import useLottoData from '../../hooks/useLottoData';

vi.mock('../../hooks/useLottoData', () => {
    return {
        default: vi.fn(),
    };
});

vi.mock('../../utils/utils', () => {
    return {
        getRecentList3: vi.fn(() => [100, 99, 98]),
    };
});

const createSuccessDraw = (drwNo: number, date: string): LottoQueryData => {
    return {
        drwNo,
        drwNoDate: date,
        totSellamnt: 1_000_000,
        firstWinamnt: drwNo * 10_000,
        firstPrzwnerCo: drwNo,
        firstAccumamnt: drwNo * 1_000_000,
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

describe('HomePage', () => {
    beforeEach(() => {
        vi.mocked(useLottoData).mockReset();
    });

    it('updates selected draw on search submit', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: false,
            data: [createSuccessDraw(100, '2025-01-01'), createSuccessDraw(99, '2024-12-25')],
        });

        render(<HomePage fontVariables="" />);

        const currentDrawValue = screen.getByText('현재 검색 회차').parentElement?.querySelector('strong');
        expect(currentDrawValue?.textContent).toBe('100회');

        fireEvent.change(screen.getByLabelText('검색할 회차 입력'), { target: { value: '99' } });
        fireEvent.click(screen.getByRole('button', { name: '검색' }));

        expect(currentDrawValue?.textContent).toBe('99회');
    });

    it('shows loading overlay and loading result text while fetching', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: false,
            data: [{ isLoading: true }],
        });

        render(<HomePage fontVariables="" />);

        expect(screen.getByText('검색중...')).toBeTruthy();
        expect(document.querySelector('[class*="loadingOverlay"]')).toBeTruthy();
    });

    it('shows fail message for not-yet-drawn round', () => {
        vi.mocked(useLottoData).mockReturnValue({
            isError: false,
            data: [createFailDraw(100)],
        });

        render(<HomePage fontVariables="" />);

        expect(screen.getByText('아직 로또 추첨 시작 전입니다.')).toBeTruthy();
    });
});
