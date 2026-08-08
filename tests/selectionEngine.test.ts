import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { fromUtc8 } from '../src/engine/time/utc8';
import { buildDirectionSnapshots } from '../src/selection/buildDirectionSnapshots';
import { buildPairHits } from '../src/selection/buildPairHits';
import { evaluateDirection, evaluateDirections, rankDirections } from '../src/selection/evaluateDirection';
import { getPairRule, PURPLE_WHITE_PAIR_RULES } from '../src/selection/pairRules';
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
    }
  });

  it('未知古訣不猜吉凶，明確標 pending／資料待校對', () => {
    expect(getPairRule('53')).toMatchObject({
      polarity: 'neutral', sourceLevel: 'C', reviewStatus: 'pending', shortMeaning: '資料待校對',
    });
  });

  it('有序組合不自動排序，68 與 86 保留不同象義', () => {
    expect(getPairRule('68')).toMatchObject({ pair: '68', reversePair: '86', shortMeaning: '武科 · 韜略' });
    expect(getPairRule('86')).toMatchObject({ pair: '86', reversePair: '68', shortMeaning: '文士參軍 · 異途' });
    expect(getPairRule('37')).not.toEqual(getPairRule('73'));
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

  it('heuristic 保留可解釋理由，不產生數值分數', () => {
    const evaluation = evaluateDirection(EXAMPLE, 'writing');
    expect(evaluation.verdict).toBe('priority');
    expect(evaluation.purpleWhiteStars).toEqual([1, 8, 6]);
    expect(evaluation.favorableHits.map((hit) => hit.pair)).toEqual(['14', '86']);
    expect(evaluation.purposeHits.map((hit) => hit.pair)).toContain('14');
    expect(evaluation.reasons.join(' ')).toContain('四一同宮');
    expect(evaluation).not.toHaveProperty('score');
  });

  it('二五交加是 high-priority caution，不以其他訊號加減抵銷', () => {
    const evaluation = evaluateDirection({
      ...EXAMPLE, yearStar: 2, monthStar: 5, dayStar: 1, hourStar: 4,
    });
    expect(evaluation.cautionHits.map((hit) => hit.pair)).toContain('25');
    expect(evaluation.favorableHits.map((hit) => hit.pair)).toContain('14');
    expect(evaluation.verdict).toBe('caution');
  });

  it('同級排序只用 rule hit、用途與紫白集中，不暴露假分數', () => {
    const ranked = rankDirections(evaluateDirections(computeFullChart(AT), 'fame'));
    expect(ranked).toHaveLength(8);
    expect(ranked.map((item) => item.snapshot.palace)).not.toContain('center');
    expect(ranked.every((item) => !('score' in item))).toBe(true);
  });
});
