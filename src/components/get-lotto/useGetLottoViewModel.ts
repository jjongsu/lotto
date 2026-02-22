'use client';

import type { EChartsOption } from 'echarts';
import { useMemo, useState } from 'react';
import useLottoData from '../../hooks/useLottoData';
import type { SumStats } from '../../utils/get-lotto-stats';
import {
    buildBonusFrequency,
    buildHighLowStats,
    buildMainNumberFrequency,
    buildOddEvenStats,
    buildSumSeries,
    toTopNFrequency,
} from '../../utils/get-lotto-stats';
import { getMainNumbersFromDraw } from '../../utils/lotto-domain';
import { isLottoSuccessQueryData, type LottoQueryData, type LottoSuccessQueryData } from '../../types/lotto';
import { clampDrawInRange, parsePositiveDrawInput } from '../../utils/draw-search';
import { getCurrentLottoRound, getRecentDrawList } from '../../utils/utils';
import { createBarChartOption, createLineChartOption, createPieChartOption } from './chart-options';

export type LookbackRange = 30 | 50 | 100;

export const LOOKBACK_OPTIONS: LookbackRange[] = [30, 50, 100];

interface GetLottoViewModel {
    latestRound: number;
    searchDraw: number;
    inputDraw: string;
    lookback: LookbackRange;
    isLoading: boolean;
    warningMessage: string;
    targetDraw: LottoQueryData | undefined;
    targetMainNumbers: number[];
    statsSuccessDraws: LottoSuccessQueryData[];
    hasStatsData: boolean;
    oddEvenStats: { odd: number; even: number };
    highLowStats: { low: number; high: number };
    sumStats: SumStats;
    mainFrequencyOption: EChartsOption;
    bonusFrequencyOption: EChartsOption;
    oddEvenOption: EChartsOption;
    highLowOption: EChartsOption;
    sumLineOption: EChartsOption;
    handleInputDrawChange: (value: string) => void;
    handleLookbackChange: (value: LookbackRange) => void;
    updateSearchDraw: (value: number) => void;
    handleSearch: () => void;
}

export const useGetLottoViewModel = (): GetLottoViewModel => {
    const latestRound = useMemo(() => getCurrentLottoRound(), []);
    const [searchDraw, setSearchDraw] = useState(latestRound);
    const [inputDraw, setInputDraw] = useState(String(latestRound));
    const [lookback, setLookback] = useState<LookbackRange>(30);

    const statsRounds = useMemo(() => getRecentDrawList(lookback), [lookback]);
    const queryRounds = useMemo(() => Array.from(new Set([searchDraw, ...statsRounds])).sort((a, b) => b - a), [searchDraw, statsRounds]);

    const { data: lottoData, isError } = useLottoData(queryRounds);
    const isLoading = lottoData.length === 0 || lottoData.some((item) => item.isLoading);

    const statsRoundSet = useMemo(() => new Set(statsRounds), [statsRounds]);
    const targetDraw = lottoData.find((item) => item.drwNo === searchDraw);

    const statsSuccessDraws = useMemo(
        () =>
            lottoData
                .filter((item): item is LottoSuccessQueryData => {
                    return isLottoSuccessQueryData(item) && typeof item.drwNo === 'number' && statsRoundSet.has(item.drwNo);
                })
                .sort((a, b) => b.drwNo - a.drwNo),
        [lottoData, statsRoundSet],
    );

    const warningMessage = useMemo(() => {
        if (isLoading) return '';
        if (isError) return '일부 회차 데이터를 불러오지 못해 통계 정확도가 낮을 수 있습니다.';
        if (statsSuccessDraws.length === 0) return '통계를 계산할 성공 회차 데이터가 없습니다.';
        if (statsSuccessDraws.length < lookback) {
            return `최근 ${lookback}회 중 ${statsSuccessDraws.length}회 데이터로 통계를 계산했습니다.`;
        }
        return '';
    }, [isError, isLoading, lookback, statsSuccessDraws.length]);

    const targetMainNumbers = useMemo(() => {
        if (!isLottoSuccessQueryData(targetDraw)) return [];
        return getMainNumbersFromDraw(targetDraw);
    }, [targetDraw]);

    const mainTop10 = useMemo(() => toTopNFrequency(buildMainNumberFrequency(statsSuccessDraws), 10), [statsSuccessDraws]);
    const bonusTop10 = useMemo(() => toTopNFrequency(buildBonusFrequency(statsSuccessDraws), 10), [statsSuccessDraws]);
    const oddEvenStats = useMemo(() => buildOddEvenStats(statsSuccessDraws), [statsSuccessDraws]);
    const highLowStats = useMemo(() => buildHighLowStats(statsSuccessDraws), [statsSuccessDraws]);
    const sumStats = useMemo(() => buildSumSeries(statsSuccessDraws), [statsSuccessDraws]);

    const hasStatsData = statsSuccessDraws.length > 0;

    const mainFrequencyOption = useMemo(
        () =>
            createBarChartOption({
                data: mainTop10,
                color: '#3ea3de',
                labelPrefix: 'No.',
            }),
        [mainTop10],
    );

    const bonusFrequencyOption = useMemo(
        () =>
            createBarChartOption({
                data: bonusTop10,
                color: '#57be8d',
                labelPrefix: 'B.',
            }),
        [bonusTop10],
    );

    const oddEvenOption = useMemo(
        () =>
            createPieChartOption({
                data: [
                    { name: '홀수', value: oddEvenStats.odd },
                    { name: '짝수', value: oddEvenStats.even },
                ],
                colors: ['#43abd9', '#f29f66'],
            }),
        [oddEvenStats.even, oddEvenStats.odd],
    );

    const highLowOption = useMemo(
        () =>
            createPieChartOption({
                data: [
                    { name: '저(1~22)', value: highLowStats.low },
                    { name: '고(23~45)', value: highLowStats.high },
                ],
                colors: ['#71c7ec', '#4eb183'],
            }),
        [highLowStats.high, highLowStats.low],
    );

    const sumLineOption = useMemo(
        () =>
            createLineChartOption({
                draws: sumStats.series.map((item) => `${item.drawNo}회`),
                sums: sumStats.series.map((item) => item.sum),
                average: sumStats.average,
            }),
        [sumStats.average, sumStats.series],
    );

    const updateSearchDraw = (next: number) => {
        const normalized = clampDrawInRange(next, latestRound);
        setSearchDraw(normalized);
        setInputDraw(String(normalized));
    };

    const handleSearch = () => {
        const parsed = parsePositiveDrawInput(inputDraw);
        if (parsed === null) return;
        updateSearchDraw(parsed);
    };

    const handleInputDrawChange = (value: string) => {
        setInputDraw(value);
    };

    const handleLookbackChange = (value: LookbackRange) => {
        setLookback(value);
    };

    return {
        latestRound,
        searchDraw,
        inputDraw,
        lookback,
        isLoading,
        warningMessage,
        targetDraw,
        targetMainNumbers,
        statsSuccessDraws,
        hasStatsData,
        oddEvenStats,
        highLowStats,
        sumStats,
        mainFrequencyOption,
        bonusFrequencyOption,
        oddEvenOption,
        highLowOption,
        sumLineOption,
        handleInputDrawChange,
        handleLookbackChange,
        updateSearchDraw,
        handleSearch,
    };
};
