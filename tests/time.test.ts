/** UTC+8 / 干支日 / 時辰 / 節氣表 */
import { describe, expect, it } from 'vitest';
import { fromUtc8, toUtc8Parts, formatUtc8, parseUtc8, gregorianToJdn } from '../src/engine/time/utc8';
import { ganzhiOfCivilDate, getGanzhiDay } from '../src/engine/time/ganzhiDay';
import { getChineseHour, hourBranchIndex } from '../src/engine/time/chineseHour';
import { branchGroup, BRANCHES } from '../src/engine/time/ganzhi';
import { getSolarTerms, getCurrentSolarTerm } from '../src/engine/time/solarTerms';

describe('UTC+8 時間層', () => {
  it('round-trips 且不受裝置時區影響', () => {
    const d = fromUtc8(2026, 8, 7, 11, 38, 0);
    expect(toUtc8Parts(d)).toEqual({ year: 2026, month: 8, day: 7, hour: 11, minute: 38, second: 0 });
    expect(formatUtc8(d)).toBe('2026-08-07 11:38');
    expect(d.toISOString()).toBe('2026-08-07T03:38:00.000Z');
  });
  it('parseUtc8', () => {
    expect(parseUtc8('2026-08-07T11:38')!.getTime()).toBe(fromUtc8(2026, 8, 7, 11, 38).getTime());
    expect(parseUtc8('nope')).toBeNull();
  });
  it('JDN 錨點', () => {
    expect(gregorianToJdn(1900, 1, 1)).toBe(2415021);
    expect(gregorianToJdn(2000, 1, 1)).toBe(2451545);
  });
});

describe('干支日', () => {
  it('已知錨點', () => {
    expect(ganzhiOfCivilDate(1900, 1, 1).text).toBe('甲戌');
    expect(ganzhiOfCivilDate(2000, 1, 1).text).toBe('戊午');
    expect(ganzhiOfCivilDate(1984, 1, 31).text).toBe('甲子');
    expect(ganzhiOfCivilDate(1984, 2, 2).text).toBe('丙寅');
    expect(ganzhiOfCivilDate(2026, 8, 7).text).toBe('癸丑');
  });
  it('連續 60 日循環', () => {
    const start = ganzhiOfCivilDate(1984, 1, 31).index60;
    expect(start).toBe(0);
    for (let i = 0; i < 60; i++) {
      const d = fromUtc8(1984, 1, 31 + i, 12, 0);
      expect(getGanzhiDay(d).index60).toBe(i);
    }
    expect(getGanzhiDay(fromUtc8(1984, 3, 31, 12, 0)).index60).toBe(0);
  });
  it('換日規則：00:00 vs 23:00 子初', () => {
    const late = fromUtc8(2026, 8, 7, 23, 30);
    expect(getGanzhiDay(late, 'midnight').text).toBe(getGanzhiDay(fromUtc8(2026, 8, 7, 12, 0), 'midnight').text);
    expect(getGanzhiDay(late, 'zishi2300').text).toBe(getGanzhiDay(fromUtc8(2026, 8, 8, 12, 0), 'midnight').text);
  });
});

describe('時辰判定 (規劃書 §15)', () => {
  it('鐘點 → 時支', () => {
    const expected = [
      [23, '子'], [0, '子'], [1, '丑'], [2, '丑'], [3, '寅'], [4, '寅'],
      [5, '卯'], [6, '卯'], [7, '辰'], [8, '辰'], [9, '巳'], [10, '巳'],
      [11, '午'], [12, '午'], [13, '未'], [14, '未'], [15, '申'], [16, '申'],
      [17, '酉'], [18, '酉'], [19, '戌'], [20, '戌'], [21, '亥'], [22, '亥'],
    ] as const;
    for (const [h, b] of expected) expect(BRANCHES[hourBranchIndex(h)]).toBe(b);
  });
  it('午時 11:00–12:59', () => {
    const h = getChineseHour(fromUtc8(2026, 8, 7, 11, 38));
    expect(h.name).toBe('午時');
    expect(h.rangeLabel).toBe('11:00–12:59');
    expect(formatUtc8(h.start)).toBe('2026-08-07 11:00');
  });
  it('子時跨午夜：00:30 起點屬前一日 23:00', () => {
    const h = getChineseHour(fromUtc8(2026, 8, 8, 0, 30));
    expect(h.name).toBe('子時');
    expect(formatUtc8(h.start)).toBe('2026-08-07 23:00');
  });
});

/** 規劃書 §36 C — 孟仲季 12 地支全測 */
describe('孟仲季', () => {
  it('寅申巳亥 → 孟；子午卯酉 → 仲；辰戌丑未 → 季', () => {
    const meng = ['寅', '申', '巳', '亥'];
    const zhong = ['子', '午', '卯', '酉'];
    const ji = ['辰', '戌', '丑', '未'];
    BRANCHES.forEach((b, i) => {
      const g = branchGroup(i);
      if (meng.includes(b)) expect(g, b).toBe('meng');
      else if (zhong.includes(b)) expect(g, b).toBe('zhong');
      else if (ji.includes(b)) expect(g, b).toBe('ji');
      else throw new Error('unreachable ' + b);
    });
  });
});

describe('節氣表', () => {
  it('2026 立秋 = 2026-08-07 19:42 (±1 分)', () => {
    const t = getSolarTerms(2026).find((x) => x.name === '立秋')!;
    expect(formatUtc8(t.date)).toBe('2026-08-07 19:42');
    expect(t.source).toBe('table');
  });
  it('2026 冬至 = 2026-12-22 04:50 (±1 分)', () => {
    const t = getSolarTerms(2026).find((x) => x.name === '冬至')!;
    expect(formatUtc8(t.date)).toBe('2026-12-22 04:50');
  });
  it('每年 24 節氣且嚴格遞增', () => {
    for (const y of [1900, 1950, 2000, 2026, 2050, 2100]) {
      const ts = getSolarTerms(y);
      expect(ts).toHaveLength(24);
      for (let i = 1; i < 24; i++) expect(ts[i]!.date.getTime()).toBeGreaterThan(ts[i - 1]!.date.getTime());
      expect(toUtc8Parts(ts[0]!.date).year).toBe(y);
      expect(toUtc8Parts(ts[23]!.date).year).toBe(y);
    }
  });
  it('表外年份自動退回演算法', () => {
    const ts = getSolarTerms(1850);
    expect(ts[0]!.source).toBe('algorithm');
    expect(ts).toHaveLength(24);
  });
  it('getCurrentSolarTerm 精確到時刻，非只比日期', () => {
    const lq = getSolarTerms(2026).find((x) => x.name === '立秋')!;
    expect(getCurrentSolarTerm(new Date(lq.date.getTime() - 60_000)).name).toBe('大暑');
    expect(getCurrentSolarTerm(new Date(lq.date.getTime() + 60_000)).name).toBe('立秋');
  });
});
