import type { LottoSuccessResponse } from '../types/lotto';
import { createEmptyFrequencyMap, getValidatedMainNumbersFromDraw, isValidLottoNumber, type FrequencyMap } from './lotto-domain';

const LOW_MAX = 22;

export type { FrequencyMap } from './lotto-domain';

export interface TopFrequencyItem {
    number: number;
    count: number;
}

export interface SumSeriesPoint {
    drawNo: number;
    sum: number;
}

export interface SumStats {
    average: number;
    min: number;
    max: number;
    series: SumSeriesPoint[];
}

export function buildMainNumberFrequency(draws: LottoSuccessResponse[]): FrequencyMap {
    const map = createEmptyFrequencyMap();

    for (const draw of draws) {
        for (const number of getValidatedMainNumbersFromDraw(draw)) {
            map[number] += 1;
        }
    }

    return map;
}

export function buildBonusFrequency(draws: LottoSuccessResponse[]): FrequencyMap {
    const map = createEmptyFrequencyMap();

    for (const draw of draws) {
        if (isValidLottoNumber(draw.bnusNo)) {
            map[draw.bnusNo] += 1;
        }
    }

    return map;
}

export function buildOddEvenStats(draws: LottoSuccessResponse[]) {
    let odd = 0;
    let even = 0;

    for (const draw of draws) {
        for (const number of getValidatedMainNumbersFromDraw(draw)) {
            if (number % 2 === 0) {
                even += 1;
            } else {
                odd += 1;
            }
        }
    }

    return { odd, even };
}

export function buildHighLowStats(draws: LottoSuccessResponse[]) {
    let low = 0;
    let high = 0;

    for (const draw of draws) {
        for (const number of getValidatedMainNumbersFromDraw(draw)) {
            if (number <= LOW_MAX) {
                low += 1;
            } else {
                high += 1;
            }
        }
    }

    return { low, high };
}

export function buildSumSeries(draws: LottoSuccessResponse[]): SumStats {
    const series = draws
        .slice()
        .sort((a, b) => a.drwNo - b.drwNo)
        .map((draw) => {
            const sum = getValidatedMainNumbersFromDraw(draw).reduce((acc, number) => acc + number, 0);
            return { drawNo: draw.drwNo, sum };
        });

    if (series.length === 0) {
        return { average: 0, min: 0, max: 0, series: [] };
    }

    const sums = series.map((item) => item.sum);
    const sumTotal = sums.reduce((acc, value) => acc + value, 0);

    return {
        average: Number((sumTotal / series.length).toFixed(1)),
        min: Math.min(...sums),
        max: Math.max(...sums),
        series,
    };
}

export function toTopNFrequency(map: FrequencyMap, n: number): TopFrequencyItem[] {
    const safeCount = Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;

    return Object.entries(map)
        .map(([number, count]) => ({ number: Number(number), count }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count || a.number - b.number)
        .slice(0, safeCount);
}
