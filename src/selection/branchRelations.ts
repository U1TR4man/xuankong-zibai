/**
 * 地支關係 primitive —— Day / Hour / Direction 三個 Gate 的唯一共用實作。
 *
 * 契約見 `docs/gates-v1-integration.md` §1、§8：
 * - 六沖只有一組實作；破日、時破、時沖月令、時沖歲君、歲破方、月破方六個名目
 *   全部消費同一個 `isClash()`，同一 clash fact 只登記一次，Gate 間不做數值相加。
 * - 三合表是單一資料源，同時供 Hour Gate 的日時三合與 Direction Gate 的三煞使用
 *   （三煞山＝三合局「對面三支」，由 `center` 的對沖支及其左右鄰支導出）。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 * 本檔只提供 primitive，不組裝 HourGate / DirectionGate，不參與
 * `verdictFor()` 或 `rankDirections()`。
 */

import { BRANCHES, type Branch } from '../engine/time/ganzhi';

function branchIndex(branch: Branch): number {
  return BRANCHES.indexOf(branch);
}

function branchAt(index: number): Branch {
  return BRANCHES[((index % 12) + 12) % 12]!;
}

/* ------------------------------------------------------------------ *
 * 六沖：子午、丑未、寅申、卯酉、辰戌、巳亥
 * ------------------------------------------------------------------ */

/**
 * 六沖對支表。以原典 truth table 明列，不靠隱式索引運算；
 * 與「相隔六位」的一致性由測試鎖定。
 */
const OPPOSITE_BRANCH: Readonly<Record<Branch, Branch>> = Object.freeze({
  子: '午', 午: '子',
  丑: '未', 未: '丑',
  寅: '申', 申: '寅',
  卯: '酉', 酉: '卯',
  辰: '戌', 戌: '辰',
  巳: '亥', 亥: '巳',
});

/** 六沖的對支；歲破方與月破方亦由本函式導出。 */
export function oppositeBranch(branch: Branch): Branch {
  return OPPOSITE_BRANCH[branch];
}

/**
 * 六沖。全專案唯一實作。
 *
 * 恆等式（由測試鎖定）：`isClash(a, b) === (oppositeBranch(a) === b)`
 */
export function isClash(a: Branch, b: Branch): boolean {
  return OPPOSITE_BRANCH[a] === b;
}

/* ------------------------------------------------------------------ *
 * 六合：子丑、寅亥、卯戌、辰酉、巳申、午未
 * ------------------------------------------------------------------ */

const SIX_HARMONY_BRANCH: Readonly<Record<Branch, Branch>> = Object.freeze({
  子: '丑', 丑: '子',
  寅: '亥', 亥: '寅',
  卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰',
  巳: '申', 申: '巳',
  午: '未', 未: '午',
});

/** 六合的合支。 */
export function sixHarmonyBranch(branch: Branch): Branch {
  return SIX_HARMONY_BRANCH[branch];
}

/** 六合。對稱關係。 */
export function isSixHarmony(a: Branch, b: Branch): boolean {
  return SIX_HARMONY_BRANCH[a] === b;
}

/* ------------------------------------------------------------------ *
 * 六害：子未、丑午、寅巳、卯辰、申亥、酉戌
 * ------------------------------------------------------------------ */

const SIX_HARM_BRANCH: Readonly<Record<Branch, Branch>> = Object.freeze({
  子: '未', 未: '子',
  丑: '午', 午: '丑',
  寅: '巳', 巳: '寅',
  卯: '辰', 辰: '卯',
  申: '亥', 亥: '申',
  酉: '戌', 戌: '酉',
});

/** 六害的害支。 */
export function sixHarmBranch(branch: Branch): Branch {
  return SIX_HARM_BRANCH[branch];
}

/** 六害。對稱關係。Hour Gate 的「日害」＝日支與時支六害。 */
export function isSixHarm(a: Branch, b: Branch): boolean {
  return SIX_HARM_BRANCH[a] === b;
}

/* ------------------------------------------------------------------ *
 * 三合：申子辰、寅午戌、亥卯未、巳酉丑
 * ------------------------------------------------------------------ */

export type SanHeGroupKey = 'shen_zi_chen' | 'yin_wu_xu' | 'hai_mao_wei' | 'si_you_chou';

export interface SanHeGroup {
  readonly key: SanHeGroupKey;
  /** 完整三支，依原典慣用次序。 */
  readonly branches: readonly [Branch, Branch, Branch];
  /**
   * 局中的仲支（四正）。Direction Gate 的三煞由 `oppositeBranch(center)`
   * 及其左右鄰支構成「對面三支」，因此三煞不得另建第二張表。
   */
  readonly center: Branch;
  /** UI 可讀標籤，例如「申子辰」。 */
  readonly label: string;
}

/**
 * 三合局單一資料源。
 *
 * 消費者：
 * - Hour Gate：日支與時支是否同局（`isSameSanHeGroup`）。
 * - Direction Gate：三煞山＝本局對面三支（由 `center` 導出，見 §4）。
 *
 * 不得在別處重建三合表或三煞表。
 */
function defineSanHeGroup(
  key: SanHeGroupKey,
  branches: readonly [Branch, Branch, Branch],
  center: Branch,
  label: string,
): SanHeGroup {
  return Object.freeze({ key, branches: Object.freeze(branches), center, label });
}

export const SAN_HE_GROUPS: readonly SanHeGroup[] = Object.freeze([
  defineSanHeGroup('shen_zi_chen', ['申', '子', '辰'], '子', '申子辰'),
  defineSanHeGroup('yin_wu_xu', ['寅', '午', '戌'], '午', '寅午戌'),
  defineSanHeGroup('hai_mao_wei', ['亥', '卯', '未'], '卯', '亥卯未'),
  defineSanHeGroup('si_you_chou', ['巳', '酉', '丑'], '酉', '巳酉丑'),
]);

const SAN_HE_GROUP_BY_BRANCH: Readonly<Record<Branch, SanHeGroup>> = (() => {
  const map = {} as Record<Branch, SanHeGroup>;
  for (const group of SAN_HE_GROUPS) {
    for (const branch of group.branches) {
      map[branch] = group;
    }
  }
  return Object.freeze(map);
})();

/** 取得該支所屬的三合局。十二支各屬且只屬一局。 */
export function getSanHeGroup(branch: Branch): SanHeGroup {
  return SAN_HE_GROUP_BY_BRANCH[branch];
}

/**
 * 兩支是否同在一個三合局。
 *
 * 只表示「同局」，**不**代表三支已完整成局
 * （見 `docs/hour-gate-v1-authoritative-rules.md` §2）。
 * 同支自身視為同局，回傳 true。
 */
export function isSameSanHeGroup(a: Branch, b: Branch): boolean {
  return SAN_HE_GROUP_BY_BRANCH[a].key === SAN_HE_GROUP_BY_BRANCH[b].key;
}

/**
 * 三合局的「對面三支」——以本局仲支的對沖支為中心的三個連續地支。
 *
 * Direction Gate 的三煞山由此導出（申子辰→巳午未、亥卯未→申酉戌、
 * 寅午戌→亥子丑、巳酉丑→寅卯辰）；本函式只回傳地支，
 * 24 山映射與 coverage 屬 Direction Gate 實作範圍，本檔不做。
 */
export function opposingTrineBranches(group: SanHeGroup): readonly [Branch, Branch, Branch] {
  const center = branchIndex(oppositeBranch(group.center));
  return [branchAt(center - 1), branchAt(center), branchAt(center + 1)];
}

/* ------------------------------------------------------------------ *
 * 刑：有向關係
 * ------------------------------------------------------------------ */

/**
 * 刑的有向表，見 `docs/hour-gate-v1-authoritative-rules.md` §1.4。
 *
 * 無恃之刑：寅→巳→申→寅（單向循環）
 * 無恩之刑：丑→戌→未→丑（單向循環）
 * 無禮之刑：子↔卯（雙向）
 * 自刑：辰、午、酉、亥
 *
 * **不是「兩支同在一個刑組即成立」**：申日寅時為刑，巳日寅時不是。
 */
function punished(...branches: Branch[]): readonly Branch[] {
  return Object.freeze(branches);
}

const BRANCH_PUNISHES: Readonly<Record<Branch, readonly Branch[]>> = Object.freeze({
  子: punished('卯'),
  丑: punished('戌'),
  寅: punished('巳'),
  卯: punished('子'),
  辰: punished('辰'),
  巳: punished('申'),
  午: punished('午'),
  未: punished('丑'),
  申: punished('寅'),
  酉: punished('酉'),
  戌: punished('未'),
  亥: punished('亥'),
});

/** 自刑支：辰、午、酉、亥。 */
export function isSelfPunishment(branch: Branch): boolean {
  return BRANCH_PUNISHES[branch][0] === branch;
}

/**
 * 刑，**有向**：前者刑後者。
 *
 * Hour Gate 的「時刑」＝日支刑時支，因此參數次序為 `(dayBranch, hourBranch)`，
 * 呼叫端不得任意對調。
 */
export function isPunishment(dayBranch: Branch, hourBranch: Branch): boolean {
  return BRANCH_PUNISHES[dayBranch].includes(hourBranch);
}
