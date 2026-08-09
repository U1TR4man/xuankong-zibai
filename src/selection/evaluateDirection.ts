import type { EngineOptions, FullChart } from '../engine/flyingStar';
import { buildDirectionSnapshots } from './buildDirectionSnapshots';
import { buildPairHits } from './buildPairHits';
import { purposeHits } from './purpose';
import { PURPLE_WHITE_SIGNAL_LABEL, PURPLE_WHITE_STARS } from './researchEvidence';
import { assessTemporalStar, buildTemporalBranchContext } from './temporalRules';
import type {
  DirectionEvaluation, DirectionLevel, DirectionSnapshot, DirectionTemporalProfile,
  DirectionVerdict, PairHit, PurpleWhiteCount, PurpleWhiteSignal, SelectionPurpose, SourceLevel,
  TemporalBranchContext,
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

export function purpleWhiteSignalFor(count: PurpleWhiteCount): PurpleWhiteSignal {
  if (count === 0) return 'none';
  if (count === 1) return 'single_arrival';
  if (count === 2) return 'two_coarrival';
  if (count === 3) return 'three_concentration';
  return 'four_coarrival';
}

export function buildDirectionTemporalProfile(
  snapshot: DirectionSnapshot,
  context: TemporalBranchContext,
): DirectionTemporalProfile {
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
  const starStates = layerStars.map(({ level, star }) => (
    assessTemporalStar(level, star, snapshot.palace, context)
  ));
  const killerHits = starStates
    .filter((state) => state.palaceKillers.length > 0)
    .map((state) => ({
      level: state.level, star: state.star, killers: state.palaceKillers,
    }));
  const yellowBlackLayers = starStates
    .filter((state) => state.star === 2 || state.star === 5)
    .map((state) => state.level);
  const hasTwo = starStates.some((state) => state.star === 2);
  const hasFive = starStates.some((state) => state.star === 5);
  return {
    direction: snapshot.direction,
    purpleWhiteHits,
    purpleWhiteCount,
    purpleWhiteSignal: purpleWhiteSignalFor(purpleWhiteCount),
    starStates,
    whiteKillerAssessment: {
      status: killerHits.length > 0 ? 'present' : 'clear',
      hits: killerHits,
      note: '依星與固定宮位判定；刑宮、害宮及四空亡尚未納入。',
    },
    yellowBlackLayers,
    yellowBlackThriving: hasTwo && hasFive
      && starStates.filter((state) => state.star === 2 || state.star === 5)
        .every((state) => state.seasonalState === 'command'),
  };
}

function verdictFor(profile: DirectionTemporalProfile): DirectionVerdict {
  const purpleWhiteStates = profile.starStates.filter((state) => state.isPurpleWhite);
  const purpleWhiteInTombOrAbsolute = purpleWhiteStates.some((state) => (
    state.temporalState.liuJieTomb || state.temporalState.absolute
  ));
  const hasMultiplePalaceKillers = profile.starStates.some((state) => (
    state.palaceKillers.length >= 2
  ));
  if (profile.yellowBlackThriving || hasMultiplePalaceKillers || purpleWhiteInTombOrAbsolute) {
    return 'caution';
  }

  const hasAnyCondition = profile.starStates.some((state) => (
    state.palaceKillers.length > 0
    || state.temporalState.liuJieTomb
    || state.temporalState.absolute
  ));
  if (profile.purpleWhiteCount >= 2 && hasAnyCondition) return 'mixed';

  const hasActivePurpleWhite = purpleWhiteStates.some((state) => (
    state.temporalState.branchQi === 'active'
  ));
  if (profile.purpleWhiteCount >= 2 && hasActivePurpleWhite) return 'priority';
  if (profile.purpleWhiteCount >= 1) return 'usable';
  return 'ordinary';
}

export function evaluateDirection(
  snapshot: DirectionSnapshot,
  context: TemporalBranchContext,
  purpose: SelectionPurpose = 'general',
): DirectionEvaluation {
  const hits = buildPairHits(snapshot);
  // 81 組只是雙星參考層，rankingWeight 固定為 0。
  const favorableHits: PairHit[] = [];
  const cautionHits: PairHit[] = [];
  const mixedHits: PairHit[] = [];
  const profile = buildDirectionTemporalProfile(snapshot, context);
  const starsByLevel = new Map(profile.starStates.map((state) => [state.level, state.star]));
  const purpleWhiteStars = profile.purpleWhiteHits.map((level) => starsByLevel.get(level)!);
  const verdict = verdictFor(profile);
  const matchedPurpose = purposeHits(hits, purpose);
  const activePurpleWhite = profile.starStates.filter((state) => (
    state.isPurpleWhite && state.temporalState.branchQi === 'active'
  ));
  const tombCount = profile.starStates.filter((state) => state.temporalState.liuJieTomb).length;
  const absoluteCount = profile.starStates.filter((state) => state.temporalState.absolute).length;
  const reasons = [
    `${PURPLE_WHITE_SIGNAL_LABEL[profile.purpleWhiteSignal]}：${profile.purpleWhiteCount}/4`,
    `支序有氣：${activePurpleWhite.length} 層`,
    `白中殺：${profile.whiteKillerAssessment.hits.length > 0
      ? `${profile.whiteKillerAssessment.hits.length} 層命中` : '未命中'}`,
    tombCount > 0 ? `入墓：${tombCount} 層` : '',
    absoluteCount > 0 ? `臨絕：${absoluteCount} 層` : '',
    profile.yellowBlackLayers.length >= 2
      ? `二黑、五黃同到${profile.yellowBlackThriving ? '且月令值旺' : ''}` : '',
    '月令旺相休囚只作條件顯示，不換算固定分數',
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
  options: Pick<EngineOptions, 'dayChangeMode' | 'yearBoundary'> = {},
): DirectionEvaluation[] {
  const context = buildTemporalBranchContext(chart.datetime, options);
  return buildDirectionSnapshots(chart).map((snapshot) => evaluateDirection(snapshot, context, purpose));
}

export function rankDirections(evaluations: readonly DirectionEvaluation[]): DirectionEvaluation[] {
  return [...evaluations].sort((a, b) => (
    VERDICT_RANK[b.verdict] - VERDICT_RANK[a.verdict]
    || b.purpleWhiteCount - a.purpleWhiteCount
  ));
}
