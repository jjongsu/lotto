import { useQueries } from '@tanstack/react-query';
import { fetchLotto } from '../apis/getLotto';
import type { LottoQueryData } from '../types/lotto';

interface UseLottoDataResult {
    isError: boolean;
    data: LottoQueryData[];
}

export default function useLottoData(drwNos: number[]): UseLottoDataResult {
    const lottoQueries = useQueries({
        queries: drwNos.map((drawNo) => ({
            queryKey: ['lotto', 'number', drawNo] as const,
            queryFn: () => fetchLotto(drawNo),
        })),
    });

    const isError = lottoQueries.some((query) => query.isError);
    const data: LottoQueryData[] = lottoQueries.map(({ data, isLoading }) => {
        return { ...(data ?? {}), isLoading };
    });

    return { isError, data };
}
