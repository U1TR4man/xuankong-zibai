import { describe, expect, it } from 'vitest';
import { getSolarTerms } from '../src/engine/time/solarTerms';
import { fromUtc8 } from '../src/engine/time/utc8';
import { buildTemporalPillars } from '../src/selection/temporalPillars';
import { assessTemporalStar, buildTemporalBranchContext } from '../src/selection/temporalRules';

function texts(date: Date, options: Parameters<typeof buildTemporalPillars>[1] = {}) {
  const pillars = buildTemporalPillars(date, options);
  return {
    year: pillars.year.text,
    month: pillars.month.text,
    day: pillars.day.text,
    hour: pillars.hour.text,
  };
}

describe('擇吉 canonical 年月日時干支', () => {
  it('2026-08-07 午時建立完整四柱', () => {
    expect(texts(fromUtc8(2026, 8, 7, 11, 38))).toEqual({
      year: '丙午', month: '乙未', day: '癸丑', hour: '戊午',
    });
  });

  it('年柱跟隨立春或公曆元旦年界設定', () => {
    const lichun = getSolarTerms(2026).find((term) => term.name === '立春')!.date;
    expect(texts(new Date(lichun.getTime() - 60_000), { yearBoundary: 'lichun' }).year).toBe('乙巳');
    expect(texts(new Date(lichun.getTime() + 60_000), { yearBoundary: 'lichun' }).year).toBe('丙午');
    expect(texts(fromUtc8(2025, 12, 31, 23, 59), { yearBoundary: 'gregorian' }).year).toBe('乙巳');
    expect(texts(fromUtc8(2026, 1, 1, 0, 0), { yearBoundary: 'gregorian' }).year).toBe('丙午');
  });

  it('月柱在節氣交接的精確時刻換月', () => {
    const liqiu = getSolarTerms(2026).find((term) => term.name === '立秋')!.date;
    expect(texts(new Date(liqiu.getTime() - 1_000)).month).toBe('乙未');
    expect(texts(liqiu).month).toBe('丙申');
  });

  it('午夜換日模式在 00:00 同步切換日柱與時干', () => {
    expect(texts(fromUtc8(2026, 8, 7, 23, 59), { dayChangeMode: 'midnight' }))
      .toMatchObject({ day: '癸丑', hour: '壬子' });
    expect(texts(fromUtc8(2026, 8, 8, 0, 0), { dayChangeMode: 'midnight' }))
      .toMatchObject({ day: '甲寅', hour: '甲子' });
  });

  it('子初換日模式在 23:00 同步切換日柱與時干', () => {
    expect(texts(fromUtc8(2026, 8, 7, 22, 59), { dayChangeMode: 'zishi2300' }))
      .toMatchObject({ day: '癸丑', hour: '癸亥' });
    expect(texts(fromUtc8(2026, 8, 7, 23, 0), { dayChangeMode: 'zishi2300' }))
      .toMatchObject({ day: '甲寅', hour: '甲子' });
  });

  it('子時與午時沿用正式中國時辰 boundary', () => {
    expect(texts(fromUtc8(2026, 8, 7, 0, 30)).hour).toBe('壬子');
    expect(texts(fromUtc8(2026, 8, 7, 11, 0)).hour).toBe('戊午');
  });

  it('UTC 時間點按 UTC+8 跨日與跨年', () => {
    expect(texts(new Date('2026-08-07T15:59:00.000Z')).day).toBe('癸丑');
    expect(texts(new Date('2026-08-07T16:00:00.000Z')).day).toBe('甲寅');
    expect(texts(new Date('2025-12-31T15:59:00.000Z'), { yearBoundary: 'gregorian' }).year).toBe('乙巳');
    expect(texts(new Date('2025-12-31T16:00:00.000Z'), { yearBoundary: 'gregorian' }).year).toBe('丙午');
  });

  it('selection periodBranch、月令與顯示干支共用同一 context', () => {
    const context = buildTemporalBranchContext(fromUtc8(2026, 8, 7, 11, 38));
    for (const level of ['year', 'month', 'day', 'hour'] as const) {
      const assessment = assessTemporalStar(level, 8, 'dui', context);
      expect(assessment.ganzhi).toBe(context.pillars[level]);
      expect(assessment.periodBranch).toBe(context.pillars[level].branch);
    }
    expect(context.monthSeason).toBe('earth_transition');
    expect(context.monthCommand).toEqual({ element: '土', rule: 'earth_last_18_days' });
  });
});
