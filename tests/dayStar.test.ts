/** 規劃書 §36 B — 六段日紫白，節氣前後各 1 分鐘 */
import { describe, expect, it } from 'vitest';
import { getSolarTerms, getDayStarSegment } from '../src/engine/time/solarTerms';
import { computeDayStar } from '../src/engine/flyingStar/dayStar';
import { getGanzhiDay } from '../src/engine/time/ganzhiDay';
import { fromUtc8 } from '../src/engine/time/utc8';
import { norm9 } from '../src/engine/flyingStar/flyNineStars';

const MIN = 60_000;

const CASES = [
  { term: '冬至', before: { star: 6, dir: 'reverse' }, after: { star: 1, dir: 'forward' } },
  { term: '雨水', before: { star: 1, dir: 'forward' }, after: { star: 7, dir: 'forward' } },
  { term: '穀雨', before: { star: 7, dir: 'forward' }, after: { star: 4, dir: 'forward' } },
  { term: '夏至', before: { star: 4, dir: 'forward' }, after: { star: 9, dir: 'reverse' } },
  { term: '處暑', before: { star: 9, dir: 'reverse' }, after: { star: 3, dir: 'reverse' } },
  { term: '霜降', before: { star: 3, dir: 'reverse' }, after: { star: 6, dir: 'reverse' } },
] as const;

describe('日紫白六段邊界（±1 分鐘）', () => {
  for (const y of [2025, 2026, 2027]) {
    for (const c of CASES) {
      it(`${y} ${c.term} 前後 1 分鐘切換`, () => {
        const t = getSolarTerms(y).find((x) => x.name === c.term)!.date;
        const before = getDayStarSegment(new Date(t.getTime() - MIN));
        const after = getDayStarSegment(new Date(t.getTime() + MIN));
        expect(before.jiaziStar).toBe(c.before.star);
        expect(before.direction).toBe(c.before.dir);
        expect(after.jiaziStar).toBe(c.after.star);
        expect(after.direction).toBe(c.after.dir);
        expect(after.from).toBe(c.term);
      });
    }
  }

  it('恰好在節氣時刻上算「後」', () => {
    const t = getSolarTerms(2026).find((x) => x.name === '夏至')!.date;
    expect(getDayStarSegment(t).from).toBe('夏至');
    expect(getDayStarSegment(new Date(t.getTime() - 1000)).from).toBe('穀雨');
  });
});

describe('日盤入中星', () => {
  it('段內甲子日 = 該段起星', () => {
    for (const y of [2026]) {
      for (const c of CASES) {
        const seg = getSolarTerms(y).find((x) => x.name === c.term)!.date;
        // 段起之後第一個甲子日
        let d = new Date(seg.getTime() + 12 * 3600_000);
        for (let i = 0; i < 60; i++) {
          if (getGanzhiDay(d).index60 === 0) break;
          d = new Date(d.getTime() + 86400_000);
        }
        const r = computeDayStar(d);
        expect(getGanzhiDay(d).text).toBe('甲子');
        expect(r.centerStar, `${y} ${c.term}`).toBe(c.after.star);
        expect(r.direction).toBe(c.after.dir);
      }
    }
  });

  it('段內逐日按方向推進一位', () => {
    const start = fromUtc8(2026, 3, 1, 12, 0); // 雨水→穀雨，順
    const seg = getDayStarSegment(start);
    expect(seg.label).toBe('雨水→穀雨');
    let prev = computeDayStar(start).centerStar;
    for (let i = 1; i <= 20; i++) {
      const d = fromUtc8(2026, 3, 1 + i, 12, 0);
      const cur = computeDayStar(d).centerStar;
      expect(cur).toBe(norm9(prev + 1));
      prev = cur;
    }
  });

  it('2026-08-07 中午（處暑前，夏至後段）為逆飛', () => {
    const r = computeDayStar(fromUtc8(2026, 8, 7, 12, 0));
    expect(r.direction).toBe('reverse');
    expect(getDayStarSegment(fromUtc8(2026, 8, 7, 12, 0)).label).toBe('夏至→處暑');
  });
});
