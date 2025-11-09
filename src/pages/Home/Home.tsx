import { Activity, useEffect, useState } from 'react';
import { useLottoNumbers } from '../../hooks/useLottoNumbers';
import { getRecentList3 } from '../../utils/utils';
import { useLottoPrize } from '../../hooks/useLottoPrize';

export default function Home() {
    // const recentDraws = [1196, 1195, 1194]; // 원하는 회차들
    const [getDraws, setGetDraws] = useState(getRecentList3());
    const [searchDraw, setSearchDraw] = useState(Math.max(...getRecentList3()));
    const results = useLottoNumbers(getDraws);

    const { data } = useLottoPrize(getDraws);

    console.log(data);

    useEffect(() => {
        setGetDraws((prev) => Array.from(new Set([...prev, searchDraw])));
    }, [searchDraw]);

    if (results.every((r) => r.isLoading)) return <p>Loading...</p>;

    const target = results.find(({ data }) => data?.drwNo === searchDraw);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Lotto(6/45) 대시보드</h1>

            <div className="mb-6 flex gap-2 items-center">
                <h2 className="text-xl font-semibold">회차 검색 :</h2>
                <input
                    type="number"
                    placeholder="회차 입력"
                    value={searchDraw}
                    onChange={(e) => setSearchDraw(e.target.valueAsNumber)}
                    className="border p-2 rounded w-32"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">검색</button>
            </div>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">검색 내용</h2>
                <Activity mode={target ? 'visible' : 'hidden'}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white shadow rounded-lg">
                            <p className="font-semibold">
                                회차 : {target?.data?.drwNo} / ({target?.data?.drwNoDate})
                            </p>
                            <p>1등 당첨자 수 : {target?.data?.firstPrzwnerCo}</p>
                            <p>1등 당첨 금액 : {target?.data?.firstWinamnt?.toLocaleString?.()}원</p>
                            <p>번호 :</p>
                            <p>
                                {`${target?.data?.drwtNo1}, ${target?.data?.drwtNo2}, ${target?.data?.drwtNo3}, ${target?.data?.drwtNo4}, ${target?.data?.drwtNo5}, ${target?.data?.drwtNo6}`}{' '}
                                + {target?.data?.bnusNo}
                            </p>
                        </div>
                    </div>
                </Activity>
                <Activity mode={!target ? 'visible' : 'hidden'}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white shadow rounded-lg">
                            <p className="font-semibold">{target?.isLoading ? '검색중...' : '검색 결과 없음'}</p>
                        </div>
                    </div>
                </Activity>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">최근 당첨 근황</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results
                        .filter((el) => el.status === 'success' && el.data.returnValue === 'success')
                        .sort((a, b) => (b.data?.drwNo || 0) - (a.data?.drwNo || 0))
                        .map(({ data }, idx) => (
                            <div key={data?.drwNo + '-lotto-' + idx} className="p-4 bg-white shadow rounded-lg">
                                <p className="font-semibold">
                                    회차 : {data?.drwNo} / ({data?.drwNoDate})
                                </p>
                                <p>1등 당첨자 수 : {data?.firstPrzwnerCo}</p>
                                <p>1등 당첨 금액 : {data?.firstWinamnt?.toLocaleString?.()}원</p>
                                <p>번호 :</p>
                                <p>
                                    {`${data?.drwtNo1}, ${data?.drwtNo2}, ${data?.drwtNo3}, ${data?.drwtNo4}, ${data?.drwtNo5}, ${data?.drwtNo6}`} +{' '}
                                    {data?.bnusNo}
                                </p>
                            </div>
                        ))}
                </div>
            </section>
        </div>
    );
}
