/**
 * Search 是正式飛星 Engine 的消費者，不是第二套 Engine。
 * 「尋找離宮 9 紫」只比對指定層級的 li 宮格值，絕不比對入中星或洛書數。
 */

import { computeFullChart, type EngineOptions } from '../engine/flyingStar';
import { PALACE_KEYS } from '../engine/flyingStar/types';
import { formatUtc8Date, formatUtc8Time } from '../engine/time/utc8';
import { buildPalaceOverlay, findPalaceOverlay } from '../overlay/buildPalaceOverlay';
import { asStarNumber, overlayLevelsThrough, type PalaceLayerStars } from '../overlay/types';
import { iterateSearchCandidates, parseCandidateRange } from './candidateIterator';
import { matchesConditions } from './matchQuery';
import type { SearchCondition, SearchLevel, SearchMatch, StarSearchQuery } from './types';

const SEARCH_LEVELS: readonly SearchLevel[] = ['day', 'hour', 'ke'];

function precisionFor(conditions: readonly SearchCondition[]): SearchLevel {
  return conditions.reduce<SearchLevel>((highest, condition) => (
    SEARCH_LEVELS.indexOf(condition.level) > SEARCH_LEVELS.indexOf(highest)
      ? condition.level
      : highest
  ), 'day');
}

function validateQuery(query: StarSearchQuery): void {
  parseCandidateRange(query.startDate, query.endDate);
  if (!PALACE_KEYS.includes(query.palace)) throw new RangeError(`無效宮位：${query.palace}`);
  if (query.conditions.length === 0) throw new RangeError('至少需要一個搜尋條件');
  const seen = new Set<SearchLevel>();
  for (const condition of query.conditions) {
    if (!SEARCH_LEVELS.includes(condition.level)) throw new RangeError(`無效搜尋層級：${condition.level}`);
    if (seen.has(condition.level)) throw new RangeError(`同一層級不可重複：${condition.level}`);
    seen.add(condition.level);
    if (condition.stars.length === 0) throw new RangeError(`${condition.level} 至少需要一顆星`);
    for (const star of condition.stars) asStarNumber(star);
  }
}

function formatDateTime(date: Date): string {
  return `${formatUtc8Date(date)}T${formatUtc8Time(date)}`;
}

function selectLayers(
  stars: PalaceLayerStars,
  precision: SearchLevel,
): Partial<PalaceLayerStars> {
  return Object.fromEntries(
    overlayLevelsThrough(precision).map((level) => [level, stars[level]]),
  ) as Partial<PalaceLayerStars>;
}

export function searchStars(
  query: StarSearchQuery,
  options: EngineOptions = {},
): SearchMatch[] {
  validateQuery(query);
  const precision = precisionFor(query.conditions);
  const matches: SearchMatch[] = [];

  for (const candidate of iterateSearchCandidates(
    query.startDate, query.endDate, precision, options.keStrategyId,
  )) {
    const chart = computeFullChart(candidate.start, options);
    const overlay = buildPalaceOverlay(chart);
    const palace = findPalaceOverlay(overlay, query.palace);
    if (!matchesConditions(palace.stars, query.conditions)) continue;

    matches.push({
      startDateTime: formatDateTime(candidate.start),
      endDateTime: formatDateTime(candidate.end),
      palace: query.palace,
      precision,
      palaceStars: selectLayers(palace.stars, precision),
      matchedConditions: query.conditions.map((condition) => ({
        level: condition.level,
        stars: [...condition.stars],
      })),
      chartContext: selectLayers(overlay.centerStars, precision),
    });
  }

  return matches;
}
