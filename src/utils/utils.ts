function getLottoRoundByDate(): number {
    const baseRound = 1196;
    const baseDate = new Date('2025-11-01T21:00:00+09:00');
    const targetDate = new Date();

    const diffMs = targetDate.getTime() - baseDate.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeksPassed = Math.floor(diffMs / weekMs);

    // 음수일 경우 1196 미만으로 내려가지 않게 처리
    return baseRound + Math.max(0, weeksPassed);
}

export const getRecentList3 = () => {
    const list: number[] = [];
    const recentDraw = getLottoRoundByDate();

    for (let index = 0; index < 3; index++) {
        list.push(recentDraw - index);
    }

    return list;
};
