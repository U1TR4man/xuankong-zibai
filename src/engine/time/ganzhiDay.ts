/**
 * GanzhiDayEngine — 干支日。
 *
 * 換日規則刻意獨立於「時辰判定」（規劃書 §12 / §15）：
 *  - 'midnight'  : UTC+8 00:00 換日（預設）
 *  - 'zishi2300' : 23:00 子初換日
 * 兩者共用同一個 index60 演算法，只差在「這個時間點算哪一天」。
 */

import { toUtc8Parts, gregorianToJdn, fromUtc8 } from './utc8';
import { ganzhiFromIndex60, type Ganzhi } from './ganzhi';

export type DayChangeMode = 'midnight' | 'zishi2300';

export const DEFAULT_DAY_CHANGE_MODE: DayChangeMode = 'midnight';

export const DAY_CHANGE_LABEL: Record<DayChangeMode, string> = {
  midnight: '00:00 午夜換日',
  zishi2300: '23:00 子初換日',
};

/**
 * 錨點：JDN + 49 ≡ index60 (mod 60)，0 = 甲子。
 * 驗證：1900-01-01 (JDN 2415021) → 甲戌；2000-01-01 (JDN 2451545) → 戊午。
 */
const JDN_TO_INDEX60_OFFSET = 49;

/** 該時間點在指定換日規則下所屬的「民用日 00:00」時間點。 */
export function civilDayStart(d: Date, mode: DayChangeMode = DEFAULT_DAY_CHANGE_MODE): Date {
  const p = toUtc8Parts(d);
  const shift = mode === 'zishi2300' && p.hour >= 23 ? 1 : 0;
  return fromUtc8(p.year, p.month, p.day + shift, 0, 0, 0);
}

/** 該時間點所屬日的干支。 */
export function getGanzhiDay(d: Date, mode: DayChangeMode = DEFAULT_DAY_CHANGE_MODE): Ganzhi {
  const start = civilDayStart(d, mode);
  const p = toUtc8Parts(start);
  const jdn = gregorianToJdn(p.year, p.month, p.day);
  return ganzhiFromIndex60(jdn + JDN_TO_INDEX60_OFFSET);
}

/** 直接由公曆日期取干支（不涉換日規則）。 */
export function ganzhiOfCivilDate(year: number, month: number, day: number): Ganzhi {
  return ganzhiFromIndex60(gregorianToJdn(year, month, day) + JDN_TO_INDEX60_OFFSET);
}
