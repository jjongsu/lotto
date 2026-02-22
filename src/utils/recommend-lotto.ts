import type { LottoSuccessResponse } from '../types/lotto';
import {
    LOTTO_MAIN_NUMBER_COUNT,
    LOTTO_MIN_NUMBER,
    LOTTO_NUMBER_POOL,
    createEmptyFrequencyMap,
    isValidLottoNumber,
    type FrequencyMap,
} from './lotto-domain';

type LottoNumbers = Pick<LottoSuccessResponse, 'drwtNo1' | 'drwtNo2' | 'drwtNo3' | 'drwtNo4' | 'drwtNo5' | 'drwtNo6'>;

export type RecommendedSet = [number, number, number, number, number, number];
export type { FrequencyMap } from './lotto-domain';

const getWeight = (number: number, frequencyMap: FrequencyMap): number => {
    const frequency = frequencyMap[number] ?? 0;
    return Math.max(0, frequency) + 1;
};

const pickWeightedNumber = (pool: number[], frequencyMap: FrequencyMap, rng: () => number): number => {
    const totalWeight = pool.reduce((acc, number) => acc + getWeight(number, frequencyMap), 0);

    if (totalWeight <= 0) {
        return pool[Math.floor(rng() * pool.length)] ?? LOTTO_MIN_NUMBER;
    }

    let cursor = rng() * totalWeight;

    for (const number of pool) {
        cursor -= getWeight(number, frequencyMap);
        if (cursor <= 0) {
            return number;
        }
    }

    return pool[pool.length - 1] ?? LOTTO_MIN_NUMBER;
};

const shuffleNumbers = (numbers: number[], rng: () => number): number[] => {
    const copied = [...numbers];
    for (let index = copied.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(rng() * (index + 1));
        [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
    }
    return copied;
};

const toRecommendedSet = (numbers: number[]): RecommendedSet => {
    const normalized = numbers
        .filter(isValidLottoNumber)
        .slice(0, LOTTO_MAIN_NUMBER_COUNT)
        .sort((a, b) => a - b);

    if (normalized.length !== LOTTO_MAIN_NUMBER_COUNT) {
        const fallback = shuffleNumbers(LOTTO_NUMBER_POOL, Math.random)
            .slice(0, LOTTO_MAIN_NUMBER_COUNT)
            .sort((a, b) => a - b);

        return [fallback[0], fallback[1], fallback[2], fallback[3], fallback[4], fallback[5]];
    }

    return [normalized[0], normalized[1], normalized[2], normalized[3], normalized[4], normalized[5]];
};

const generateWeightedSet = (frequencyMap: FrequencyMap, rng: () => number): RecommendedSet => {
    const picked = new Set<number>();

    while (picked.size < LOTTO_MAIN_NUMBER_COUNT) {
        const pool = LOTTO_NUMBER_POOL.filter((number) => !picked.has(number));
        const number = pickWeightedNumber(pool, frequencyMap, rng);
        picked.add(number);
    }

    return toRecommendedSet(Array.from(picked));
};

const generateUniformSet = (rng: () => number): RecommendedSet => {
    const set = shuffleNumbers(LOTTO_NUMBER_POOL, rng).slice(0, LOTTO_MAIN_NUMBER_COUNT);
    return toRecommendedSet(set);
};

export function buildFrequencyMap(draws: LottoNumbers[]): FrequencyMap {
    const map = createEmptyFrequencyMap();

    for (const draw of draws) {
        const numbers = [draw.drwtNo1, draw.drwtNo2, draw.drwtNo3, draw.drwtNo4, draw.drwtNo5, draw.drwtNo6];
        for (const number of numbers) {
            if (isValidLottoNumber(number)) {
                map[number] += 1;
            }
        }
    }

    return map;
}

interface GenerateWeightedSetsOptions {
    frequencyMap: FrequencyMap;
    setCount?: number;
    rng?: () => number;
    maxAttempts?: number;
}

export function generateWeightedSets({
    frequencyMap,
    setCount = 5,
    rng = Math.random,
    maxAttempts,
}: GenerateWeightedSetsOptions): RecommendedSet[] {
    const targetCount = Number.isFinite(setCount) && setCount > 0 ? Math.floor(setCount) : 5;
    const attemptsLimit = maxAttempts ?? targetCount * 40;
    const sets: RecommendedSet[] = [];
    const seen = new Set<string>();

    let attempts = 0;
    while (sets.length < targetCount && attempts < attemptsLimit) {
        attempts += 1;
        const nextSet = generateWeightedSet(frequencyMap, rng);
        const key = nextSet.join('-');

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        sets.push(nextSet);
    }

    while (sets.length < targetCount) {
        const nextSet = generateUniformSet(rng);
        const key = nextSet.join('-');

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        sets.push(nextSet);
    }

    return sets;
}
