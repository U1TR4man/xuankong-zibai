/**
 * 24 山幾何 —— Direction 層（方位神煞）的唯一空間真相源。
 *
 * 契約見 `docs/direction-gate-v1-authoritative-rules.md` §0–§5、§8。
 *
 * 兩套空間解析度刻意並存：
 * - 紫白飛星到方：八宮，45°（既有 `DirectionPalaceKey`）
 * - 歲破、月破方、三煞：24 山，15°
 *
 * 因此八宮 UI 只能表達「本宮含受影響山」，**不得把整宮等同犯煞**（見
 * `getMountainHitsForPalace()` 與 `DirectionHitCoverage`）。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 * 本檔只提供幾何與 truth table，不組裝 `DirectionGateAssessment`、不參與
 * `verdictFor()` 或 `rankDirections()`。
 */

import type { Branch } from '../engine/time/ganzhi';
import {
  SAN_HE_GROUPS,
  getSanHeGroup,
  opposingTrineBranches,
  oppositeBranch,
} from './branchRelations';
import type { DirectionPalaceKey } from './types';

export type Mountain24 =
  | '壬' | '子' | '癸' | '丑' | '艮' | '寅'
  | '甲' | '卯' | '乙' | '辰' | '巽' | '巳'
  | '丙' | '午' | '丁' | '未' | '坤' | '申'
  | '庚' | '酉' | '辛' | '戌' | '乾' | '亥';

export type DirectionHitCoverage = 'none' | 'partial' | 'full';

/**
 * 24 山單一有序表，依羅盤順時針排列，起於壬。
 *
 * 這張表同時決定方位角與八宮歸屬，不另建第二張映射表：
 * - 方位角：`(FIRST_MOUNTAIN_BEARING + index * 15) % 360`
 * - 八宮：每連續三山成一宮，宮序見 `PALACE_ORDER`
 */
export const MOUNTAINS_24: readonly Mountain24[] = Object.freeze([
  '壬', '子', '癸', // 坎
  '丑', '艮', '寅', // 艮
  '甲', '卯', '乙', // 震
  '辰', '巽', '巳', // 巽
  '丙', '午', '丁', // 離
  '未', '坤', '申', // 坤
  '庚', '酉', '辛', // 兌
  '戌', '乾', '亥', // 乾
]);

/** 每山 15°，各山中心 ±7.5°。 */
export const MOUNTAIN_ARC_DEGREES = 15;

/**
 * 子中心為 0°，故表首的壬為 345°，跨 0° 邊界。
 * 角度僅供未來 compass 使用；V1 不做羅盤，也不區分磁北／真北。
 */
const FIRST_MOUNTAIN_BEARING = 345;

const PALACE_ORDER: readonly DirectionPalaceKey[] = Object.freeze([
  'kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian',
]);

const MOUNTAIN_INDEX: Readonly<Record<Mountain24, number>> = (() => {
  const map = {} as Record<Mountain24, number>;
  MOUNTAINS_24.forEach((mountain, index) => { map[mountain] = index; });
  return Object.freeze(map);
})();

const MOUNTAIN_SET: ReadonlySet<string> = new Set<string>(MOUNTAINS_24);

/**
 * 值是否為 24 山之一。
 *
 * 需要此檢查是因為**戊、己為中宮之位，本無外方**，不在 24 山內；
 * 六德等正面規則的值可能落在戊或己，屆時不得強轉為山
 * （見 `docs/direction-positive-v1-authoritative-rules.md` §2.1、§2.3）。
 */
export function isMountain24(value: string): value is Mountain24 {
  return MOUNTAIN_SET.has(value);
}

/** 該山的中心方位角（度）。子為 0°、卯 90°、午 180°、酉 270°、壬 345°。 */
export function mountainBearing(mountain: Mountain24): number {
  return (FIRST_MOUNTAIN_BEARING + MOUNTAIN_INDEX[mountain] * MOUNTAIN_ARC_DEGREES) % 360;
}

/** 該山所屬的八宮。 */
export function palaceOfMountain(mountain: Mountain24): DirectionPalaceKey {
  return PALACE_ORDER[Math.floor(MOUNTAIN_INDEX[mountain] / 3)]!;
}

/** 該宮所含的三山，依羅盤次序。 */
export function mountainsOfPalace(
  palace: DirectionPalaceKey,
): readonly [Mountain24, Mountain24, Mountain24] {
  const start = PALACE_ORDER.indexOf(palace) * 3;
  return [MOUNTAINS_24[start]!, MOUNTAINS_24[start + 1]!, MOUNTAINS_24[start + 2]!];
}

/* ------------------------------------------------------------------ *
 * 歲破方 / 月破方：由單一柱地支導出的對沖山
 * ------------------------------------------------------------------ */

/**
 * 歲破山 ＝ 太歲支的六沖對山。命中為**單一 15° 山**，非整宮。
 *
 * 例：子年歲破午，午為離宮中山，丙、丁兩山不命中。
 *
 * 與 Time Gate 的「破日」（月支沖日支，`dayMonthBreak`）**同源於六沖但語義不同**，
 * 不得共用欄位、不得重複扣分（整合契約 §1）。禁用 `yuePo` 這個名字。
 */
export function getSuiPoMountain(yearBranch: Branch): Mountain24 {
  return oppositeBranch(yearBranch);
}

/**
 * 月破方 ＝ 節氣月建的六沖對山，在整個節氣月內恆定。
 *
 * 與「破日」的差異同上：破日只在特定日成立，月破方與哪一天無關。
 */
export function getMonthBreakMountain(monthBranch: Branch): Mountain24 {
  return oppositeBranch(monthBranch);
}

/* ------------------------------------------------------------------ *
 * 三煞
 * ------------------------------------------------------------------ */

/**
 * 三煞山（劫煞、災煞、歲煞）＝該支所屬三合局的對面三支。
 *
 * 資料完全由 `branchRelations.ts` 的 `SAN_HE_GROUPS` 導出，不另建三煞表：
 *
 * ```text
 * 申子辰 → 巳午未    亥卯未 → 申酉戌
 * 寅午戌 → 亥子丑    巳酉丑 → 寅卯辰
 * ```
 *
 * 同一張表以年支、月支、日支分別查表即得年／月／日三煞；
 * **不建立時三煞**（核心文本作「年月日之凶神」，見規則文件 §4.2）。
 *
 * 注意這三山在**十二地支環**上相鄰，但在 **24 山環**上彼此相隔 30°，
 * 中間夾著天干山或四維山。例：三煞亥子丑之間夾壬、癸，壬與癸並不命中。
 * 規則文件 §4 稱「三個連續 15° 山」是就四正「一帶三山」的傳統說法而言，
 * 不可理解為 24 山環上的三個相鄰格。
 */
export function getSanShaMountains(
  branch: Branch,
): readonly [Mountain24, Mountain24, Mountain24] {
  return opposingTrineBranches(getSanHeGroup(branch));
}

/** 四個三合局各自的三煞山，供資料檢查與 UI 說明使用。 */
export function listSanShaByGroup(): ReadonlyArray<{
  label: string;
  mountains: readonly [Mountain24, Mountain24, Mountain24];
}> {
  return SAN_HE_GROUPS.map((group) => ({
    label: group.label,
    mountains: opposingTrineBranches(group),
  }));
}

/* ------------------------------------------------------------------ *
 * partial hit / coverage
 * ------------------------------------------------------------------ */

export interface MountainHitResult {
  /** 本宮三山中實際受影響者，依羅盤次序。 */
  matched: readonly Mountain24[];
  coverage: DirectionHitCoverage;
}

/**
 * 求某宮三山與受影響山的交集。
 *
 * `matched.length === 0 → none`；`=== 3 → full`；其餘 `partial`。
 *
 * partial 是必要概念，不是邊界情況：三煞橫跨三個八宮，每宮通常只有一山受影響。
 * 例：子年三煞巳午未 → 巽宮（巳）、離宮（午）、坤宮（未）**各為 partial**，
 * 不得標成「三煞全宮」或「南方大凶」。
 */
export function getMountainHitsForPalace(
  palace: DirectionPalaceKey,
  affected: readonly Mountain24[],
): MountainHitResult {
  const affectedSet = new Set<Mountain24>(affected);
  const matched = mountainsOfPalace(palace).filter((mountain) => affectedSet.has(mountain));
  let coverage: DirectionHitCoverage = 'partial';
  if (matched.length === 0) coverage = 'none';
  else if (matched.length === 3) coverage = 'full';
  return { matched, coverage };
}
