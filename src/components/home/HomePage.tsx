'use client';

import { useEffect, useMemo, useState } from 'react';
import { getRecentList3 } from '../../utils/utils';
import useLottoData from '../../hooks/useLottoData';
import { MoonLoader } from 'react-spinners';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function Home() {
    const [getDraws, setGetDraws] = useState(getRecentList3());
    const [searchDraw, setSearchDraw] = useState(Math.max(...getRecentList3()));
    const [inputDraw, setInputDraw] = useState(String(Math.max(...getRecentList3())));
    const { data } = useLottoData(getDraws);

    useEffect(() => {
        setGetDraws((prev) => Array.from(new Set([...prev, searchDraw])));
    }, [searchDraw]);

    const isLoading = data.some((el) => el.isLoading);
    const target = data.find((el) => el?.drwNo === searchDraw);

    const recentSuccessData = useMemo(() => data.filter((el) => el?.returnValue === 'success').sort((a, b) => (b?.drwNo || 0) - (a?.drwNo || 0)), [data]);

    const handleSearch = () => {
        const next = Number(inputDraw);
        if (!Number.isFinite(next) || next <= 0) return;
        setSearchDraw(Math.floor(next));
    };

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Lotto(6/45) 대시보드</CardTitle>
                    <CardDescription>원하는 회차를 검색하고 최근 당첨 결과를 확인합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch();
                        }}
                    >
                        <Input
                            type="number"
                            min={1}
                            placeholder="회차 입력"
                            value={inputDraw}
                            onChange={(e) => setInputDraw(e.target.value)}
                            className="w-full sm:max-w-40"
                        />
                        <Button type="submit">검색</Button>
                    </form>
                </CardContent>
            </Card>

            <section>
                <h2 className="mb-4 text-xl font-semibold">검색 내용</h2>
                {target ? (
                    target.returnValue !== 'success' ? (
                        <Card>
                            <CardContent className="pt-6 text-sm text-slate-500">아직 로또 추첨 시작 전입니다.</CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <span>{target.drwNo}회차</span>
                                    <Badge variant="secondary">{target.drwNoDate}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm md:text-base">
                                <p>1등 당첨자 수: {target.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액: {target.firstWinamnt?.toLocaleString?.()}원</p>
                                <p>
                                    번호: {target.drwtNo1}, {target.drwtNo2}, {target.drwtNo3}, {target.drwtNo4}, {target.drwtNo5}, {target.drwtNo6} +{' '}
                                    {target.bnusNo}
                                </p>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-sm text-slate-500">{isLoading ? '검색중...' : '검색 결과 없음'}</CardContent>
                    </Card>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold">최근 당첨 근황</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {recentSuccessData.map((el, idx) => (
                        <Card key={`${el?.drwNo}-lotto-${idx}`}>
                            <CardHeader className="gap-2">
                                <CardTitle className="text-lg">{el?.drwNo}회차</CardTitle>
                                <CardDescription>{el?.drwNoDate}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>1등 당첨자 수: {el?.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액: {el?.firstWinamnt?.toLocaleString?.()}원</p>
                                <p>
                                    번호: {el?.drwtNo1}, {el?.drwtNo2}, {el?.drwtNo3}, {el?.drwtNo4}, {el?.drwtNo5}, {el?.drwtNo6} + {el?.bnusNo}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {isLoading && (
                <div
                    className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-slate-900/30 backdrop-blur-[2px]"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <MoonLoader size={70} />
                </div>
            )}
        </main>
    );
}
