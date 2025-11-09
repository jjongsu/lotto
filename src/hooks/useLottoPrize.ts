import { useQueries, type UseQueryResult } from '@tanstack/react-query';

export interface LottoPrize {
    winAmount1: string;
    winAmount2: string;
    winAmount3: string;
    winAmount4: string;
    winAmount5: string;
}

interface UseLottoPrizeResult {
    data: (LottoPrize | undefined)[];
    loading: boolean;
    error: (Error | null)[];
}

/**
 * drwNo 배열로 여러 회차 데이터를 가져오는 hook
 */
export function useLottoPrize(drwNos: number[]): UseLottoPrizeResult {
    const queries: UseQueryResult<LottoPrize, Error>[] = useQueries({
        queries: drwNos.map((drwNo) => ({
            queryKey: ['lottoPrize', drwNo],
            queryFn: async () => {
                const res = await fetch(`/api/price?drwNo=${drwNo}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return { ...res.json(), drwNo } as Promise<LottoPrize & { drwNo: number }>;
            },
            enabled: !!drwNo, // drwNo가 존재할 때만 실행
        })),
    });

    const data = queries.map((q) => q.data);
    const loading = queries.some((q) => q.isLoading);
    const error = queries.map((q) => q.error ?? null);

    return { data, loading, error };
}
