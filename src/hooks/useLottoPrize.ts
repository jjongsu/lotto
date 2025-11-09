// import { useEffect, useState } from 'react';

// export interface LottoPrize {
//     rank: string;
//     winAmount: string;
// }

// export function useLottoPrize(drwNo?: number) {
//     const [data, setData] = useState<LottoPrize[] | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<Error | null>(null);

//     useEffect(() => {
//         if (!drwNo) return;
//         setLoading(true);

//         fetch(`/api/price?drwNo=${drwNo}`)
//             .then((res) => {
//                 if (!res.ok) throw new Error(`HTTP ${res.status}`);
//                 return res.json();
//             })
//             .then(setData)
//             .catch(setError)
//             .finally(() => setLoading(false));
//     }, [drwNo]);

//     return { data, loading, error };
// }

import { useQueries, type UseQueryResult } from '@tanstack/react-query';

export interface LottoPrize {
    rank: number;
    winAmount: number;
}

interface UseLottoPrizeResult {
    data: (LottoPrize[] | undefined)[];
    loading: boolean;
    error: (Error | null)[];
}

/**
 * drwNo 배열로 여러 회차 데이터를 가져오는 hook
 */
export function useLottoPrize(drwNos: number[]): UseLottoPrizeResult {
    const queries: UseQueryResult<LottoPrize[], Error>[] = useQueries({
        queries: drwNos.map((drwNo) => ({
            queryKey: ['lottoPrize', drwNo],
            queryFn: async () => {
                const res = await fetch(`/api/price?drwNo=${drwNo}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<LottoPrize[]>;
            },
            enabled: !!drwNo, // drwNo가 존재할 때만 실행
        })),
    });

    const data = queries.map((q) => q.data);
    const loading = queries.some((q) => q.isLoading);
    const error = queries.map((q) => q.error ?? null);

    return { data, loading, error };
}
