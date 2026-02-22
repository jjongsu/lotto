export const LOTTO_MIN_NUMBER = 1;
export const LOTTO_MAX_NUMBER = 45;
export const LOTTO_MAIN_NUMBER_COUNT = 6;

export const LOTTO_NUMBER_POOL = Array.from({ length: LOTTO_MAX_NUMBER }, (_, index) => index + LOTTO_MIN_NUMBER);

export type FrequencyMap = Record<number, number>;

export interface LottoMainNumbersShape {
    drwtNo1: number;
    drwtNo2: number;
    drwtNo3: number;
    drwtNo4: number;
    drwtNo5: number;
    drwtNo6: number;
}

export type LottoBallBandClassKey = 'ballBandYellow' | 'ballBandBlue' | 'ballBandRed' | 'ballBandGray' | 'ballBandGreen';

export interface FrequencyItem {
    number: number;
    count: number;
}

export const isFiniteNumber = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isFinite(value);
};

export const isValidLottoNumber = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isInteger(value) && value >= LOTTO_MIN_NUMBER && value <= LOTTO_MAX_NUMBER;
};

export const getMainNumbersFromDraw = (draw: Partial<LottoMainNumbersShape>): number[] => {
    return [draw.drwtNo1, draw.drwtNo2, draw.drwtNo3, draw.drwtNo4, draw.drwtNo5, draw.drwtNo6].filter(isFiniteNumber);
};

export const getValidatedMainNumbersFromDraw = (draw: LottoMainNumbersShape): number[] => {
    return getMainNumbersFromDraw(draw).filter(isValidLottoNumber);
};

export const createEmptyFrequencyMap = (): FrequencyMap => {
    const map: FrequencyMap = {};
    for (const number of LOTTO_NUMBER_POOL) {
        map[number] = 0;
    }
    return map;
};

export const getLottoBallBandClassKey = (number: number): LottoBallBandClassKey => {
    if (number <= 10) return 'ballBandYellow';
    if (number <= 20) return 'ballBandBlue';
    if (number <= 30) return 'ballBandRed';
    if (number <= 40) return 'ballBandGray';
    return 'ballBandGreen';
};

export const getLottoBallBandClassName = (styles: Record<string, string>, number: number): string => {
    return styles[getLottoBallBandClassKey(number)] ?? '';
};

export const toSortedFrequencyItems = (map: FrequencyMap): FrequencyItem[] => {
    return Object.entries(map)
        .map(([number, count]) => ({ number: Number(number), count }))
        .sort((a, b) => b.count - a.count || a.number - b.number);
};
