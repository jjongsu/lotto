import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const drwNo = req.query.drwNo as string;
    if (!drwNo) {
        return res.status(400).json({ error: 'drwNo parameter is required' });
    }

    try {
        const response = await fetch('https://www.dhlottery.co.kr/gameResult.do?method=byWin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ drwNo }),
        });

        // ArrayBuffer → Buffer → EUC-KR → UTF-8
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const html = iconv.decode(buffer, 'euc-kr');

        const $ = cheerio.load(html);
        const prizes: Record<string, string> = {};

        // ✅ "순위"는 직접 1~5 지정, "1게임당 당첨금액"은 td.eq(3)
        $('table.tbl_data tbody tr').each((i, el) => {
            const winAmount = $(el).find('td').eq(3).text().trim(); // "2,939,186,738원"
            prizes[`winAmount${i + 1}`] = winAmount;
        });

        return res.status(200).json(prizes);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
