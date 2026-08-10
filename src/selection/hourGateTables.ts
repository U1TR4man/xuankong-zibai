/**
 * Hour Gate V1 —— 五不遇、日祿時與時干扶日的固定表。
 *
 * 契約見 `docs/hour-gate-v1-authoritative-rules.md` §1.3、§2、§8、§12 第 2 步。
 *
 * 核心定位（§0）：**時者，日之用也**。時辰不是脫離日柱再擇一次吉凶，
 * 而是先不能破日、沖月令／歲君，再看能否扶日。因此本檔的三張表全部
 * 以**日干**為輸入基準。
 *
 * V1 政策：本檔只提供表與純函式，不做 precedence 組裝、不改
 * `TimeGateAssessment.hourStatus`（仍為 `'not_evaluated'`）、不參與
 * `verdictFor()` 或 `rankDirections()`。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 */

import type { Branch, Ganzhi, Stem } from '../engine/time/ganzhi';
import { dayElementFor, elementRelationBetween } from './temporalRules';

/* ------------------------------------------------------------------ *
 * 五不遇時
 * ------------------------------------------------------------------ */

/**
 * 五不遇時＝時干剋日干的**指定十組定局**。
 *
 * | 日干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
 * |---|---|---|---|---|---|---|---|---|---|---|
 * | 五不遇 | 庚午 | 辛巳 | 壬辰 | 癸卯 | 甲寅 | 乙丑 | 丙子 | 丁酉 | 戊申 | 己未 |
 *
 * **必須用定局表，不得用 generic「時干剋日干且同陰陽」推導**：傳本干支配時
 * 差異會造成 false positive（§1.3）。表值與五鼠遁的一致性由測試鎖定，
 * 但一致性是**驗證**手段，不是取值來源。
 */
const FIVE_BU_YU: Readonly<Record<Stem, string>> = Object.freeze({
  甲: '庚午', 乙: '辛巳', 丙: '壬辰', 丁: '癸卯', 戊: '甲寅',
  己: '乙丑', 庚: '丙子', 辛: '丁酉', 壬: '戊申', 癸: '己未',
});

/**
 * 是否為五不遇時。
 *
 * **不得把「時支剋日支」混入**：《協紀辨方書》卷七專門校正，正法只看
 * 時干剋日干；另一傳法連時支剋日支亦算，《協紀》認為不如前法。
 * 時支與日支的關係另走時破、時刑、日害、六合、時建（§1.3）。
 *
 * severity 為 `strong_caution` 而非 hardReject（§4.1）：《造命宗鏡集》卷六
 * 保存楊公用課「曾犯五不遇，但取兩干不雜」。本檔只回傳事實，不定強度。
 */
export function isFiveBuYu(dayStem: Stem, hourGanzhi: Ganzhi): boolean {
  return FIVE_BU_YU[dayStem] === hourGanzhi.text;
}

/** 該日干的五不遇時干支文字，供 UI 說明與資料檢查使用。 */
export function fiveBuYuGanzhiFor(dayStem: Stem): string {
  return FIVE_BU_YU[dayStem];
}

/* ------------------------------------------------------------------ *
 * 日祿時
 * ------------------------------------------------------------------ */

/**
 * 十干日祿時（天干正祿／臨官位）。
 *
 * | 日干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
 * |---|---|---|---|---|---|---|---|---|---|---|
 * | 祿時 | 寅 | 卯 | 巳 | 午 | 巳 | 午 | 申 | 酉 | 亥 | 子 |
 *
 * 戊祿在巳、己祿在午，與丙丁同位，這是定局不是筆誤。
 *
 * **祿時不凌駕負面規則**（§3.2）：祿時＋時破仍以時破優先；
 * 祿時＋五不遇不得直接升為 preferred。本檔只回傳事實，precedence 屬組裝層。
 */
const DAY_LU_HOUR: Readonly<Record<Stem, Branch>> = Object.freeze({
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳',
  己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
});

/** 時支是否為該日干的祿時。 */
export function isDayLuHour(dayStem: Stem, hourBranch: Branch): boolean {
  return DAY_LU_HOUR[dayStem] === hourBranch;
}

/** 該日干的祿時支。 */
export function dayLuBranchFor(dayStem: Stem): Branch {
  return DAY_LU_HOUR[dayStem];
}

/* ------------------------------------------------------------------ *
 * 時干扶日
 * ------------------------------------------------------------------ */

/**
 * 時干對日干的六種五行關係。
 *
 * `neutral` 保留自規則文件 §8 的型別定義，但五行兩兩之間必屬其餘五種之一，
 * 因此 V1 實際永不回傳；由測試以 100 組全枚舉鎖定。
 */
export type HourStemSupport =
  | 'same_element'
  | 'generates_day'
  | 'neutral'
  | 'drains_day'
  | 'controlled_by_day'
  | 'controls_day';

/**
 * 時干對日干的關係。
 *
 * 五行取既有 `dayElementFor()`，關係取既有 `elementRelationBetween()`，
 * 兩者都在 `temporalRules.ts`，**不另建第二套五行表**。
 *
 * 注意方向：以**時干**為主體判斷它對日干做了什麼。
 */
export function assessHourStemSupport(dayStem: Stem, hourStem: Stem): HourStemSupport {
  switch (elementRelationBetween(dayElementFor(hourStem), dayElementFor(dayStem))) {
    case 'same': return 'same_element';
    case 'generates': return 'generates_day';
    case 'controls': return 'controls_day';
    case 'controlled_by': return 'controlled_by_day';
    // 時干被日干所生＝日干洩氣於時干
    default: return 'drains_day';
  }
}

/**
 * V1 只把比助與生日當正面訊號（§2）。
 *
 * 洩、耗、剋在 V1 不作負面扣分——研究稿未給強度，且 Gate 不做數值抵消。
 */
export function isSupportiveHourStem(support: HourStemSupport): boolean {
  return support === 'same_element' || support === 'generates_day';
}
