/**
 * FlyingStarEngine 匯總入口。
 *
 *   時間資料 → 規則 Engine → StarResult → 九宮 Rendering
 *
 * UI 只能消費 StarResult，嚴禁自行計算飛星（規劃書 §40）。
 */

import { computeYearStar, type YearBoundary } from './yearStar';
import { computeMonthStar } from './monthStar';
import { computeDayStar } from './dayStar';
import { computeHourStar } from './hourStar';
import { computeKeStar, type KeStarResult } from './keStar';
import { getKeStrategy } from './ke/registry';
import type { DayChangeMode } from '../time/ganzhiDay';
import type { StarResult } from './types';

export interface EngineOptions {
  dayChangeMode?: DayChangeMode;
  yearBoundary?: YearBoundary;
  keStrategyId?: string;
}

export interface FullChart {
  datetime: Date;
  year: StarResult;
  month: StarResult;
  day: StarResult;
  hour: StarResult;
  ke: KeStarResult;
}

/** 一次算出五層盤。各層彼此獨立，只有刻盤依賴時盤結果。 */
export function computeFullChart(d: Date, opts: EngineOptions = {}): FullChart {
  const dayMode = opts.dayChangeMode ?? 'midnight';
  const boundary = opts.yearBoundary ?? 'lichun';
  const strategy = getKeStrategy(opts.keStrategyId ?? 'ke8-15min');
  const hour = computeHourStar(d, dayMode);
  return {
    datetime: d,
    year: computeYearStar(d, boundary),
    month: computeMonthStar(d, boundary),
    day: computeDayStar(d, dayMode),
    hour,
    ke: computeKeStar(hour, d, strategy),
  };
}

export * from './types';
export * from './flyNineStars';
export { computeYearStar, getYearCenterStar, getYearGanzhi, getYuan } from './yearStar';
export { computeMonthStar, getMonthCenterStar, getFirstMonthStar } from './monthStar';
export { computeDayStar } from './dayStar';
export { computeHourStar, getHourCenterStar, ZISHI_START_STAR } from './hourStar';
export { computeKeStar, type KeStarResult } from './keStar';
export { getKeStrategy, KE_STRATEGIES, DEFAULT_KE_STRATEGY_ID } from './ke/registry';
export type { KeStarStrategy, KeInfo } from './ke/KeStarStrategy';
export type { YearBoundary } from './yearStar';
