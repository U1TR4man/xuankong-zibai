import type { PalaceKey } from '../engine/flyingStar/types';
import type { YearBoundary } from '../engine/flyingStar/yearStar';
import type { Branch, Ganzhi } from '../engine/time/ganzhi';
import type { DayChangeMode } from '../engine/time/ganzhiDay';
import type { StarNumber } from '../overlay/types';
import { PURPLE_WHITE_STARS, STAR_QI_REFERENCE } from './researchEvidence';
import { buildTemporalPillars } from './temporalPillars';
import type {
  AnJianVariantId, DaYueJianAssessment, DirectionLevel, DirectionPalaceKey, Element,
  GenericWhiteKillerAnJianAssessment, LayerRole, MonthlyCenterStarState,
  PalaceElementRelation, PalaceKiller, RuleEvidence, SeasonalState, TemporalBranchContext,
  TemporalStarAssessment, TimeGateAssessment, PurpleWhiteArrivalRule,
} from './types';

type MonthSeason = TemporalBranchContext['monthSeason'];

export const NATIVE_PALACE: Readonly<Record<StarNumber, PalaceKey>> = {
  1: 'kan', 2: 'kun', 3: 'zhen', 4: 'xun', 5: 'center',
  6: 'qian', 7: 'dui', 8: 'gen', 9: 'li',
};

export const STAR_ELEMENT: Readonly<Record<StarNumber, Element>> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土',
  6: '金', 7: '金', 8: '土', 9: '火',
};

export const PALACE_ELEMENT: Readonly<Record<PalaceKey, Element>> = {
  kan: '水', kun: '土', zhen: '木', xun: '木', center: '土',
  qian: '金', dui: '金', gen: '土', li: '火',
};

const OPPOSITE_PALACE: Readonly<Partial<Record<PalaceKey, PalaceKey>>> = {
  kan: 'li', li: 'kan', kun: 'gen', gen: 'kun',
  zhen: 'dui', dui: 'zhen', xun: 'qian', qian: 'xun',
};

const CONTROLS: Readonly<Record<Element, Element>> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};
const GENERATES: Readonly<Record<Element, Element>> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

type AnJianVariantTable = Readonly<Partial<Record<StarNumber, readonly PalaceKey[]>>>;

/** 第五輪修正：一般九宮暗建、《三元寶海》五黃四隅及《選擇紀要》異文分層保存。 */
export const AN_JIAN_VARIANTS: Readonly<Record<AnJianVariantId, AnJianVariantTable>> = {
  generic_jiugong: {
    1: ['kan'], 2: ['kun'], 3: ['zhen'], 4: ['xun'], 5: ['center'],
    6: ['qian'], 7: ['dui'], 8: ['gen'], 9: ['li'],
  },
  san_yuan_bao_hai: {
    1: ['kan'], 2: ['kun'], 3: ['zhen'], 4: ['xun'],
    5: ['qian', 'kun', 'gen', 'xun'],
    6: ['qian'], 7: ['dui'], 8: ['gen'], 9: ['li'],
  },
  jiyao_native_and_center: {
    1: ['kan', 'center'], 6: ['qian', 'center'],
    8: ['gen', 'center'], 9: ['li', 'center'],
  },
};

export const WHITE_KILLER_LAYER_POLICY: Readonly<Record<DirectionLevel, RuleEvidence>> = {
  year: {
    sourceClass: 'direct_operational', layerEvidence: { year: 'A' }, rankingUse: 'active',
  },
  month: {
    sourceClass: 'direct_operational', layerEvidence: { month: 'A' }, rankingUse: 'active',
  },
  day: {
    sourceClass: 'direct_theoretical', layerEvidence: { day: 'B' }, rankingUse: 'reference_only',
  },
  hour: {
    sourceClass: 'direct_theoretical', layerEvidence: { hour: 'B' }, rankingUse: 'reference_only',
  },
};

export const BRANCH_QI_POLICY: Readonly<Record<DirectionLevel, RuleEvidence>> = {
  year: {
    sourceClass: 'direct_operational', layerEvidence: { year: 'A' }, rankingUse: 'active',
  },
  month: {
    sourceClass: 'direct_operational', layerEvidence: { month: 'A' }, rankingUse: 'active',
  },
  day: {
    sourceClass: 'direct_operational', layerEvidence: { day: 'B+' }, rankingUse: 'active_secondary',
  },
  hour: {
    sourceClass: 'derived', layerEvidence: { hour: 'C' }, rankingUse: 'reference_only',
  },
};

/** 第六輪：到方本身與支序有氣分開；日白是主層，時白只作同級細選。 */
export const PURPLE_WHITE_ARRIVAL_POLICY: Readonly<Record<DirectionLevel, PurpleWhiteArrivalRule>> = {
  year: { arrival: 'active', rankingUse: 'active', role: 'background' },
  month: { arrival: 'active', rankingUse: 'active', role: 'primary' },
  day: { arrival: 'active', rankingUse: 'active', role: 'primary' },
  hour: { arrival: 'active', rankingUse: 'active_light', role: 'tie_breaker' },
};

export const ELEMENT_SUPPORT_QI_POLICY: RuleEvidence = {
  sourceClass: 'direct_theoretical',
  layerEvidence: { year: 'B', month: 'A', day: 'B', hour: 'B' },
  rankingUse: 'disabled',
};

/** 古表命名的受剋殺，與一般「宮五行剋星五行」分開。 */
const CLASSICAL_SHOU_KE: Readonly<Record<StarNumber, readonly PalaceKey[]>> = {
  1: ['center'], 2: ['zhen', 'xun'], 3: ['qian', 'dui'], 4: ['qian', 'dui'],
  5: ['zhen', 'xun'], 6: ['li'], 7: ['li'], 8: ['zhen', 'xun'], 9: ['kan'],
};

export const LAYER_ROLE: Readonly<Record<DirectionLevel, LayerRole>> = {
  year: 'background_or_large_scale',
  month: 'seasonal_command',
  day: 'day_gate',
  hour: 'fine_tuning',
};

const MONTH_SEASON_BY_BRANCH: Readonly<Record<Branch, MonthSeason>> = {
  子: 'winter', 丑: 'earth_transition', 寅: 'spring', 卯: 'spring',
  辰: 'earth_transition', 巳: 'summer', 午: 'summer', 未: 'earth_transition',
  申: 'autumn', 酉: 'autumn', 戌: 'earth_transition', 亥: 'winter',
};

const SEASONAL_STATE: Readonly<Record<Element, Record<MonthSeason, SeasonalState>>> = {
  水: {
    winter: 'command', autumn: 'support', spring: 'rest',
    summer: 'imprisoned', earth_transition: 'controlled',
  },
  木: {
    spring: 'command', winter: 'support', summer: 'rest',
    earth_transition: 'imprisoned', autumn: 'controlled',
  },
  金: {
    autumn: 'command', earth_transition: 'support', winter: 'rest',
    spring: 'imprisoned', summer: 'controlled',
  },
  火: {
    summer: 'command', spring: 'support', earth_transition: 'rest',
    autumn: 'imprisoned', winter: 'controlled',
  },
  土: {
    earth_transition: 'command', summer: 'support', autumn: 'rest',
    winter: 'imprisoned', spring: 'controlled',
  },
};

export interface TemporalContextOptions {
  dayChangeMode?: DayChangeMode;
  yearBoundary?: YearBoundary;
}

export function buildTemporalBranchContext(
  date: Date,
  options: TemporalContextOptions = {},
): TemporalBranchContext {
  const pillars = buildTemporalPillars(date, options);
  return {
    pillars,
    evidence: { year: 'A', month: 'A', day: 'B', hour: 'C' },
    monthSeason: MONTH_SEASON_BY_BRANCH[pillars.month.branch],
  };
}

export function assessPalaceKillers(star: StarNumber, palace: PalaceKey): PalaceKiller[] {
  const killers: PalaceKiller[] = [];
  if (CLASSICAL_SHOU_KE[star].includes(palace)) killers.push('shou_ke');
  if (star !== 5 && OPPOSITE_PALACE[NATIVE_PALACE[star]] === palace) killers.push('chuan_xin');
  if ((star === 6 && palace === 'dui') || (star === 7 && palace === 'qian')) {
    killers.push('jiao_jian');
  }
  if ([2, 5, 6, 7, 8].includes(star) && (palace === 'zhen' || palace === 'xun')) {
    killers.push('dou_niu');
  }
  return killers;
}

function samePalaces(first: readonly PalaceKey[], second: readonly PalaceKey[]): boolean {
  return first.length === second.length && first.every((palace) => second.includes(palace));
}

export function assessGenericWhiteKillerAnJian(
  level: DirectionLevel,
  centerStar: StarNumber,
  palace: DirectionPalaceKey,
  variantId: AnJianVariantId = 'generic_jiugong',
): GenericWhiteKillerAnJianAssessment {
  const selected = AN_JIAN_VARIANTS[variantId][centerStar];
  if (!selected) {
    throw new Error(`An-jian variant ${variantId} has no reading for star ${centerStar}`);
  }
  const forbiddenPalaces = [...selected];
  const variantReadings = (Object.entries(AN_JIAN_VARIANTS) as [AnJianVariantId, AnJianVariantTable][])
    .flatMap(([readingId, table]) => {
      const reading = table[centerStar];
      return reading ? [{
        variantId: readingId,
        forbiddenPalaces: [...reading],
        sourceClass: readingId === 'generic_jiugong' ? 'direct_theoretical' as const : 'variant' as const,
      }] : [];
    });
  return {
    level,
    active: forbiddenPalaces.includes(palace),
    centerStar,
    forbiddenPalaces,
    evidence: WHITE_KILLER_LAYER_POLICY[level].layerEvidence[level]!,
    rankingUse: WHITE_KILLER_LAYER_POLICY[level].rankingUse,
    variantId,
    variantReadings,
    hasVariantReading: variantReadings.some((reading) => (
      !samePalaces(reading.forbiddenPalaces, forbiddenPalaces)
    )),
  };
}

/** 第六輪校正：大月建即本月入中紫白星的後天本宮。 */
export function computeDaYueJian(
  monthCenterStar: StarNumber,
  monthGanzhi: Ganzhi,
  palace: DirectionPalaceKey,
): DaYueJianAssessment {
  const daYueJianPalace = NATIVE_PALACE[monthCenterStar];
  return {
    status: 'evaluated',
    centerStar: monthCenterStar,
    palace: daYueJianPalace,
    hitsThisDirection: daYueJianPalace === palace,
    monthGanzhi,
    evidence: 'A',
    rankingUse: 'warning_only',
    calculationMethod: 'month_center_star_native_palace',
    samePositionAsMonthAnJian: true,
    legacyYearStemRule: { enabled: false, status: 'deprecated_by_xieji' },
    note: '本月入中星的後天本宮，同時是大月建與月九宮暗建所在；合流顯示且只計一次警示。',
  };
}

export function buildTimeGateAssessment(): TimeGateAssessment {
  return {
    dayStatus: 'not_evaluated',
    hourStatus: 'not_evaluated',
    rankingUse: 'disabled',
    note: '日主與時課 Gate 尚未建立完整通書日課規則，不參與方向判定。',
  };
}

export function buildMonthlyCenterStarState(
  centerStar: StarNumber,
  monthGanzhi: Ganzhi,
): MonthlyCenterStarState {
  return {
    centerStar,
    monthGanzhi,
    monthNayin: null,
    transformedElement: null,
    mode: 'research',
    rankingUse: 'disabled',
    note: '月建納音如何作用於值月星與八方飛星尚未封版，不參與方向判定。',
  };
}

export function palaceElementRelationFor(
  star: StarNumber,
  palace: PalaceKey,
): TemporalStarAssessment['elementRelation'] {
  const palaceElement = PALACE_ELEMENT[palace];
  const starElement = STAR_ELEMENT[star];
  let relation: PalaceElementRelation;
  if (palaceElement === starElement) relation = 'same';
  else if (GENERATES[palaceElement] === starElement) relation = 'palace_generates_star';
  else if (GENERATES[starElement] === palaceElement) relation = 'star_generates_palace';
  else if (CONTROLS[palaceElement] === starElement) relation = 'palace_controls_star';
  else relation = 'star_controls_palace';
  return { palaceElement, starElement, relation };
}

export function seasonalStateFor(star: StarNumber, season: MonthSeason): SeasonalState {
  return SEASONAL_STATE[STAR_ELEMENT[star]][season];
}

export function assessTemporalStar(
  level: DirectionLevel,
  star: StarNumber,
  palace: PalaceKey,
  context: TemporalBranchContext,
): TemporalStarAssessment {
  const reference = STAR_QI_REFERENCE[star];
  const periodBranch = context.pillars[level].branch;
  const activeBranches = reference.directQiBranches;
  const whiteKillerRule = WHITE_KILLER_LAYER_POLICY[level];
  const branchQiRule = BRANCH_QI_POLICY[level];
  return {
    level,
    star,
    palace,
    periodBranch,
    ganzhi: context.pillars[level],
    isPurpleWhite: PURPLE_WHITE_STARS.has(star),
    role: LAYER_ROLE[level],
    arrivalRule: PURPLE_WHITE_ARRIVAL_POLICY[level],
    palaceKillers: assessPalaceKillers(star, palace),
    whiteKillerRule,
    elementRelation: palaceElementRelationFor(star, palace),
    temporalState: {
      liuJieTomb: reference.tombBranch === periodBranch,
      absolute: reference.absoluteBranch === periodBranch,
      branchQi: activeBranches
        ? activeBranches.includes(periodBranch) ? 'active' : 'inactive'
        : 'unknown',
      qiEvidence: branchQiRule.layerEvidence[level] ?? context.evidence[level],
      qiRankingUse: branchQiRule.rankingUse,
    },
    seasonalState: seasonalStateFor(star, context.monthSeason),
  };
}
