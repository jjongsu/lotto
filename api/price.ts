import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';

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

        const html = await response.text();
        const $ = cheerio.load(html);
        const prizes: { rank: number; winAmount: number }[] = [];

        // ✅ "순위"는 직접 1~5 지정, "1게임당 당첨금액"은 td.eq(3)
        $('table.tbl_data tbody tr').each((i, el) => {
            const winAmountStr = $(el).find('td').eq(3).text().trim(); // "2,939,186,738원"
            const winAmount = Number(winAmountStr.replace(/,/g, '').replace(/원/g, '')); // 숫자로 변환
            prizes.push({ rank: i + 1, winAmount });
        });

        return res.status(200).json(prizes);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
