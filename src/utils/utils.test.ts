import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentLottoRound, getRecentDrawList } from './utils';

describe('utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calculates current lotto round from base date', () => {
        vi.setSystemTime(new Date('2025-11-15T21:00:00+09:00'));

        expect(getCurrentLottoRound()).toBe(1198);
    });

    it('returns recent draw list with boundary-safe count handling', () => {
        vi.setSystemTime(new Date('2025-11-01T21:00:00+09:00'));

        expect(getRecentDrawList(3)).toEqual([1196, 1195, 1194]);
        expect(getRecentDrawList(2.8)).toEqual([1196, 1195]);
        expect(getRecentDrawList(0)).toEqual([]);
        expect(getRecentDrawList(-3)).toEqual([]);
    });
});
