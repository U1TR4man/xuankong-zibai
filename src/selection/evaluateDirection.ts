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
const POLARITY_RANK = { caution: 4, favorable: 3, mixed: 2, neutral: 1 } as const;
const VERDICT_RANK: Record<DirectionVerdict, number> = {
  priority: 5, usable: 4, mixed: 3, ordinary: 2, caution: 1,
};

function appliesDirectly(hit: PairHit): boolean {
  const applicability = hit.rule.applicability;
  return applicability.temporalSelection === 'direct'
    && !applicability.requiresPalaceContext
    && !applicability.requiresProsperityContext;
}

function topHit(hits: readonly PairHit[]): PairHit {
  return [...hits].sort((a, b) => (
    POLARITY_RANK[b.rule.polarity] - POLARITY_RANK[a.rule.polarity]
    || SOURCE_RANK[b.rule.sourceLevel] - SOURCE_RANK[a.rule.sourceLevel]
    || Number(b.rule.reviewStatus !== 'pending') - Number(a.rule.reviewStatus !== 'pending')
  ))[0]!;
}

function highestSource(hits: readonly PairHit[]): SourceLevel {
  return hits.reduce<SourceLevel>((highest, hit) => (
    SOURCE_RANK[hit.rule.sourceLevel] > SOURCE_RANK[highest] ? hit.rule.sourceLevel : highest
  ), 'C');
}

function verdictFor(
  favorable: readonly PairHit[], caution: readonly PairHit[],
  purpleWhiteCount: number,
): DirectionVerdict {
  if (caution.some((hit) => hit.rule.priority === 'high')) return 'caution';
  if (favorable.length > 0 && caution.length > 0) return 'mixed';
  const strongFavorable = favorable.some((hit) => hit.rule.sourceLevel === 'A'
    || hit.rule.sourceLevel === 'B');
  if (strongFavorable && caution.length === 0 && purpleWhiteCount >= 2) return 'priority';
  if ((favorable.length > 0 || purpleWhiteCount >= 2) && caution.length === 0) return 'usable';
  return 'ordinary';
}

export function evaluateDirection(
  snapshot: DirectionSnapshot,
  purpose: SelectionPurpose = 'general',
): DirectionEvaluation {
  const hits = buildPairHits(snapshot);
  const directHits = hits.filter(appliesDirectly);
  const favorableHits = directHits.filter((hit) => hit.rule.polarity === 'favorable');
  const cautionHits = directHits.filter((hit) => hit.rule.polarity === 'caution');
  const mixedHits = directHits.filter((hit) => hit.rule.polarity === 'mixed');
  const stars = [snapshot.yearStar, snapshot.monthStar, snapshot.dayStar, snapshot.hourStar];
  const purpleWhiteStars = stars.filter((star) => PURPLE_WHITE.has(star));
  const verdict = verdictFor(favorableHits, cautionHits, purpleWhiteStars.length);
  const matchedPurpose = purposeHits(hits, purpose);
  const reasons = [
    ...favorableHits.map((hit) => `${hit.pair} ${hit.rule.title}｜${hit.rule.shortMeaning}`),
    ...cautionHits.map((hit) => `${hit.pair} ${hit.rule.title}｜${hit.rule.shortMeaning}`),
    purpleWhiteStars.length > 0 ? `紫白集中：${purpleWhiteStars.join('、')}` : '未見紫白集中',
    cautionHits.length === 0 ? '未命中目前已校對的主要警示組合' : '',
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
    || b.purposeHits.length - a.purposeHits.length
    || b.favorableHits.filter((hit) => hit.rule.sourceLevel === 'A').length
      - a.favorableHits.filter((hit) => hit.rule.sourceLevel === 'A').length
    || b.favorableHits.filter((hit) => hit.rule.sourceLevel === 'B').length
      - a.favorableHits.filter((hit) => hit.rule.sourceLevel === 'B').length
    || b.purpleWhiteCount - a.purpleWhiteCount
  ));
}
