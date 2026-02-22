import type { LottoApiResponse } from '../types/lotto';

export type { LottoApiResponse, LottoSuccessResponse } from '../types/lotto';

export const fetchLotto = async (drwNo: number): Promise<LottoApiResponse> => {
    const response = await fetch(`/api/lotto?drwNo=${drwNo}`);

    if (!response.ok) {
        throw new Error('Network error');
    }

    return response.json();
};
