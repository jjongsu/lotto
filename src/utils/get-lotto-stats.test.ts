import { describe, expect, it } from 'vitest';
import type { LottoSuccessResponse } from '../types/lotto';
import {
    buildBonusFrequency,
    buildHighLowStats,
    buildMainNumberFrequency,
    buildOddEvenStats,
    buildSumSeries,
    toTopNFrequency,
} from './get-lotto-stats';

const createSuccessDraw = (drwNo: number, numbers: [number, number, number, number, number, number], bonus: number): LottoSuccessResponse => {
    return {
        drwNo,
        drwNoDate: `2025-01-${String(drwNo).padStart(2, '0')}`,
        totSellamnt: 1_000_000,
        firstWinamnt: 2_000_000,
        firstPrzwnerCo: 10,
        firstAccumamnt: 20_000_000,
        drwtNo1: numbers[0],
        drwtNo2: numbers[1],
        drwtNo3: numbers[2],
        drwtNo4: numbers[3],
        drwtNo5: numbers[4],
        drwtNo6: numbers[5],
        bnusNo: bonus,
        returnValue: 'success',
    };
};

describe('get-lotto-stats utils', () => {
    it('builds main/bonus frequency and returns top items', () => {
        const draws = [createSuccessDraw(1, [1, 2, 3, 4, 5, 6], 7), createSuccessDraw(2, [1, 2, 11, 12, 13, 14], 7)];

        const mainFrequency = buildMainNumberFrequency(draws);
        const bonusFrequency = buildBonusFrequency(draws);
        const topItems = toTopNFrequency(mainFrequency, 3);

        expect(mainFrequency[1]).toBe(2);
        expect(mainFrequency[2]).toBe(2);
        expect(mainFrequency[6]).toBe(1);
        expect(mainFrequency[45]).toBe(0);

        expect(bonusFrequency[7]).toBe(2);
        expect(bonusFrequency[1]).toBe(0);

        expect(topItems).toEqual([
            { number: 1, count: 2 },
            { number: 2, count: 2 },
            { number: 3, count: 1 },
        ]);
    });

    it('computes odd/even, high/low, and sum stats', () => {
        const draws = [createSuccessDraw(2, [23, 24, 25, 26, 27, 28], 3), createSuccessDraw(1, [1, 2, 3, 4, 5, 6], 9)];

        const oddEven = buildOddEvenStats(draws);
        const highLow = buildHighLowStats(draws);
        const sumStats = buildSumSeries(draws);

        expect(oddEven).toEqual({ odd: 6, even: 6 });
        expect(highLow).toEqual({ low: 6, high: 6 });
        expect(sumStats).toEqual({
            average: 87,
            min: 21,
            max: 153,
            series: [
                { drawNo: 1, sum: 21 },
                { drawNo: 2, sum: 153 },
            ],
        });
    });

    it('returns zeroed sum stats for empty draws', () => {
        expect(buildSumSeries([])).toEqual({
            average: 0,
            min: 0,
            max: 0,
            series: [],
        });
    });
});
