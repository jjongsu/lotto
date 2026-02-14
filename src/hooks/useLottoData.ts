import { useQueries } from '@tanstack/react-query';
import { fetchLotto } from '../apis/getLotto';

export default function useLottoData(drwNos: number[]) {
    const lottoQueries = useQueries({
        queries: drwNos.map((num) => ({
            queryKey: ['lotto', 'number', num],
            queryFn: () => fetchLotto(num),
        })),
    });

    const isError = lottoQueries.some((el) => el.isError);
    const data = lottoQueries.map(({ data, isLoading }) => {
        return { ...data, isLoading };
    });

    return { isError, data };
}
