import { useEffect, useState } from 'react';

export interface LottoPrize {
    rank: string;
    winAmount: string;
}

export function useLottoPrize(drwNo?: number) {
    const [data, setData] = useState<LottoPrize[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!drwNo) return;
        setLoading(true);

        fetch(`/api/price?drwNo=${drwNo}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [drwNo]);

    return { data, loading, error };
}
