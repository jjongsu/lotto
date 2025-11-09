import { useQueries } from '@tanstack/react-query';
// import { fetchLotto } from '../apis/getLotto';
// import { posLottoAmount } from '../apis/postLottoAmount';
// import { useMemo } from 'react';

export default function useLottoData(drwNos: number[]) {
    // const amountsQueries = useQueries({
    //     queries: drwNos.map((drwNo) => ({
    //         queryKey: ['lotto', 'amount', drwNo],
    //         queryFn: async () => posLottoAmount(drwNo),
    //         enabled: !!drwNo, // drwNo가 존재할 때만 실행
    //     })),
    // });

    const lottoQueries = useQueries({
        queries: drwNos.map((drwNo) => ({
            queryKey: ['lotto', 'info', drwNo],
            queryFn: async () => {
                const priceRes = await fetch(`/api/price?drwNo=${drwNo}`);
                if (import.meta.env.DEV) {
                    const numRes = await fetch(`/lotto/common.do?method=getLottoNumber&drwNo=${drwNo}`);

                    if (!numRes.ok || !priceRes.ok) throw new Error('Network error');
                    const data = { ...numRes.json(), ...priceRes.json() };

                    return data;
                } else {
                    const numRes = await fetch(`/api/lotto?drwNo=${drwNo}`);

                    if (!numRes.ok || !priceRes.ok) throw new Error('Network error');
                    const data = { ...numRes.json(), ...priceRes.json() };

                    return data;
                }
            },
            enabled: !!drwNos.length,
        })),
    });

    const isLoading = lottoQueries.some((el) => el.isLoading);
    const isError = lottoQueries.some((el) => el.isError);
    const data = lottoQueries.map(({ data }) => data);

    // const isLoading = useMemo(() => amountsQueries.some((q) => q.isLoading) || lottoQueries.some((q) => q.isLoading), [amountsQueries, lottoQueries]);
    // const isError = useMemo(() => amountsQueries.some((q) => q.isError) || lottoQueries.some((q) => q.isError), [amountsQueries, lottoQueries]);
    // const data = lottoQueries.map(({ data }) => {
    //     const targetAmount = amountsQueries.flatMap((amountData) => amountData.data).find((el) => el?.drwNo === data?.drwNo);
    //     if (targetAmount) {
    //         return { ...data, ...targetAmount };
    //     }
    // });

    return { isLoading, isError, data };
}
