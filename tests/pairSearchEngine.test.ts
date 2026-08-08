import { describe, expect, it } from 'vitest';
import { purposeHits } from '../src/selection/purpose';
import { searchPairOccurrences, type PairSearchQuery } from '../src/selection/searchPairOccurrences';

const BASE: PairSearchQuery = {
  version: 1,
  startDate: '2026-08-07',
  endDate: '2026-08-07',
  firstStar: 1,
  secondStar: 4,
  ordered: true,
  layers: ['YM', 'YD', 'YH', 'MD', 'MH', 'DH'],
};

describe('紫白擇吉 Phase 3 尋組合 Engine', () => {
  it('搜尋 14 會掃描每個正式流時候選、八方與指定六層', () => {
    const matches = searchPairOccurrences(BASE);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.hit.pair === '14')).toBe(true);
    expect(matches.every((match) => match.snapshot.palace !== ('center' as string))).toBe(true);
    expect(matches.every((match) => BASE.layers.includes(match.hit.layer))).toBe(true);
  });

  it('指定次序只命中 14；不分次序可同時命中 14／41', () => {
    const ordered = searchPairOccurrences(BASE);
    const unordered = searchPairOccurrences({ ...BASE, ordered: false });
    expect(new Set(ordered.map((match) => match.hit.pair))).toEqual(new Set(['14']));
    expect(new Set(unordered.map((match) => match.hit.pair))).toEqual(new Set(['14', '41']));
    expect(unordered.length).toBeGreaterThan(ordered.length);
  });

  it('指定 Pair Layer 後不會混入其他層', () => {
    const matches = searchPairOccurrences({ ...BASE, ordered: false, layers: ['DH'] });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.hit.layer === 'DH')).toBe(true);
  });

  it('同一 query 重跑完全 deterministic', () => {
    expect(searchPairOccurrences(BASE)).toEqual(searchPairOccurrences(BASE));
  });

  it('按用途搜尋只命中對應 tags，並附上無分數排序 context', () => {
    const matches = searchPairOccurrences({ ...BASE, purpose: 'writing' });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => purposeHits([match.hit], 'writing').length === 1)).toBe(true);
    expect(matches.every((match) => match.purposeContext?.purpose === 'writing')).toBe(true);
    expect(matches.every((match) => !('score' in match))).toBe(true);
    expect(matches[0]?.hit.rule.sourceLevel).toBe('A');
  });

  it('拒絕空 layer 與重複 layer', () => {
    expect(() => searchPairOccurrences({ ...BASE, layers: [] })).toThrow('至少選擇');
    expect(() => searchPairOccurrences({ ...BASE, layers: ['YM', 'YM'] })).toThrow('不可重複');
  });
});
