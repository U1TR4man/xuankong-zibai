import type { FullChart } from '../engine/flyingStar';
import type { StarNumber } from '../overlay/types';
import { buildDirectionSnapshots } from './buildDirectionSnapshots';
import { buildPairHits } from './buildPairHits';
import { purposeHits } from './purpose';
import type {
  DirectionEvaluation, DirectionSnapshot, DirectionVerdict, PairHit, SelectionPurpose,
  SourceLevel,
} from './types';

const PURPLE_WHITE = new Set<StarNumber>([1, 6, 8, 9]);
const SOURCE_RANK: Record<SourceLevel, number> = { A: 3, B: 2, C: 1 };
const SOURCE_GRADE_RANK = { A: 5, 'A/B': 4, B: 3, 'B/C': 2, C: 1 } as const;
const VERDICT_RANK: Record<DirectionVerdict, number> = {
  priority: 5, usable: 4, mixed: 3, ordinary: 2, caution: 1,
};

function topHit(hits: readonly PairHit[]): PairHit {
  return [...hits].sort((a, b) => (
    SOURCE_GRADE_RANK[b.rule.sourceGrade] - SOURCE_GRADE_RANK[a.rule.sourceGrade]
    || Number(b.rule.reviewStatus !== 'pending') - Number(a.rule.reviewStatus !== 'pending')
  ))[0]!;
}

function highestSource(hits: readonly PairHit[]): SourceLevel {
  return hits.reduce<SourceLevel>((highest, hit) => (
    SOURCE_RANK[hit.rule.sourceLevel] > SOURCE_RANK[highest] ? hit.rule.sourceLevel : highest
  ), 'C');
}

function verdictFor(purpleWhiteCount: number): DirectionVerdict {
  return purpleWhiteCount >= 2 ? 'usable' : 'ordinary';
}

export function evaluateDirection(
  snapshot: DirectionSnapshot,
  purpose: SelectionPurpose = 'general',
): DirectionEvaluation {
  const hits = buildPairHits(snapshot);
  // 81 組只是雙星參考層，rankingWeight 固定為 0。
  const favorableHits: PairHit[] = [];
  const cautionHits: PairHit[] = [];
  const mixedHits: PairHit[] = [];
  const stars = [snapshot.yearStar, snapshot.monthStar, snapshot.dayStar, snapshot.hourStar];
  const purpleWhiteStars = stars.filter((star) => PURPLE_WHITE.has(star));
  const verdict = verdictFor(purpleWhiteStars.length);
  const matchedPurpose = purposeHits(hits, purpose);
  const reasons = [
    purpleWhiteStars.length > 0 ? `紫白集中：${purpleWhiteStars.join('、')}` : '未見紫白集中',
    '雙星 81 組只供參考，不參與方向排序',
  ].filter(Boolean);

  return {
    snapshot,
    hits,
    verdict,
    purpleWhiteCount: purpleWhiteStars.length,
    purpleWhiteStars,
    favorableHits,
    cautionHits,
    mixedHits,
    highestSourceLevel: highestSource(hits),
    purpose,
    purposeHits: matchedPurpose,
    topHit: topHit(hits),
    reasons,
  };
}

export function evaluateDirections(
  chart: FullChart,
  purpose: SelectionPurpose = 'general',
): DirectionEvaluation[] {
  return buildDirectionSnapshots(chart).map((snapshot) => evaluateDirection(snapshot, purpose));
}

export function rankDirections(evaluations: readonly DirectionEvaluation[]): DirectionEvaluation[] {
  return [...evaluations].sort((a, b) => (
    VERDICT_RANK[b.verdict] - VERDICT_RANK[a.verdict]
    || b.purpleWhiteCount - a.purpleWhiteCount
  ));
}
