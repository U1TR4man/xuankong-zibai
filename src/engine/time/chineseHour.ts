/**
 * 時辰判定（規劃書 §15）。
 *
 * 子 23:00–00:59, 丑 01:00–02:59, … 亥 21:00–22:59。
 * 注意：本檔只決定「時支」，與 ganzhiDay 的換日規則完全分離。
 */

import { BRANCHES, type Branch } from './ganzhi';
import { fromUtc8, toUtc8Parts, formatUtc8Time } from './utc8';

export interface ChineseHour {
  /** 0 = 子 … 11 = 亥 */
  branchIndex: number;
  branch: Branch;
  /** 該時辰起點（含），時間點 */
  start: Date;
  /** 該時辰終點（不含），時間點 */
  end: Date;
  /** 例：'11:00–12:59' */
  rangeLabel: string;
  name: string;
}

/** 時支索引：子時橫跨 23:00–00:59。 */
export function hourBranchIndex(hour24: number): number {
  return Math.floor(((hour24 + 1) % 24) / 2);
}

/** 該時支的起始鐘點（子=23，丑=1 …）。 */
export function hourBranchStartClock(branchIndex: number): number {
  return (branchIndex * 2 + 23) % 24;
}

export function getChineseHour(d: Date): ChineseHour {
  const p = toUtc8Parts(d);
  const bi = hourBranchIndex(p.hour);
  const startClock = hourBranchStartClock(bi);
  // 子時起點若為 23:00 而現在是 00:xx，起點屬於前一天
  const dayShift = bi === 0 && p.hour < 23 ? -1 : 0;
  const start = fromUtc8(p.year, p.month, p.day + dayShift, startClock, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return {
    branchIndex: bi,
    branch: BRANCHES[bi]!,
    start,
    end,
    rangeLabel: `${formatUtc8Time(start)}–${formatUtc8Time(new Date(end.getTime() - 60_000))}`,
    name: BRANCHES[bi]! + '時',
  };
}

/** 取得同一天序列中相鄰的時辰（用於「← 巳時 / 未時 →」導航）。 */
export function shiftChineseHour(d: Date, delta: number): Date {
  const h = getChineseHour(d);
  const offsetInHour = d.getTime() - h.start.getTime();
  return new Date(h.start.getTime() + delta * 2 * 60 * 60 * 1000 + offsetInHour);
}
