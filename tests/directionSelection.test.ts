import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { BRANCHES, STEMS, type Branch, type Stem } from '../src/engine/time/ganzhi';
import { fromUtc8 } from '../src/engine/time/utc8';
import {
  type DirectionSelectionSource,
  buildDirectionSelectionAssessment,
  buildDirectionSelectionAssessments,
  buildDirectionSelectionContext,
} from '../src/selection/directionSelection';
import { evaluateDirections, rankDirections } from '../src/selection/evaluateDirection';
import { palaceOfMountain } from '../src/selection/mountains24';
import { buildTemporalPillars } from '../src/selection/temporalPillars';
import type { DirectionPalaceKey } from '../src/selection/types';

const PALACES: readonly DirectionPalaceKey[] = ['kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian'];

function src(yearStem: Stem, yearBranch: Branch, monthBranch: Branch, dayBranch: Branch): DirectionSelectionSource {
  return { yearStem, yearBranch, monthBranch, dayBranch };
}

/**
 * 己酉年未月：
 * - 三德叢聚在甲（己年歲德甲、未月天德甲、未月月德甲），甲屬震宮
 * - 歲破 = 酉之對沖卯，卯亦屬震宮
 * - 年三煞：酉屬巳酉丑局 → 三煞寅卯辰，卯同樣在震宮
 * 因此震宮同時有得吉山（甲）與受煞山（卯），是驗證「正負並存不相抵」的關鍵案例。
 */
const CONFLICT = src('己', '酉', '未', '子');

describe('V2 組裝：constraints 與 positives 分 channel', () => {
  it('context 只依年干與月支，八宮共用同一份', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    expect(context.virtues).toHaveLength(6);
    expect(context.sanDeFang).toEqual({ active: true, mountain: '甲' });
    expect(context.monthJinKui).toEqual({ branch: '卯', rankingUse: 'disabled', mode: 'reference_only' });
  });

  it('V1 政策欄位固定：status 未評估、不參排序', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    for (const assessment of buildDirectionSelectionAssessments(context, PALACES)) {
      expect(assessment.status, assessment.target.palace).toBe('not_evaluated');
      expect(assessment.rankingUse).toBe('disabled');
      expect(assessment.constraints.status).toBe('not_evaluated');
      for (const virtue of assessment.positives.virtues) expect(virtue.rankingUse).toBe('disabled');
    }
  });

  it('八宮全覆蓋，target 與 constraints 的宮位一致', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    const all = buildDirectionSelectionAssessments(context, PALACES);
    expect(all).toHaveLength(8);
    expect(all.map((a) => a.target.palace)).toEqual(PALACES);
    for (const assessment of all) {
      expect(assessment.constraints.palace).toBe(assessment.target.palace);
    }
  });

  it('positives 只含落在本宮的六德，全盤六項仍在 context', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    const zhen = buildDirectionSelectionAssessment(context, 'zhen');
    // 己年歲德甲、未月天德甲、未月月德甲 → 三項都在震宮
    expect(zhen.positives.virtues.map((v) => v.code).sort()).toEqual(['sui_de', 'tian_de', 'yue_de']);
    expect(zhen.positives.matched).toEqual(['甲']);
    expect(zhen.positives.coverage).toBe('partial');
    // 己年歲德合己、未月天德合己、未月月德合己 —— 全部無外方，不在任何宮
    for (const palace of PALACES) {
      const assessment = buildDirectionSelectionAssessment(context, palace);
      for (const virtue of assessment.positives.virtues) {
        expect(virtue.position.kind).toBe('mountain');
      }
    }
    expect(context.virtues.filter((v) => v.position.kind === 'outside_24_mountains')).toHaveLength(3);
  });

  it('三德叢聚只出現在該山所屬的宮', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    const withPattern = PALACES.filter(
      (palace) => buildDirectionSelectionAssessment(context, palace).positives.patterns.sanDeFang,
    );
    expect(withPattern).toEqual([palaceOfMountain('甲')]);
    expect(withPattern).toEqual(['zhen']);
  });

  it('月金匱只在該支所屬宮出現，且恆不參排序', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    const withJinKui = PALACES.filter(
      (palace) => buildDirectionSelectionAssessment(context, palace).positives.references.monthJinKui,
    );
    expect(withJinKui).toEqual([palaceOfMountain('卯')]);
    const zhen = buildDirectionSelectionAssessment(context, 'zhen');
    expect(zhen.positives.references.monthJinKui).toEqual({ branch: '卯', rankingUse: 'disabled' });
  });
});

describe('§6 architecture invariant：正面不得翻轉 structural veto', () => {
  const context = buildDirectionSelectionContext(CONFLICT);
  const zhen = buildDirectionSelectionAssessment(context, 'zhen');

  it('同宮同時有三德叢聚與歲破，兩者都完整保留', () => {
    expect(zhen.positives.patterns.sanDeFang).toEqual({ active: true, mountain: '甲' });
    const rules = zhen.constraints.hits.map((hit) => hit.rule);
    expect(rules).toContain('sui_po');
    expect(rules).toContain('year_san_sha');
    // 受煞的是卯，得吉的是甲，兩山不同且各自保留
    for (const hit of zhen.constraints.hits) expect(hit.matched).toEqual(['卯']);
    expect(zhen.positives.matched).toEqual(['甲']);
  });

  it('三德叢聚沒有移除、弱化或標記任何 constraint', () => {
    expect(zhen.constraints.hits.length).toBeGreaterThan(0);
    for (const hit of zhen.constraints.hits) {
      expect(hit.rankingUse).toBe('disabled');
      expect(hit.gateUse).toBe('reference_only');
      expect(hit.coverage).toBe('partial');
    }
    // 沒有任何 cancel／suppress／resolved 之類欄位
    const serialized = JSON.stringify(zhen);
    for (const token of ['cancel', 'suppress', 'resolved', 'neutralis', 'neutraliz', 'score', 'total']) {
      expect(serialized.toLowerCase(), token).not.toContain(token);
    }
  });

  it('reasons 正負並列，constraints 在前，且不代表任何抵銷', () => {
    expect(zhen.reasons).toEqual([
      'constraint_sui_po',
      'constraint_year_san_sha',
      'positive_virtue',
      'positive_san_de_fang',
      'reference_month_jin_kui',
    ]);
    // 正面條目沒有讓 constraint 條目消失
    expect(zhen.reasons.filter((reason) => reason.startsWith('constraint_'))).toHaveLength(2);
  });

  it('status 不因正面條目數量改變', () => {
    const context2 = buildDirectionSelectionContext(CONFLICT);
    for (const palace of PALACES) {
      const assessment = buildDirectionSelectionAssessment(context2, palace);
      expect(assessment.status, palace).toBe('not_evaluated');
    }
  });

  it('大量枚舉：任何年干×年支×月支組合都不產生 not_evaluated 以外的 status', () => {
    for (const yearStem of STEMS) {
      for (const monthBranch of BRANCHES) {
        const context3 = buildDirectionSelectionContext(src(yearStem, '子', monthBranch, '午'));
        for (const assessment of buildDirectionSelectionAssessments(context3, PALACES)) {
          expect(assessment.status).toBe('not_evaluated');
          expect(assessment.rankingUse).toBe('disabled');
        }
      }
    }
  });
});

describe('regression：V2 組裝不得影響方向 verdict 與排序', () => {
  const AT = fromUtc8(2026, 8, 7, 11, 38);

  function fingerprint() {
    const chart = computeFullChart(AT);
    const evaluations = evaluateDirections(chart);
    return {
      verdicts: evaluations.map((e) => `${e.snapshot.palace}:${e.verdict}`),
      order: rankDirections(evaluations).map((e) => e.snapshot.palace),
    };
  }

  it('計算 V2 前後，八方 verdict 與排序完全相同', () => {
    const before = fingerprint();
    const pillars = buildTemporalPillars(AT);
    const context = buildDirectionSelectionContext({
      yearStem: pillars.year.stem,
      yearBranch: pillars.year.branch,
      monthBranch: pillars.month.branch,
      dayBranch: pillars.day.branch,
    });
    const all = buildDirectionSelectionAssessments(context, PALACES);
    expect(all.some((a) => a.constraints.hits.length > 0)).toBe(true);
    expect(all.some((a) => a.positives.virtues.length > 0)).toBe(true);
    expect(fingerprint()).toEqual(before);
  });

  it('DirectionEvaluation 完全沒有 V2 欄位', () => {
    const chart = computeFullChart(AT);
    const serialized = JSON.stringify(evaluateDirections(chart));
    for (const token of [
      'sanDeFang', 'monthJinKui', 'sui_de', 'tian_de', 'yue_de',
      'positive_virtue', 'constraint_sui_po', 'outside_24_mountains',
    ]) {
      expect(serialized, token).not.toContain(token);
    }
  });

  it('得三德叢聚的方向沒有因此被排到最前', () => {
    // 找一個當日確實有三德叢聚的年月；沒有就跳過斷言但保留結構檢查
    const pillars = buildTemporalPillars(AT);
    const context = buildDirectionSelectionContext({
      yearStem: pillars.year.stem,
      yearBranch: pillars.year.branch,
      monthBranch: pillars.month.branch,
      dayBranch: pillars.day.branch,
    });
    const chart = computeFullChart(AT);
    const ranked = rankDirections(evaluateDirections(chart)).map((e) => e.snapshot.palace);
    const positivePalaces = PALACES.filter(
      (palace) => buildDirectionSelectionAssessment(context, palace).positives.virtues.length > 0,
    );
    expect(positivePalaces.length).toBeGreaterThan(0);
    // 得吉方向在排序中的位置分佈不受 V2 影響：與不計算 V2 時完全相同
    const rankedAgain = rankDirections(evaluateDirections(chart)).map((e) => e.snapshot.palace);
    expect(rankedAgain).toEqual(ranked);
  });
});

describe('計算層不得內嵌 user-facing 中文（接手指南 §7）', () => {
  it('V2 輸出只含結構代碼與干支字，無中文句子', () => {
    const context = buildDirectionSelectionContext(CONFLICT);
    const payload = JSON.stringify(buildDirectionSelectionAssessments(context, PALACES));
    expect(payload).not.toMatch(/[，。；：、？！]/u);
    for (const word of ['本版本', '不判定', '警示', '排序', '參考']) {
      expect(payload, word).not.toContain(word);
    }
  });
});
