/** 干支基礎表。 */

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];

export interface Ganzhi {
  stem: Stem;
  branch: Branch;
  stemIndex: number;
  branchIndex: number;
  /** 0 = 甲子 … 59 = 癸亥 */
  index60: number;
  text: string;
}

export function ganzhiFromIndex60(index60: number): Ganzhi {
  const i = ((index60 % 60) + 60) % 60;
  const s = i % 10;
  const b = i % 12;
  return {
    stem: STEMS[s]!,
    branch: BRANCHES[b]!,
    stemIndex: s,
    branchIndex: b,
    index60: i,
    text: STEMS[s]! + BRANCHES[b]!,
  };
}

/** 孟 / 仲 / 季 三分（規劃書 §13）。 */
export type BranchGroup = 'meng' | 'zhong' | 'ji';

export const BRANCH_GROUP_LABEL: Record<BranchGroup, string> = {
  meng: '孟',
  zhong: '仲',
  ji: '季',
};

/**
 * 孟：寅申巳亥（2, 8, 5, 11）
 * 仲：子午卯酉（0, 6, 3, 9）
 * 季：辰戌丑未（4, 10, 1, 7）
 */
export function branchGroup(branchIndex: number): BranchGroup {
  const b = ((branchIndex % 12) + 12) % 12;
  switch (b % 3) {
    case 0: return 'zhong'; // 子 卯 午 酉
    case 2: return 'meng';  // 寅 巳 申 亥
    default: return 'ji';   // 丑 辰 未 戌
  }
}
