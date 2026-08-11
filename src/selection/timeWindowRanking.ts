/**
 * 最佳時窗 Ranking V1 —— 本專案**唯一會排序的判定層**。
 *
 * 契約見 `docs/time-window-ranking-v1-authoritative-rules.md`。
 *
 * 排的是**時間**不是方向：
 *
 * ```ts
 * axis = 'temporal';
 * ```
 *
 * Day Gate 與 Hour Gate 都不依賴宮位——同一時刻八個方向拿到的日課、時課完全相同——
 * 所以把它們加進 `rankDirections()` 等於對八方同加一個常數，排序輸出一格不會變。
 * Gate 的正確去處是時間軸。反過來，本層**不排序方向**。
 *
 * 使用者於 2026-08-11 授權的範圍**僅限時間軸**：三個方位 Gate 的 `rankingUse`
 * 仍為 `'disabled'`，`verdictFor()` 與 `rankDirections()` 仍讀不到任何 Gate 欄位，
 * 由 `tests/timeWindowRanking.test.ts` 的 regression 鎖定。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL；`mode` 由呼叫端自 settings 取好傳入。
 * **不重算飛星**——直接消費既有的 `SearchMatch[]`（`docs/HANDOFF.md` 保留的 extension point）。
 */

import { parseUtc8 } from '../engine/time/utc8';
import type { DayChangeMode } from '../engine/time/ganzhiDay';
import type { YearBoundary } from '../engine/flyingStar/yearStar';
import type { SearchMatch } from '../search/types';
import { type HourGateStatus, type SelectionMode, buildHourGate } from './hourGate';
import { type TemporalPillars, buildTemporalPillars } from './temporalPillars';
import { buildTemporalBranchContext, buildTimeGateAssessment } from './temporalRules';
import type { DayGateStatus } from './types';

export type TimeWindowAdmissibility = 'admissible' | 'rejected';

/**
 * 日精度沒有唯一時辰，故另立 `'not_applicable'`。
 *
 * **不得重用 `'not_evaluated'`**：後者已被 `TimeGateAssessment.hourStatus` 佔用，
 * 語義是「本版本尚未評估」，與「此精度不存在這個概念」是兩回事。
 */
export type TimeWindowHourStatus = HourGateStatus | 'not_applicable';

/** V1 只有一個排除來源。新增任何一個都屬規則文件 §10 的 stop condition。 */
export type TimeWindowRejection = 'hour_gate_reject';

export interface RankedTimeWindow {
  /** 直接引用來源 match，不複製飛星資料、不重算。 */
  match: SearchMatch;
  pillars: TemporalPillars;
  admissibility: TimeWindowAdmissibility;
  /** `admissible` 時恆為空陣列。 */
  rejectedBy: readonly TimeWindowRejection[];
  dayStatus: DayGateStatus;
  hourStatus: TimeWindowHourStatus;
  /** 1 起算；排序鍵（可用性、日課、時課）三者相同的時窗共用同一個 tier。 */
  tier: number;
  /**
   * 本層專用。**`rankingUse` 在時間層是禁用名**，地位同 `yuePo`：
   * 日後看到 `rankingUse: 'active'` 出現在任何地方，必須能立刻判定為錯，
   * 而不必先追它屬於哪個軸。
   */
  timeRankingUse: 'active';
}

export interface TimeWindowRankingOptions {
  mode?: SelectionMode;
  dayChangeMode?: DayChangeMode;
  yearBoundary?: YearBoundary;
  /** 預設 false：被排除的時窗仍回傳，只是排在最後並標明原因。 */
  dropRejected?: boolean;
}

/** 日為體。旺相 → 休 → 囚死。 */
const DAY_STATUS_ORDER: Readonly<Record<DayGateStatus, number>> = Object.freeze({
  pass: 0, mixed: 1, caution: 2,
});

/**
 * 時為用。`reject` 不在此表——它由 `admissibility` 處理，不參與同級比較。
 */
const HOUR_STATUS_ORDER: Readonly<Record<Exclude<HourGateStatus, 'reject'>, number>> = Object.freeze({
  preferred: 0, pass: 1, mixed: 2, caution: 3,
});

function hourRank(status: TimeWindowHourStatus): number {
  if (status === 'reject' || status === 'not_applicable') return Number.NaN;
  return HOUR_STATUS_ORDER[status];
}

/**
 * 規則文件 §5.1 說日精度「鍵 2 跳過」。那條規則只有在**整批同精度**時才是良定義的：
 * 若把日精度與時精度混在一起，比較會失去遞移性（A 與 B 平手、A 與 C 平手，
 * 但 B 與 C 分高下），排序結果隨輸入次序而變。
 *
 * `searchStars()` 的 `precision` 每次查詢只算一次，因此同一批 `SearchMatch` 必然同精度；
 * 混精度代表呼叫端把不同查詢的結果併在一起，屬程式錯誤。
 * 與其產出一個沒有意義的順序，不如當場擋下。
 */
function assertUniformPrecision(matches: readonly SearchMatch[]): void {
  const first = matches[0];
  if (!first) return;
  for (const match of matches) {
    if (match.precision !== first.precision) {
      // 訊息用英文：這是 programmer error，不是使用者條件，且 `src/**` 的字串常量
      // 會被字體 subset 掃描（見 `scripts/build-font-subset.py`），
      // 不值得為使用者看不到的訊息擴大自帶字體。既有慣例見 `ganzhiFromStemBranch`。
      throw new RangeError(
        `rankTimeWindows requires uniform precision: got ${first.precision} and ${match.precision}`,
      );
    }
  }
}

interface Scored {
  window: Omit<RankedTimeWindow, 'tier'>;
  start: number;
}

function score(
  match: SearchMatch,
  options: TimeWindowRankingOptions,
): Scored {
  const start = parseUtc8(match.startDateTime);
  if (!start) throw new RangeError(`unparsable window start: ${match.startDateTime}`);
  const contextOptions = {
    dayChangeMode: options.dayChangeMode,
    yearBoundary: options.yearBoundary,
  };
  const pillars = buildTemporalPillars(start, contextOptions);
  const dayStatus = buildTimeGateAssessment(
    buildTemporalBranchContext(start, contextOptions),
  ).dayStatus;

  // 日精度涵蓋十二個時辰，沒有唯一時柱可判；補一個代表時辰就是捏造。
  if (match.precision === 'day') {
    return {
      start: start.getTime(),
      window: {
        match,
        pillars,
        admissibility: 'admissible',
        rejectedBy: [],
        dayStatus,
        hourStatus: 'not_applicable',
        timeRankingUse: 'active',
      },
    };
  }

  const hourGate = buildHourGate(pillars, { mode: options.mode });
  const rejected = hourGate.status === 'reject';
  return {
    start: start.getTime(),
    window: {
      match,
      pillars,
      admissibility: rejected ? 'rejected' : 'admissible',
      rejectedBy: rejected ? ['hour_gate_reject'] : [],
      dayStatus,
      hourStatus: hourGate.status,
      timeRankingUse: 'active',
    },
  };
}

/** 排序鍵 0–2；相同代表同 tier。鍵 3（時間）另行比較，不進 tier。 */
function tierKey(window: Omit<RankedTimeWindow, 'tier'>): string {
  return `${window.admissibility}|${window.dayStatus}|${window.hourStatus}`;
}

function compare(a: Scored, b: Scored): number {
  // 鍵 0：structural veto 是入場資格，不受「日為體」的主從關係約束。
  const admissible = Number(a.window.admissibility === 'rejected')
    - Number(b.window.admissibility === 'rejected');
  if (admissible !== 0) return admissible;

  // 鍵 1：日為體。《協紀》卷三十四〈用時法〉「時者，日之用也」。
  const day = DAY_STATUS_ORDER[a.window.dayStatus] - DAY_STATUS_ORDER[b.window.dayStatus];
  if (day !== 0) return day;

  // 鍵 2：時為用。整批同精度已由 assertUniformPrecision 保證，
  // 故此處若有一邊是 NaN，另一邊必然也是。
  const hour = hourRank(a.window.hourStatus) - hourRank(b.window.hourStatus);
  if (!Number.isNaN(hour) && hour !== 0) return hour;

  // 鍵 3：**這不是判定，只是讓輸出可重現**。UI 必須明示，別讓人以為越早越吉。
  return a.start - b.start;
}

/**
 * 依「可用性 → 日課 → 時課 → 時間」排序候選時窗。
 *
 * 排序鍵**只有這四個**；第五個鍵屬規則文件 §10 的 stop condition。
 * 分層是 lexicographic，**不是加權和**——把兩個 Gate 換算成數字相加會違反
 * `hour-gate-v1` §7「Gate 不做算術抵消」。輸出沒有分數、沒有星級。
 *
 * 一個看似違直覺但正確的後果：**囚日的 `preferred` 時辰排在旺日的 `caution` 時辰之後**。
 * 那正是「先擇日、再於日內擇時」；把時課提前等於推翻 `hour-gate-v1` §0 已封版的
 * `hourRole = 'support_and_refinement'`。
 */
export function rankTimeWindows(
  matches: readonly SearchMatch[],
  options: TimeWindowRankingOptions = {},
): readonly RankedTimeWindow[] {
  assertUniformPrecision(matches);
  const scored = matches.map((match) => score(match, options));
  scored.sort(compare);

  const ranked: RankedTimeWindow[] = [];
  let tier = 0;
  let previousKey: string | undefined;
  for (const item of scored) {
    if (options.dropRejected && item.window.admissibility === 'rejected') continue;
    const key = tierKey(item.window);
    if (key !== previousKey) {
      tier += 1;
      previousKey = key;
    }
    ranked.push({ ...item.window, tier });
  }
  return ranked;
}
