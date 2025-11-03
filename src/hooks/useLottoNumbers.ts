import { useQueries } from '@tanstack/react-query';
import { fetchLotto } from '../../api/getLotto';

export const useLottoNumbers = (drawNumbers: number[]) => {
    return useQueries({
        queries: drawNumbers.map((num) => ({
            queryKey: ['lotto', 'number', num],
            queryFn: () => fetchLotto(num),
        })),
    });
};
