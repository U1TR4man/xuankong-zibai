import { computeFullChart, type EngineOptions } from '../engine/flyingStar';
import { formatUtc8Date, formatUtc8Time } from '../engine/time/utc8';
import { asStarNumber, type StarNumber } from '../overlay/types';
import { iterateSearchCandidates, parseCandidateRange } from '../search/candidateIterator';
import { buildDirectionSnapshots } from './buildDirectionSnapshots';
import { buildPairHits } from './buildPairHits';
import { evaluateDirection } from './evaluateDirection';
import { PURPOSE_OPTIONS } from './purpose';
import { buildTemporalBranchContext } from './temporalRules';
import {
  PAIR_LAYERS, type DirectionSnapshot, type PairHit, type PairLayer, type SelectionPurpose,
} from './types';

export interface PairSearchQuery {
  version: 1;
  startDate: string;
  endDate: string;
  firstStar: StarNumber;
  secondStar: StarNumber;
  ordered: boolean;
  layers: PairLayer[];
  /** 有值時改為按用途 tags 搜尋；first／second 只保留表單草稿，不參與 matching。 */
  purpose?: SelectionPurpose;
}

export interface PairSearchMatch {
  startDateTime: string;
  endDateTime: string;
  snapshot: DirectionSnapshot;
  hit: PairHit;
  purposeContext?: {
    purpose: SelectionPurpose;
    purpleWhiteCount: number;
  };
}

const VALID_LAYERS = PAIR_LAYERS.map((layer) => layer.key);

function formatDateTime(date: Date): string {
  return `${formatUtc8Date(date)}T${formatUtc8Time(date)}`;
}

function validateQuery(query: PairSearchQuery): void {
  parseCandidateRange(query.startDate, query.endDate);
  asStarNumber(query.firstStar);
  asStarNumber(query.secondStar);
  if (query.layers.length === 0) throw new RangeError('請至少選擇一個 Pair Layer');
  if (new Set(query.layers).size !== query.layers.length) throw new RangeError('Pair Layer 不可重複');
  for (const layer of query.layers) {
    if (!VALID_LAYERS.includes(layer)) throw new RangeError(`無效 Pair Layer：${layer}`);
  }
  if (query.purpose && !PURPOSE_OPTIONS.some((purpose) => (
    purpose.value === query.purpose && purpose.value !== 'general'
  ))) throw new RangeError(`無效用途：${query.purpose}`);
}

function matchesPair(hit: PairHit, query: PairSearchQuery): boolean {
  if (!query.layers.includes(hit.layer)) return false;
  const direct = hit.firstStar === query.firstStar && hit.secondStar === query.secondStar;
  if (query.ordered || query.firstStar === query.secondStar) return direct;
  return direct || hit.firstStar === query.secondStar && hit.secondStar === query.firstStar;
}

export function searchPairOccurrences(
  query: PairSearchQuery,
  options: EngineOptions = {},
): PairSearchMatch[] {
  validateQuery(query);
  const matches: PairSearchMatch[] = [];
  for (const candidate of iterateSearchCandidates(
    query.startDate, query.endDate, 'hour', options.keStrategyId,
  )) {
    const chart = computeFullChart(candidate.start, options);
    const temporalContext = buildTemporalBranchContext(candidate.start, options);
    for (const snapshot of buildDirectionSnapshots(chart)) {
      const evaluation = query.purpose
        ? evaluateDirection(snapshot, temporalContext, query.purpose)
        : undefined;
      const hits = evaluation?.hits ?? buildPairHits(snapshot);
      for (const hit of hits) {
        const purposeMatch = evaluation?.purposeHits.includes(hit) ?? false;
        if (!query.layers.includes(hit.layer)) continue;
        if (query.purpose ? !purposeMatch : !matchesPair(hit, query)) continue;
        matches.push({
          startDateTime: formatDateTime(candidate.start),
          endDateTime: formatDateTime(candidate.end),
          snapshot,
          hit,
          purposeContext: query.purpose && evaluation ? {
            purpose: query.purpose,
            purpleWhiteCount: evaluation.purpleWhiteCount,
          } : undefined,
        });
      }
    }
  }
  if (query.purpose) {
    const sourceRank = { A: 5, 'A/B': 4, B: 3, 'B/C': 2, C: 1 } as const;
    matches.sort((a, b) => (
      sourceRank[b.hit.rule.sourceGrade] - sourceRank[a.hit.rule.sourceGrade]
      || (b.purposeContext?.purpleWhiteCount ?? 0) - (a.purposeContext?.purpleWhiteCount ?? 0)
      || a.startDateTime.localeCompare(b.startDateTime)
    ));
  }
  return matches;
}
