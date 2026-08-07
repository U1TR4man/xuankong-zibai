/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import type { SearchMatch, StarSearchQuery } from '../src/search/types';
import { SearchResults } from '../src/ui/SearchResults';

const QUERY: StarSearchQuery = {
  version: 1,
  startDate: '2026-09-01',
  endDate: '2026-09-03',
  palace: 'li',
  conditions: [{ level: 'hour', stars: [9] }],
};

function match(startDateTime: string): SearchMatch {
  return {
    startDateTime,
    endDateTime: startDateTime.endsWith('01:00')
      ? startDateTime.replace('01:00', '03:00')
      : startDateTime.replace('03:00', '05:00'),
    palace: 'li',
    precision: 'hour',
    palaceStars: { year: 1, month: 5, day: 4, hour: 9 },
    matchedConditions: [{ level: 'hour', stars: [9] }],
    chartContext: { year: 2, month: 6, day: 5, hour: 1 },
  };
}

describe('Phase 5 搜尋結果 UX', () => {
  it('按日期分組並保留時間 ascending', () => {
    const view = SearchResults(QUERY, [
      match('2026-09-01T01:00'),
      match('2026-09-01T03:00'),
      match('2026-09-02T01:00'),
    ]);
    expect(view.querySelectorAll('.search-result-group')).toHaveLength(2);
    expect(view.querySelectorAll('.search-result-group')[0]?.textContent).toContain('9月1日');
    expect(view.querySelectorAll('.search-result-group')[0]?.textContent).toContain('2 個');
    expect(Array.from(view.querySelectorAll('.search-result__time')).map((node) => node.textContent))
      .toEqual(['01:00–02:59', '03:00–04:59', '01:00–02:59']);
  });

  it('零結果顯示可修改條件的 empty state，不自行推薦', () => {
    const view = SearchResults(QUERY, []);
    expect(view.querySelector('.search-results__count')?.textContent).toBe('共 0 個結果');
    expect(view.querySelector('.search-empty')?.textContent).toContain('沒有找到符合條件');
    expect(view.textContent).not.toContain('推薦');
  });

  it('長範圍與大量結果均明確提示，且不偷偷截斷', () => {
    const many = Array.from({ length: 201 }, () => match('2026-09-01T01:00'));
    const view = SearchResults({ ...QUERY, startDate: '2026-01-01', endDate: '2026-04-15' }, many);
    expect(view.querySelector('.search-results__count')?.textContent).toBe('共 201 個結果');
    expect(view.querySelectorAll('.search-result')).toHaveLength(200);
    expect(view.textContent).toContain('長範圍');
    expect(view.textContent).toContain('不會被截斷');
    const more = view.querySelector<HTMLButtonElement>('.search-results__more')!;
    expect(more.textContent).toContain('尚餘 1');
    more.click();
    expect(view.querySelectorAll('.search-result')).toHaveLength(201);
    expect(more.hidden).toBe(true);
  });
});
