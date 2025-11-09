import { useQueries } from '@tanstack/react-query';
import { fetchLotto } from '../apis/getLotto';
import { postLottoAmount } from '../apis/postLottoAmount';

export default function useLottoData(drwNos: number[]) {
    const amountsQueries = useQueries({
        queries: drwNos.map((drwNo) => ({
            queryKey: ['lotto', 'amount', drwNo],
            queryFn: async () => postLottoAmount(drwNo),
            enabled: !!drwNo, // drwNo가 존재할 때만 실행
        })),
    });

    const lottoQueries = useQueries({
        queries: drwNos.map((num) => ({
            queryKey: ['lotto', 'number', num],
            queryFn: () => fetchLotto(num),
        })),
    });

    const isError = lottoQueries.some((el) => el.isError);
    const data = lottoQueries.map(({ data, isLoading }) => {
        const target = amountsQueries.map(({ data, isFetched }) => ({ data, isFetched })).find((amountQuery) => amountQuery.data?.drwNo === data?.drwNo);
        const amountData = { ...target?.data, amountIsFetched: target?.isFetched };
        return { ...data, ...amountData, isLoading };
    });

    // const isLoading = useMemo(() => amountsQueries.some((q) => q.isLoading) || lottoQueries.some((q) => q.isLoading), [amountsQueries, lottoQueries]);
    // const isError = useMemo(() => amountsQueries.some((q) => q.isError) || lottoQueries.some((q) => q.isError), [amountsQueries, lottoQueries]);
    // const data = lottoQueries.map(({ data }) => {
    //     const targetAmount = amountsQueries.flatMap((amountData) => amountData.data).find((el) => el?.drwNo === data?.drwNo);
    //     if (targetAmount) {
    //         return { ...data, ...targetAmount };
    //     }
    // });

    return { isError, data, amountsQueries };
}
