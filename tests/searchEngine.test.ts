import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { parseUtc8 } from '../src/engine/time/utc8';
import { iterateSearchCandidates } from '../src/search/candidateIterator';
import { matchesConditions } from '../src/search/matchQuery';
import { searchStars } from '../src/search/StarSearchEngine';
import type { StarSearchQuery } from '../src/search/types';

function query(overrides: Partial<StarSearchQuery> = {}): StarSearchQuery {
  return {
    version: 1,
    startDate: '2026-09-01',
    endDate: '2026-09-03',
    palace: 'li',
    conditions: [{ level: 'hour', stars: [9] }],
    ...overrides,
  };
}

describe('Phase 3 Search A core', () => {
  it('每日枚舉 1 日、12 時辰、96 刻，全部採 UTC+8 時窗', () => {
    expect([...iterateSearchCandidates('2026-09-01', '2026-09-01', 'day')]).toHaveLength(1);
    expect([...iterateSearchCandidates('2026-09-01', '2026-09-01', 'hour')]).toHaveLength(12);
    expect([...iterateSearchCandidates('2026-09-01', '2026-09-01', 'ke')]).toHaveLength(96);
    const hours = [...iterateSearchCandidates('2026-09-01', '2026-09-01', 'hour')];
    expect(hours[0]!.start.toISOString()).toBe('2026-08-31T17:00:00.000Z'); // UTC+8 01:00
    expect(hours[11]!.start.toISOString()).toBe('2026-09-01T15:00:00.000Z'); // UTC+8 23:00
  });

  it('「離宮流時 9 紫」只命中離宮格內值 9', () => {
    const matches = searchStars(query());
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match.palace).toBe('li');
      expect(match.precision).toBe('hour');
      expect(match.palaceStars.hour).toBe(9);
      const date = parseUtc8(match.startDateTime)!;
      expect(computeFullChart(date).hour.palaceStars.li).toBe(9);
    }
  });

  it('入中星 9 不等於離宮 9，不會造成誤命中', () => {
    const candidates = [...iterateSearchCandidates('2026-09-01', '2026-09-10', 'hour')];
    const centerNine = candidates.find(({ start }) => {
      const hour = computeFullChart(start).hour;
      return hour.centerStar === 9 && hour.palaceStars.li !== 9;
    });
    expect(centerNine).toBeTruthy();
    const matchTimes = new Set(searchStars(query({ endDate: '2026-09-10' })).map((m) => m.startDateTime));
    const key = `${centerNine!.start.toISOString()}`;
    expect([...matchTimes].some((value) => parseUtc8(value)!.toISOString() === key)).toBe(false);
  });

  it('結果依時間遞增，並只帶到搜尋精度為止的上層', () => {
    const day = searchStars(query({ conditions: [{ level: 'day', stars: [1, 2, 3, 4, 5, 6, 7, 8, 9] }] }));
    const hour = searchStars(query({ conditions: [{ level: 'hour', stars: [1, 2, 3, 4, 5, 6, 7, 8, 9] }] }));
    const ke = searchStars(query({ conditions: [{ level: 'ke', stars: [1, 2, 3, 4, 5, 6, 7, 8, 9] }] }));
    expect(Object.keys(day[0]!.palaceStars)).toEqual(['year', 'month', 'day']);
    expect(Object.keys(hour[0]!.palaceStars)).toEqual(['year', 'month', 'day', 'hour']);
    expect(Object.keys(ke[0]!.palaceStars)).toEqual(['year', 'month', 'day', 'hour', 'ke']);
    expect(ke.map((match) => match.startDateTime)).toEqual(
      [...ke].map((match) => match.startDateTime).sort(),
    );
  });

  it('同層 stars 採 OR；無效日期與空條件會拒絕', () => {
    expect(matchesConditions({ year: 1, month: 2, day: 3, hour: 8, ke: 9 }, [
      { level: 'hour', stars: [8, 9] },
    ])).toBe(true);
    expect(() => searchStars(query({ startDate: '2026-02-31' }))).toThrow(RangeError);
    expect(() => searchStars(query({ conditions: [] }))).toThrow(RangeError);
  });
});
