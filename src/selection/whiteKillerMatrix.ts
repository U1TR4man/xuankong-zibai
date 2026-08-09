import type { PalaceKey } from '../engine/flyingStar/types';
import type { Branch } from '../engine/time/ganzhi';
import type { StarNumber } from '../overlay/types';

export interface WhiteKillerMatrixRow {
  liuJieTomb: Branch;
  anJian: readonly PalaceKey[];
  shouKe: readonly PalaceKey[];
  chuanXin: readonly PalaceKey[];
  jiaoJian: readonly PalaceKey[];
  douNiu: readonly PalaceKey[];
}

/**
 * 第七輪封版的白中殺 9 星 × 6 殺定局。
 * 暗建讀 center star；四種宮位殺讀 arrival star；六捷讀 period branch。
 */
export const WHITE_KILLER_MATRIX = {
  1: {
    liuJieTomb: '辰', anJian: ['kan'], shouKe: ['center'],
    chuanXin: ['li'], jiaoJian: [], douNiu: [],
  },
  2: {
    liuJieTomb: '辰', anJian: ['kun'], shouKe: ['zhen', 'xun'],
    chuanXin: ['gen'], jiaoJian: [], douNiu: ['zhen', 'xun'],
  },
  3: {
    liuJieTomb: '未', anJian: ['zhen'], shouKe: ['qian', 'dui'],
    chuanXin: ['dui'], jiaoJian: [], douNiu: [],
  },
  4: {
    liuJieTomb: '未', anJian: ['xun'], shouKe: ['qian', 'dui'],
    chuanXin: ['qian'], jiaoJian: [], douNiu: [],
  },
  5: {
    liuJieTomb: '辰', anJian: ['center'], shouKe: ['zhen', 'xun'],
    chuanXin: [], jiaoJian: [], douNiu: ['zhen', 'xun'],
  },
  6: {
    liuJieTomb: '丑', anJian: ['qian'], shouKe: ['li'],
    chuanXin: ['xun'], jiaoJian: ['dui'], douNiu: ['zhen', 'xun'],
  },
  7: {
    liuJieTomb: '丑', anJian: ['dui'], shouKe: ['li'],
    chuanXin: ['zhen'], jiaoJian: ['qian'], douNiu: ['zhen', 'xun'],
  },
  8: {
    liuJieTomb: '辰', anJian: ['gen'], shouKe: ['zhen', 'xun'],
    chuanXin: ['kun'], jiaoJian: [], douNiu: ['zhen', 'xun'],
  },
  9: {
    liuJieTomb: '戌', anJian: ['li'], shouKe: ['kan'],
    chuanXin: ['kan'], jiaoJian: [], douNiu: [],
  },
} as const satisfies Readonly<Record<StarNumber, WhiteKillerMatrixRow>>;

/** Rule-level confidence is sealed; original-page verification remains a separate research task. */
export const WHITE_KILLER_MATRIX_AUDIT = {
  version: 'seventh_round_9x6',
  restoredColumnOrder: [9, 1, 2, 3, 4, 5, 6, 7, 8],
  confidence: {
    liuJieTomb: 'A+', anJian: 'A+', shouKe: 'A',
    chuanXin: 'A+', jiaoJian: 'A', douNiu: 'A',
  },
  fiveYellowDefault: 'center',
  fiveYellowFourCorners: 'variant_only',
  primarySourceVerified: false,
} as const;
