import type { PalaceKey } from '../engine/flyingStar/types';
import type { YearBoundary } from '../engine/flyingStar/yearStar';
import type { Branch, Ganzhi, Stem } from '../engine/time/ganzhi';
import type { DayChangeMode } from '../engine/time/ganzhiDay';
import { nextTermOf } from '../engine/time/solarTerms';
import type { StarNumber } from '../overlay/types';
import { PURPLE_WHITE_STARS, STAR_QI_REFERENCE } from './researchEvidence';
import { buildTemporalPillars } from './temporalPillars';
import { WHITE_KILLER_MATRIX, type WhiteKillerMatrixRow } from './whiteKillerMatrix';
import type {
  AnJianVariantId, DaYueJianAssessment, DirectionLevel, DirectionPalaceKey, Element,
  DayGate, DayMasterSeasonState, GenericWhiteKillerAnJianAssessment, LayerRole, MonthlyCenterStarState,
  PalaceElementRelation, PalaceKiller, RuleEvidence, SeasonalState, TemporalBranchContext,
  TemporalStarAssessment, TimeGateAssessment, PurpleWhiteArrivalRule,
} from './types';

type MonthSeason = TemporalBranchContext['monthSeason'];

const STEM_ELEMENT: Readonly<Record<Stem, Element>> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

/** 四季主氣；辰未戌丑進入四立前十八日後，Day Gate 另改取土司令。 */
const SEASON_MAIN_ELEMENT_BY_BRANCH: Readonly<Record<Branch, Element>> = {
  子: '水', 丑: '水', 寅: '木', 卯: '木', 辰: '木', 巳: '火',
  午: '火', 未: '火', 申: '金', 酉: '金', 戌: '金', 亥: '水',
};
const FOUR_SEASON_STARTS = ['立春', '立夏', '立秋', '立冬'] as const;
const EARTH_COMMAND_MS = 18 * 24 * 60 * 60 * 1000;

export const NATIVE_PALACE: Readonly<Record<StarNumber, PalaceKey>> = {
  1: WHITE_KILLER_MATRIX[1].anJian[0], 2: WHITE_KILLER_MATRIX[2].anJian[0],
  3: WHITE_KILLER_MATRIX[3].anJian[0], 4: WHITE_KILLER_MATRIX[4].anJian[0],
  5: WHITE_KILLER_MATRIX[5].anJian[0], 6: WHITE_KILLER_MATRIX[6].anJian[0],
  7: WHITE_KILLER_MATRIX[7].anJian[0], 8: WHITE_KILLER_MATRIX[8].anJian[0],
  9: WHITE_KILLER_MATRIX[9].anJian[0],
};

export const STAR_ELEMENT: Readonly<Record<StarNumber, Element>> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土',
  6: '金', 7: '金', 8: '土', 9: '火',
};

export const PALACE_ELEMENT: Readonly<Record<PalaceKey, Element>> = {
  kan: '水', kun: '土', zhen: '木', xun: '木', center: '土',
  qian: '金', dui: '金', gen: '土', li: '火',
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
    1: WHITE_KILLER_MATRIX[1].anJian, 2: WHITE_KILLER_MATRIX[2].anJian,
    3: WHITE_KILLER_MATRIX[3].anJian, 4: WHITE_KILLER_MATRIX[4].anJian,
    5: WHITE_KILLER_MATRIX[5].anJian, 6: WHITE_KILLER_MATRIX[6].anJian,
    7: WHITE_KILLER_MATRIX[7].anJian, 8: WHITE_KILLER_MATRIX[8].anJian,
    9: WHITE_KILLER_MATRIX[9].anJian,
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
  const nextSeasonStart = nextTermOf(date, FOUR_SEASON_STARTS);
  const isEarthCommand = nextSeasonStart.date.getTime() - date.getTime() <= EARTH_COMMAND_MS;
  return {
    pillars,
    evidence: { year: 'A', month: 'A', day: 'B', hour: 'C' },
    monthSeason: MONTH_SEASON_BY_BRANCH[pillars.month.branch],
    monthCommand: isEarthCommand
      ? { element: '土', rule: 'earth_last_18_days' }
      : { element: SEASON_MAIN_ELEMENT_BY_BRANCH[pillars.month.branch], rule: 'season_main' },
  };
}

export function assessAnJian(centerStar: StarNumber, palace: PalaceKey): boolean {
  return (WHITE_KILLER_MATRIX[centerStar].anJian as readonly PalaceKey[]).includes(palace);
}

export function assessArrivalWhiteKillers(
  star: StarNumber,
  palace: PalaceKey,
): PalaceKiller[] {
  const row: WhiteKillerMatrixRow = WHITE_KILLER_MATRIX[star];
  const killers: PalaceKiller[] = [];
  if ((row.shouKe as readonly PalaceKey[]).includes(palace)) killers.push('shou_ke');
  if ((row.chuanXin as readonly PalaceKey[]).includes(palace)) killers.push('chuan_xin');
  if ((row.jiaoJian as readonly PalaceKey[]).includes(palace)) killers.push('jiao_jian');
  if ((row.douNiu as readonly PalaceKey[]).includes(palace)) killers.push('dou_niu');
  return killers;
}

export function assessLiuJie(star: StarNumber, periodBranch: Branch): boolean {
  return WHITE_KILLER_MATRIX[star].liuJieTomb === periodBranch;
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
    active: variantId === 'generic_jiugong'
      ? assessAnJian(centerStar, palace) : forbiddenPalaces.includes(palace),
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

export function dayElementFor(stem: Stem): Element {
  return STEM_ELEMENT[stem];
}

export function dayMasterSeasonStateFor(
  dayElement: Element,
  monthElement: Element,
): DayMasterSeasonState {
  if (dayElement === monthElement) return 'wang';
  if (GENERATES[monthElement] === dayElement) return 'xiang';
  if (GENERATES[dayElement] === monthElement) return 'xiu';
  if (CONTROLS[dayElement] === monthElement) return 'qiu';
  return 'si';
}

function buildDayGate(context: TemporalBranchContext): DayGate {
  const dayStem = context.pillars.day.stem;
  const dayElement = dayElementFor(dayStem);
  const monthElement = context.monthCommand.element;
  const seasonalState = dayMasterSeasonStateFor(dayElement, monthElement);
  const reasons: Record<DayMasterSeasonState, string> = {
    wang: '日主與月令同氣，日主得令。',
    xiang: '月令生扶日主，日主得生。',
    xiu: '日主生月令，氣勢休退。',
    qiu: '日主剋月令，失時受囚。',
    si: '月令剋日主，日主受制。',
  };
  const status = seasonalState === 'wang' || seasonalState === 'xiang'
    ? 'pass' : seasonalState === 'xiu' ? 'mixed' : 'caution';
  return {
    dayStem,
    dayElement,
    monthBranch: context.pillars.month.branch,
    monthElement,
    monthCommandRule: context.monthCommand.rule,
    seasonalState,
    status,
    reasons: [
      reasons[seasonalState],
      context.monthCommand.rule === 'earth_last_18_days'
        ? '月令司氣採四立前十八日土旺。'
        : '月令司氣採節氣月的四季主氣。',
    ],
  };
}

export function buildTimeGateAssessment(context: TemporalBranchContext): TimeGateAssessment {
  const dayGate = buildDayGate(context);
  return {
    dayStatus: dayGate.status,
    hourStatus: 'not_evaluated',
    rankingUse: 'disabled',
    dayGate,
    note: 'Day Gate V1 只判日干與月令，不換算分數；時課尚未評估，兩者均不改方向排序。',
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
    palaceKillers: assessArrivalWhiteKillers(star, palace),
    whiteKillerRule,
    elementRelation: palaceElementRelationFor(star, palace),
    temporalState: {
      liuJieTomb: assessLiuJie(star, periodBranch),
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
