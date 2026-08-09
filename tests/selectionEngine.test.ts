import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { fromUtc8 } from '../src/engine/time/utc8';
import { buildDirectionSnapshots } from '../src/selection/buildDirectionSnapshots';
import { buildPairHits } from '../src/selection/buildPairHits';
import {
  evaluateDirection, evaluateDirections, purpleWhiteSignalFor, rankDirections,
} from '../src/selection/evaluateDirection';
import { getPairRule, PURPLE_WHITE_PAIR_RULES } from '../src/selection/pairRules';
import { SELECTION_METHOD_EVIDENCE, STAR_QI_REFERENCE } from '../src/selection/researchEvidence';
import type { DirectionSnapshot } from '../src/selection/types';

const AT = fromUtc8(2026, 8, 7, 11, 38);
const EXAMPLE: DirectionSnapshot = {
  direction: 'SE', palace: 'xun', palaceNumber: 4, name: '巽', bearing: '東南', row: 0, col: 0,
  yearStar: 1, monthStar: 4, dayStar: 8, hourStar: 6,
};

describe('紫白擇吉 Phase 1 資料與判讀層', () => {
  it('11–99 共 81 條且每條保留完整基本欄位', () => {
    expect(PURPLE_WHITE_PAIR_RULES).toHaveLength(81);
    expect(new Set(PURPLE_WHITE_PAIR_RULES.map((rule) => rule.pair)).size).toBe(81);
    expect(PURPLE_WHITE_PAIR_RULES.map((rule) => rule.pair)).toEqual(
      Array.from({ length: 9 }, (_, first) => (
        Array.from({ length: 9 }, (_, second) => `${first + 1}${second + 1}`)
      )).flat(),
    );
    for (const rule of PURPLE_WHITE_PAIR_RULES) {
      expect(rule.elementRelation.length).toBeGreaterThan(0);
      expect(rule.shortMeaning.length).toBeGreaterThan(0);
      expect(rule.tags).toBeInstanceOf(Array);
      expect(rule.reversePair).toBe(`${rule.secondStar}${rule.firstStar}`);
      expect(['A', 'B', 'C']).toContain(rule.sourceLevel);
      expect(['A', 'A/B', 'B', 'B/C', 'C']).toContain(rule.sourceGrade);
      expect(rule.reviewStatus).toBe('needs-review');
      expect(rule.temporalUse).toBe('reference_only');
      expect(rule.rankingWeight).toBe(0);
      expect(rule.verified).toBe(false);
      expect(rule.sourceAudit.useContexts).toContain('temporal_pair_reference');
      expect(rule.sourceAudit.primarySourceVerified).toBe(false);
      expect(rule.sourceAudit.verificationStatus).toBe('awaiting_scan');
      expect(rule.sourceAudit.textWitnesses.length).toBeGreaterThan(0);
    }
  });

  it('第二輪 source audit 保存直接、反向推建與不可省略條件', () => {
    expect(getPairRule('14').sourceAudit).toMatchObject({
      evidenceForm: 'direct_same_palace_pair', directionality: 'unordered_pair',
    });
    expect(getPairRule('68').sourceAudit).toMatchObject({
      evidenceForm: 'direct_ordered_pair', directionality: 'explicit_order',
      useContexts: ['base_plus_flow', 'temporal_pair_reference'],
    });
    expect(getPairRule('48').sourceAudit.directionality).toBe('reverse_inferred');
    expect(getPairRule('28').sourceAudit).toMatchObject({
      evidenceForm: 'palace_conditioned', conditions: { palace: 6 },
    });
    expect(getPairRule('31').sourceAudit.conditions?.direction).toBe('庚');
    expect(getPairRule('67').sourceAudit.evidenceForm).toBe('named_pattern');
    expect(getPairRule('55').sourceAudit.evidenceForm).toBe('single_star_repeated');
  });

  it('疑似 36／37 轉錄錯位只存為 variant，不改寫 36 規則', () => {
    const variant = getPairRule('37').sourceAudit.variants?.[0];
    expect(variant).toMatchObject({
      reading: '三六迭逢而遇盜', verificationStatus: 'suspected_transcription_error',
    });
    expect(getPairRule('36').sourceAudit.evidenceForm).toBe('derived');
    expect(getPairRule('36').sourceAudit.directionality).toBe('unknown');
  });

  it('有氣／墓絕表與死退異文只作研究資料，不產生自動判定', () => {
    expect(STAR_QI_REFERENCE[1]).toMatchObject({
      qiElements: ['金', '水'], tombBranch: '辰', absoluteBranch: '巳',
    });
    expect(STAR_QI_REFERENCE[9]).toMatchObject({
      tombBranch: '戌', absoluteBranch: '亥',
    });
    expect(STAR_QI_REFERENCE[9].auditNote).toContain('轉錄');
    const variant = SELECTION_METHOD_EVIDENCE.find((item) => item.id === 'death_retreat_variant')!;
    expect(variant.verificationStatus).toBe('variant');
    expect(variant.primarySourceVerified).toBe(false);
    expect(variant.variants?.map((item) => item.reading)).toEqual([
      '死退雙臨始佳', '死退雙臨不利',
    ]);
  });

  it('研究摘要入庫但不猜吉凶、不假裝已校對', () => {
    expect(getPairRule('53')).toMatchObject({
      polarity: 'neutral', sourceLevel: 'B', sourceGrade: 'B', reviewStatus: 'needs-review',
      shortMeaning: '三木犯五：病災、瘟疾、衝突', rankingWeight: 0,
    });
  });

  it('有序組合不自動排序，68 與 86 保留不同象義', () => {
    expect(getPairRule('68')).toMatchObject({
      pair: '68', reversePair: '86', orderSensitive: true,
      shortMeaning: '六八：武科、韜略、權位、尊榮',
    });
    expect(getPairRule('86')).toMatchObject({
      pair: '86', reversePair: '68', orderSensitive: true,
      shortMeaning: '八六：文士參軍、異途擢用、由文入權',
    });
    expect(getPairRule('37')).not.toEqual(getPairRule('73'));
    expect(getPairRule('25').orderSensitive).toBe(true);
    expect(getPairRule('52').orderSensitive).toBe(true);
    expect(getPairRule('14').orderSensitive).toBe(false);
  });

  it('八方快照只組裝正式 FullChart 的年月日時，中宮不參與', () => {
    const chart = computeFullChart(AT);
    const snapshots = buildDirectionSnapshots(chart);
    expect(snapshots).toHaveLength(8);
    expect(snapshots.map((snapshot) => snapshot.palace)).not.toContain('center');
    for (const snapshot of snapshots) {
      expect(snapshot).toMatchObject({
        yearStar: chart.year.palaceStars[snapshot.palace],
        monthStar: chart.month.palaceStars[snapshot.palace],
        dayStar: chart.day.palaceStars[snapshot.palace],
        hourStar: chart.hour.palaceStars[snapshot.palace],
      });
    }
  });

  it('每方固定建立 YM／YD／YH／MD／MH／DH 六個有序 pair', () => {
    const hits = buildPairHits(EXAMPLE);
    expect(hits.map((hit) => hit.layer)).toEqual(['YM', 'YD', 'YH', 'MD', 'MH', 'DH']);
    expect(hits.map((hit) => hit.pair)).toEqual(['14', '18', '16', '48', '46', '86']);
  });

  it('heuristic 只使用紫白集中，雙星參考不產生數值分數', () => {
    const evaluation = evaluateDirection(EXAMPLE, 'writing');
    expect(evaluation.verdict).toBe('usable');
    expect(evaluation.purpleWhiteStars).toEqual([1, 8, 6]);
    expect(evaluation.purpleWhiteHits).toEqual(['year', 'day', 'hour']);
    expect(evaluation.purpleWhiteSignal).toBe('three_concentration');
    expect(evaluation.temporalProfile.starStates.every((state) => (
      state.qi === 'unknown' && state.tomb === 'unknown' && state.absolute === 'unknown'
    ))).toBe(true);
    expect(evaluation.temporalProfile.whiteKillerAssessment.status).toBe('unknown');
    expect(evaluation.favorableHits).toEqual([]);
    expect(evaluation.cautionHits).toEqual([]);
    expect(evaluation.purposeHits.map((hit) => hit.pair)).toContain('14');
    expect(evaluation.reasons.join(' ')).toContain('雙星 81 組只供參考');
    expect(evaluation).not.toHaveProperty('score');
  });

  it('0–4 顆紫白各有明確訊號，三時名稱明示為工具分級', () => {
    expect([0, 1, 2, 3, 4].map((count) => purpleWhiteSignalFor(count as 0 | 1 | 2 | 3 | 4)))
      .toEqual(['none', 'single_arrival', 'two_coarrival', 'three_concentration', 'four_coarrival']);
    expect(evaluateDirection({
      ...EXAMPLE, yearStar: 1, monthStar: 6, dayStar: 8, hourStar: 9,
    }).reasons[0]).toBe('四時紫白同到：4/4');
    expect(evaluateDirection({
      ...EXAMPLE, yearStar: 2, monthStar: 3, dayStar: 4, hourStar: 5,
    }).reasons[0]).toBe('無紫白集中：0/4');
  });

  it('二五交加保留參考文字，但不直接改變擇吉 verdict', () => {
    const evaluation = evaluateDirection({
      ...EXAMPLE, yearStar: 2, monthStar: 5, dayStar: 1, hourStar: 4,
    });
    expect(evaluation.hits.find((hit) => hit.pair === '25')?.rule.shortMeaning)
      .toContain('二五交加');
    expect(evaluation.cautionHits).toEqual([]);
    expect(evaluation.verdict).toBe('ordinary');
  });

  it('方向排序不受 pair 用途改變，且不暴露假分數', () => {
    const chart = computeFullChart(AT);
    const ranked = rankDirections(evaluateDirections(chart, 'fame'));
    const general = rankDirections(evaluateDirections(chart, 'general'));
    expect(ranked).toHaveLength(8);
    expect(ranked.map((item) => item.snapshot.palace)).not.toContain('center');
    expect(ranked.map((item) => item.snapshot.palace))
      .toEqual(general.map((item) => item.snapshot.palace));
    expect(ranked.every((item) => !('score' in item))).toBe(true);
  });
});
