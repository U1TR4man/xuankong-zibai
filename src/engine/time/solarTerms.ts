/**
 * SolarTermEngine — 全 App 唯一的節氣來源。
 *
 * 1900–2100 走預先產生的精確表（tools/gen-solarterms.py，定氣法，
 * 已與 寿星天文历 全表比對：最大差 28 秒）。
 * 表外年份自動退回 solarTermsAlgo.ts 的演算法（誤差約 ±2 分鐘），
 * 並在回傳值標記 source='algorithm'。
 *
 * 所有時刻都是「精確到秒的時間點」，任何判斷都必須比較時間點，
 * 不可只比日期（規劃書 §11）。
 */

import {
  SOLAR_TERM_SECONDS,
  TABLE_FIRST_YEAR,
  TABLE_LAST_YEAR,
  TERM_ORDER_IN_YEAR,
} from '../../data/solarTerms.data';
import { fromUtc8, toUtc8Parts } from './utc8';
import { dateToJdUt, jdUtToDate, solveTermJdUt } from './solarTermsAlgo';

export type SolarTermName = (typeof TERM_ORDER_IN_YEAR)[number];

export interface SolarTerm {
  /** 節氣名，如 '立秋' */
  name: SolarTermName;
  /** 0–23，該公曆年內的順序（0 = 小寒） */
  indexInYear: number;
  /** 太陽視黃經（度） */
  longitude: number;
  /** 精確時刻（時間點，以 UTC+8 解讀） */
  date: Date;
  /** 該時刻所屬的公曆年（UTC+8） */
  year: number;
  /** 是「節」(true) 還是「氣」(false)。節分月。 */
  isJie: boolean;
  source: 'table' | 'algorithm';
}

/** 節氣在該年內的近似 day-of-year，供演算法路徑做初始猜測。 */
const APPROX_DOY = [
  5, 20, 35, 50, 65, 80, 95, 110, 125, 141, 157, 172,
  188, 204, 219, 235, 250, 266, 281, 296, 311, 326, 341, 356,
];

const cache = new Map<number, SolarTerm[]>();

function longitudeOf(indexInYear: number): number {
  return (285 + indexInYear * 15) % 360;
}

/** 取得某公曆年（UTC+8）的 24 節氣，依時間排序（0 = 小寒 … 23 = 冬至）。 */
export function getSolarTerms(year: number): SolarTerm[] {
  const hit = cache.get(year);
  if (hit) return hit;

  let out: SolarTerm[];
  if (year >= TABLE_FIRST_YEAR && year <= TABLE_LAST_YEAR) {
    const row = SOLAR_TERM_SECONDS[year - TABLE_FIRST_YEAR]!;
    const base = fromUtc8(year, 1, 1, 0, 0, 0).getTime();
    out = row.map((secs, i) => ({
      name: TERM_ORDER_IN_YEAR[i]!,
      indexInYear: i,
      longitude: longitudeOf(i),
      date: new Date(base + secs * 1000),
      year,
      isJie: i % 2 === 0,
      source: 'table' as const,
    }));
  } else {
    out = TERM_ORDER_IN_YEAR.map((name, i) => {
      const guess = dateToJdUt(fromUtc8(year, 1, 1, 0, 0, 0)) + APPROX_DOY[i]! - 1;
      const jd = solveTermJdUt(longitudeOf(i), guess);
      return {
        name,
        indexInYear: i,
        longitude: longitudeOf(i),
        date: jdUtToDate(jd),
        year,
        isJie: i % 2 === 0,
        source: 'algorithm' as const,
      };
    });
  }
  cache.set(year, out);
  return out;
}

/** 涵蓋 d 前後的節氣序列（前一年 + 當年 + 下一年），已排序。 */
function termsAround(d: Date): SolarTerm[] {
  const y = toUtc8Parts(d).year;
  return [...getSolarTerms(y - 1), ...getSolarTerms(y), ...getSolarTerms(y + 1)];
}

/** 目前所在的節氣（最後一個 <= d 的節氣）。 */
export function getCurrentSolarTerm(d: Date): SolarTerm {
  const all = termsAround(d);
  let last = all[0]!;
  for (const t of all) {
    if (t.date.getTime() <= d.getTime()) last = t;
    else break;
  }
  return last;
}

/** 下一個節氣。 */
export function getNextSolarTerm(d: Date): SolarTerm {
  const all = termsAround(d);
  for (const t of all) if (t.date.getTime() > d.getTime()) return t;
  return all[all.length - 1]!;
}

/** 最後一個 <= d 且名稱在 names 內的節氣。 */
export function lastTermOf(d: Date, names: readonly SolarTermName[]): SolarTerm {
  const all = termsAround(d);
  let last: SolarTerm | null = null;
  for (const t of all) {
    if (t.date.getTime() > d.getTime()) break;
    if (names.includes(t.name)) last = t;
  }
  if (!last) throw new Error('solar term not found before ' + d.toISOString());
  return last;
}

/** 下一個名稱在 names 內的節氣。 */
export function nextTermOf(d: Date, names: readonly SolarTermName[]): SolarTerm {
  const all = termsAround(d);
  for (const t of all) {
    if (t.date.getTime() > d.getTime() && names.includes(t.name)) return t;
  }
  throw new Error('solar term not found after ' + d.toISOString());
}

/* ------------------------------------------------------------------ */
/* 日紫白六段（規劃書 §10）                                            */
/* ------------------------------------------------------------------ */

export const DAY_SEGMENT_BOUNDARIES = ['冬至', '雨水', '穀雨', '夏至', '處暑', '霜降'] as const;

export interface DaySegment {
  /** 起始節氣名 */
  from: SolarTermName;
  /** 結束節氣名（下一段的起點） */
  to: SolarTermName;
  start: Date;
  end: Date;
  /** 該段甲子日的入中星 */
  jiaziStar: number;
  direction: 'forward' | 'reverse';
  label: string;
}

const SEGMENT_RULES: Record<string, { to: SolarTermName; star: number; dir: 'forward' | 'reverse' }> = {
  冬至: { to: '雨水', star: 1, dir: 'forward' },
  雨水: { to: '穀雨', star: 7, dir: 'forward' },
  穀雨: { to: '夏至', star: 4, dir: 'forward' },
  夏至: { to: '處暑', star: 9, dir: 'reverse' },
  處暑: { to: '霜降', star: 3, dir: 'reverse' },
  霜降: { to: '冬至', star: 6, dir: 'reverse' },
};

/** 判斷 d 屬於日紫白六段中的哪一段。 */
export function getDayStarSegment(d: Date): DaySegment {
  const start = lastTermOf(d, DAY_SEGMENT_BOUNDARIES);
  const rule = SEGMENT_RULES[start.name]!;
  const end = nextTermOf(d, [rule.to]);
  return {
    from: start.name,
    to: rule.to,
    start: start.date,
    end: end.date,
    jiaziStar: rule.star,
    direction: rule.dir,
    label: `${start.name}→${rule.to}`,
  };
}

/* ------------------------------------------------------------------ */
/* 陰陽遁（時紫白用，規劃書 §13）                                       */
/* ------------------------------------------------------------------ */

export interface YinYangPeriod {
  /** 'yang' = 冬至後至夏至前（順）；'yin' = 夏至後至冬至前（逆） */
  kind: 'yang' | 'yin';
  direction: 'forward' | 'reverse';
  start: Date;
  end: Date;
  label: string;
}

export function getYinYangPeriod(d: Date): YinYangPeriod {
  const start = lastTermOf(d, ['冬至', '夏至']);
  const isYang = start.name === '冬至';
  const end = nextTermOf(d, [isYang ? '夏至' : '冬至']);
  return {
    kind: isYang ? 'yang' : 'yin',
    direction: isYang ? 'forward' : 'reverse',
    start: start.date,
    end: end.date,
    label: isYang ? '冬至後（陽遁·順）' : '夏至後（陰遁·逆）',
  };
}

/* ------------------------------------------------------------------ */
/* 節氣月（流月用，規劃書 §9）                                          */
/* ------------------------------------------------------------------ */

/** 12 節與其所開啟的月建地支索引（0=子, 1=丑 … 11=亥）。 */
const JIE_TO_BRANCH: Record<string, number> = {
  小寒: 1, 立春: 2, 驚蟄: 3, 清明: 4, 立夏: 5, 芒種: 6,
  小暑: 7, 立秋: 8, 白露: 9, 寒露: 10, 立冬: 11, 大雪: 0,
};
const ALL_JIE = Object.keys(JIE_TO_BRANCH) as SolarTermName[];

export interface SolarMonth {
  /** 月建地支索引，0=子 … 11=亥 */
  branchIndex: number;
  /** 紫白用月序：1 = 正月(寅月) … 12 = 十二月(丑月) */
  monthNumber: number;
  /** 開啟本月的節 */
  startTerm: SolarTerm;
  start: Date;
  end: Date;
}

/** 依節氣（不是公曆月份）判斷所在月建。 */
export function getSolarMonthByJieqi(d: Date): SolarMonth {
  const startTerm = lastTermOf(d, ALL_JIE);
  const branchIndex = JIE_TO_BRANCH[startTerm.name]!;
  const end = nextTermOf(d, ALL_JIE);
  return {
    branchIndex,
    monthNumber: ((branchIndex - 2 + 12) % 12) + 1,
    startTerm,
    start: startTerm.date,
    end: end.date,
  };
}

/** 以立春為界的干支年年份（流年 / 流月都用它）。 */
export function getSolarYearByLichun(d: Date): number {
  const start = lastTermOf(d, ['立春']);
  return toUtc8Parts(start.date).year;
}
