import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { fromUtc8 } from '../src/engine/time/utc8';
import { searchStars } from '../src/search/StarSearchEngine';
import type { SearchLevel, SearchMatch } from '../src/search/types';
import { buildDirectionGateAssessment } from '../src/selection/directionGate';
import { evaluateDirections, rankDirections } from '../src/selection/evaluateDirection';
import { buildTemporalPillars } from '../src/selection/temporalPillars';
import { buildTemporalBranchContext, buildTimeGateAssessment } from '../src/selection/temporalRules';
import { rankTimeWindows } from '../src/selection/timeWindowRanking';

/**
 * 排序只讀 `startDateTime` 與 `precision`；其餘欄位補成合法空值即可。
 * `endDateTime` 取與起點相同，是為了讓「排序不讀 end」這件事在測試裡也成立——
 * 若哪天有人偷偷改成讀 end，這裡會立刻失去意義而被發現。
 */
function matchAt(startDateTime: string, precision: SearchLevel = 'hour'): SearchMatch {
  return {
    startDateTime,
    endDateTime: startDateTime,
    palace: 'li',
    precision,
    palaceStars: {},
    matchedConditions: [],
    chartContext: {},
  };
}

/**
 * 以下時間點皆由 Day Gate 與 Hour Gate 實算取得，非杜撰：
 *
 * | 時間 | 日課／時課 | 四柱 |
 * |---|---|---|
 * | 2026-09-07T01:00 | caution / preferred | 甲申日 乙丑時 |
 * | 2026-09-13T09:00 | pass / caution | 庚寅日 辛巳時 |
 * | 2026-09-13T23:00 | pass / caution | 庚寅日 丙子時 |
 * | 2026-09-13T15:00 | pass / reject | 庚寅日 甲申時（申沖寅為時破） |
 * | 2026-09-01T07:00 | mixed / preferred | 戊寅日 丙辰時 |
 */
const CAUTION_DAY_PREFERRED_HOUR = '2026-09-07T01:00';
const PASS_DAY_CAUTION_HOUR = '2026-09-13T09:00';
const PASS_DAY_CAUTION_HOUR_LATER = '2026-09-13T23:00';
const PASS_DAY_REJECT_HOUR = '2026-09-13T15:00';
const MIXED_DAY_PREFERRED_HOUR = '2026-09-01T07:00';
/** 丙申月、戊寅時：寅沖申為時沖月令。daily → mixed、construction → reject。 */
const CLASH_MONTH_HOUR = '2026-09-03T03:00';

const startsOf = (windows: readonly { match: SearchMatch }[]) => (
  windows.map((w) => w.match.startDateTime)
);

describe('最佳時窗 Ranking V1', () => {
  it('排序鍵為 可用性 → 日課 → 時課 → 時間', () => {
    const ranked = rankTimeWindows([
      matchAt(PASS_DAY_REJECT_HOUR),
      matchAt(CAUTION_DAY_PREFERRED_HOUR),
      matchAt(MIXED_DAY_PREFERRED_HOUR),
      matchAt(PASS_DAY_CAUTION_HOUR),
    ]);
    expect(startsOf(ranked)).toEqual([
      PASS_DAY_CAUTION_HOUR,          // 日 pass
      MIXED_DAY_PREFERRED_HOUR,       // 日 mixed
      CAUTION_DAY_PREFERRED_HOUR,     // 日 caution
      PASS_DAY_REJECT_HOUR,           // 時破：不論日課多好都出局
    ]);
  });

  it('囚日的 preferred 時辰排在旺日的 caution 時辰之後，即使它在時間上更早', () => {
    // 這是「時者，日之用也」的直接後果，且刻意選用時間次序相反的例子：
    // caution 日在 9/7、pass 日在 9/13，若排序被時間鍵主導，結果會相反。
    const ranked = rankTimeWindows([
      matchAt(CAUTION_DAY_PREFERRED_HOUR),
      matchAt(PASS_DAY_CAUTION_HOUR),
    ]);
    expect(startsOf(ranked)).toEqual([PASS_DAY_CAUTION_HOUR, CAUTION_DAY_PREFERRED_HOUR]);
    expect(ranked[0]?.dayStatus).toBe('pass');
    expect(ranked[0]?.hourStatus).toBe('caution');
    expect(ranked[1]?.dayStatus).toBe('caution');
    expect(ranked[1]?.hourStatus).toBe('preferred');
  });

  it('時破排在最後並標明唯一排除來源，不因日課旺相而回到前面', () => {
    const ranked = rankTimeWindows([
      matchAt(PASS_DAY_REJECT_HOUR),
      matchAt(CAUTION_DAY_PREFERRED_HOUR),
    ]);
    const rejected = ranked.at(-1)!;
    expect(rejected.match.startDateTime).toBe(PASS_DAY_REJECT_HOUR);
    expect(rejected.admissibility).toBe('rejected');
    expect(rejected.rejectedBy).toEqual(['hour_gate_reject']);
    expect(rejected.dayStatus).toBe('pass');
    // 可用的時窗一律不帶排除理由。
    expect(ranked[0]?.admissibility).toBe('admissible');
    expect(ranked[0]?.rejectedBy).toEqual([]);
  });

  it('dropRejected 才會移除不可用時窗，預設保留', () => {
    const input = [matchAt(PASS_DAY_REJECT_HOUR), matchAt(PASS_DAY_CAUTION_HOUR)];
    expect(rankTimeWindows(input)).toHaveLength(2);
    const dropped = rankTimeWindows(input, { dropRejected: true });
    expect(startsOf(dropped)).toEqual([PASS_DAY_CAUTION_HOUR]);
    expect(dropped.every((w) => w.admissibility === 'admissible')).toBe(true);
  });

  it('tier 依 可用性／日課／時課 分組，時間不進 tier', () => {
    const ranked = rankTimeWindows([
      matchAt(PASS_DAY_CAUTION_HOUR),
      matchAt(PASS_DAY_CAUTION_HOUR_LATER),
      matchAt(CAUTION_DAY_PREFERRED_HOUR),
      matchAt(PASS_DAY_REJECT_HOUR),
    ]);
    // 前兩者同日同時課，時間不同但仍同 tier。
    expect(ranked.map((w) => w.tier)).toEqual([1, 1, 2, 3]);
    expect(ranked.slice(0, 2).map((w) => w.match.startDateTime))
      .toEqual([PASS_DAY_CAUTION_HOUR, PASS_DAY_CAUTION_HOUR_LATER]);
  });

  it('平手按時間遞增，且與輸入次序無關（排序穩定可重現）', () => {
    const forward = rankTimeWindows([
      matchAt(PASS_DAY_CAUTION_HOUR), matchAt(PASS_DAY_CAUTION_HOUR_LATER),
    ]);
    const reversed = rankTimeWindows([
      matchAt(PASS_DAY_CAUTION_HOUR_LATER), matchAt(PASS_DAY_CAUTION_HOUR),
    ]);
    expect(startsOf(forward)).toEqual([PASS_DAY_CAUTION_HOUR, PASS_DAY_CAUTION_HOUR_LATER]);
    expect(startsOf(reversed)).toEqual(startsOf(forward));
  });

  it('日精度不補時柱：hourStatus 為 not_applicable，且不重用 not_evaluated', () => {
    const ranked = rankTimeWindows([matchAt('2026-09-13T12:00', 'day')]);
    expect(ranked[0]?.hourStatus).toBe('not_applicable');
    expect(ranked[0]?.admissibility).toBe('admissible');
    // not_evaluated 語義是「本版本尚未評估」，與「此精度無此概念」不同，不得混用。
    expect(JSON.stringify(ranked)).not.toContain('not_evaluated');
  });

  it('日精度只用日課與時間排序', () => {
    const ranked = rankTimeWindows([
      matchAt('2026-09-07T12:00', 'day'),   // caution
      matchAt('2026-09-13T12:00', 'day'),   // pass
      matchAt('2026-09-01T12:00', 'day'),   // mixed
    ]);
    expect(ranked.map((w) => w.dayStatus)).toEqual(['pass', 'mixed', 'caution']);
  });

  it('拒絕混精度輸入，而不是產出無意義的順序', () => {
    // 「日精度跳過時課」只在整批同精度時才是良定義的；混在一起會失去遞移性。
    expect(() => rankTimeWindows([
      matchAt(PASS_DAY_CAUTION_HOUR, 'hour'),
      matchAt('2026-09-13T12:00', 'day'),
    ])).toThrow(RangeError);
  });

  it('mode 確實傳達到 Hour Gate：沖月令在 construction 由 mixed 變 reject', () => {
    // 2026-09-03T03:00＝丙申月、戊寅時，寅沖申為時沖月令；日柱庚辰不受影響。
    const daily = rankTimeWindows([matchAt(CLASH_MONTH_HOUR)], { mode: 'daily' })[0]!;
    const construction = rankTimeWindows(
      [matchAt(CLASH_MONTH_HOUR)], { mode: 'construction' },
    )[0]!;
    expect(daily.hourStatus).toBe('mixed');
    expect(daily.admissibility).toBe('admissible');
    expect(construction.hourStatus).toBe('reject');
    expect(construction.admissibility).toBe('rejected');
    expect(construction.rejectedBy).toEqual(['hour_gate_reject']);
  });

  it('construction 不得改動日課', () => {
    for (const at of [
      CLASH_MONTH_HOUR, CAUTION_DAY_PREFERRED_HOUR, PASS_DAY_CAUTION_HOUR,
      MIXED_DAY_PREFERRED_HOUR, PASS_DAY_REJECT_HOUR,
    ]) {
      const daily = rankTimeWindows([matchAt(at)], { mode: 'daily' })[0]!;
      const construction = rankTimeWindows([matchAt(at)], { mode: 'construction' })[0]!;
      expect(construction.dayStatus).toBe(daily.dayStatus);
    }
  });

  it('construction 只是抬高門檻，不會讓原本不可用的時窗變可用', () => {
    for (const at of [CLASH_MONTH_HOUR, PASS_DAY_REJECT_HOUR, PASS_DAY_CAUTION_HOUR]) {
      const daily = rankTimeWindows([matchAt(at)], { mode: 'daily' })[0]!;
      const construction = rankTimeWindows([matchAt(at)], { mode: 'construction' })[0]!;
      if (daily.admissibility === 'rejected') {
        expect(construction.admissibility).toBe('rejected');
      }
    }
  });

  it('消費既有 SearchMatch，不重算飛星', () => {
    const matches = searchStars({
      version: 1,
      startDate: '2026-09-01',
      endDate: '2026-09-20',
      palace: 'li',
      conditions: [{ level: 'hour', stars: [9] }],
    }, { dayChangeMode: 'midnight', yearBoundary: 'lichun', keStrategyId: 'eight-ke-15min' });
    expect(matches.length).toBeGreaterThan(0);
    const ranked = rankTimeWindows(matches);
    expect(ranked).toHaveLength(matches.length);
    // 逐項仍是**原本那個物件**（reference equality），沒有被複製或改寫；
    // 這正是「消費既有 SearchMatch，不重算飛星」的可測形式。
    const original = new Set<SearchMatch>(matches);
    for (const window of ranked) expect(original.has(window.match)).toBe(true);
    expect(new Set(ranked.map((w) => w.match)).size).toBe(matches.length);
  });
});

describe('regression：最佳時窗不得外溢到方向軸', () => {
  const AT = fromUtc8(2026, 9, 13, 9, 0);
  const someMatches = [matchAt(PASS_DAY_CAUTION_HOUR), matchAt(PASS_DAY_REJECT_HOUR)];

  it('計算時窗排序前後，八方 verdict 與排序完全相同', () => {
    const fingerprint = () => {
      const evaluations = evaluateDirections(computeFullChart(AT));
      return {
        verdicts: evaluations.map((e) => `${e.snapshot.palace}:${e.verdict}`),
        order: rankDirections(evaluations).map((e) => e.snapshot.palace),
      };
    };
    const before = fingerprint();
    expect(rankTimeWindows(someMatches)).toHaveLength(2);
    expect(fingerprint()).toEqual(before);
  });

  it('DirectionEvaluation 完全沒有時窗層欄位', () => {
    const serialized = JSON.stringify(evaluateDirections(computeFullChart(AT)));
    for (const token of [
      'tier', 'timeRankingUse', 'admissibility', 'rejectedBy', 'hour_gate_reject',
      'not_applicable',
    ]) {
      expect(serialized).not.toContain(token);
    }
  });

  it('RankedTimeWindow 不得出現方向軸的字：rankingUse 與 verdict', () => {
    const serialized = JSON.stringify(rankTimeWindows(someMatches));
    // rankingUse 在時間層是禁用名，地位同 yuePo。
    expect(serialized).not.toContain('rankingUse');
    expect(serialized).not.toContain('verdict');
    expect(serialized).toContain('timeRankingUse');
  });

  it('方位 Gate 的 rankingUse 仍為 disabled，hourStatus 仍為 not_evaluated', () => {
    rankTimeWindows(someMatches);
    const assessment = buildTimeGateAssessment(buildTemporalBranchContext(AT));
    expect(assessment.rankingUse).toBe('disabled');
    expect(assessment.hourStatus).toBe('not_evaluated');
    const pillars = buildTemporalPillars(AT);
    const gate = buildDirectionGateAssessment({
      yearBranch: pillars.year.branch,
      monthBranch: pillars.month.branch,
      dayBranch: pillars.day.branch,
    }, 'li');
    expect(gate.status).toBe('not_evaluated');
    for (const hit of gate.hits) {
      expect(hit.rankingUse).toBe('disabled');
      expect(hit.gateUse).toBe('reference_only');
    }
  });
});
