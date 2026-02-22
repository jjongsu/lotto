import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GetLottoPage from './GetLottoPage';
import { useGetLottoViewModel } from './useGetLottoViewModel';

vi.mock('next/dynamic', () => {
    return {
        default: () => {
            return ({ option }: { option: unknown }) => <div data-testid="chart-mock" data-option={JSON.stringify(option)} />;
        },
    };
});

vi.mock('./useGetLottoViewModel', () => {
    return {
        LOOKBACK_OPTIONS: [30, 50, 100],
        useGetLottoViewModel: vi.fn(),
    };
});

type GetLottoViewModel = ReturnType<typeof useGetLottoViewModel>;

const createViewModel = (overrides: Partial<GetLottoViewModel> = {}): GetLottoViewModel => {
    const baseStatsDraw = {
        drwNo: 1200,
        drwNoDate: '2025-01-01',
        totSellamnt: 1000000,
        firstWinamnt: 2000000,
        firstPrzwnerCo: 5,
        firstAccumamnt: 10000000,
        drwtNo1: 1,
        drwtNo2: 2,
        drwtNo3: 3,
        drwtNo4: 4,
        drwtNo5: 5,
        drwtNo6: 6,
        bnusNo: 7,
        returnValue: 'success' as const,
        isLoading: false,
    };

    return {
        latestRound: 1210,
        searchDraw: 1200,
        inputDraw: '1200',
        lookback: 30,
        isLoading: false,
        warningMessage: '',
        targetDraw: baseStatsDraw,
        targetMainNumbers: [1, 2, 3, 4, 5, 6],
        statsSuccessDraws: [baseStatsDraw],
        hasStatsData: true,
        oddEvenStats: { odd: 3, even: 3 },
        highLowStats: { low: 4, high: 2 },
        sumStats: {
            average: 126,
            min: 100,
            max: 150,
            series: [{ drawNo: 1200, sum: 126 }],
        },
        mainFrequencyOption: { chart: 'main' },
        bonusFrequencyOption: { chart: 'bonus' },
        oddEvenOption: { chart: 'oddEven' },
        highLowOption: { chart: 'highLow' },
        sumLineOption: { chart: 'sum' },
        handleInputDrawChange: vi.fn(),
        handleLookbackChange: vi.fn(),
        updateSearchDraw: vi.fn(),
        handleSearch: vi.fn(),
        ...overrides,
    };
};

describe('GetLottoPage', () => {
    it('handles search/move/lookback interactions', () => {
        const viewModel = createViewModel({
            latestRound: 1500,
            searchDraw: 1200,
            inputDraw: '1200',
        });

        vi.mocked(useGetLottoViewModel).mockReturnValue(viewModel);

        render(<GetLottoPage fontVariables="" />);

        fireEvent.change(screen.getByLabelText('검색할 회차 입력'), { target: { value: '1199' } });
        expect(viewModel.handleInputDrawChange).toHaveBeenCalledWith('1199');

        fireEvent.click(screen.getByRole('button', { name: '검색' }));
        expect(viewModel.handleSearch).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: '이전 회차 이동' }));
        expect(viewModel.updateSearchDraw).toHaveBeenCalledWith(1199);

        fireEvent.click(screen.getByRole('button', { name: '다음 회차 이동' }));
        expect(viewModel.updateSearchDraw).toHaveBeenCalledWith(1201);

        fireEvent.click(screen.getByRole('button', { name: '최근 50회' }));
        expect(viewModel.handleLookbackChange).toHaveBeenCalledWith(50);
    });

    it('updates lookback text and warning message based on view model state', () => {
        vi.mocked(useGetLottoViewModel).mockReturnValue(createViewModel({ lookback: 30, warningMessage: '', hasStatsData: true }));

        const { rerender } = render(<GetLottoPage fontVariables="" />);

        expect(screen.getByText('최신 기준 최근 30회 통계를 시각화해 제공합니다.')).toBeTruthy();
        const chartMocks = screen.getAllByTestId('chart-mock');
        expect(chartMocks).toHaveLength(5);
        expect(chartMocks[0].getAttribute('data-option')).toContain('main');

        vi.mocked(useGetLottoViewModel).mockReturnValue(
            createViewModel({
                lookback: 100,
                warningMessage: '경고 메시지',
                hasStatsData: false,
            }),
        );

        rerender(<GetLottoPage fontVariables="" />);

        expect(screen.getByText('최신 기준 최근 100회 통계를 시각화해 제공합니다.')).toBeTruthy();
        expect(screen.getByText('경고 메시지')).toBeTruthy();
        expect(screen.getByText('통계를 계산할 수 있는 회차 데이터가 아직 없습니다.')).toBeTruthy();
    });
});
