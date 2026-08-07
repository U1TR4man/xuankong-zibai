/**
 * YearStarEngine — 流年紫白（規劃書 §8）。
 *
 * 規則：三元九運年紫白。
 *   上元甲子（1864）一白入中
 *   中元甲子（1924）四綠入中
 *   下元甲子（1984）七赤入中
 *   之後逐年逆行（星數 −1），180 年一循環。
 * 年界採立春（可在 settings 切換為公曆元旦）。
 * 年盤九宮一律順飛。
 */

import { getSolarYearByLichun } from '../time/solarTerms';
import { ganzhiFromIndex60 } from '../time/ganzhi';
import { toUtc8Parts } from '../time/utc8';
import { flyNineStars, norm9 } from './flyNineStars';
import { starName, type StarResult } from './types';

export type YearBoundary = 'lichun' | 'gregorian';

export const YEAR_BOUNDARY_LABEL: Record<YearBoundary, string> = {
  lichun: '立春換年',
  gregorian: '公曆元旦換年',
};

/** 上元甲子年。 */
export const UPPER_YUAN_JIAZI = 1864;

/** 干支年年份 → 入中星。 */
export function getYearCenterStar(solarYear: number): number {
  return norm9(1 - (solarYear - UPPER_YUAN_JIAZI));
}

/** 干支年年份 → 年干支。 */
export function getYearGanzhi(solarYear: number) {
  return ganzhiFromIndex60(solarYear - 4);
}

/** 三元名稱。 */
export function getYuan(solarYear: number): '上元' | '中元' | '下元' {
  const n = (((solarYear - UPPER_YUAN_JIAZI) % 180) + 180) % 180;
  return n < 60 ? '上元' : n < 120 ? '中元' : '下元';
}

/** 依設定取得該時間點所屬的干支年年份。 */
export function resolveSolarYear(d: Date, boundary: YearBoundary = 'lichun'): number {
  return boundary === 'lichun' ? getSolarYearByLichun(d) : toUtc8Parts(d).year;
}

export function computeYearStar(d: Date, boundary: YearBoundary = 'lichun'): StarResult {
  const solarYear = resolveSolarYear(d, boundary);
  const centerStar = getYearCenterStar(solarYear);
  const gz = getYearGanzhi(solarYear);
  const yuan = getYuan(solarYear);
  const offset = (((solarYear - UPPER_YUAN_JIAZI) % 180) + 180) % 180;
  return {
    level: 'year',
    centerStar,
    direction: 'forward',
    palaceStars: flyNineStars(centerStar, 'forward'),
    sourceRule: '三元年紫白：上元甲子一白／中元甲子四綠／下元甲子七赤，逐年逆行',
    title: `${solarYear}年`,
    subtitle: `${gz.text}年 · ${yuan}`,
    explain: [
      { label: '年界', value: YEAR_BOUNDARY_LABEL[boundary] },
      { label: '干支年', value: `${solarYear} ${gz.text}` },
      { label: '三元', value: `${yuan}（距上元甲子 ${offset} 年）` },
      { label: '起算', value: '上元甲子(1864) 一白入中' },
      { label: '推算', value: `1 − ${solarYear - UPPER_YUAN_JIAZI} → ${starName(centerStar)}` },
      { label: '飛法', value: '年盤順飛' },
    ],
  };
}
