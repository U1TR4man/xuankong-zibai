/** 流年 / 流月紫白 */
import { describe, expect, it } from 'vitest';
import { computeYearStar, getYearCenterStar, getYearGanzhi, getYuan } from '../src/engine/flyingStar/yearStar';
import { computeMonthStar, getFirstMonthStar, getMonthCenterStar } from '../src/engine/flyingStar/monthStar';
import { getSolarMonthByJieqi, getSolarTerms } from '../src/engine/time/solarTerms';
import { fromUtc8 } from '../src/engine/time/utc8';
import { norm9 } from '../src/engine/flyingStar/flyNineStars';

describe('年紫白', () => {
  it('三元甲子起例', () => {
    expect(getYearCenterStar(1864)).toBe(1); // 上元甲子 一白
    expect(getYearCenterStar(1924)).toBe(4); // 中元甲子 四綠
    expect(getYearCenterStar(1984)).toBe(7); // 下元甲子 七赤
    expect(getYearCenterStar(2044)).toBe(1); // 180 年循環
  });
  it('逐年逆行', () => {
    for (let y = 1980; y < 2060; y++) expect(getYearCenterStar(y + 1)).toBe(norm9(getYearCenterStar(y) - 1));
  });
  it('近年對照', () => {
    expect(getYearCenterStar(2024)).toBe(3);
    expect(getYearCenterStar(2025)).toBe(2);
    expect(getYearCenterStar(2026)).toBe(1);
  });
  it('年干支', () => {
    expect(getYearGanzhi(1984).text).toBe('甲子');
    expect(getYearGanzhi(2024).text).toBe('甲辰');
    expect(getYearGanzhi(2026).text).toBe('丙午');
    expect(getYuan(2026)).toBe('下元');
  });
  it('立春換年：立春前一分鐘仍屬前一年', () => {
    const lc = getSolarTerms(2026).find((x) => x.name === '立春')!.date;
    expect(computeYearStar(new Date(lc.getTime() - 60000)).centerStar).toBe(getYearCenterStar(2025));
    expect(computeYearStar(new Date(lc.getTime() + 60000)).centerStar).toBe(getYearCenterStar(2026));
  });
  it('公曆換年設定', () => {
    const d = fromUtc8(2026, 1, 15, 12, 0);
    expect(computeYearStar(d, 'lichun').centerStar).toBe(getYearCenterStar(2025));
    expect(computeYearStar(d, 'gregorian').centerStar).toBe(getYearCenterStar(2026));
  });
});

describe('月紫白', () => {
  it('正月起例', () => {
    expect(getFirstMonthStar(0)).toBe(8);  // 子
    expect(getFirstMonthStar(6)).toBe(8);  // 午
    expect(getFirstMonthStar(4)).toBe(5);  // 辰
    expect(getFirstMonthStar(1)).toBe(5);  // 丑
    expect(getFirstMonthStar(2)).toBe(2);  // 寅
    expect(getFirstMonthStar(11)).toBe(2); // 亥
  });
  it('逐月逆行', () => {
    for (let m = 1; m < 12; m++) expect(getMonthCenterStar(6, m + 1)).toBe(norm9(getMonthCenterStar(6, m) - 1));
  });
  it('節氣月而非公曆月：立秋前後跨月', () => {
    const lq = getSolarTerms(2026).find((x) => x.name === '立秋')!.date;
    expect(getSolarMonthByJieqi(new Date(lq.getTime() - 60000)).branchIndex).toBe(7);  // 未
    expect(getSolarMonthByJieqi(new Date(lq.getTime() + 60000)).branchIndex).toBe(8);  // 申
  });
  it('2026 丙午年申月 = 二黑入中', () => {
    const r = computeMonthStar(fromUtc8(2026, 8, 10, 12, 0));
    expect(r.title).toBe('申月');
    expect(r.centerStar).toBe(2);
  });
  it('十二月建對應正確', () => {
    const expected: Array<[number, number, number]> = [
      [2026, 2, 10, ], [2026, 3, 10], [2026, 4, 10], [2026, 5, 10],
    ].map((a) => a as [number, number, number]);
    const branches = expected.map(([y, m, d]) => getSolarMonthByJieqi(fromUtc8(y, m, d, 12, 0)).branchIndex);
    expect(branches).toEqual([2, 3, 4, 5]); // 寅 卯 辰 巳
  });
});
