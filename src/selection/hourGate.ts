/**
 * Hour Gate V1 —— 組裝與 precedence。
 *
 * 契約見 `docs/hour-gate-v1-authoritative-rules.md` §7、§8、§12 第 3 步。
 *
 * 核心定位（§0）：**時者，日之用也**。Hour Gate 先決定時辰是否進入候選，
 * 時白只在合格時辰內比較方向；**時白吉不得推翻不合格的時辰**。
 *
 * ```ts
 * hourRole = 'support_and_refinement';   // 不是 'equal_to_day'
 * ```
 *
 * V1 政策：
 *
 * ```ts
 * rankingUse: 'disabled'      // 不參與八方排序
 * ```
 *
 * 本檔**不寫回** `TimeGateAssessment.hourStatus`（仍為 `'not_evaluated'`）：
 * 依 §11 stop condition 2，那需要使用者明確批准。
 *
 * **Gate 不做算術抵消**（§7）：
 *
 * ```text
 * 錯：時破 -5 + 祿時 +3 + 三合 +2 = 0 → 可用
 * 對：時破 → reject；祿時／三合仍完整顯示，但不解除 reject
 * ```
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 */

import type { Branch, Stem } from '../engine/time/ganzhi';
import {
  isClash,
  isPunishment,
  isSameSanHeGroup,
  isSixHarm,
  isSixHarmony,
} from './branchRelations';
import {
  type HourStemSupport,
  assessHourStemSupport,
  isDayLuHour,
  isFiveBuYu,
  isSupportiveHourStem,
} from './hourGateTables';
import type { TemporalPillars } from './temporalPillars';

export type HourGateStatus = 'preferred' | 'pass' | 'mixed' | 'caution' | 'reject';

/**
 * 用途模式。整合契約 §5：使用者如何選擇尚未定義，
 * **規格確定前一律以 `daily` 為預設語義**。
 */
export type SelectionMode = 'daily' | 'construction';

export type ClashSeverity = 'ignore_for_small' | 'warning' | 'reject';

export type HourGateReason =
  | 'conflict_hour_break'
  | 'conflict_clash_month'
  | 'conflict_clash_year'
  | 'conflict_five_bu_yu'
  | 'conflict_punishment'
  | 'conflict_harm'
  | 'support_build'
  | 'support_liu_he'
  | 'support_san_he'
  | 'support_stem'
  | 'support_day_lu';

export interface HourGateClash {
  active: boolean;
  severity: ClashSeverity;
}

export interface HourGateConflicts {
  /** 時破＝日支沖時支。structural veto，無「小事可勿論」豁免。 */
  hourBreak: boolean;
  /** 時沖月令。原典明文「大事則忌，小事可勿論」，故不得全域 hard reject。 */
  clashMonth: HourGateClash;
  /** 時沖歲君。同上。 */
  clashYear: HourGateClash;
  /** 五不遇＝時干剋日干的十組定局。strong caution，非絕對死刑。 */
  fiveBuYu: boolean;
  /** 時刑＝日支刑時支，有向。 */
  punishment: boolean;
  /** 日害＝日支與時支六害。 */
  harm: boolean;
}

export interface HourGateSupport {
  /** 時建＝日支與時支相同。 */
  build: boolean;
  liuHe: boolean;
  /** 日時同在一個三合局；**不代表三支已完整成局**。 */
  sanHe: boolean;
  stemSupport: HourStemSupport;
  dayLu: boolean;
  /**
   * 是否可救弱日（§4.2）。
   *
   * 只是**標記**：V1 不讓它改變 `status`，也不寫回 Day Gate。
   * 它只能降低 Day Gate 的 caution，且**不能救破日、時破這類 structural veto**，
   * 因此在有 structural veto 或五不遇時恆為 false。
   */
  rescuesWeakDay: boolean;
}

export interface HourGate {
  hourStem: Stem;
  hourBranch: Branch;
  mode: SelectionMode;
  conflicts: HourGateConflicts;
  support: HourGateSupport;
  /**
   * 活動限定規則（§5）。旬中空亡與截路空亡原典明文「忌出行，不忌葬事」，
   * 因此**不可作 universal penalty**。V1 未實作旬空計算，恆為空物件。
   */
  activitySpecific: { xunKong?: boolean; jieLuKong?: boolean };
  status: HourGateStatus;
  /** 穩定代碼，非中文句子（接手指南 §7）。衝突在前、支持在後，並列不抵消。 */
  reasons: readonly HourGateReason[];
  rankingUse: 'disabled';
}

export interface HourGateOptions {
  /** 預設 `'daily'`，見 `SelectionMode`。 */
  mode?: SelectionMode;
}

/**
 * 時沖月令／歲君的 severity。
 *
 * `construction` 取 `reject`；`daily` 取 `warning`——原典明文有「小事可勿論」，
 * 但那是「可勿論」不是「必無事」，故 daily 仍記為 warning 而非 ignore。
 */
function clashSeverity(active: boolean, mode: SelectionMode): ClashSeverity {
  if (!active) return 'ignore_for_small';
  return mode === 'construction' ? 'reject' : 'warning';
}

/**
 * precedence（§7 研究稿 §37）：
 *
 * ```text
 * 1. hourBreak                                  → reject
 * 2. construction && (clashMonth || clashYear)  → reject
 * 3. fiveBuYu || punishment                     → caution
 * 4. harm || clashing                           → 至少 mixed
 * 5. pass + 任一正面支持                        → preferred
 * ```
 *
 * **positive support 不得把 reject 翻回 pass。**
 *
 * ### 2026-08-10 修正：時刑與五不遇同級
 *
 * 初版依研究稿把五不遇列 C 層、時刑列 D 層，因此五不遇（caution）重於時刑（mixed）。
 * 補讀固定版本原文後，**兩卷都不支持這個高下**：
 *
 * - 《協紀》四庫本卷三十四〈用時法〉：「時破**大凶**……時刑**次凶**……五不遇時**次凶**」
 * - 同書卷七〈八錄〉：「建合則吉，而**破刑害則凶**也」——破、刑、害並列，不分高下
 *
 * 規則文件 §4 為時刑所引的「次凶，亦輕可」一句，在兩卷均未見。
 *
 * 因此改為：大凶 → `reject`；**次凶（時刑、五不遇）→ `caution`**；其餘凶 → `mixed`。
 * 日害維持 `mixed`：卷七雖與破、刑並列，但卷三十四〈用時法〉未列日害，
 * 兩卷都沒有給它明確等級，故不隨時刑一併提升。
 *
 * ### 實作補洞：daily 模式的時沖月令／歲君
 *
 * §7 的 precedence 只規定 construction 的沖月令／歲君為 reject，沒有說 daily 落哪一級。
 * 若照字面實作，daily ＋ 沖月令 ＋ 日祿會得到 `preferred`，與 §4 把它列為
 * `warning` 明顯矛盾。
 *
 * 本實作取**下限**而非新強度：§4 把時沖月令列為 B 層（major context），
 * 而時刑／日害是 D 層（minor）且已對應 `mixed`；B 層不可能比 D 層輕，
 * 故 daily 的沖月令／歲君同樣落在 `mixed`。這是由文件自身分層推出的地板值，
 * 不是自創 severity，但仍屬實作期判斷，已記入規則文件與 HANDOFF。
 */
function resolveStatus(
  conflicts: HourGateConflicts,
  support: HourGateSupport,
  mode: SelectionMode,
): HourGateStatus {
  if (conflicts.hourBreak) return 'reject';
  const clashing = conflicts.clashMonth.active || conflicts.clashYear.active;
  if (mode === 'construction' && clashing) return 'reject';
  // 次凶：時刑與五不遇同級（見上方 2026-08-10 修正）
  if (conflicts.fiveBuYu || conflicts.punishment) return 'caution';
  if (conflicts.harm || clashing) return 'mixed';
  const hasSupport = support.build
    || support.liuHe
    || support.sanHe
    || support.dayLu
    || isSupportiveHourStem(support.stemSupport);
  return hasSupport ? 'preferred' : 'pass';
}

function collectReasons(conflicts: HourGateConflicts, support: HourGateSupport): HourGateReason[] {
  const reasons: HourGateReason[] = [];
  if (conflicts.hourBreak) reasons.push('conflict_hour_break');
  if (conflicts.clashMonth.active) reasons.push('conflict_clash_month');
  if (conflicts.clashYear.active) reasons.push('conflict_clash_year');
  if (conflicts.fiveBuYu) reasons.push('conflict_five_bu_yu');
  if (conflicts.punishment) reasons.push('conflict_punishment');
  if (conflicts.harm) reasons.push('conflict_harm');
  if (support.build) reasons.push('support_build');
  if (support.liuHe) reasons.push('support_liu_he');
  if (support.sanHe) reasons.push('support_san_he');
  if (isSupportiveHourStem(support.stemSupport)) reasons.push('support_stem');
  if (support.dayLu) reasons.push('support_day_lu');
  return reasons;
}

/**
 * 由 canonical 四柱組裝 Hour Gate。
 *
 * 四柱一律取既有 `TemporalPillars`（年界、節氣月、換日、中國時辰 boundary 皆沿用），
 * **不另建第二套四柱**。
 *
 * 正負關係必然可同時存在（§3.1）：自刑支在日時相同時同時是時建與時刑；
 * 巳日申時同時是六合與刑；辛日酉時同時是日祿與五不遇。
 * 因此 `conflicts` 與 `support` 各自完整保存，最終 status 由 precedence 決定，
 * **不靠正負抵消**。
 */
export function buildHourGate(
  pillars: TemporalPillars,
  options: HourGateOptions = {},
): HourGate {
  const mode: SelectionMode = options.mode ?? 'daily';
  const dayBranch = pillars.day.branch;
  const hourBranch = pillars.hour.branch;

  const clashMonthActive = isClash(hourBranch, pillars.month.branch);
  const clashYearActive = isClash(hourBranch, pillars.year.branch);

  const conflicts: HourGateConflicts = {
    hourBreak: isClash(dayBranch, hourBranch),
    clashMonth: { active: clashMonthActive, severity: clashSeverity(clashMonthActive, mode) },
    clashYear: { active: clashYearActive, severity: clashSeverity(clashYearActive, mode) },
    fiveBuYu: isFiveBuYu(pillars.day.stem, pillars.hour),
    punishment: isPunishment(dayBranch, hourBranch),
    harm: isSixHarm(dayBranch, hourBranch),
  };

  const stemSupport = assessHourStemSupport(pillars.day.stem, pillars.hour.stem);
  const dayLu = isDayLuHour(pillars.day.stem, hourBranch);
  const hasStructuralVeto = conflicts.hourBreak || conflicts.fiveBuYu;

  const support: HourGateSupport = {
    build: dayBranch === hourBranch,
    liuHe: isSixHarmony(dayBranch, hourBranch),
    sanHe: isSameSanHeGroup(dayBranch, hourBranch),
    stemSupport,
    dayLu,
    rescuesWeakDay: !hasStructuralVeto && (isSupportiveHourStem(stemSupport) || dayLu),
  };

  return {
    hourStem: pillars.hour.stem,
    hourBranch,
    mode,
    conflicts,
    support,
    activitySpecific: {},
    status: resolveStatus(conflicts, support, mode),
    reasons: collectReasons(conflicts, support),
    rankingUse: 'disabled',
  };
}
