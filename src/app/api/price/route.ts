import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const drwNo = searchParams.get('drwNo');

    if (!drwNo) {
        return NextResponse.json({ error: 'drwNo parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch('https://www.dhlottery.co.kr/gameResult.do?method=byWin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ drwNo }),
            cache: 'no-store',
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const html = iconv.decode(buffer, 'euc-kr');

        const $ = cheerio.load(html);
        const prizes: Record<string, string> = {};

        $('table.tbl_data tbody tr').each((i, el) => {
            const winAmount = $(el).find('td').eq(3).text().trim();
            prizes[`winAmount${i + 1}`] = winAmount;
        });

        return NextResponse.json({ drwNo: Number(drwNo), ...prizes });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
