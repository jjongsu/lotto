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
        const prizes: { rank: string; winAmount: string }[] = [];

        $('table.tbl_data tbody tr').each((_, el) => {
            const rank = $(el).find('td').eq(0).text().trim();
            const winAmount = $(el).find('td').eq(2).text().trim();
            prizes.push({ rank, winAmount });
        });

        return res.status(200).json(prizes);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
