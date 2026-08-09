import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { fromUtc8 } from '../src/engine/time/utc8';
import { ganzhiFromIndex60 } from '../src/engine/time/ganzhi';
import { buildDirectionSnapshots } from '../src/selection/buildDirectionSnapshots';
import { buildPairHits } from '../src/selection/buildPairHits';
import {
  evaluateDirection, evaluateDirections, purpleWhiteSignalFor, rankDirections,
} from '../src/selection/evaluateDirection';
import { getPairRule, PURPLE_WHITE_PAIR_RULES } from '../src/selection/pairRules';
import { SELECTION_METHOD_EVIDENCE, STAR_QI_REFERENCE } from '../src/selection/researchEvidence';
import {
  assessMonthAnJian, assessPalaceKillers, assessTemporalStar, buildTemporalBranchContext,
  palaceElementRelationFor, seasonalStateFor,
} from '../src/selection/temporalRules';
import type { StarNumber } from '../src/overlay/types';
import type {
  DirectionSnapshot, PalaceKiller, TemporalBranchContext,
} from '../src/selection/types';

const AT = fromUtc8(2026, 8, 7, 11, 38);
const EXAMPLE: DirectionSnapshot = {
  direction: 'SE', palace: 'xun', palaceNumber: 4, name: '巽', bearing: '東南', row: 0, col: 0,
  yearStar: 1, monthStar: 4, dayStar: 8, hourStar: 6,
  monthCenterStar: 4,
};
const CONTEXT: TemporalBranchContext = {
  pillars: {
    year: ganzhiFromIndex60(8), month: ganzhiFromIndex60(9),
    day: ganzhiFromIndex60(6), hour: ganzhiFromIndex60(0),
  },
  evidence: { year: 'A', month: 'A', day: 'B', hour: 'B' },
  monthSeason: 'autumn',
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

  it('有氣／墓絕表與死退異文保留研究邊界', () => {
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

  it('月暗建依月白入中判定，不再把飛星回本宮當成暗建', () => {
    expect(assessMonthAnJian(1, 'kan')).toMatchObject({ active: true, centerStar: 1 });
    expect(assessMonthAnJian(1, 'gen').active).toBe(false);
    expect(assessMonthAnJian(5, 'qian').active).toBe(true);
    expect(assessMonthAnJian(5, 'kun').active).toBe(true);
    expect(assessMonthAnJian(5, 'gen').active).toBe(true);
    expect(assessMonthAnJian(5, 'xun').active).toBe(true);
    expect(assessMonthAnJian(5, 'zhen').active).toBe(false);
    expect(assessMonthAnJian(6, 'qian').active).toBe(true);
    expect(assessPalaceKillers(1, 'kan')).toEqual([]);
  });

  it('古典白中殺可同層重疊，且一般五行相剋另列', () => {
    expect(assessPalaceKillers(1, 'center')).toEqual(['shou_ke']);
    expect(assessPalaceKillers(6, 'li')).toEqual(['shou_ke']);
    expect(assessPalaceKillers(6, 'xun')).toEqual(['chuan_xin', 'dou_niu']);
    expect(assessPalaceKillers(6, 'dui')).toEqual(['jiao_jian']);
    expect(assessPalaceKillers(7, 'qian')).toEqual(['jiao_jian']);
    expect(assessPalaceKillers(8, 'zhen')).toEqual(['shou_ke', 'dou_niu']);
    expect(assessPalaceKillers(9, 'kan')).toEqual(['shou_ke', 'chuan_xin']);
    expect(assessPalaceKillers(5, 'center')).toEqual([]);
    expect(assessPalaceKillers(5, 'li')).toEqual([]);
    expect(palaceElementRelationFor(1, 'gen').relation).toBe('palace_controls_star');
    expect(assessPalaceKillers(1, 'gen')).not.toContain('shou_ke');
  });

  it('白中殺四類古表逐星鎖定，暗建不混入逐星矩陣', () => {
    const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
    const palaces = ['kan', 'kun', 'zhen', 'xun', 'center', 'qian', 'dui', 'gen', 'li'] as const;
    const controlled = [
      ['center'], ['zhen', 'xun'], ['qian', 'dui'], ['qian', 'dui'],
      ['zhen', 'xun'], ['li'], ['li'], ['zhen', 'xun'], ['kan'],
    ];
    const opposite = [['li'], ['gen'], ['dui'], ['qian'], [], ['xun'], ['zhen'], ['kun'], ['kan']];
    for (const [index, star] of stars.entries()) {
      const matching = (killer: PalaceKiller) => (
        palaces.filter((palace) => assessPalaceKillers(star, palace).includes(killer))
      );
      expect(matching('an_jian')).toEqual([]);
      expect(matching('shou_ke')).toEqual(controlled[index]);
      expect(matching('chuan_xin')).toEqual(opposite[index]);
      expect(matching('jiao_jian')).toEqual(star === 6 ? ['dui'] : star === 7 ? ['qian'] : []);
      expect(matching('dou_niu')).toEqual([2, 5, 6, 7, 8].includes(star) ? ['zhen', 'xun'] : []);
    }
  });

  it('六捷墓、臨絕與支序有氣逐層分開，未有直接表的星保持未知', () => {
    const tomb = assessTemporalStar('year', 1, 'dui', {
      ...CONTEXT,
      pillars: { ...CONTEXT.pillars, year: ganzhiFromIndex60(4) },
    });
    const absolute = assessTemporalStar('month', 6, 'dui', {
      ...CONTEXT,
      pillars: { ...CONTEXT.pillars, month: ganzhiFromIndex60(2) },
    });
    const active = assessTemporalStar('day', 9, 'dui', CONTEXT);
    const unknown = assessTemporalStar('hour', 2, 'dui', CONTEXT);
    expect(tomb.temporalState).toMatchObject({
      liuJieTomb: true, absolute: false, branchQi: 'inactive', qiEvidence: 'A',
    });
    expect(absolute.temporalState).toMatchObject({
      liuJieTomb: false, absolute: true, branchQi: 'inactive', qiEvidence: 'A',
    });
    expect(active.temporalState.branchQi).toBe('active');
    expect(active.temporalState.qiEvidence).toBe('B');
    expect(unknown.temporalState.branchQi).toBe('unknown');
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map((star) => STAR_QI_REFERENCE[star as StarNumber].tombBranch))
      .toEqual(['辰', '辰', '未', '未', '辰', '丑', '丑', '辰', '戌']);
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map((star) => STAR_QI_REFERENCE[star as StarNumber].absoluteBranch))
      .toEqual(['巳', '巳', '申', '申', '巳', '寅', '寅', '巳', '亥']);
    expect(STAR_QI_REFERENCE[1].directQiBranches).toEqual(['申', '酉', '戌', '亥', '子']);
    expect(STAR_QI_REFERENCE[6].directQiBranches).toEqual(['巳', '午', '未', '申', '酉']);
    expect(STAR_QI_REFERENCE[8].directQiBranches).toEqual(['申', '酉', '戌', '亥', '子']);
    expect(STAR_QI_REFERENCE[9].directQiBranches).toEqual(['寅', '卯', '辰', '巳', '午']);
  });

  it('月令旺相休囚按九星五行保存，但不建立固定數值權重', () => {
    expect(seasonalStateFor(1, 'winter')).toBe('command');
    expect(seasonalStateFor(4, 'winter')).toBe('support');
    expect(seasonalStateFor(6, 'winter')).toBe('rest');
    expect(seasonalStateFor(8, 'winter')).toBe('imprisoned');
    expect(seasonalStateFor(9, 'winter')).toBe('controlled');
  });

  it('四層地支沿用正式年界、節氣月、換日與時辰 API', () => {
    const context = buildTemporalBranchContext(AT);
    expect(Object.fromEntries(Object.entries(context.pillars).map(([level, pillar]) => (
      [level, pillar.text]
    )))).toEqual({ year: '丙午', month: '乙未', day: '癸丑', hour: '戊午' });
    expect(context).toMatchObject({
      evidence: { year: 'A', month: 'A', day: 'B', hour: 'B' },
      monthSeason: 'earth_transition',
    });
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
        monthCenterStar: chart.month.centerStar,
      });
    }
  });

  it('每方固定建立 YM／YD／YH／MD／MH／DH 六個有序 pair', () => {
    const hits = buildPairHits(EXAMPLE);
    expect(hits.map((hit) => hit.layer)).toEqual(['YM', 'YD', 'YH', 'MD', 'MH', 'DH']);
    expect(hits.map((hit) => hit.pair)).toEqual(['14', '18', '16', '48', '46', '86']);
  });

  it('方向判定加入白中殺與時間狀態，雙星參考仍不產生數值分數', () => {
    const evaluation = evaluateDirection(EXAMPLE, CONTEXT, 'writing');
    expect(evaluation.verdict).toBe('caution');
    expect(evaluation.purpleWhiteStars).toEqual([1, 8, 6]);
    expect(evaluation.purpleWhiteHits).toEqual(['year', 'day', 'hour']);
    expect(evaluation.purpleWhiteSignal).toBe('three_coarrival');
    expect(evaluation.qualifiedPurpleWhiteHits).toEqual(['year']);
    expect(evaluation.temporalProfile.starStates.map((state) => state.periodBranch))
      .toEqual(['申', '酉', '午', '子']);
    expect(evaluation.temporalProfile.whiteKillerAssessment.status).toBe('present');
    expect(evaluation.temporalProfile.whiteKillerAssessment.hits.find((hit) => hit.level === 'day'))
      .toMatchObject({ star: 8, killers: ['shou_ke', 'dou_niu'] });
    expect(evaluation.favorableHits).toEqual([]);
    expect(evaluation.cautionHits).toEqual([]);
    expect(evaluation.purposeHits.map((hit) => hit.pair)).toContain('14');
    expect(evaluation.reasons.join(' ')).toContain('雙星 81 組只供參考');
    expect(evaluation).not.toHaveProperty('score');
  });

  it('V4 判定區分主要層合格紫白、警示與無警示 fallback', () => {
    const safe = {
      ...EXAMPLE, palace: 'dui' as const, palaceNumber: 7, monthCenterStar: 1 as const,
    };
    expect(evaluateDirection({
      ...safe, yearStar: 7, monthStar: 1, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('priority');
    expect(evaluateDirection({
      ...safe, yearStar: 1, monthStar: 7, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('usable');
    expect(evaluateDirection({
      ...safe, yearStar: 7, monthStar: 1, dayStar: 3, hourStar: 7,
    }, CONTEXT).verdict).toBe('mixed');
    expect(evaluateDirection({
      ...safe, yearStar: 2, monthStar: 5, dayStar: 2, hourStar: 4,
    }, CONTEXT).verdict).toBe('caution');
    expect(evaluateDirection({
      ...safe, palace: 'gen', palaceNumber: 8,
      yearStar: 7, monthStar: 7, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('ordinary');
  });

  it('0–4 層紫白各有明確訊號，一時／二時異文不變數值門檻', () => {
    expect([0, 1, 2, 3, 4].map((count) => purpleWhiteSignalFor(count as 0 | 1 | 2 | 3 | 4)))
      .toEqual(['none', 'single_arrival', 'two_coarrival', 'three_coarrival', 'all_four_coarrival']);
    expect(evaluateDirection({
      ...EXAMPLE, yearStar: 1, monthStar: 6, dayStar: 8, hourStar: 9,
    }, CONTEXT).reasons[0]).toBe('紫白到方：4/4（年月日時紫白同到）');
    expect(evaluateDirection({
      ...EXAMPLE, yearStar: 2, monthStar: 3, dayStar: 4, hourStar: 5,
    }, CONTEXT).reasons[0]).toBe('紫白到方：0/4（無紫白到方）');
    expect(evaluateDirection({
      ...EXAMPLE, palace: 'dui', palaceNumber: 7, monthCenterStar: 1,
      yearStar: 7, monthStar: 1, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('priority');
    const coarrival = SELECTION_METHOD_EVIDENCE.find((item) => item.id === 'temporal_coarrival')!;
    expect(coarrival.verificationStatus).toBe('variant');
    expect(coarrival.variants?.map((item) => item.reading))
      .toEqual(['紫白一時加', '紫白二時加']);
  });

  it('二五交加 pair 文字仍不評分；只有另立的黃黑值令條件可觸發警示', () => {
    const evaluation = evaluateDirection({
      ...EXAMPLE, palace: 'li', palaceNumber: 9,
      yearStar: 2, monthStar: 5, dayStar: 1, hourStar: 4,
    }, CONTEXT);
    expect(evaluation.hits.find((hit) => hit.pair === '25')?.rule.shortMeaning)
      .toContain('二五交加');
    expect(evaluation.cautionHits).toEqual([]);
    expect(evaluation.temporalProfile.yellowBlackLayers).toEqual(['year', 'month']);
    expect(evaluation.temporalProfile.yellowBlackThriving).toBe(false);
    expect(evaluation.verdict).toBe('caution');
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
