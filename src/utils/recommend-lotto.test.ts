import { describe, expect, it } from 'vitest';
import { createEmptyFrequencyMap } from './lotto-domain';
import { buildFrequencyMap, generateWeightedSets } from './recommend-lotto';

const createSequenceRng = (sequence: number[]) => {
    let index = 0;
    return () => {
        const value = sequence[index % sequence.length] ?? 0.5;
        index += 1;
        return value;
    };
};

describe('recommend-lotto utils', () => {
    it('builds frequency map from draw list', () => {
        const frequencyMap = buildFrequencyMap([
            { drwtNo1: 1, drwtNo2: 2, drwtNo3: 3, drwtNo4: 4, drwtNo5: 5, drwtNo6: 6 },
            { drwtNo1: 1, drwtNo2: 2, drwtNo3: 3, drwtNo4: 4, drwtNo5: 5, drwtNo6: 6 },
        ]);

        expect(frequencyMap[1]).toBe(2);
        expect(frequencyMap[6]).toBe(2);
        expect(frequencyMap[7]).toBe(0);
    });

    it('returns set count, sorted sets, and de-duplicated sets', () => {
        const frequencyMap = createEmptyFrequencyMap();
        frequencyMap[1] = 20;
        frequencyMap[2] = 18;
        frequencyMap[3] = 16;
        frequencyMap[4] = 14;
        frequencyMap[5] = 12;
        frequencyMap[6] = 10;

        const sets = generateWeightedSets({
            frequencyMap,
            setCount: 5,
            maxAttempts: 120,
            rng: createSequenceRng([0.01, 0.15, 0.23, 0.31, 0.42, 0.56, 0.67, 0.78, 0.89, 0.94]),
        });

        expect(sets).toHaveLength(5);

        for (const set of sets) {
            expect(set).toHaveLength(6);
            expect([...set].sort((a, b) => a - b)).toEqual(set);
            expect(new Set(set).size).toBe(6);
            expect(set.every((number) => number >= 1 && number <= 45)).toBe(true);
        }

        expect(new Set(sets.map((set) => set.join('-'))).size).toBe(5);
    });

    it('produces deterministic output with same RNG sequence', () => {
        const frequencyMap = createEmptyFrequencyMap();
        frequencyMap[10] = 10;
        frequencyMap[20] = 8;
        frequencyMap[30] = 6;

        const first = generateWeightedSets({
            frequencyMap,
            setCount: 3,
            rng: createSequenceRng([0.13, 0.22, 0.41, 0.58, 0.63, 0.74, 0.81, 0.91, 0.06, 0.17]),
            maxAttempts: 80,
        });

        const second = generateWeightedSets({
            frequencyMap,
            setCount: 3,
            rng: createSequenceRng([0.13, 0.22, 0.41, 0.58, 0.63, 0.74, 0.81, 0.91, 0.06, 0.17]),
            maxAttempts: 80,
        });

        expect(first).toEqual(second);
    });

    it('falls back to uniform generation when attempts are limited', () => {
        const frequencyMap = createEmptyFrequencyMap();

        const sets = generateWeightedSets({
            frequencyMap,
            setCount: 3,
            maxAttempts: 1,
            rng: createSequenceRng([0.04, 0.26, 0.48, 0.62, 0.78, 0.91, 0.33, 0.57]),
        });

        expect(sets).toHaveLength(3);
        for (const set of sets) {
            expect(set.every((number) => number >= 1 && number <= 45)).toBe(true);
        }
    });
});
