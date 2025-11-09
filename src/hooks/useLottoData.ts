import { useQueries } from '@tanstack/react-query';
import { fetchLotto } from '../apis/getLotto';
import { posLottoAmount } from '../apis/postLottoAmount';
import { useMemo } from 'react';

export default function useLottoData(drwNos: number[]) {
    const amountsQueries = useQueries({
        queries: drwNos.map((drwNo) => ({
            queryKey: ['lotto', 'amount', drwNo],
            queryFn: async () => posLottoAmount(drwNo),
            enabled: !!drwNo, // drwNo가 존재할 때만 실행
        })),
    });

    const lottoQueries = useQueries({
        queries: drwNos.map((num) => ({
            queryKey: ['lotto', 'number', num],
            queryFn: () => fetchLotto(num),
            enabled: !!drwNos.length,
        })),
    });

    const isLoading = useMemo(() => amountsQueries.some((q) => q.isLoading) || lottoQueries.some((q) => q.isLoading), [amountsQueries, lottoQueries]);
    const isError = useMemo(() => amountsQueries.some((q) => q.isError) || lottoQueries.some((q) => q.isError), [amountsQueries, lottoQueries]);
    const data = lottoQueries.map(({ data }) => {
        const targetAmount = amountsQueries.flatMap((amountData) => amountData.data).find((el) => el?.drwNo === data?.drwNo);
        if (targetAmount) {
            return { ...data, ...targetAmount };
        }
    });

    return { isLoading, isError, data };
}
