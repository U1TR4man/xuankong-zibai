/**
 * Direction Gate V1 —— 方位神煞（negative constraints）組裝層。
 *
 * 契約見 `docs/direction-gate-v1-authoritative-rules.md` §5–§8、§11 第 3 步。
 *
 * V1 只回答「本宮三山中，哪幾山被哪條規則命中」，**不產生吉凶判定**：
 *
 * ```ts
 * status: 'not_evaluated'      // 不產生 pass / mixed / caution / avoid
 * rankingUse: 'disabled'       // 不參與八方排序
 * gateUse: 'reference_only'    // 不參與 verdict
 * ```
 *
 * 理由見規則文件 §6／§9：五條規則的強度目前只有轉述語句，沒有固定版本、
 * 卷次、頁碼或原頁影像，因此 `primarySourceVerified = false`，不得設 hard veto。
 * `verdictFor()` 與 `rankDirections()` **不得讀取本檔任何欄位**，
 * 由 `tests/directionGate.test.ts` 的 regression test 鎖定。
 *
 * 本檔是正面 evidence（六德、三德叢聚）的前置：兩者共用 24 山幾何，
 * 但必須分成 constraints 與 positives 兩個 channel，不得混為一鍋。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 */

import type { Branch } from '../engine/time/ganzhi';
import {
  type DirectionHitCoverage,
  type Mountain24,
  getMonthBreakMountain,
  getMountainHitsForPalace,
  getSanShaMountains,
  getSuiPoMountain,
  mountainsOfPalace,
} from './mountains24';
import type { DirectionPalaceKey, TemporalEvidenceLevel } from './types';

/**
 * 五條方位神煞。名稱與整合契約 §1 對齊：
 * `sui_po` 與 `month_break` 是**方位層**的對沖山，
 * 與 Time Gate 的 `dayMonthBreak`（破日）語義不同，不得共用欄位、不得重複扣分。
 * 禁用 `yuePo` 這個名字。
 *
 * 不建立 `hour_san_sha`：核心文本作「年月日之凶神」，不得為四柱對稱自造。
 */
export type DirectionShaRule =
  | 'sui_po'
  | 'month_break'
  | 'year_san_sha'
  | 'month_san_sha'
  | 'day_san_sha';

export type SpatialResolution = 'palace8' | 'mountain24' | 'bearing';

export interface SpatialTarget {
  /** V1 required。 */
  palace: DirectionPalaceKey;
  mountain?: Mountain24;
  /** 未來 compass 用，V1 不產生。 */
  bearing?: number;
}

export interface MountainHit {
  rule: DirectionShaRule;
  /** 該規則影響的全部山（不限本宮）。 */
  affectedMountains: readonly Mountain24[];
  /** 其中落在本宮的山，依羅盤次序。 */
  matched: readonly Mountain24[];
  coverage: DirectionHitCoverage;
  evidenceLevel: TemporalEvidenceLevel;
  rankingUse: 'disabled';
  gateUse: 'reference_only';
}

/**
 * `note` 是**穩定代碼**而非中文句子。
 *
 * 接手指南 §7：「計算層回傳穩定、可測試的結構資料；UI 才翻譯成自然中文。」
 * 規則文件 §8 寫作 `note: string`，此處收窄為 union，理由有二：
 * 1. 計算層不應內嵌 user-facing 文案；
 * 2. 在 `src/**` 的字串常量新增中文會擴大自帶字體 subset
 *    （由 `tests/v21Assets.test.ts` 鎖定），非本輪 scope。
 */
export type DirectionGateNote = 'v1_reference_only_not_evaluated';

export interface DirectionGateAssessment {
  palace: DirectionPalaceKey;
  /** 本宮三山。 */
  mountains: readonly [Mountain24, Mountain24, Mountain24];
  /** V1 恆為 `'palace8'`：engine 已有 24 山，但 UI 仍以八宮呈現。 */
  precision: SpatialResolution;
  /** 只保留實際命中本宮者；未命中的規則不入列。 */
  hits: readonly MountainHit[];
  /** 本宮三山中被任一規則命中的整體覆蓋度。 */
  coverage: DirectionHitCoverage;
  status: 'not_evaluated';
  note: DirectionGateNote;
}

/** 三個來源地支。年、月、日共用同一張三煞表。 */
export interface DirectionShaSource {
  yearBranch: Branch;
  monthBranch: Branch;
  dayBranch: Branch;
}

/**
 * 五條規則的證據等級一律 `'C'`。
 *
 * 第十輪研究稿只給篇名，未給卷次、頁碼、版本或原頁影像
 * （見 `docs/direction-gate-v1-authoritative-rules.md` §9），
 * 是三輪 Gate 研究中最弱者。**不得因為算法 deterministic 就調高。**
 */
const DIRECTION_SHA_EVIDENCE: TemporalEvidenceLevel = 'C';

const V1_NOTE: DirectionGateNote = 'v1_reference_only_not_evaluated';

export interface DirectionShaAffected {
  rule: DirectionShaRule;
  affectedMountains: readonly Mountain24[];
  evidenceLevel: TemporalEvidenceLevel;
}

/**
 * 五條規則各自影響的山（不分宮）。
 *
 * 歲破與月破方各為單一山；三組三煞各為三山。
 *
 * **overlap 是正常的，不是錯誤**：例如年支與月支相同時，歲破山與月破方
 * 必然同山；某山亦可同時是歲破與三煞。它們來自不同柱，是**不同的 fact
 * 恰好同位**，因此各自登記一次、並列保存，不合併、不相抵
 * （整合契約 §2.3、規則文件 §7）。
 */
export function getDirectionShaAffected(source: DirectionShaSource): readonly DirectionShaAffected[] {
  const at = (rule: DirectionShaRule, affectedMountains: readonly Mountain24[]): DirectionShaAffected => ({
    rule,
    affectedMountains,
    evidenceLevel: DIRECTION_SHA_EVIDENCE,
  });
  return [
    at('sui_po', [getSuiPoMountain(source.yearBranch)]),
    at('month_break', [getMonthBreakMountain(source.monthBranch)]),
    at('year_san_sha', getSanShaMountains(source.yearBranch)),
    at('month_san_sha', getSanShaMountains(source.monthBranch)),
    at('day_san_sha', getSanShaMountains(source.dayBranch)),
  ];
}

function coverageOf(matchedCount: number): DirectionHitCoverage {
  if (matchedCount === 0) return 'none';
  if (matchedCount === 3) return 'full';
  return 'partial';
}

/**
 * 組裝單一宮的 Direction Gate 結果。
 *
 * `hits` 只保留命中本宮者；五條規則全部落在他宮時 `hits` 為空、
 * `coverage` 為 `'none'`。整體 `coverage` 取各規則命中山的**聯集**，
 * 因此同一山被多條規則命中不會被重複計入。
 */
export function buildDirectionGateAssessment(
  source: DirectionShaSource,
  palace: DirectionPalaceKey,
): DirectionGateAssessment {
  const hits: MountainHit[] = [];
  const union = new Set<Mountain24>();
  for (const affected of getDirectionShaAffected(source)) {
    const { matched, coverage } = getMountainHitsForPalace(palace, affected.affectedMountains);
    if (matched.length === 0) continue;
    for (const mountain of matched) union.add(mountain);
    hits.push({
      rule: affected.rule,
      affectedMountains: affected.affectedMountains,
      matched,
      coverage,
      evidenceLevel: affected.evidenceLevel,
      rankingUse: 'disabled',
      gateUse: 'reference_only',
    });
  }
  return {
    palace,
    mountains: mountainsOfPalace(palace),
    precision: 'palace8',
    hits,
    coverage: coverageOf(union.size),
    status: 'not_evaluated',
    note: V1_NOTE,
  };
}

/** 八宮全部組裝，次序與 `PALACE_ORDER` 一致；中宮不參與方位神煞。 */
export function buildDirectionGateAssessments(
  source: DirectionShaSource,
  palaces: readonly DirectionPalaceKey[],
): readonly DirectionGateAssessment[] {
  return palaces.map((palace) => buildDirectionGateAssessment(source, palace));
}
