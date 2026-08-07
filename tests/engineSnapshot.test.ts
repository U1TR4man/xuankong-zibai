/**
 * 算法輸出快照回歸（V2 UI 重構驗收標準 F）。
 *
 * 快照在 UI 重構開始前（commit d86f724）產生，涵蓋 1912–2104 共 1200 個時間點的
 * 五層 centerStar / direction / 完整九宮飛布。
 *
 * 任何 UI 重構都不得改變同一 datetime 的排盤輸出。
 * 若本測試失敗，代表動到了 engine —— 不是更新快照，是把改動退掉。
 */
import { describe, expect, it } from 'vitest';
import snapshot from './fixtures/chart-snapshot.json';
import { computeFullChart } from '../src/engine/flyingStar';
import { parseUtc8 } from '../src/engine/time/utc8';

interface Row {
  t: string;
  y: [number, string, string];
  m: [number, string, string];
  d: [number, string, string];
  h: [number, string, string];
  k: [number, string, number, string];
}

describe('算法輸出零回歸', () => {
  it('1200 個時間點的五層排盤與 UI 重構前完全一致', () => {
    const rows = snapshot as Row[];
    expect(rows.length).toBe(1200);
    const diffs: string[] = [];
    for (const r of rows) {
      const c = computeFullChart(parseUtc8(r.t)!);
      const actual = {
        y: [c.year.centerStar, c.year.direction, Object.values(c.year.palaceStars).join('')],
        m: [c.month.centerStar, c.month.direction, Object.values(c.month.palaceStars).join('')],
        d: [c.day.centerStar, c.day.direction, Object.values(c.day.palaceStars).join('')],
        h: [c.hour.centerStar, c.hour.direction, Object.values(c.hour.palaceStars).join('')],
        k: [c.ke.centerStar, c.ke.direction, c.ke.keIndex, Object.values(c.ke.palaceStars).join('')],
      };
      for (const key of ['y', 'm', 'd', 'h', 'k'] as const) {
        const a = JSON.stringify(actual[key]);
        const b = JSON.stringify(r[key]);
        if (a !== b) diffs.push(`${r.t} ${key}: ${b} → ${a}`);
      }
    }
    expect(diffs.slice(0, 10).join('\n')).toBe('');
    expect(diffs).toHaveLength(0);
  });
});
