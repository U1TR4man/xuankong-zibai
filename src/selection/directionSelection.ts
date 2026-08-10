/**
 * Direction Selection Assessment V2 —— 把 constraints 與 positives 併成單一結果。
 *
 * 契約見 `docs/direction-positive-v1-authoritative-rules.md` §6、§7、§11 第 7 步。
 *
 * ```text
 * DIRECTION CONSTRAINTS   歲破、月破方、三煞      → directionGate.ts
 * DIRECTION POSITIVES     六德、三德叢聚          → directionVirtues.ts
 *          ↓
 * DIRECTION SELECTION V2  本檔：並列保存，不做綜合判定
 * ```
 *
 * **architecture invariant（§6）**：正面 evidence 不得翻轉 structural veto。
 * 本檔刻意**沒有**任何「抵銷」路徑：
 *
 * ```ts
 * // 明確禁止，本檔不存在這種寫法
 * if (sanDeCongJu) { suiPo = false; sanSha = false; }
 * ```
 *
 * 也不做數值化總分、不做正負抵消、不建立「命中 N 個吉神即優先」的硬閾值。
 * `status` 恆為 `'not_evaluated'`：V1 不產生 priority／usable／mixed／caution／avoid。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 */

import type { Branch, Stem } from '../engine/time/ganzhi';
import {
  type DirectionGateAssessment,
  type DirectionShaSource,
  type SpatialTarget,
  buildDirectionGateAssessment,
} from './directionGate';
import {
  type DirectionVirtueEvidence,
  type DirectionVirtueOptions,
  type SanDeCongJuResult,
  detectSanDeCongJu,
  getDirectionVirtues,
  getMonthJinKuiBranch,
} from './directionVirtues';
import {
  type Mountain24,
  getMountainHitsForPalace,
  palaceOfMountain,
} from './mountains24';
import type { DirectionPalaceKey } from './types';

/**
 * 正面命中的覆蓋度。與 negative 的 `DirectionHitCoverage` 同形但**分開命名**，
 * 避免把「本宮受煞幾山」與「本宮得吉幾山」誤用成同一欄位（§2.4）。
 *
 * 六德實務上幾乎恆為 `partial`：只落一個 15° 山。
 */
export type PositiveHitCoverage = 'none' | 'partial' | 'full';

/**
 * 結果代碼。**不是中文句子**——接手指南 §7 要求計算層回傳結構資料、
 * 由 UI 翻譯。規則文件 §7 寫作 `reasons: string[]`，此處收窄為 union，
 * 理由同 `DirectionGateNote`（見 `directionGate.ts` §8.1 補記）。
 */
export type DirectionAssessmentReason =
  | 'constraint_sui_po'
  | 'constraint_month_break'
  | 'constraint_year_san_sha'
  | 'constraint_month_san_sha'
  | 'constraint_day_san_sha'
  | 'positive_virtue'
  | 'positive_san_de_cong_ju'
  | 'reference_month_jin_kui';

const CONSTRAINT_REASON: Readonly<Record<string, DirectionAssessmentReason>> = Object.freeze({
  sui_po: 'constraint_sui_po',
  month_break: 'constraint_month_break',
  year_san_sha: 'constraint_year_san_sha',
  month_san_sha: 'constraint_month_san_sha',
  day_san_sha: 'constraint_day_san_sha',
});

/**
 * 全盤層 context：六德、三德叢聚與月金匱都只依年干與月支，
 * 與宮位無關，因此算一次即可，不必在八個宮重複計算。
 */
export interface DirectionSelectionContext {
  /** 六項全部，含 `outside_24_mountains` 與 `none`，供全盤層說明使用。 */
  virtues: readonly DirectionVirtueEvidence[];
  sanDeCongJu: SanDeCongJuResult;
  monthJinKui: { branch: Branch; rankingUse: 'disabled'; mode: 'reference_only' };
  sha: DirectionShaSource;
}

export interface DirectionSelectionSource extends DirectionShaSource {
  yearStem: Stem;
}

export function buildDirectionSelectionContext(
  source: DirectionSelectionSource,
  options: DirectionVirtueOptions = {},
): DirectionSelectionContext {
  const virtues = getDirectionVirtues(source.yearStem, source.monthBranch, options);
  return {
    virtues,
    sanDeCongJu: detectSanDeCongJu(virtues),
    monthJinKui: {
      branch: getMonthJinKuiBranch(source.monthBranch),
      rankingUse: 'disabled',
      mode: 'reference_only',
    },
    sha: {
      yearBranch: source.yearBranch,
      monthBranch: source.monthBranch,
      dayBranch: source.dayBranch,
    },
  };
}

export interface DirectionPositives {
  /** 只含實際落在本宮的六德項；全盤層的六項見 `DirectionSelectionContext.virtues`。 */
  virtues: readonly DirectionVirtueEvidence[];
  /** 本宮三山中得吉者，依羅盤次序。 */
  matched: readonly Mountain24[];
  coverage: PositiveHitCoverage;
  patterns: {
    /** 只在三德叢聚山落在本宮時出現。 */
    sanDeCongJu?: { active: true; mountain: Mountain24 };
  };
  references: {
    /** 只在月金匱支落在本宮時出現；恆不參與排序。 */
    monthJinKui?: { branch: Branch; rankingUse: 'disabled' };
  };
}

export interface DirectionSelectionAssessmentV2 {
  target: SpatialTarget;
  /** negative channel。 */
  constraints: DirectionGateAssessment;
  /** positive channel。 */
  positives: DirectionPositives;
  /**
   * V1 恆為 `'not_evaluated'`：不產生 priority／usable／mixed／caution／avoid。
   * 證據強度未封版前不得改（規則文件 §5、§8 stop condition）。
   */
  status: 'not_evaluated';
  /** 依 §6 precedence 排列：constraints 先於 positives，但不代表任何抵銷。 */
  reasons: readonly DirectionAssessmentReason[];
  rankingUse: 'disabled';
}

function positiveCoverage(matchedCount: number): PositiveHitCoverage {
  if (matchedCount === 0) return 'none';
  if (matchedCount === 3) return 'full';
  return 'partial';
}

/**
 * 組裝單一宮的 V2 結果。
 *
 * constraints 與 positives 各自獨立計算後並列保存：
 * 同一宮可同時有受煞山與得吉山（例如震宮的卯犯歲破、甲得三德叢聚），
 * **兩者都必須保留**，不得因任一方而移除或弱化另一方。
 */
export function buildDirectionSelectionAssessment(
  context: DirectionSelectionContext,
  palace: DirectionPalaceKey,
): DirectionSelectionAssessmentV2 {
  const constraints = buildDirectionGateAssessment(context.sha, palace);

  const virtuesHere = context.virtues.filter((virtue) => (
    virtue.position.kind === 'mountain' && palaceOfMountain(virtue.position.mountain) === palace
  ));
  const virtueMountains = virtuesHere.map((virtue) => (
    virtue.position.kind === 'mountain' ? virtue.position.mountain : null
  )).filter((mountain): mountain is Mountain24 => mountain !== null);
  const { matched } = getMountainHitsForPalace(palace, virtueMountains);

  const patterns: DirectionPositives['patterns'] = {};
  const { sanDeCongJu } = context;
  if (sanDeCongJu.active && sanDeCongJu.mountain && palaceOfMountain(sanDeCongJu.mountain) === palace) {
    patterns.sanDeCongJu = { active: true, mountain: sanDeCongJu.mountain };
  }

  const references: DirectionPositives['references'] = {};
  if (palaceOfMountain(context.monthJinKui.branch) === palace) {
    references.monthJinKui = { branch: context.monthJinKui.branch, rankingUse: 'disabled' };
  }

  const reasons: DirectionAssessmentReason[] = [];
  for (const hit of constraints.hits) {
    const reason = CONSTRAINT_REASON[hit.rule];
    if (reason && !reasons.includes(reason)) reasons.push(reason);
  }
  if (virtuesHere.length > 0) reasons.push('positive_virtue');
  if (patterns.sanDeCongJu) reasons.push('positive_san_de_cong_ju');
  if (references.monthJinKui) reasons.push('reference_month_jin_kui');

  return {
    target: { palace },
    constraints,
    positives: {
      virtues: virtuesHere,
      matched,
      coverage: positiveCoverage(matched.length),
      patterns,
      references,
    },
    status: 'not_evaluated',
    reasons,
    rankingUse: 'disabled',
  };
}

/** 八宮全部組裝；中宮不參與方位神煞與六德。 */
export function buildDirectionSelectionAssessments(
  context: DirectionSelectionContext,
  palaces: readonly DirectionPalaceKey[],
): readonly DirectionSelectionAssessmentV2[] {
  return palaces.map((palace) => buildDirectionSelectionAssessment(context, palace));
}
