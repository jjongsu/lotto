'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import useLottoData from '../../hooks/useLottoData';
import { isLottoSuccessQueryData } from '../../types/lotto';
import { parsePositiveDrawInput } from '../../utils/draw-search';
import { getLottoBallBandClassName, getMainNumbersFromDraw, isFiniteNumber } from '../../utils/lotto-domain';
import { getRecentList3 } from '../../utils/utils';
import styles from './HomePage.module.css';

interface HomePageProps {
    fontVariables: string;
}

export default function HomePage({ fontVariables }: HomePageProps) {
    const { initialDraws, defaultDraw } = useMemo(() => {
        const draws = getRecentList3();
        const maxDraw = draws.length > 0 ? Math.max(...draws) : 1;
        return { initialDraws: draws, defaultDraw: maxDraw };
    }, []);

    const [drawsToFetch, setDrawsToFetch] = useState(initialDraws);
    const [searchDraw, setSearchDraw] = useState(defaultDraw);
    const [inputDraw, setInputDraw] = useState(String(defaultDraw));
    const { data: lottoData } = useLottoData(drawsToFetch);

    useEffect(() => {
        setDrawsToFetch((prev) => Array.from(new Set([...prev, searchDraw])));
    }, [searchDraw]);

    const isLoading = lottoData.some((item) => item.isLoading);
    const targetDraw = lottoData.find((item) => item.drwNo === searchDraw);

    const recentSuccessData = useMemo(() => {
        return lottoData.filter(isLottoSuccessQueryData).sort((a, b) => b.drwNo - a.drwNo);
    }, [lottoData]);

    const winningNumbers = useMemo(() => {
        if (!isLottoSuccessQueryData(targetDraw)) return [];
        return getMainNumbersFromDraw(targetDraw);
    }, [targetDraw]);

    const handleSearch = () => {
        const parsed = parsePositiveDrawInput(inputDraw);
        if (parsed === null) return;
        setSearchDraw(parsed);
    };

    return (
        <main className={`${styles.page} ${fontVariables}`}>
            <div className={styles.backdropGrid} aria-hidden />

            <section className={styles.hudPanel}>
                <div className={styles.titleGroup}>
                    <p className={styles.kicker}>LOTTO DASHBOARD ROUTER</p>
                    <h1 className={styles.title}>Lotto Mission Control</h1>
                    <p className={styles.description}>원하는 회차를 검색하고 최근 당첨 흐름을 한 화면에서 빠르게 확인하세요.</p>
                </div>
                <div className={styles.quickLinkGrid}>
                    <Link href="/recommendations" className={styles.quickLinkCard}>
                        <span className={styles.quickLinkLabel}>Quick Route</span>
                        <strong className={styles.quickLinkTitle}>추천 번호 받기</strong>
                        <span className={styles.quickLinkDescription}>최근 빈도 가중치로 5세트 추천</span>
                    </Link>
                    <Link href="/results" className={styles.quickLinkCard}>
                        <span className={styles.quickLinkLabel}>Quick Route</span>
                        <strong className={styles.quickLinkTitle}>회차 조회 페이지</strong>
                        <span className={styles.quickLinkDescription}>추첨 데이터 조회 라우터 바로 이동</span>
                    </Link>
                </div>
            </section>

            <section className={styles.statusPanel}>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>현재 검색 회차</span>
                    <strong className={styles.statusValue}>{searchDraw}회</strong>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>누적 조회 회차</span>
                    <strong className={styles.statusValue}>{drawsToFetch.length}회</strong>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>성공 데이터 수</span>
                    <strong className={styles.statusValue}>{recentSuccessData.length}회</strong>
                </div>
            </section>

            <section className={styles.searchPanel} aria-labelledby="search-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="search-heading" className={styles.sectionTitle}>
                        회차 검색
                    </h2>
                    <p className={styles.sectionDescription}>숫자를 입력하면 해당 회차 결과를 즉시 불러옵니다.</p>
                </div>

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
                        placeholder="회차 입력"
                        value={inputDraw}
                        onChange={(event) => setInputDraw(event.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        검색
                    </button>
                </form>
            </section>

            <section className={styles.resultPanel} aria-labelledby="result-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="result-heading" className={styles.sectionTitle}>
                        검색 결과
                    </h2>
                    <p className={styles.sectionDescription}>회차별 1등 정보와 당첨 번호를 표시합니다.</p>
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
                            </div>

                            <div className={styles.numberRow}>
                                <ul className={styles.ballRow}>
                                    {winningNumbers.map((number) => (
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

            <section className={styles.recentPanel} aria-labelledby="recent-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="recent-heading" className={styles.sectionTitle}>
                        최근 당첨 근황
                    </h2>
                    <p className={styles.sectionDescription}>가장 최근 성공 회차를 최신순으로 확인합니다.</p>
                </div>

                <div className={styles.recentGrid}>
                    {recentSuccessData.map((draw, idx) => (
                        <article className={styles.recentCard} key={`${draw.drwNo}-lotto-${idx}`} style={{ animationDelay: `${idx * 70}ms` }}>
                            <div className={styles.recentHeader}>
                                <strong className={styles.recentRound}>{draw.drwNo}회차</strong>
                                <span className={styles.recentDate}>{draw.drwNoDate}</span>
                            </div>
                            <div className={styles.recentStats}>
                                <p>1등 당첨자 수: {draw.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액: {draw.firstWinamnt?.toLocaleString?.()}원</p>
                            </div>
                            <div className={styles.numberRow}>
                                <ul className={styles.ballRow}>
                                    {getMainNumbersFromDraw(draw).map((number) => (
                                        <li key={`${draw.drwNo}-${number}`} className={styles.ballItem}>
                                            <span className={`${styles.ball} ${getLottoBallBandClassName(styles, number)}`}>{number}</span>
                                        </li>
                                    ))}
                                </ul>
                                {isFiniteNumber(draw.bnusNo) ? (
                                    <>
                                        <span className={styles.plusSymbol}>+</span>
                                        <span className={`${styles.ball} ${getLottoBallBandClassName(styles, draw.bnusNo)}`}>{draw.bnusNo}</span>
                                    </>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {isLoading && (
                <div className={styles.loadingOverlay} onPointerDown={(event) => event.stopPropagation()}>
                    <MoonLoader size={70} color="#1ea9bb" />
                </div>
            )}
        </main>
    );
}
