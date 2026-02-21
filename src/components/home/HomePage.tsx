'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LottoResponse } from '../../apis/getLotto';
import { getRecentList3 } from '../../utils/utils';
import useLottoData from '../../hooks/useLottoData';
import { MoonLoader } from 'react-spinners';
import styles from './HomePage.module.css';

interface HomePageProps {
    fontVariables: string;
}

type LottoQueryData = Partial<LottoResponse> & { isLoading: boolean };

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

export default function HomePage({ fontVariables }: HomePageProps) {
    const { initialDraws, maxDraw } = useMemo(() => {
        const draws = getRecentList3();
        return { initialDraws: draws, maxDraw: Math.max(...draws) };
    }, []);

    const [getDraws, setGetDraws] = useState(initialDraws);
    const [searchDraw, setSearchDraw] = useState(maxDraw);
    const [inputDraw, setInputDraw] = useState(String(maxDraw));
    const { data } = useLottoData(getDraws);
    const lottoData = data as LottoQueryData[];

    useEffect(() => {
        setGetDraws((prev) => Array.from(new Set([...prev, searchDraw])));
    }, [searchDraw]);

    const isLoading = lottoData.some((el) => el.isLoading);
    const target = lottoData.find((el) => el?.drwNo === searchDraw);

    const recentSuccessData = useMemo(
        () => lottoData.filter((el): el is LottoResponse & { isLoading: boolean } => el?.returnValue === 'success').sort((a, b) => (b?.drwNo || 0) - (a?.drwNo || 0)),
        [lottoData],
    );

    const winningNumbers = useMemo(() => {
        if (!target || target.returnValue !== 'success') return [];
        return [target.drwtNo1, target.drwtNo2, target.drwtNo3, target.drwtNo4, target.drwtNo5, target.drwtNo6].filter(isValidNumber);
    }, [target]);

    const handleSearch = () => {
        const next = Number(inputDraw);
        if (!Number.isFinite(next) || next <= 0) return;
        setSearchDraw(Math.floor(next));
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
                    <Link href="/recommend-lotto" className={styles.quickLinkCard}>
                        <span className={styles.quickLinkLabel}>Quick Route</span>
                        <strong className={styles.quickLinkTitle}>추천 번호 받기</strong>
                        <span className={styles.quickLinkDescription}>최근 빈도 가중치로 5세트 추천</span>
                    </Link>
                    <Link href="/get-lotto" className={styles.quickLinkCard}>
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
                    <strong className={styles.statusValue}>{getDraws.length}회</strong>
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
                    onSubmit={(e) => {
                        e.preventDefault();
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
                        onChange={(e) => setInputDraw(e.target.value)}
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

                {target ? (
                    target.returnValue !== 'success' ? (
                        <p className={styles.emptyState}>아직 로또 추첨 시작 전입니다.</p>
                    ) : (
                        <article className={styles.resultCard}>
                            <div className={styles.resultHeader}>
                                <strong className={styles.resultRound}>{target.drwNo}회차</strong>
                                <span className={styles.resultDate}>{target.drwNoDate}</span>
                            </div>

                            <div className={styles.resultStats}>
                                <p>1등 당첨자 수: {target.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액: {target.firstWinamnt?.toLocaleString?.()}원</p>
                            </div>

                            <div className={styles.numberRow}>
                                <ul className={styles.ballRow}>
                                    {winningNumbers.map((number) => (
                                        <li key={`target-${target.drwNo}-${number}`} className={styles.ballItem}>
                                            <span className={`${styles.ball} ${getBallBandClassName(number)}`}>{number}</span>
                                        </li>
                                    ))}
                                </ul>
                                {isValidNumber(target.bnusNo) ? (
                                    <>
                                        <span className={styles.plusSymbol}>+</span>
                                        <span className={`${styles.ball} ${getBallBandClassName(target.bnusNo)}`}>{target.bnusNo}</span>
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
                    {recentSuccessData.map((el, idx) => (
                        <article className={styles.recentCard} key={`${el?.drwNo}-lotto-${idx}`} style={{ animationDelay: `${idx * 70}ms` }}>
                            <div className={styles.recentHeader}>
                                <strong className={styles.recentRound}>{el?.drwNo}회차</strong>
                                <span className={styles.recentDate}>{el?.drwNoDate}</span>
                            </div>
                            <div className={styles.recentStats}>
                                <p>1등 당첨자 수: {el?.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액: {el?.firstWinamnt?.toLocaleString?.()}원</p>
                            </div>
                            <div className={styles.numberRow}>
                                <ul className={styles.ballRow}>
                                    {[el?.drwtNo1, el?.drwtNo2, el?.drwtNo3, el?.drwtNo4, el?.drwtNo5, el?.drwtNo6]
                                        .filter(isValidNumber)
                                        .map((number) => (
                                            <li key={`${el?.drwNo}-${number}`} className={styles.ballItem}>
                                                <span className={`${styles.ball} ${getBallBandClassName(number)}`}>{number}</span>
                                            </li>
                                        ))}
                                </ul>
                                {isValidNumber(el?.bnusNo) ? (
                                    <>
                                        <span className={styles.plusSymbol}>+</span>
                                        <span className={`${styles.ball} ${getBallBandClassName(el.bnusNo)}`}>{el.bnusNo}</span>
                                    </>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {isLoading && (
                <div className={styles.loadingOverlay} onPointerDown={(e) => e.stopPropagation()}>
                    <MoonLoader size={70} color="#1ea9bb" />
                </div>
            )}
        </main>
    );
}
