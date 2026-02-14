import { NextResponse } from 'next/server';

interface LatestLottoItemResponse {
    ltEpsd?: number | string;
    ltRflYmd?: string;
    tm1WnNo?: number | string;
    tm2WnNo?: number | string;
    tm3WnNo?: number | string;
    tm4WnNo?: number | string;
    tm5WnNo?: number | string;
    tm6WnNo?: number | string;
    bnsWnNo?: number | string;
    wholEpsdSumNtslAmt?: number | string;
    rnk1WnAmt?: number | string;
    rnk1WnNope?: number | string;
    rnk1SumWnAmt?: number | string;
}

interface LatestLottoResponse {
    data?: {
        list?: LatestLottoItemResponse[];
    };
}

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatYmd = (ymd?: string) => {
    if (!ymd || ymd.length !== 8) return '';
    return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const drwNo = searchParams.get('drwNo');

    if (!drwNo) {
        return NextResponse.json({ error: 'drwNo parameter is required' }, { status: 400 });
    }

    const url = `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd=${drwNo}&_=${Date.now()}`;
    const response = await fetch(url, {
        cache: 'no-store',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: 'https://www.dhlottery.co.kr/lt645/result',
            'User-Agent': 'Mozilla/5.0',
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch lotto (${response.status})` }, { status: response.status });
    }

    const data = (await response.json()) as LatestLottoResponse;
    const target = data?.data?.list?.[0];

    if (!target) {
        return NextResponse.json({
            drwNo: toNumber(drwNo),
            returnValue: 'fail',
        });
    }

    return NextResponse.json({
        drwNo: toNumber(target.ltEpsd),
        drwNoDate: formatYmd(target.ltRflYmd),
        totSellamnt: toNumber(target.wholEpsdSumNtslAmt),
        firstWinamnt: toNumber(target.rnk1WnAmt),
        firstPrzwnerCo: toNumber(target.rnk1WnNope),
        firstAccumamnt: toNumber(target.rnk1SumWnAmt),
        drwtNo1: toNumber(target.tm1WnNo),
        drwtNo2: toNumber(target.tm2WnNo),
        drwtNo3: toNumber(target.tm3WnNo),
        drwtNo4: toNumber(target.tm4WnNo),
        drwtNo5: toNumber(target.tm5WnNo),
        drwtNo6: toNumber(target.tm6WnNo),
        bnusNo: toNumber(target.bnsWnNo),
        returnValue: 'success',
    });
}
