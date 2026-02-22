'use client';

import { useMemo, useState } from 'react';
import useLottoData from '../../hooks/useLottoData';
import { isLottoSuccessQueryData } from '../../types/lotto';
import { createEmptyFrequencyMap, getLottoBallBandClassName, toSortedFrequencyItems } from '../../utils/lotto-domain';
import { buildFrequencyMap, generateWeightedSets } from '../../utils/recommend-lotto';
import { getRecentDrawList } from '../../utils/utils';
import styles from './RecommendLottoPage.module.css';

const LOOKBACK_ROUNDS = 30;
const RECOMMEND_SET_COUNT = 5;

interface RecommendLottoPageProps {
    fontVariables: string;
}

export default function RecommendLottoPage({ fontVariables }: RecommendLottoPageProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const recentDrawList = useMemo(() => getRecentDrawList(LOOKBACK_ROUNDS), []);
    const { data: lottoData, isError } = useLottoData(recentDrawList);
    const isLoading = lottoData.length === 0 || lottoData.some((item) => item.isLoading);

    const successfulDraws = useMemo(() => {
        return lottoData.filter(isLottoSuccessQueryData);
    }, [lottoData]);

    const frequencyMap = useMemo(() => {
        if (successfulDraws.length === 0) {
            return createEmptyFrequencyMap();
        }

        return buildFrequencyMap(successfulDraws);
    }, [successfulDraws]);

    const recommendedSets = useMemo(() => {
        const refreshSalt = (refreshKey % 997) / 997;
        return generateWeightedSets({
            frequencyMap,
            setCount: RECOMMEND_SET_COUNT,
            maxAttempts: RECOMMEND_SET_COUNT * 70,
            rng: () => (Math.random() + refreshSalt) % 1,
        });
    }, [frequencyMap, refreshKey]);

    const topFrequencyNumbers = useMemo(() => {
        return toSortedFrequencyItems(frequencyMap).slice(0, 10);
    }, [frequencyMap]);

    const drawRange = useMemo(() => {
        if (successfulDraws.length === 0) return '-';

        const drawNumbers = successfulDraws.map((draw) => draw.drwNo);
        const maxDraw = Math.max(...drawNumbers);
        const minDraw = Math.min(...drawNumbers);
        return `${maxDraw}회차 ~ ${minDraw}회차`;
    }, [successfulDraws]);

    const warningMessage = useMemo(() => {
        if (isLoading) return '';
        if (isError) return '일부 회차 데이터를 불러오지 못해 가중치 정확도가 낮을 수 있습니다.';
        if (successfulDraws.length === 0) return '회차 데이터가 없어 균등 분포 기반 추천을 표시합니다.';
        return '';
    }, [isError, isLoading, successfulDraws.length]);

    return (
        <main className={`${styles.page} ${fontVariables}`}>
            <div className={styles.backdropGrid} aria-hidden />

            <section className={styles.hudPanel}>
                <div className={styles.titleGroup}>
                    <p className={styles.kicker}>LOTTO RECOMMENDATION ROUTER</p>
                    <h1 className={styles.title}>Recommend Lotto Console</h1>
                    <p className={styles.description}>최근 {LOOKBACK_ROUNDS}회차 출현 빈도를 반영해 중복 없는 5세트를 추천합니다.</p>
                </div>

                <div className={styles.hudActions}>
                    <div className={styles.badgeRow} role="list" aria-label="추천 모드">
                        <span className={styles.modeBadge} role="listitem">
                            Frequency Weighted
                        </span>
                        <span className={styles.modeBadge} role="listitem">
                            Duplicate Free
                        </span>
                        <span className={styles.modeBadge} role="listitem">
                            5 Sets
                        </span>
                    </div>
                    <button
                        type="button"
                        className={styles.refreshButton}
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        aria-label="추천 번호 다시 생성"
                    >
                        추천 다시 받기
                    </button>
                </div>
            </section>

            <section className={styles.statusPanel}>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>기준 회차 범위</span>
                    <strong className={styles.statusValue}>{drawRange}</strong>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>반영 데이터 수</span>
                    <strong className={styles.statusValue}>{successfulDraws.length}회</strong>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>추천 방식</span>
                    <strong className={styles.statusValue}>빈도 + 1 가중치 룰렛</strong>
                </div>
            </section>

            {warningMessage ? (
                <p className={styles.warningBanner} role="status" aria-live="polite">
                    {warningMessage}
                </p>
            ) : null}

            <section className={styles.recommendSection} aria-labelledby="recommend-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="recommend-heading" className={styles.sectionTitle}>
                        추천 번호
                    </h2>
                    <p className={styles.sectionDescription}>세트별 중복은 허용하지 않으며, 세트 내부 중복은 제거됩니다.</p>
                </div>

                <div className={styles.recommendGrid}>
                    {isLoading
                        ? Array.from({ length: RECOMMEND_SET_COUNT }).map((_, index) => (
                              <article className={`${styles.ticketCard} ${styles.skeletonCard}`} key={`skeleton-${index}`} aria-hidden="true">
                                  <div className={styles.skeletonTitle} />
                                  <div className={styles.skeletonBallRow}>
                                      {Array.from({ length: 6 }).map((__, ballIndex) => (
                                          <span className={styles.skeletonBall} key={`skeleton-ball-${index}-${ballIndex}`} />
                                      ))}
                                  </div>
                              </article>
                          ))
                        : recommendedSets.map((numbers, index) => (
                              <article className={styles.ticketCard} key={numbers.join('-')} style={{ animationDelay: `${index * 70}ms` }}>
                                  <div className={styles.ticketHeader}>
                                      <span className={styles.ticketLabel}>SET {index + 1}</span>
                                  </div>
                                  <ul className={styles.ballRow}>
                                      {numbers.map((number) => (
                                          <li key={`${index}-${number}`} className={styles.ballItem}>
                                              <span className={`${styles.ball} ${getLottoBallBandClassName(styles, number)}`}>{number}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </article>
                          ))}
                </div>
            </section>

            <section className={styles.statsPanel} aria-labelledby="frequency-heading">
                <div className={styles.sectionHeader}>
                    <h2 id="frequency-heading" className={styles.sectionTitle}>
                        최근 {LOOKBACK_ROUNDS}회 상위 출현 번호
                    </h2>
                    <p className={styles.sectionDescription}>보너스 번호를 제외한 본번호 기준 통계입니다.</p>
                </div>
                <div className={styles.frequencyGrid}>
                    {topFrequencyNumbers.map(({ number, count }) => (
                        <div key={`freq-${number}`} className={styles.frequencyCell}>
                            <span className={`${styles.ball} ${getLottoBallBandClassName(styles, number)}`}>{number}</span>
                            <span className={styles.frequencyCount}>{count}회</span>
                        </div>
                    ))}
                </div>
                <p className={styles.disclaimer}>추천 번호는 통계 기반 참고 정보이며 당첨을 보장하지 않습니다.</p>
            </section>
        </main>
    );
}
