import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { BRANCHES, type Branch } from '../src/engine/time/ganzhi';
import { fromUtc8 } from '../src/engine/time/utc8';
import {
  type DirectionShaSource,
  buildDirectionGateAssessment,
  buildDirectionGateAssessments,
  getDirectionShaAffected,
} from '../src/selection/directionGate';
import { evaluateDirections, rankDirections } from '../src/selection/evaluateDirection';
import { getSanShaMountains, getSuiPoMountain, palaceOfMountain } from '../src/selection/mountains24';
import { buildTemporalPillars } from '../src/selection/temporalPillars';
import type { DirectionPalaceKey } from '../src/selection/types';

const PALACES: readonly DirectionPalaceKey[] = ['kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian'];

function source(yearBranch: Branch, monthBranch: Branch, dayBranch: Branch): DirectionShaSource {
  return { yearBranch, monthBranch, dayBranch };
}

describe('Direction Gate 組裝', () => {
  it('五條規則齊備，且不自造時三煞', () => {
    const rules = getDirectionShaAffected(source('子', '寅', '午')).map((hit) => hit.rule);
    expect(rules).toEqual(['sui_po', 'month_break', 'year_san_sha', 'month_san_sha', 'day_san_sha']);
    expect(rules).not.toContain('hour_san_sha');
  });

  it('歲破、月破方各一山；三煞各三山', () => {
    const affected = getDirectionShaAffected(source('子', '寅', '午'));
    const byRule = Object.fromEntries(affected.map((hit) => [hit.rule, hit.affectedMountains]));
    expect(byRule.sui_po).toEqual(['午']);
    expect(byRule.month_break).toEqual(['申']);
    expect(byRule.year_san_sha).toEqual(['巳', '午', '未']);
    expect(byRule.month_san_sha).toEqual(['亥', '子', '丑']);
    expect(byRule.day_san_sha).toEqual(['亥', '子', '丑']);
  });

  it('V1 政策欄位固定：status 未評估、不參排序、只作參考、精度為八宮', () => {
    const assessment = buildDirectionGateAssessment(source('子', '子', '子'), 'li');
    expect(assessment.status).toBe('not_evaluated');
    expect(assessment.precision).toBe('palace8');
    // note 是穩定代碼，計算層不得內嵌 user-facing 中文（接手指南 §7）
    expect(assessment.note).toBe('v1_reference_only_not_evaluated');
    expect(assessment.note).not.toMatch(/[一-鿿]/u);
    for (const hit of assessment.hits) {
      expect(hit.rankingUse).toBe('disabled');
      expect(hit.gateUse).toBe('reference_only');
      expect(hit.evidenceLevel).toBe('C');
    }
  });

  it('本宮三山正確，且未命中的規則不入 hits', () => {
    // 子年寅月午日：歲破午、月破申、年三煞巳午未、月日三煞亥子丑
    const assessment = buildDirectionGateAssessment(source('子', '寅', '午'), 'zhen');
    expect(assessment.mountains).toEqual(['甲', '卯', '乙']);
    expect(assessment.hits).toEqual([]);
    expect(assessment.coverage).toBe('none');
  });

  it('partial hit：離宮只有午受影響，丙、丁不命中', () => {
    const assessment = buildDirectionGateAssessment(source('子', '寅', '午'), 'li');
    expect(assessment.mountains).toEqual(['丙', '午', '丁']);
    expect(assessment.coverage).toBe('partial');
    for (const hit of assessment.hits) expect(hit.matched).toEqual(['午']);
  });

  it('overlap 並列：年月支相同時歲破與月破方同山，仍各自登記一次', () => {
    const assessment = buildDirectionGateAssessment(source('子', '子', '子'), 'li');
    const rules = assessment.hits.map((hit) => hit.rule);
    // 歲破午、月破方午、年三煞巳午未、月三煞、日三煞 —— 五條全部命中離宮的午
    expect(rules).toEqual(['sui_po', 'month_break', 'year_san_sha', 'month_san_sha', 'day_san_sha']);
    for (const hit of assessment.hits) expect(hit.matched).toEqual(['午']);
    // 但整體 coverage 取聯集，同一山不因五條命中而重複計入
    expect(assessment.coverage).toBe('partial');
  });

  it('coverage 取聯集而非命中條數', () => {
    // 亥年：歲破巳；亥屬亥卯未局，三煞申酉戌 —— 兌宮三山庚酉辛只有酉命中
    const dui = buildDirectionGateAssessment(source('亥', '亥', '亥'), 'dui');
    expect(dui.coverage).toBe('partial');
    expect(new Set(dui.hits.flatMap((hit) => [...hit.matched]))).toEqual(new Set(['酉']));
  });

  it('三煞跨三宮，每宮各 partial，合計三宮命中', () => {
    const src = source('午', '午', '午'); // 寅午戌局 → 三煞亥子丑
    const affectedPalaces = PALACES.filter(
      (palace) => buildDirectionGateAssessment(src, palace).hits.length > 0,
    );
    expect(getSanShaMountains('午').map(palaceOfMountain)).toEqual(['qian', 'kan', 'gen']);
    // 午年歲破子、月破方子，同樣落坎宮
    expect(affectedPalaces).toEqual(['kan', 'gen', 'qian']);
    for (const palace of affectedPalaces) {
      expect(buildDirectionGateAssessment(src, palace).coverage, palace).toBe('partial');
    }
  });

  it('八宮全覆蓋，且任一組年月日都不會讓某宮 coverage 變成 full', () => {
    for (const yearBranch of BRANCHES) {
      for (const monthBranch of BRANCHES) {
        const src = source(yearBranch, monthBranch, monthBranch);
        const all = buildDirectionGateAssessments(src, PALACES);
        expect(all).toHaveLength(8);
        for (const assessment of all) {
          expect(assessment.coverage, `${yearBranch}${monthBranch}-${assessment.palace}`).not.toBe('full');
        }
      }
    }
  });

  it('每個 matched 山必屬本宮，且 affectedMountains 為該規則全部影響山', () => {
    const src = source('子', '卯', '申');
    for (const palace of PALACES) {
      const assessment = buildDirectionGateAssessment(src, palace);
      for (const hit of assessment.hits) {
        for (const mountain of hit.matched) {
          expect(assessment.mountains).toContain(mountain);
          expect(hit.affectedMountains).toContain(mountain);
          expect(palaceOfMountain(mountain)).toBe(palace);
        }
      }
    }
  });

  it('歲破恆命中且僅命中一個宮', () => {
    for (const yearBranch of BRANCHES) {
      const src = source(yearBranch, yearBranch, yearBranch);
      const hitPalaces = PALACES.filter((palace) => (
        buildDirectionGateAssessment(src, palace).hits.some((hit) => hit.rule === 'sui_po')
      ));
      expect(hitPalaces, yearBranch).toEqual([palaceOfMountain(getSuiPoMountain(yearBranch))]);
    }
  });
});

describe('regression：Direction Gate 不得影響方向 verdict 與排序', () => {
  const AT = fromUtc8(2026, 8, 7, 11, 38);

  function evaluationFingerprint(purpose: 'general' | 'fame' = 'general') {
    const chart = computeFullChart(AT);
    const evaluations = evaluateDirections(chart, purpose);
    const ranked = rankDirections(evaluations);
    return {
      verdicts: evaluations.map((e) => `${e.snapshot.palace}:${e.verdict}`),
      order: ranked.map((e) => e.snapshot.palace),
    };
  }

  it('計算 Direction Gate 前後，八方 verdict 與排序完全相同', () => {
    const before = evaluationFingerprint();
    const pillars = buildTemporalPillars(AT);
    const src = source(pillars.year.branch, pillars.month.branch, pillars.day.branch);
    const assessments = buildDirectionGateAssessments(src, PALACES);
    // 本日確實有宮被命中，否則這個 regression 沒有說服力
    expect(assessments.some((assessment) => assessment.hits.length > 0)).toBe(true);
    const after = evaluationFingerprint();
    expect(after).toEqual(before);
  });

  it('DirectionEvaluation 完全沒有 Direction Gate 欄位', () => {
    const chart = computeFullChart(AT);
    const serialized = JSON.stringify(evaluateDirections(chart));
    // 只檢查 Direction Gate 專屬 token。`not_evaluated` 不可用作判準——
    // 既有 TimeGateAssessment.hourStatus 本來就是 'not_evaluated'。
    for (const token of [
      'sui_po', 'month_break', 'san_sha', 'sanSha', 'affectedMountains',
      'gateUse', 'palace8', 'v1_reference_only_not_evaluated',
    ]) {
      expect(serialized, token).not.toContain(token);
    }
  });

  it('被歲破或三煞命中的方向，verdict 與名次不因此下降', () => {
    const chart = computeFullChart(AT);
    const pillars = buildTemporalPillars(AT);
    const src = source(pillars.year.branch, pillars.month.branch, pillars.day.branch);
    const hitPalaces = new Set(
      PALACES.filter((palace) => buildDirectionGateAssessment(src, palace).hits.length > 0),
    );
    expect(hitPalaces.size).toBeGreaterThan(0);
    const ranked = rankDirections(evaluateDirections(chart));
    // 命中方位神煞的宮並沒有被推到排序末端，證明 rankDirections 未讀 Gate
    const hitRanks = ranked
      .map((evaluation, index) => ({ palace: evaluation.snapshot.palace, index }))
      .filter((entry) => hitPalaces.has(entry.palace))
      .map((entry) => entry.index);
    const tailStart = 8 - hitPalaces.size;
    expect(Math.min(...hitRanks)).toBeLessThan(tailStart);
  });

  it('多個時間點下 Gate 命中情形會變，但排序邏輯不受影響', () => {
    const moments = [
      fromUtc8(2024, 3, 15, 10, 0),
      fromUtc8(2025, 6, 1, 14, 0),
      fromUtc8(2026, 8, 7, 11, 38),
      fromUtc8(2027, 11, 20, 8, 30),
    ];
    const hitCounts = new Set<number>();
    for (const moment of moments) {
      const chart = computeFullChart(moment);
      const pillars = buildTemporalPillars(moment);
      const src = source(pillars.year.branch, pillars.month.branch, pillars.day.branch);
      hitCounts.add(
        PALACES.filter((palace) => buildDirectionGateAssessment(src, palace).hits.length > 0).length,
      );
      const ranked = rankDirections(evaluateDirections(chart));
      expect(ranked).toHaveLength(8);
      expect(new Set(ranked.map((e) => e.snapshot.palace)).size).toBe(8);
    }
    // Gate 命中宮數確實隨時間變動，證明上面的不變性不是因為 Gate 恆空
    expect(hitCounts.size).toBeGreaterThan(1);
  });
});
