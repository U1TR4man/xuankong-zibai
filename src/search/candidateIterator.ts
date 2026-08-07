/** UTC+8 deterministic 候選時間枚舉；不含任何飛星規則。 */

import { getKeStrategy } from '../engine/flyingStar/ke/registry';
import { addDays, formatUtc8Date, fromUtc8, parseUtc8, toUtc8Parts } from '../engine/time/utc8';
import type { SearchCandidate, SearchLevel } from './types';

const HOUR_STARTS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] as const;

function parseDateOnly(value: string): Date {
  const parsed = parseUtc8(value);
  if (!parsed || formatUtc8Date(parsed) !== value) throw new RangeError(`無效日期：${value}`);
  return parsed;
}

export interface CandidateRange {
  start: Date;
  endInclusive: Date;
}

export function parseCandidateRange(startDate: string, endDate: string): CandidateRange {
  const start = parseDateOnly(startDate);
  const endInclusive = parseDateOnly(endDate);
  if (start.getTime() > endInclusive.getTime()) throw new RangeError('開始日期不可晚於結束日期');
  return { start, endInclusive };
}

export function* iterateSearchCandidates(
  startDate: string,
  endDate: string,
  precision: SearchLevel,
  keStrategyId = 'ke8-15min',
): Generator<SearchCandidate> {
  const { start, endInclusive } = parseCandidateRange(startDate, endDate);
  const strategy = getKeStrategy(keStrategyId);

  for (let day = start; day.getTime() <= endInclusive.getTime(); day = addDays(day, 1)) {
    const p = toUtc8Parts(day);
    if (precision === 'day') {
      const candidate = fromUtc8(p.year, p.month, p.day, 12, 0);
      yield { start: candidate, end: addDays(candidate, 1) };
      continue;
    }

    for (const hour of HOUR_STARTS) {
      const hourStart = fromUtc8(p.year, p.month, p.day, hour, 0);
      if (precision === 'hour') {
        yield { start: hourStart, end: new Date(hourStart.getTime() + 2 * 60 * 60 * 1000) };
        continue;
      }

      for (const ke of strategy.listKe(hourStart)) {
        yield { start: ke.start, end: ke.end };
      }
    }
  }
}
