import type { PalaceKey } from '../engine/flyingStar/types';
import { getYearGanzhi, resolveSolarYear, type YearBoundary } from '../engine/flyingStar/yearStar';
import { getChineseHour } from '../engine/time/chineseHour';
import { BRANCHES, type Branch } from '../engine/time/ganzhi';
import { getGanzhiDay, type DayChangeMode } from '../engine/time/ganzhiDay';
import { getSolarMonthByJieqi } from '../engine/time/solarTerms';
import type { StarNumber } from '../overlay/types';
import { PURPLE_WHITE_STARS, STAR_QI_REFERENCE } from './researchEvidence';
import type {
  DirectionLevel, DirectionPalaceKey, Element, LayerRole, MonthAnJianAssessment,
  PalaceElementRelation, PalaceKiller, SeasonalState, TemporalBranchContext, TemporalStarAssessment,
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

/** 第四輪修正：暗建看月白入中星；五黃入中禁四隅。 */
export const AN_JIAN_BY_CENTER_STAR: Readonly<Record<StarNumber, readonly DirectionPalaceKey[]>> = {
  1: ['kan'], 2: ['kun'], 3: ['zhen'], 4: ['xun'],
  5: ['qian', 'kun', 'gen', 'xun'],
  6: ['qian'], 7: ['dui'], 8: ['gen'], 9: ['li'],
};

/** 古表命名的受剋殺，與一般「宮五行剋星五行」分開。 */
const CLASSICAL_SHOU_KE: Readonly<Record<StarNumber, readonly PalaceKey[]>> = {
  1: ['center'], 2: ['zhen', 'xun'], 3: ['qian', 'dui'], 4: ['qian', 'dui'],
  5: ['zhen', 'xun'], 6: ['li'], 7: ['li'], 8: ['zhen', 'xun'], 9: ['kan'],
};

export const LAYER_ROLE: Readonly<Record<DirectionLevel, LayerRole>> = {
  year: 'background_or_large_scale', month: 'primary', day: 'primary', hour: 'fine_tuning',
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
  const solarYear = resolveSolarYear(date, options.yearBoundary ?? 'lichun');
  const monthBranch = BRANCHES[getSolarMonthByJieqi(date).branchIndex]!;
  return {
    branches: {
      year: getYearGanzhi(solarYear).branch,
      month: monthBranch,
      day: getGanzhiDay(date, options.dayChangeMode ?? 'midnight').branch,
      hour: getChineseHour(date).branch,
    },
    evidence: { year: 'A', month: 'A', day: 'B', hour: 'B' },
    monthSeason: MONTH_SEASON_BY_BRANCH[monthBranch],
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

export function assessMonthAnJian(
  centerStar: StarNumber,
  palace: DirectionPalaceKey,
): MonthAnJianAssessment {
  const forbiddenPalaces = [...AN_JIAN_BY_CENTER_STAR[centerStar]];
  return { active: forbiddenPalaces.includes(palace), centerStar, forbiddenPalaces };
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
  const periodBranch = context.branches[level];
  const activeBranches = reference.directQiBranches;
  return {
    level,
    star,
    palace,
    periodBranch,
    isPurpleWhite: PURPLE_WHITE_STARS.has(star),
    role: LAYER_ROLE[level],
    palaceKillers: assessPalaceKillers(star, palace),
    elementRelation: palaceElementRelationFor(star, palace),
    temporalState: {
      liuJieTomb: reference.tombBranch === periodBranch,
      absolute: reference.absoluteBranch === periodBranch,
      branchQi: activeBranches
        ? activeBranches.includes(periodBranch) ? 'active' : 'inactive'
        : 'unknown',
      qiEvidence: context.evidence[level],
    },
    seasonalState: seasonalStateFor(star, context.monthSeason),
  };
}
