'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { MoonLoader } from 'react-spinners';
import type { LottoResponse } from '../../apis/getLotto';
import useLottoData from '../../hooks/useLottoData';
import {
    buildBonusFrequency,
    buildHighLowStats,
    buildMainNumberFrequency,
    buildOddEvenStats,
    buildSumSeries,
    toTopNFrequency,
    type TopFrequencyItem,
} from '../../utils/get-lotto-stats';
import { getCurrentLottoRound, getRecentDrawList } from '../../utils/utils';
import styles from './GetLottoPage.module.css';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
    ssr: false,
});

type LottoQueryData = Partial<LottoResponse> & { isLoading: boolean };
type LookbackRange = 30 | 50 | 100;

interface GetLottoPageProps {
    fontVariables: string;
}

const LOOKBACK_OPTIONS: LookbackRange[] = [30, 50, 100];

const getBallBandClassName = (number: number) => {
    if (number <= 10) return styles.ballBandYellow;
    if (number <= 20) return styles.ballBandBlue;
    if (number <= 30) return styles.ballBandRed;
    if (number <= 40) return styles.ballBandGray;
    return styles.ballBandGreen;
};

const isValidNumber = (value: number | undefined): value is number => {
    return typeof value === 'number' && Number.isFinite(value);
};

const createCommonChartOption = (): Pick<EChartsOption, 'backgroundColor' | 'textStyle' | 'animationDuration' | 'animationDurationUpdate'> => {
    return {
        backgroundColor: 'transparent',
        textStyle: {
            color: '#2f4f6c',
            fontFamily: 'var(--font-lotto-body), Noto Sans KR, sans-serif',
            fontSize: 12,
        },
        animationDuration: 360,
        animationDurationUpdate: 220,
    };
};

const createBarChartOption = ({
    data,
    color,
    labelPrefix,
}: {
    data: TopFrequencyItem[];
    color: string;
    labelPrefix: string;
}): EChartsOption => {
    const common = createCommonChartOption();
    const categories = data.map((item) => `${labelPrefix} ${item.number}`);

    return {
        ...common,
        grid: { left: 14, right: 14, top: 30, bottom: 18, containLabel: true },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(243, 250, 255, 0.95)',
            borderColor: 'rgba(126, 172, 204, 0.55)',
            textStyle: { color: '#1f4060' },
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                interval: 0,
                rotate: data.length > 7 ? 24 : 0,
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(107, 149, 184, 0.65)',
                },
            },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            splitLine: {
                lineStyle: {
                    color: 'rgba(126, 163, 198, 0.24)',
                },
            },
        },
        series: [
            {
                type: 'bar',
                data: data.map((item) => item.count),
                barWidth: '58%',
                itemStyle: {
                    color,
                    borderRadius: [7, 7, 2, 2],
                },
            },
        ],
        media: [
            {
                query: { maxWidth: 420 },
                option: {
                    grid: { left: 8, right: 10, top: 28, bottom: 18, containLabel: true },
                    xAxis: {
                        axisLabel: {
                            interval: 'auto',
                            rotate: 32,
                            fontSize: 10,
                        },
                    },
                    yAxis: {
                        axisLabel: {
                            fontSize: 10,
                        },
                    },
                },
            },
        ],
    };
};

const createPieChartOption = ({
    data,
    colors,
}: {
    data: Array<{ name: string; value: number }>;
    colors: string[];
}): EChartsOption => {
    const common = createCommonChartOption();

    return {
        ...common,
        color: colors,
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(243, 250, 255, 0.95)',
            borderColor: 'rgba(126, 172, 204, 0.55)',
            textStyle: { color: '#1f4060' },
        },
        legend: {
            bottom: 4,
            left: 'center',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                color: '#35516d',
                fontSize: 12,
            },
        },
        series: [
            {
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                label: {
                    formatter: '{b}\n{d}%',
                    color: '#2c4c68',
                    fontSize: 12,
                },
                data,
            },
        ],
        media: [
            {
                query: { maxWidth: 420 },
                option: {
                    legend: {
                        bottom: -2,
                        textStyle: {
                            fontSize: 11,
                        },
                    },
                    series: [
                        {
                            center: ['50%', '42%'],
                            radius: ['42%', '66%'],
                            label: {
                                fontSize: 10,
                            },
                        },
                    ],
                },
            },
        ],
    };
};

const createLineChartOption = ({
    draws,
    sums,
    average,
}: {
    draws: string[];
    sums: number[];
    average: number;
}): EChartsOption => {
    const common = createCommonChartOption();

    return {
        ...common,
        grid: { left: 14, right: 14, top: 36, bottom: 24, containLabel: true },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(243, 250, 255, 0.95)',
            borderColor: 'rgba(126, 172, 204, 0.55)',
            textStyle: { color: '#1f4060' },
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: draws,
            axisLine: {
                lineStyle: {
                    color: 'rgba(107, 149, 184, 0.65)',
                },
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: 'rgba(126, 163, 198, 0.24)',
                },
            },
        },
        series: [
            {
                type: 'line',
                smooth: true,
                data: sums,
                showSymbol: false,
                lineStyle: {
                    width: 2.2,
                    color: '#3c9fda',
                },
                areaStyle: {
                    color: 'rgba(113, 201, 233, 0.26)',
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    lineStyle: {
                        color: 'rgba(227, 140, 67, 0.85)',
                        type: 'dashed',
                    },
                    data: [{ yAxis: average, name: '평균' }],
                    label: {
                        formatter: '평균 {c}',
                        color: '#7b4f1f',
                    },
                },
            },
        ],
        media: [
            {
                query: { maxWidth: 420 },
                option: {
                    grid: { left: 8, right: 10, top: 30, bottom: 18, containLabel: true },
                    xAxis: {
                        axisLabel: {
                            fontSize: 10,
                            interval: 'auto',
                        },
                    },
                    yAxis: {
                        axisLabel: {
                            fontSize: 10,
                        },
                    },
                },
            },
        ],
    };
};

const CHART_STYLE = {
    width: '100%',
    height: '100%',
} as const;

export default function GetLottoPage({ fontVariables }: GetLottoPageProps) {
    const latestRound = useMemo(() => getCurrentLottoRound(), []);
    const [searchDraw, setSearchDraw] = useState(latestRound);
    const [inputDraw, setInputDraw] = useState(String(latestRound));
    const [lookback, setLookback] = useState<LookbackRange>(30);

    const statsRounds = useMemo(() => getRecentDrawList(lookback), [lookback]);
    const queryRounds = useMemo(
        () =>
            Array.from(new Set([searchDraw, ...statsRounds])).sort((a, b) => b - a),
        [searchDraw, statsRounds],
    );

    const { data, isError } = useLottoData(queryRounds);
    const lottoData = data as LottoQueryData[];
    const isLoading = lottoData.length === 0 || lottoData.some((item) => item.isLoading);

    const statsRoundSet = useMemo(() => new Set(statsRounds), [statsRounds]);
    const targetDraw = lottoData.find((item) => item?.drwNo === searchDraw);

    const statsSuccessDraws = useMemo(
        () =>
            lottoData
                .filter((item): item is LottoResponse & { isLoading: boolean } => {
                    return item.returnValue === 'success' && typeof item.drwNo === 'number' && statsRoundSet.has(item.drwNo);
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
        if (!targetDraw || targetDraw.returnValue !== 'success') return [];
        return [targetDraw.drwtNo1, targetDraw.drwtNo2, targetDraw.drwtNo3, targetDraw.drwtNo4, targetDraw.drwtNo5, targetDraw.drwtNo6].filter(isValidNumber);
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
        const normalized = Math.min(latestRound, Math.max(1, Math.floor(next)));
        setSearchDraw(normalized);
        setInputDraw(String(normalized));
    };

    const handleSearch = () => {
        const next = Number(inputDraw);
        if (!Number.isFinite(next) || next <= 0) return;
        updateSearchDraw(next);
    };

    return (
        <main className={`${styles.page} ${fontVariables}`}>
            <div className={styles.backdropGrid} aria-hidden />

            <section className={styles.hudPanel}>
                <div className={styles.titleGroup}>
                    <p className={styles.kicker}>LOTTO LOOKUP ROUTER</p>
                    <h1 className={styles.title}>Get Lotto Intelligence</h1>
                    <p className={styles.description}>회차별 당첨 정보를 검색하고, 최신 기준 확장 통계를 차트로 확인할 수 있습니다.</p>
                </div>

                <div className={styles.hudControls}>
                    <form
                        className={styles.searchForm}
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSearch();
                        }}
                    >
                        <label htmlFor="draw-input" className={styles.visuallyHidden}>
                            검색할 회차 입력
                        </label>
                        <input
                            id="draw-input"
                            type="number"
                            min={1}
                            value={inputDraw}
                            placeholder="회차 입력"
                            onChange={(event) => setInputDraw(event.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchButton}>
                            검색
                        </button>
                    </form>

                    <div className={styles.moveButtonRow}>
                        <button
                            type="button"
                            className={styles.moveButton}
                            onClick={() => updateSearchDraw(searchDraw - 1)}
                            disabled={searchDraw <= 1}
                            aria-label="이전 회차 이동"
                        >
                            이전 회차
                        </button>
                        <button
                            type="button"
                            className={styles.moveButton}
                            onClick={() => updateSearchDraw(searchDraw + 1)}
                            disabled={searchDraw >= latestRound}
                            aria-label="다음 회차 이동"
                        >
                            다음 회차
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.statusPanel}>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>최신 기준 회차</span>
                    <strong className={styles.statusValue}>{latestRound}회</strong>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>현재 검색 회차</span>
                    <strong className={styles.statusValue}>{searchDraw}회</strong>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>통계 반영 회차 수</span>
                    <strong className={styles.statusValue}>{statsSuccessDraws.length}회</strong>
                </div>
            </section>

            <section className={styles.rangePanel} aria-label="통계 범위 선택">
                <span className={styles.rangeLabel}>통계 범위</span>
                <div className={styles.rangeButtonRow}>
                    {LOOKBACK_OPTIONS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`${styles.rangeButton} ${lookback === option ? styles.rangeButtonActive : ''}`}
                            onClick={() => setLookback(option)}
                            aria-pressed={lookback === option}
                        >
                            최근 {option}회
                        </button>
                    ))}
                </div>
            </section>

            {warningMessage ? (
                <p className={styles.warningBanner} role="status" aria-live="polite">
                    {warningMessage}
                </p>
            ) : null}

            <section className={styles.resultPanel} aria-labelledby="result-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="result-heading" className={styles.sectionTitle}>
                        검색 결과
                    </h2>
                    <p className={styles.sectionDescription}>회차 상세 정보와 번호 조합을 확인합니다.</p>
                </div>

                {targetDraw ? (
                    targetDraw.returnValue !== 'success' ? (
                        <p className={styles.emptyState}>아직 로또 추첨 시작 전입니다.</p>
                    ) : (
                        <article className={styles.resultCard}>
                            <div className={styles.resultHeader}>
                                <strong className={styles.resultRound}>{targetDraw.drwNo}회차</strong>
                                <span className={styles.resultDate}>{targetDraw.drwNoDate}</span>
                            </div>
                            <div className={styles.resultStats}>
                                <p>1등 당첨자 수: {targetDraw.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액: {targetDraw.firstWinamnt?.toLocaleString?.()}원</p>
                                <p>1등 누적 당첨 금액: {targetDraw.firstAccumamnt?.toLocaleString?.()}원</p>
                            </div>
                            <div className={styles.numberRow}>
                                <ul className={styles.ballRow}>
                                    {targetMainNumbers.map((number) => (
                                        <li key={`target-${targetDraw.drwNo}-${number}`} className={styles.ballItem}>
                                            <span className={`${styles.ball} ${getBallBandClassName(number)}`}>{number}</span>
                                        </li>
                                    ))}
                                </ul>
                                {isValidNumber(targetDraw.bnusNo) ? (
                                    <>
                                        <span className={styles.plusSymbol}>+</span>
                                        <span className={`${styles.ball} ${getBallBandClassName(targetDraw.bnusNo)}`}>{targetDraw.bnusNo}</span>
                                    </>
                                ) : null}
                            </div>
                        </article>
                    )
                ) : (
                    <p className={styles.emptyState}>{isLoading ? '검색중...' : '검색 결과 없음'}</p>
                )}
            </section>

            <section className={styles.statsPanel} aria-labelledby="stats-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="stats-heading" className={styles.sectionTitle}>
                        확장 통계 대시보드
                    </h2>
                    <p className={styles.sectionDescription}>최신 기준 최근 {lookback}회 통계를 시각화해 제공합니다.</p>
                </div>

                {hasStatsData ? (
                    <div className={styles.statsGrid}>
                        <article className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>메인번호 출현 Top 10</h3>
                            <div className={styles.chartSurface}>
                                <ReactECharts option={mainFrequencyOption} style={CHART_STYLE} className={styles.chartInstance} autoResize notMerge lazyUpdate />
                            </div>
                        </article>

                        <article className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>홀짝 분포</h3>
                            <div className={styles.chartSurface}>
                                <ReactECharts option={oddEvenOption} style={CHART_STYLE} className={styles.chartInstance} autoResize notMerge lazyUpdate />
                            </div>
                            <p className={styles.chartMeta}>총 집계 수: {(oddEvenStats.odd + oddEvenStats.even).toLocaleString()}개</p>
                        </article>

                        <article className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>회차별 번호합 추세</h3>
                            <div className={styles.sumBadgeRow}>
                                <span className={styles.sumBadge}>평균 {sumStats.average}</span>
                                <span className={styles.sumBadge}>최소 {sumStats.min}</span>
                                <span className={styles.sumBadge}>최대 {sumStats.max}</span>
                            </div>
                            <div className={`${styles.chartSurface} ${styles.lineChartSurface}`}>
                                <ReactECharts option={sumLineOption} style={CHART_STYLE} className={styles.chartInstance} autoResize notMerge lazyUpdate />
                            </div>
                        </article>

                        <article className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>보너스번호 출현 Top 10</h3>
                            <div className={styles.chartSurface}>
                                <ReactECharts option={bonusFrequencyOption} style={CHART_STYLE} className={styles.chartInstance} autoResize notMerge lazyUpdate />
                            </div>
                        </article>

                        <article className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>고/저 분포</h3>
                            <div className={styles.chartSurface}>
                                <ReactECharts option={highLowOption} style={CHART_STYLE} className={styles.chartInstance} autoResize notMerge lazyUpdate />
                            </div>
                            <p className={styles.chartMeta}>총 집계 수: {(highLowStats.low + highLowStats.high).toLocaleString()}개</p>
                        </article>
                    </div>
                ) : (
                    <p className={styles.emptyState}>통계를 계산할 수 있는 회차 데이터가 아직 없습니다.</p>
                )}
            </section>

            {isLoading ? (
                <div className={styles.loadingOverlay} onPointerDown={(event) => event.stopPropagation()}>
                    <MoonLoader size={70} color="#1ea9bb" />
                </div>
            ) : null}
        </main>
    );
}
