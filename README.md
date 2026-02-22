# Lotto Dashboard

Next.js(App Router) 기반 로또(6/45) 조회 대시보드입니다.

## Tech Stack

- Framework: `Next.js 16` (App Router)
- UI: `React 19`, `Tailwind CSS 4`
- Language: `TypeScript 5`
- Data Fetching/State: `@tanstack/react-query` (v5)
- Visualization: `Apache ECharts`, `echarts-for-react`
- Testing: `Vitest`, `Testing Library`, `jsdom`
- Linting: `ESLint 9`

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 빌드 결과 실행
- `npm run lint`: ESLint 실행

## Google AdSense Verification Checklist

1. `npm run dev` 실행
2. `view-source:http://localhost:3000`에서 아래 메타 태그 확인
   - `<meta name="google-adsense-account" content="ca-pub-3984267493776789">`
3. `view-source:http://localhost:3000` 또는 DevTools Elements에서 AdSense 스크립트 확인
   - `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3984267493776789`
4. `http://localhost:3000/ads.txt` 접속 시 아래 1줄이 그대로 출력되는지 확인
   - `google.com, pub-3984267493776789, DIRECT, f08c47fec0942fa0`
5. AdSense client 변경이 필요하면 `src/app/seo.ts`의 `GOOGLE_ADSENSE_CLIENT` 상수를 수정

## Production URL Checklist (AdSense)

1. 배포 환경 변수에 `NEXT_PUBLIC_SITE_URL=https://<your-domain>` 설정
2. 배포 후 `view-source:https://<your-domain>`에서 canonical/`og:url`이 `localhost`가 아닌 실제 도메인인지 확인
3. `https://<your-domain>/robots.txt` 접속 시 200 응답과 `sitemap.xml` 경로 노출 확인
4. `https://<your-domain>/sitemap.xml`에 `/`, `/results`, `/recommendations` URL 포함 여부 확인
