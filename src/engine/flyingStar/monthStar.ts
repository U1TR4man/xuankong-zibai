/**
 * MonthStarEngine — 流月紫白（規劃書 §9）。
 *
 * 月份一律以節氣月（月建）為準，不得直接使用公曆 1–12 月。
 * 規則：
 *   子午卯酉年 → 正月(寅月) 八白入中
 *   辰戌丑未年 → 正月 五黃入中
 *   寅申巳亥年 → 正月 二黑入中
 * 之後逐月逆行（星數 −1）。月盤九宮順飛。
 */

import { getSolarMonthByJieqi } from '../time/solarTerms';
import { BRANCHES } from '../time/ganzhi';
import { flyNineStars, norm9 } from './flyNineStars';
import { resolveSolarYear, getYearGanzhi, type YearBoundary } from './yearStar';
import { starName, type StarResult } from './types';

/** 年支 → 正月入中星。 */
export function getFirstMonthStar(yearBranchIndex: number): number {
  const b = ((yearBranchIndex % 12) + 12) % 12;
  switch (b % 3) {
    case 0: return 8; // 子午卯酉
    case 1: return 5; // 丑辰未戌
    default: return 2; // 寅巳申亥
  }
}

function firstMonthGroupLabel(yearBranchIndex: number): string {
  switch (((yearBranchIndex % 12) + 12) % 12 % 3) {
    case 0: return '子午卯酉年';
    case 1: return '辰戌丑未年';
    default: return '寅申巳亥年';
  }
}

/**
 * @param yearBranchIndex 年支索引 0=子
 * @param monthNumber 1 = 正月(寅月) … 12 = 十二月(丑月)
 */
export function getMonthCenterStar(yearBranchIndex: number, monthNumber: number): number {
  return norm9(getFirstMonthStar(yearBranchIndex) - (monthNumber - 1));
}

export function computeMonthStar(d: Date, boundary: YearBoundary = 'lichun'): StarResult {
  const solarYear = resolveSolarYear(d, boundary);
  const yearGz = getYearGanzhi(solarYear);
  const sm = getSolarMonthByJieqi(d);
  const base = getFirstMonthStar(yearGz.branchIndex);
  const centerStar = getMonthCenterStar(yearGz.branchIndex, sm.monthNumber);
  const monthBranch = BRANCHES[sm.branchIndex]!;
  return {
    level: 'month',
    centerStar,
    direction: 'forward',
    palaceStars: flyNineStars(centerStar, 'forward'),
    sourceRule: '三元月紫白：子午卯酉年正月八白／辰戌丑未年正月五黃／寅申巳亥年正月二黑，逐月逆行',
    title: `${monthBranch}月`,
    subtitle: `${sm.startTerm.name}起`,
    explain: [
      { label: '年支', value: `${yearGz.text} → ${firstMonthGroupLabel(yearGz.branchIndex)}` },
      { label: '正月起星', value: starName(base) },
      { label: '節氣月', value: `${sm.startTerm.name}起 ${monthBranch}月（第 ${sm.monthNumber} 月）` },
      { label: '推算', value: `${starName(base)} 逆行 ${sm.monthNumber - 1} 位 → ${starName(centerStar)}` },
      { label: '飛法', value: '月盤順飛' },
    ],
  };
}
