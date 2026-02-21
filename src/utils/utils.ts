export function getCurrentLottoRound(): number {
    const baseRound = 1196;
    const baseDate = new Date('2025-11-01T21:00:00+09:00');
    const targetDate = new Date();

    const diffMs = targetDate.getTime() - baseDate.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeksPassed = Math.floor(diffMs / weekMs);

    return baseRound + Math.max(0, weeksPassed);
}

export function getRecentDrawList(count: number): number[] {
    const safeCount = Math.floor(count);
    if (!Number.isFinite(safeCount) || safeCount <= 0) {
        return [];
    }

    const recentDraw = getCurrentLottoRound();
    const list: number[] = [];

    for (let index = 0; index < safeCount; index++) {
        const draw = recentDraw - index;
        if (draw > 0) {
            list.push(draw);
        }
    }

    return list;
}

export const getRecentList3 = () => {
    return getRecentDrawList(3);
};
