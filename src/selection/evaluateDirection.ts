import type { FullChart } from '../engine/flyingStar';
import { buildDirectionSnapshots } from './buildDirectionSnapshots';
import { buildPairHits } from './buildPairHits';
import { purposeHits } from './purpose';
import { PURPLE_WHITE_SIGNAL_LABEL, PURPLE_WHITE_STARS } from './researchEvidence';
import type {
  DirectionEvaluation, DirectionLevel, DirectionSnapshot, DirectionTemporalProfile,
  DirectionVerdict, PairHit, PurpleWhiteCount, PurpleWhiteSignal, SelectionPurpose, SourceLevel,
} from './types';

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

export function purpleWhiteSignalFor(count: PurpleWhiteCount): PurpleWhiteSignal {
  if (count === 0) return 'none';
  if (count === 1) return 'single_arrival';
  if (count === 2) return 'two_coarrival';
  if (count === 3) return 'three_concentration';
  return 'four_coarrival';
}

function temporalProfile(snapshot: DirectionSnapshot): DirectionTemporalProfile {
  const layerStars: readonly { level: DirectionLevel; star: DirectionSnapshot[`${DirectionLevel}Star`] }[] = [
    { level: 'year', star: snapshot.yearStar },
    { level: 'month', star: snapshot.monthStar },
    { level: 'day', star: snapshot.dayStar },
    { level: 'hour', star: snapshot.hourStar },
  ];
  const purpleWhiteHits = layerStars
    .filter(({ star }) => PURPLE_WHITE_STARS.has(star))
    .map(({ level }) => level);
  const purpleWhiteCount = purpleWhiteHits.length as PurpleWhiteCount;
  return {
    direction: snapshot.direction,
    purpleWhiteHits,
    purpleWhiteCount,
    purpleWhiteSignal: purpleWhiteSignalFor(purpleWhiteCount),
    starStates: layerStars.map(({ level, star }) => ({
      level, star, qi: 'unknown', phase: 'unknown', tomb: 'unknown', absolute: 'unknown',
    })),
    whiteKillerAssessment: {
      status: 'unknown',
      killers: [],
      note: '白中殺原圖／表格及時間套用方法尚待核對，不以「無」代替未知。',
    },
  };
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
  const profile = temporalProfile(snapshot);
  const starsByLevel = new Map(profile.starStates.map((state) => [state.level, state.star]));
  const purpleWhiteStars = profile.purpleWhiteHits.map((level) => starsByLevel.get(level)!);
  const verdict = verdictFor(profile.purpleWhiteCount);
  const matchedPurpose = purposeHits(hits, purpose);
  const reasons = [
    `${PURPLE_WHITE_SIGNAL_LABEL[profile.purpleWhiteSignal]}：${profile.purpleWhiteCount}/4`,
    '有氣、墓絕與白中殺尚未完成可重跑判定，不作加減分',
    '雙星 81 組只供參考，不參與方向排序',
  ].filter(Boolean);

  return {
    snapshot,
    temporalProfile: profile,
    hits,
    verdict,
    purpleWhiteCount: profile.purpleWhiteCount,
    purpleWhiteHits: profile.purpleWhiteHits,
    purpleWhiteSignal: profile.purpleWhiteSignal,
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
