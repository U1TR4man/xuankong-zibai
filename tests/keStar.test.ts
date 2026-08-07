/** 規劃書 §36 E — 刻盤 */
import { describe, expect, it } from 'vitest';
import { EightKe15MinuteStrategy as S } from '../src/engine/flyingStar/ke/EightKe15MinuteStrategy';
import { computeKeStar } from '../src/engine/flyingStar/keStar';
import { flyNineStars } from '../src/engine/flyingStar/flyNineStars';
import { fromUtc8, formatUtc8Time } from '../src/engine/time/utc8';
import type { StarResult } from '../src/engine/flyingStar/types';

const hourResult = (centerStar: number, direction: 'forward' | 'reverse'): StarResult => ({
  level: 'hour',
  centerStar,
  direction,
  palaceStars: flyNineStars(centerStar, direction),
  sourceRule: 'test',
  title: '午時',
  explain: [],
});

describe('八刻十五分鐘制 · 刻序切分', () => {
  it('午時八刻的時間界線', () => {
    const list = S.listKe(fromUtc8(2026, 8, 7, 11, 38));
    expect(list.map((k) => formatUtc8Time(k.start))).toEqual([
      '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45',
    ]);
    expect(list[2]!.rangeLabel).toBe('11:30–11:44');
    expect(list[2]!.label).toBe('第三刻');
  });

  it('分鐘 → 刻序', () => {
    const at = (h: number, m: number) => S.getKeIndex(fromUtc8(2026, 8, 7, h, m));
    expect(at(11, 0)).toBe(0);
    expect(at(11, 14)).toBe(0);
    expect(at(11, 15)).toBe(1);
    expect(at(11, 38)).toBe(2);
    expect(at(12, 0)).toBe(4);
    expect(at(12, 59)).toBe(7);
  });

  it('子時跨午夜也切成八刻 23:00–00:45', () => {
    const list = S.listKe(fromUtc8(2026, 8, 8, 0, 30));
    expect(list.map((k) => formatUtc8Time(k.start))).toEqual([
      '23:00', '23:15', '23:30', '23:45', '00:00', '00:15', '00:30', '00:45',
    ]);
    expect(S.getKeIndex(fromUtc8(2026, 8, 8, 0, 30))).toBe(6);
  });
});

describe('刻星推算', () => {
  it('hourStar = 6, forward → 6,7,8,9,1,2,3,4', () => {
    const h = hourResult(6, 'forward');
    const got = S.listKe(fromUtc8(2026, 8, 7, 11, 0)).map((k) => S.getCenterStar(h, k.start));
    expect(got).toEqual([6, 7, 8, 9, 1, 2, 3, 4]);
  });

  it('hourStar = 6, reverse → 6,5,4,3,2,1,9,8', () => {
    const h = hourResult(6, 'reverse');
    const got = S.listKe(fromUtc8(2026, 8, 7, 11, 0)).map((k) => S.getCenterStar(h, k.start));
    expect(got).toEqual([6, 5, 4, 3, 2, 1, 9, 8]);
  });

  it('第一刻必等於流時入中星', () => {
    for (let c = 1; c <= 9; c++) {
      for (const d of ['forward', 'reverse'] as const) {
        const h = hourResult(c, d);
        expect(S.getCenterStar(h, fromUtc8(2026, 8, 7, 11, 5))).toBe(c);
      }
    }
  });

  it('刻盤方向承接流時方向', () => {
    expect(S.getDirection(hourResult(3, 'reverse'), fromUtc8(2026, 8, 7, 11, 38))).toBe('reverse');
  });
});

describe('computeKeStar 輸出', () => {
  it('包含可替換 strategy 標示與免責說明', () => {
    const r = computeKeStar(hourResult(6, 'reverse'), fromUtc8(2026, 8, 7, 11, 38), S);
    expect(r.level).toBe('ke');
    expect(r.keIndex).toBe(2);
    expect(r.centerStar).toBe(4);
    expect(r.strategyId).toBe('ke8-15min');
    expect(r.strategyName).toBe('八刻十五分鐘制');
    expect(r.disclaimer).toContain('不視為唯一古法');
    expect(r.palaceStars).toEqual(flyNineStars(4, 'reverse'));
  });
});
