import type { EngineOptions, FullChart } from '../engine/flyingStar';
import { buildDirectionSnapshots } from './buildDirectionSnapshots';
import { buildPairHits } from './buildPairHits';
import { purposeHits } from './purpose';
import { PURPLE_WHITE_SIGNAL_LABEL, PURPLE_WHITE_STARS } from './researchEvidence';
import {
  assessGenericWhiteKillerAnJian, assessTemporalStar, buildMonthlyCenterStarState,
  buildTemporalBranchContext, buildTimeGateAssessment, computeDaYueJian,
} from './temporalRules';
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
  if (count === 3) return 'three_coarrival';
  return 'all_four_coarrival';
}

export function buildDirectionTemporalProfile(
  snapshot: DirectionSnapshot,
  context: TemporalBranchContext,
): DirectionTemporalProfile {
  const layerStars: readonly {
    level: DirectionLevel;
    star: DirectionSnapshot[`${DirectionLevel}Star`];
    centerStar: DirectionSnapshot[`${DirectionLevel}CenterStar`];
  }[] = [
    { level: 'year', star: snapshot.yearStar, centerStar: snapshot.yearCenterStar },
    { level: 'month', star: snapshot.monthStar, centerStar: snapshot.monthCenterStar },
    { level: 'day', star: snapshot.dayStar, centerStar: snapshot.dayCenterStar },
    { level: 'hour', star: snapshot.hourStar, centerStar: snapshot.hourCenterStar },
  ];
  const purpleWhiteHits = layerStars
    .filter(({ star }) => PURPLE_WHITE_STARS.has(star))
    .map(({ level }) => level);
  const purpleWhiteCount = purpleWhiteHits.length as PurpleWhiteCount;
  const starStates = layerStars.map(({ level, star }) => (
    assessTemporalStar(level, star, snapshot.palace, context)
  ));
  const genericWhiteKiller = Object.fromEntries(layerStars.map(({ level, centerStar }) => [
    level,
    assessGenericWhiteKillerAnJian(level, centerStar, snapshot.palace),
  ])) as DirectionTemporalProfile['anJian']['genericWhiteKiller'];
  for (const assessment of Object.values(genericWhiteKiller)) {
    if (!assessment.active) continue;
    const state = starStates.find((item) => item.level === assessment.level)!;
    state.palaceKillers = ['an_jian', ...state.palaceKillers];
  }
  const qualifiedPurpleWhiteHits = starStates.filter((state) => (
    state.isPurpleWhite
    && !state.temporalState.liuJieTomb
    && !state.temporalState.absolute
    && (state.whiteKillerRule.rankingUse !== 'active' || state.palaceKillers.length === 0)
  )).map((state) => state.level);
  const qualifiedPurpleWhiteCount = qualifiedPurpleWhiteHits.length as PurpleWhiteCount;
  const killerHits = starStates
    .filter((state) => state.palaceKillers.length > 0)
    .map((state) => ({
      level: state.level,
      star: state.star,
      killers: state.palaceKillers,
      evidence: state.whiteKillerRule.layerEvidence[state.level]!,
      rankingUse: state.whiteKillerRule.rankingUse,
    }));
  const activeKillerHits = killerHits.filter((hit) => hit.rankingUse === 'active');
  const referenceKillerHits = killerHits.filter((hit) => hit.rankingUse === 'reference_only');
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
    allFourPurpleWhite: purpleWhiteCount === 4,
    qualifiedPurpleWhiteHits,
    qualifiedPurpleWhiteCount,
    starStates,
    timeGate: buildTimeGateAssessment(context),
    anJian: {
      genericWhiteKiller,
      daYueJian: computeDaYueJian(
        snapshot.monthCenterStar, context.pillars.month, snapshot.palace,
      ),
    },
    monthlyCenterStarState: buildMonthlyCenterStarState(
      snapshot.monthCenterStar, context.pillars.month,
    ),
    whiteKillerAssessment: {
      status: killerHits.length > 0 ? 'present' : 'clear',
      hits: killerHits,
      activeHits: activeKillerHits,
      referenceHits: referenceKillerHits,
      note: '年、月白中殺正式參與判定；日、時只作類比參考。一般宮星五行生剋另列。',
    },
    yellowBlackLayers,
    yellowBlackThriving: hasTwo && hasFive
      && starStates.filter((state) => state.star === 2 || state.star === 5)
        .every((state) => state.seasonalState === 'command'),
  };
}

function verdictFor(profile: DirectionTemporalProfile): DirectionVerdict {
  const killerCount = profile.whiteKillerAssessment.activeHits.reduce((count, hit) => (
    count + hit.killers.length
  ), 0);
  const hasTemporalWarning = profile.starStates.some((state) => (
    state.temporalState.qiRankingUse !== 'reference_only' && (
      state.temporalState.liuJieTomb || state.temporalState.absolute
    )
  ));
  const hasAnyWarning = profile.starStates.some((state) => (
    (state.whiteKillerRule.rankingUse === 'active' && state.palaceKillers.length > 0)
    || (state.temporalState.qiRankingUse !== 'reference_only' && (
      state.temporalState.liuJieTomb || state.temporalState.absolute
    ))
  )) || profile.yellowBlackLayers.length >= 2;
  const hasQualifiedPrimary = profile.qualifiedPurpleWhiteHits.some((level) => (
    level === 'month' || level === 'day'
  ));
  const hasSupportedPrimary = profile.starStates.some((state) => (
    (state.level === 'month' || state.level === 'day')
    && profile.qualifiedPurpleWhiteHits.includes(state.level)
    && state.temporalState.branchQi === 'active'
    && (state.temporalState.qiRankingUse === 'active'
      || state.temporalState.qiRankingUse === 'active_secondary')
  ));
  const daYueJianHit = profile.anJian.daYueJian.hitsThisDirection;
  const hasOtherActiveKiller = profile.whiteKillerAssessment.activeHits.some((hit) => (
    hit.killers.some((killer) => killer !== 'an_jian')
  ));
  const daYueJianCompoundWarning = daYueJianHit && (
    profile.yellowBlackLayers.length > 0 || hasOtherActiveKiller || hasTemporalWarning
  );

  if (daYueJianCompoundWarning) return 'caution';
  if (profile.yellowBlackLayers.length >= 2) return 'caution';
  if (!hasQualifiedPrimary && killerCount >= 2) return 'caution';
  if (profile.purpleWhiteCount > 0 && hasAnyWarning) return 'mixed';
  if (hasQualifiedPrimary && !hasAnyWarning) {
    return hasSupportedPrimary ? 'priority' : 'usable';
  }
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
    state.isPurpleWhite
    && state.temporalState.qiRankingUse === 'active'
    && state.temporalState.branchQi === 'active'
  ));
  const secondaryPurpleWhite = profile.starStates.filter((state) => (
    state.isPurpleWhite
    && state.temporalState.qiRankingUse === 'active_secondary'
    && state.temporalState.branchQi === 'active'
  ));
  const referencePurpleWhite = profile.starStates.filter((state) => (
    state.isPurpleWhite
    && state.temporalState.qiRankingUse === 'reference_only'
    && state.temporalState.branchQi === 'active'
  ));
  const qualifiedPrimary = profile.qualifiedPurpleWhiteHits.filter((level) => (
    level === 'month' || level === 'day'
  ));
  const tombCount = profile.starStates.filter((state) => state.temporalState.liuJieTomb).length;
  const absoluteCount = profile.starStates.filter((state) => state.temporalState.absolute).length;
  const reasons = [
    `紫白到方：${profile.purpleWhiteCount}/4（${PURPLE_WHITE_SIGNAL_LABEL[profile.purpleWhiteSignal]}）`,
    `支序有氣：年月正式 ${activePurpleWhite.length} 層；日次級有效 ${secondaryPurpleWhite.length} 層；時參考 ${referencePurpleWhite.length} 層`,
    qualifiedPrimary.length > 0 ? `主要層合格：${qualifiedPrimary.join('、')}` : '',
    `白中殺：年月${profile.whiteKillerAssessment.activeHits.length > 0
      ? `${profile.whiteKillerAssessment.activeHits.length} 層命中` : '未命中'}`,
    profile.whiteKillerAssessment.referenceHits.length > 0
      ? `日時白中殺參考：${profile.whiteKillerAssessment.referenceHits.length} 層命中` : '',
    ...Object.values(profile.anJian.genericWhiteKiller)
      .filter((assessment) => assessment.active && assessment.rankingUse === 'active')
      .map((assessment) => assessment.level === 'month'
        ? `大月建／月暗建：月白 ${assessment.centerStar} 入中，本方為其本宮，只計一次警示`
        : `一般九宮暗建：${assessment.level} 白 ${assessment.centerStar} 入中，本方不宜修作`),
    tombCount > 0 ? `入墓：${tombCount} 層` : '',
    absoluteCount > 0 ? `臨絕：${absoluteCount} 層` : '',
    profile.yellowBlackLayers.length >= 2
      ? `二黑、五黃同到${profile.yellowBlackThriving ? '且月令值旺' : ''}` : '',
    '日課 Gate 已顯示但不改方向排序；月、日白是方向主層，年作長期背景，時白只作同級細選',
    '日課旺相休囚死與九星月令狀態均不換算固定分數',
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
    qualifiedPurpleWhiteCount: profile.qualifiedPurpleWhiteCount,
    qualifiedPurpleWhiteHits: profile.qualifiedPurpleWhiteHits,
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
  temporalContext?: TemporalBranchContext,
): DirectionEvaluation[] {
  const context = temporalContext ?? buildTemporalBranchContext(chart.datetime, options);
  return buildDirectionSnapshots(chart).map((snapshot) => evaluateDirection(snapshot, context, purpose));
}

export function rankDirections(evaluations: readonly DirectionEvaluation[]): DirectionEvaluation[] {
  const qualifiedRoleCount = (
    evaluation: DirectionEvaluation,
    role: 'primary' | 'background' | 'tie_breaker',
  ): number => evaluation.temporalProfile.starStates.filter((state) => (
    state.arrivalRule.role === role
    && evaluation.qualifiedPurpleWhiteHits.includes(state.level)
  )).length;
  const activeSecondaryQiCount = (evaluation: DirectionEvaluation): number => (
    evaluation.temporalProfile.starStates.filter((state) => (
      state.isPurpleWhite
      && state.temporalState.qiRankingUse === 'active_secondary'
      && state.temporalState.branchQi === 'active'
    )).length
  );
  return [...evaluations].sort((a, b) => (
    VERDICT_RANK[b.verdict] - VERDICT_RANK[a.verdict]
    || qualifiedRoleCount(b, 'primary') - qualifiedRoleCount(a, 'primary')
    || activeSecondaryQiCount(b) - activeSecondaryQiCount(a)
    || qualifiedRoleCount(b, 'background') - qualifiedRoleCount(a, 'background')
    || qualifiedRoleCount(b, 'tie_breaker') - qualifiedRoleCount(a, 'tie_breaker')
    || b.purpleWhiteCount - a.purpleWhiteCount
  ));
}
