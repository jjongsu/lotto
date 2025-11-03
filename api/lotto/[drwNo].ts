// import type { VercelRequest, VercelResponse } from '@vercel/node';

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   const { drwNo } = req.query;
//   const apiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;

//   try {
//     const response = await fetch(apiUrl);
//     const data = await response.json();

//     // ✅ 브라우저에서 접근 가능하도록 CORS 헤더 추가
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch Lotto data' });
//   }
// }
