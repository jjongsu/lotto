export const parsePositiveDrawInput = (value: string): number | null => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return Math.floor(parsed);
};

export const clampDrawInRange = (draw: number, maxRound: number): number => {
    return Math.min(maxRound, Math.max(1, Math.floor(draw)));
};
