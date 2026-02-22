'use client';

import dynamic from 'next/dynamic';
import { MoonLoader } from 'react-spinners';
import { CHART_STYLE } from './chart-options';
import { LOOKBACK_OPTIONS, useGetLottoViewModel } from './useGetLottoViewModel';
import { getLottoBallBandClassName, isFiniteNumber } from '../../utils/lotto-domain';
import styles from './GetLottoPage.module.css';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
    ssr: false,
});

interface GetLottoPageProps {
    fontVariables: string;
}

export default function GetLottoPage({ fontVariables }: GetLottoPageProps) {
    const {
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
    } = useGetLottoViewModel();

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
                            onChange={(event) => handleInputDrawChange(event.target.value)}
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
                            onClick={() => handleLookbackChange(option)}
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
                                            <span className={`${styles.ball} ${getLottoBallBandClassName(styles, number)}`}>{number}</span>
                                        </li>
                                    ))}
                                </ul>
                                {isFiniteNumber(targetDraw.bnusNo) ? (
                                    <>
                                        <span className={styles.plusSymbol}>+</span>
                                        <span className={`${styles.ball} ${getLottoBallBandClassName(styles, targetDraw.bnusNo)}`}>{targetDraw.bnusNo}</span>
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
