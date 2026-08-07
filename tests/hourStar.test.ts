/** 規劃書 §36 D — 時盤 */
import { describe, expect, it } from 'vitest';
import { computeHourStar, getHourCenterStar, ZISHI_START_STAR } from '../src/engine/flyingStar/hourStar';
import { getSolarTerms, getYinYangPeriod } from '../src/engine/time/solarTerms';
import { getGanzhiDay } from '../src/engine/time/ganzhiDay';
import { branchGroup } from '../src/engine/time/ganzhi';
import { fromUtc8, formatUtc8 } from '../src/engine/time/utc8';
import { norm9 } from '../src/engine/flyingStar/flyNineStars';

describe('陰陽遁判定', () => {
  it('冬至/夏至時刻前後 1 分鐘切換', () => {
    const dz = getSolarTerms(2026).find((x) => x.name === '冬至')!.date;
    const xz = getSolarTerms(2026).find((x) => x.name === '夏至')!.date;
    expect(getYinYangPeriod(new Date(dz.getTime() - 60000)).kind).toBe('yin');
    expect(getYinYangPeriod(new Date(dz.getTime() + 60000)).kind).toBe('yang');
    expect(getYinYangPeriod(new Date(xz.getTime() - 60000)).kind).toBe('yang');
    expect(getYinYangPeriod(new Date(xz.getTime() + 60000)).kind).toBe('yin');
  });
});

describe('子時起星表', () => {
  it('陽遁 孟七赤 仲一白 季四綠；陰遁 孟三碧 仲九紫 季六白', () => {
    expect(ZISHI_START_STAR.yang).toEqual({ meng: 7, zhong: 1, ji: 4 });
    expect(ZISHI_START_STAR.yin).toEqual({ meng: 3, zhong: 9, ji: 6 });
  });
});

describe('冬至後（陽遁）仲日', () => {
  it('子時 = 一白，丑時 = 二黑，並順推 12 時辰', () => {
    expect(getHourCenterStar('yang', 'zhong', 0)).toBe(1);
    expect(getHourCenterStar('yang', 'zhong', 1)).toBe(2);
    for (let i = 0; i < 12; i++) expect(getHourCenterStar('yang', 'zhong', i)).toBe(norm9(1 + i));
  });
});

describe('夏至後（陰遁）仲日', () => {
  it('子時 = 九紫，丑時 = 八白，並逆推 12 時辰', () => {
    expect(getHourCenterStar('yin', 'zhong', 0)).toBe(9);
    expect(getHourCenterStar('yin', 'zhong', 1)).toBe(8);
    for (let i = 0; i < 12; i++) expect(getHourCenterStar('yin', 'zhong', i)).toBe(norm9(9 - i));
  });
  it('規劃書 §27 例：夏至後仲(午)日午時 → 三碧入中', () => {
    expect(getHourCenterStar('yin', 'zhong', 6)).toBe(3);
  });
});

describe('computeHourStar 端到端', () => {
  it('2026-08-07 11:38（夏至後）', () => {
    const d = fromUtc8(2026, 8, 7, 11, 38);
    const gz = getGanzhiDay(d);
    const group = branchGroup(gz.branchIndex);
    const r = computeHourStar(d);
    expect(r.title).toBe('午時');
    expect(r.direction).toBe('reverse');
    expect(r.centerStar).toBe(getHourCenterStar('yin', group, 6));
    expect(formatUtc8(d)).toBe('2026-08-07 11:38');
  });

  it('同一日 12 時辰依方向連續推進', () => {
    const base = fromUtc8(2026, 3, 10, 0, 30); // 陽遁
    let prev = computeHourStar(base).centerStar;
    for (let i = 1; i < 12; i++) {
      const d = fromUtc8(2026, 3, 10, 1 + (i - 1) * 2, 30);
      const cur = computeHourStar(d).centerStar;
      expect(cur).toBe(norm9(prev + 1));
      prev = cur;
    }
  });
});
