export interface LottoPrize {
    drwNo: number;
    winAmount1: string;
    winAmount2: string;
    winAmount3: string;
    winAmount4: string;
    winAmount5: string;
}

export const posLottoAmount = async (drwNo: number) => {
    const res = await fetch(`/api/price?drwNo=${drwNo}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ...res.json(), drwNo } as Promise<LottoPrize[]>;
};
