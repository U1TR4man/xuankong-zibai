import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { getSolarTerms } from '../src/engine/time/solarTerms';
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
  AN_JIAN_VARIANTS, BRANCH_QI_POLICY, ELEMENT_SUPPORT_QI_POLICY,
  PURPLE_WHITE_ARRIVAL_POLICY, WHITE_KILLER_LAYER_POLICY,
  assessAnJian, assessArrivalWhiteKillers, assessGenericWhiteKillerAnJian, assessLiuJie,
  assessTemporalStar, buildMonthlyCenterStarState, buildTemporalBranchContext,
  buildTimeGateAssessment, computeDaYueJian, dayElementFor, dayMasterSeasonStateFor,
  palaceElementRelationFor, seasonalStateFor,
} from '../src/selection/temporalRules';
import { WHITE_KILLER_MATRIX, WHITE_KILLER_MATRIX_AUDIT } from '../src/selection/whiteKillerMatrix';
import type { StarNumber } from '../src/overlay/types';
import type {
  DirectionSnapshot, PalaceKiller, TemporalBranchContext,
} from '../src/selection/types';

const AT = fromUtc8(2026, 8, 7, 11, 38);
const EXAMPLE: DirectionSnapshot = {
  direction: 'SE', palace: 'xun', palaceNumber: 4, name: '巽', bearing: '東南', row: 0, col: 0,
  yearStar: 1, monthStar: 4, dayStar: 8, hourStar: 6,
  yearCenterStar: 1, monthCenterStar: 4, dayCenterStar: 1, hourCenterStar: 1,
};
const CONTEXT: TemporalBranchContext = {
  pillars: {
    year: ganzhiFromIndex60(8), month: ganzhiFromIndex60(9),
    day: ganzhiFromIndex60(6), hour: ganzhiFromIndex60(0),
  },
  evidence: { year: 'A', month: 'A', day: 'B', hour: 'C' },
  monthSeason: 'autumn',
  monthCommand: { element: '金', rule: 'season_main' },
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
    expect(STAR_QI_REFERENCE[9].auditNote).toContain('封版為戌墓');
    expect(STAR_QI_REFERENCE[9].auditNote).toContain('原頁仍待核對');
    const variant = SELECTION_METHOD_EVIDENCE.find((item) => item.id === 'death_retreat_variant')!;
    expect(variant.verificationStatus).toBe('variant');
    expect(variant.primarySourceVerified).toBe(false);
    expect(variant.variants?.map((item) => item.reading)).toEqual([
      '死退雙臨始佳', '死退雙臨不利',
    ]);
  });

  it('一般九宮暗建預設與五黃四隅異文分層，不疊加', () => {
    expect(assessGenericWhiteKillerAnJian('year', 1, 'kan'))
      .toMatchObject({ level: 'year', active: true, centerStar: 1, variantId: 'generic_jiugong' });
    expect(assessGenericWhiteKillerAnJian('year', 1, 'gen').active).toBe(false);
    expect(assessGenericWhiteKillerAnJian('month', 5, 'qian')).toMatchObject({
      active: false, forbiddenPalaces: ['center'], hasVariantReading: true,
    });
    expect(assessGenericWhiteKillerAnJian('month', 5, 'qian', 'san_yuan_bao_hai')).toMatchObject({
      active: true, forbiddenPalaces: ['qian', 'kun', 'gen', 'xun'],
    });
    expect(AN_JIAN_VARIANTS.jiyao_native_and_center[1]).toEqual(['kan', 'center']);
    expect(assessGenericWhiteKillerAnJian('hour', 6, 'qian')).toMatchObject({
      active: true, evidence: 'B', rankingUse: 'reference_only',
    });
    expect(assessAnJian(1, 'kan')).toBe(true);
    expect(assessAnJian(1, 'li')).toBe(false);
    expect(assessAnJian(5, 'center')).toBe(true);
    expect(assessArrivalWhiteKillers(1, 'kan')).toEqual([]);
  });

  it('大月建由月入中星本宮推得，舊年干起例停用', () => {
    const daYueJian = computeDaYueJian(4, CONTEXT.pillars.month, 'xun');
    expect(daYueJian).toMatchObject({
      status: 'evaluated', centerStar: 4, palace: 'xun', hitsThisDirection: true,
      calculationMethod: 'month_center_star_native_palace', rankingUse: 'warning_only',
      samePositionAsMonthAnJian: true,
      legacyYearStemRule: { enabled: false, status: 'deprecated_by_xieji' },
    });
    expect(computeDaYueJian(5, CONTEXT.pillars.month, 'xun')).toMatchObject({
      centerStar: 5, palace: 'center', hitsThisDirection: false,
    });
  });

  it('36 個月型態共用月紫白入中星的九星本宮定位', () => {
    const groups = [
      [8, 7, 6, 5, 4, 3, 2, 1, 9, 8, 7, 6],
      [5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4, 3],
      [2, 1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 9],
    ] as const;
    const expected = [
      ['gen', 'dui', 'qian', 'center', 'xun', 'zhen', 'kun', 'kan', 'li', 'gen', 'dui', 'qian'],
      ['center', 'xun', 'zhen', 'kun', 'kan', 'li', 'gen', 'dui', 'qian', 'center', 'xun', 'zhen'],
      ['kun', 'kan', 'li', 'gen', 'dui', 'qian', 'center', 'xun', 'zhen', 'kun', 'kan', 'li'],
    ];
    expect(groups.map((group) => group.map((centerStar) => (
      computeDaYueJian(centerStar, CONTEXT.pillars.month, 'xun').palace
    )))).toEqual(expected);
  });

  it('Day Gate V1 已評估日干月令，Hour Gate 與月納音維持未評估', () => {
    expect(buildTimeGateAssessment(CONTEXT)).toMatchObject({
      dayStatus: 'pass', hourStatus: 'not_evaluated', rankingUse: 'disabled',
      dayGate: {
        dayStem: '庚', dayElement: '金', monthBranch: '酉', monthElement: '金',
        seasonalState: 'wang', status: 'pass',
      },
    });
    expect(buildMonthlyCenterStarState(4, CONTEXT.pillars.month)).toMatchObject({
      centerStar: 4, monthNayin: null, transformedElement: null,
      mode: 'research', rankingUse: 'disabled',
    });
  });

  it('古典白中殺可同層重疊，且一般五行相剋另列', () => {
    expect(assessArrivalWhiteKillers(1, 'center')).toEqual(['shou_ke']);
    expect(assessArrivalWhiteKillers(6, 'li')).toEqual(['shou_ke']);
    expect(assessArrivalWhiteKillers(6, 'xun')).toEqual(['chuan_xin', 'dou_niu']);
    expect(assessArrivalWhiteKillers(6, 'dui')).toEqual(['jiao_jian']);
    expect(assessArrivalWhiteKillers(7, 'qian')).toEqual(['jiao_jian']);
    expect(assessArrivalWhiteKillers(8, 'zhen')).toEqual(['shou_ke', 'dou_niu']);
    expect(assessArrivalWhiteKillers(9, 'kan')).toEqual(['shou_ke', 'chuan_xin']);
    expect(assessArrivalWhiteKillers(5, 'center')).toEqual([]);
    expect(assessArrivalWhiteKillers(5, 'li')).toEqual([]);
    expect(palaceElementRelationFor(1, 'gen').relation).toBe('palace_controls_star');
    expect(assessArrivalWhiteKillers(1, 'gen')).not.toContain('shou_ke');
  });

  it('第七輪九星×六殺矩陣逐格鎖定，三種輸入不混用', () => {
    const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
    const palaces = ['kan', 'kun', 'zhen', 'xun', 'center', 'qian', 'dui', 'gen', 'li'] as const;
    expect(WHITE_KILLER_MATRIX).toEqual({
      1: { liuJieTomb: '辰', anJian: ['kan'], shouKe: ['center'], chuanXin: ['li'], jiaoJian: [], douNiu: [] },
      2: { liuJieTomb: '辰', anJian: ['kun'], shouKe: ['zhen', 'xun'], chuanXin: ['gen'], jiaoJian: [], douNiu: ['zhen', 'xun'] },
      3: { liuJieTomb: '未', anJian: ['zhen'], shouKe: ['qian', 'dui'], chuanXin: ['dui'], jiaoJian: [], douNiu: [] },
      4: { liuJieTomb: '未', anJian: ['xun'], shouKe: ['qian', 'dui'], chuanXin: ['qian'], jiaoJian: [], douNiu: [] },
      5: { liuJieTomb: '辰', anJian: ['center'], shouKe: ['zhen', 'xun'], chuanXin: [], jiaoJian: [], douNiu: ['zhen', 'xun'] },
      6: { liuJieTomb: '丑', anJian: ['qian'], shouKe: ['li'], chuanXin: ['xun'], jiaoJian: ['dui'], douNiu: ['zhen', 'xun'] },
      7: { liuJieTomb: '丑', anJian: ['dui'], shouKe: ['li'], chuanXin: ['zhen'], jiaoJian: ['qian'], douNiu: ['zhen', 'xun'] },
      8: { liuJieTomb: '辰', anJian: ['gen'], shouKe: ['zhen', 'xun'], chuanXin: ['kun'], jiaoJian: [], douNiu: ['zhen', 'xun'] },
      9: { liuJieTomb: '戌', anJian: ['li'], shouKe: ['kan'], chuanXin: ['kan'], jiaoJian: [], douNiu: [] },
    });
    expect(WHITE_KILLER_MATRIX_AUDIT).toMatchObject({
      version: 'seventh_round_9x6',
      restoredColumnOrder: [9, 1, 2, 3, 4, 5, 6, 7, 8],
      fiveYellowDefault: 'center', fiveYellowFourCorners: 'variant_only',
      // 2026-08-11 逐頁核到《五要奇書》卷三十八六列完整直證後升為 true。
      primarySourceVerified: true,
      // 但只有這一本完整；另外三本受剋列脫格且互不相同，不得讀成多本互校。
      corroboration: 'single_complete_witness',
      // 《完孝錄》「以上星煞所忌，特見其例耳」——刑宮、害宮、空亡未實作。
      completeness: 'example_set_not_exhaustive',
    });
    // 異說只登記、不改格值，且一律不進排序。
    expect(WHITE_KILLER_MATRIX_AUDIT.variants.map((v) => [v.rule, v.id, v.rankingUse]))
      .toEqual([
        ['douNiu', 'dou_niu_yuan_gui_three_four_same_palace', 'disabled'],
        ['anJian', 'an_jian_five_yellow_four_corners', 'disabled'],
      ]);
    // 鬥牛異說是古本編者自己標明的，不是本專案發現的現代歧義。
    expect(WHITE_KILLER_MATRIX_AUDIT.variants[0]?.acknowledgedBySource).toBe(true);
    expect(WHITE_KILLER_MATRIX_AUDIT.definitionVariants[0]?.effectOnValues).toBe('none');
    // 出處只存 stable chapter URL；帶時效簽名的原書影像 URL 不得入專案。
    for (const ref of [
      WHITE_KILLER_MATRIX_AUDIT.primarySource,
      WHITE_KILLER_MATRIX_AUDIT.completenessSource,
      ...WHITE_KILLER_MATRIX_AUDIT.variants.map((v) => v.source),
    ]) {
      expect(ref.stableChapterUrl).toMatch(/^https:\/\/www\.shidianguji\.com\/zh\/book\/[^/]+\/chapter\/[^/?#]+$/);
      expect(ref.searchAnchor.length).toBeGreaterThan(0);
    }
    for (const star of stars) {
      const row = WHITE_KILLER_MATRIX[star];
      const matching = (killer: PalaceKiller) => (
        palaces.filter((palace) => assessArrivalWhiteKillers(star, palace).includes(killer))
      );
      expect(matching('an_jian')).toEqual([]);
      expect(matching('shou_ke')).toEqual(row.shouKe);
      expect(matching('chuan_xin')).toEqual(row.chuanXin);
      expect(matching('jiao_jian')).toEqual(row.jiaoJian);
      expect(matching('dou_niu')).toEqual(row.douNiu);
      expect(palaces.filter((palace) => assessAnJian(star, palace))).toEqual(row.anJian);
      expect(assessLiuJie(star, row.liuJieTomb)).toBe(true);
    }
    expect(assessLiuJie(1, '戌')).toBe(false);
    expect(assessLiuJie(9, '辰')).toBe(false);
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
    expect(active.temporalState.qiEvidence).toBe('B+');
    expect(active.temporalState.qiRankingUse).toBe('active_secondary');
    expect(unknown.temporalState.branchQi).toBe('unknown');
    expect(unknown.temporalState.qiEvidence).toBe('C');
    expect(unknown.temporalState.qiRankingUse).toBe('reference_only');
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

  it('十干五行與日主旺相休囚死採五行生剋的 deterministic 關係', () => {
    expect('甲乙丙丁戊己庚辛壬癸'.split('').map((stem) => dayElementFor(
      stem as Parameters<typeof dayElementFor>[0],
    ))).toEqual(['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']);
    expect([
      dayMasterSeasonStateFor('木', '木'),
      dayMasterSeasonStateFor('火', '木'),
      dayMasterSeasonStateFor('水', '木'),
      dayMasterSeasonStateFor('土', '木'),
      dayMasterSeasonStateFor('金', '木'),
    ]).toEqual(['wang', 'xiang', 'xiu', 'si', 'qiu']);
  });

  it('Day Gate 月令採節氣月，並只在四立前十八日切換土司令', () => {
    const liqiu = getSolarTerms(2026).find((term) => term.name === '立秋')!.date;
    const transition = new Date(liqiu.getTime() - 18 * 24 * 60 * 60 * 1000);
    const before = buildTemporalBranchContext(new Date(transition.getTime() - 1_000));
    const atTransition = buildTemporalBranchContext(transition);
    const atLiqiu = buildTemporalBranchContext(liqiu);

    expect(before).toMatchObject({
      pillars: { month: { branch: '未' } },
      monthCommand: { element: '火', rule: 'season_main' },
    });
    expect(atTransition).toMatchObject({
      pillars: { month: { branch: '未' } },
      monthCommand: { element: '土', rule: 'earth_last_18_days' },
    });
    expect(atLiqiu).toMatchObject({
      pillars: { month: { branch: '申' } },
      monthCommand: { element: '金', rule: 'season_main' },
    });
  });

  it('四層地支沿用正式年界、節氣月、換日與時辰 API', () => {
    const context = buildTemporalBranchContext(AT);
    expect(Object.fromEntries(Object.entries(context.pillars).map(([level, pillar]) => (
      [level, pillar.text]
    )))).toEqual({ year: '丙午', month: '乙未', day: '癸丑', hour: '戊午' });
    expect(context).toMatchObject({
      evidence: { year: 'A', month: 'A', day: 'B', hour: 'C' },
      monthSeason: 'earth_transition',
      monthCommand: { element: '土', rule: 'earth_last_18_days' },
    });
  });

  it('Day Gate 狀態不會改寫同一方向的 verdict 或排序', () => {
    const passContext = { ...CONTEXT, monthCommand: { element: '金', rule: 'season_main' } } as const;
    const cautionContext = { ...CONTEXT, monthCommand: { element: '火', rule: 'season_main' } } as const;
    const pass = evaluateDirection(EXAMPLE, passContext);
    const caution = evaluateDirection(EXAMPLE, cautionContext);

    expect(pass.temporalProfile.timeGate.dayStatus).toBe('pass');
    expect(caution.temporalProfile.timeGate.dayStatus).toBe('caution');
    expect(caution.verdict).toBe(pass.verdict);
  });

  it('白中殺與支序有氣依來源強度分層，五行生扶不參與排序', () => {
    expect(WHITE_KILLER_LAYER_POLICY).toMatchObject({
      year: { rankingUse: 'active', layerEvidence: { year: 'A' } },
      month: { rankingUse: 'active', layerEvidence: { month: 'A' } },
      day: { rankingUse: 'reference_only', layerEvidence: { day: 'B' } },
      hour: { rankingUse: 'reference_only', layerEvidence: { hour: 'B' } },
    });
    expect(BRANCH_QI_POLICY).toMatchObject({
      year: { rankingUse: 'active', layerEvidence: { year: 'A' } },
      month: { rankingUse: 'active', layerEvidence: { month: 'A' } },
      day: { rankingUse: 'active_secondary', layerEvidence: { day: 'B+' } },
      hour: { rankingUse: 'reference_only', layerEvidence: { hour: 'C' } },
    });
    expect(PURPLE_WHITE_ARRIVAL_POLICY).toEqual({
      year: { arrival: 'active', rankingUse: 'active', role: 'background' },
      month: { arrival: 'active', rankingUse: 'active', role: 'primary' },
      day: { arrival: 'active', rankingUse: 'active', role: 'primary' },
      hour: { arrival: 'active', rankingUse: 'active_light', role: 'tie_breaker' },
    });
    expect(ELEMENT_SUPPORT_QI_POLICY.rankingUse).toBe('disabled');
  });

  it('一般九宮暗建按各層入中星計算，年月正式、日時參考', () => {
    const evaluation = evaluateDirection({
      ...EXAMPLE,
      palace: 'kan', palaceNumber: 1,
      yearCenterStar: 1, monthCenterStar: 1, dayCenterStar: 1, hourCenterStar: 1,
    }, CONTEXT);
    const anJianHits = evaluation.temporalProfile.whiteKillerAssessment.hits
      .filter((hit) => hit.killers.includes('an_jian'));
    expect(anJianHits.map((hit) => [hit.level, hit.rankingUse])).toEqual([
      ['year', 'active'], ['month', 'active'],
      ['day', 'reference_only'], ['hour', 'reference_only'],
    ]);
    expect(evaluation.temporalProfile.whiteKillerAssessment.activeHits
      .filter((hit) => hit.killers.includes('an_jian')).map((hit) => hit.level))
      .toEqual(['year', 'month']);
  });

  it('月暗建與大月建同位合流，只產生一次 active warning', () => {
    const evaluation = evaluateDirection({
      ...EXAMPLE, palace: 'xun', palaceNumber: 4,
      yearCenterStar: 1, monthCenterStar: 4, dayCenterStar: 1, hourCenterStar: 1,
      yearStar: 9, monthStar: 1, dayStar: 9, hourStar: 7,
    }, CONTEXT);
    expect(evaluation.temporalProfile.anJian.daYueJian).toMatchObject({
      palace: 'xun', hitsThisDirection: true, samePositionAsMonthAnJian: true,
    });
    expect(evaluation.temporalProfile.whiteKillerAssessment.activeHits).toEqual([
      expect.objectContaining({ level: 'month', killers: ['an_jian'] }),
    ]);
    expect(evaluation.reasons.filter((reason) => reason.startsWith('大月建／月暗建：')))
      .toHaveLength(1);
    expect(evaluation.verdict).toBe('mixed');
    expect(evaluateDirection({
      ...evaluation.snapshot, hourStar: 2,
    }, CONTEXT).verdict).toBe('caution');
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
        yearCenterStar: chart.year.centerStar,
        monthCenterStar: chart.month.centerStar,
        dayCenterStar: chart.day.centerStar,
        hourCenterStar: chart.hour.centerStar,
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
    expect(evaluation.verdict).toBe('mixed');
    expect(evaluation.purpleWhiteStars).toEqual([1, 8, 6]);
    expect(evaluation.purpleWhiteHits).toEqual(['year', 'day', 'hour']);
    expect(evaluation.purpleWhiteSignal).toBe('three_coarrival');
    expect(evaluation.qualifiedPurpleWhiteHits).toEqual(['year', 'day', 'hour']);
    expect(evaluation.temporalProfile.starStates.map((state) => state.periodBranch))
      .toEqual(['申', '酉', '午', '子']);
    expect(evaluation.temporalProfile.whiteKillerAssessment.status).toBe('present');
    expect(evaluation.temporalProfile.whiteKillerAssessment.hits.find((hit) => hit.level === 'day'))
      .toMatchObject({ star: 8, killers: ['shou_ke', 'dou_niu'] });
    expect(evaluation.temporalProfile.whiteKillerAssessment.activeHits.map((hit) => hit.level))
      .toEqual(['month']);
    expect(evaluation.temporalProfile.whiteKillerAssessment.referenceHits.map((hit) => hit.level))
      .toEqual(['day', 'hour']);
    expect(evaluation.favorableHits).toEqual([]);
    expect(evaluation.cautionHits).toEqual([]);
    expect(evaluation.purposeHits.map((hit) => hit.pair)).toContain('14');
    expect(evaluation.reasons.join(' ')).toContain('雙星 81 組只供參考');
    expect(evaluation).not.toHaveProperty('score');
  });

  it('V6 判定讓月日作主層、時白只作細選，日時白中殺仍不降級', () => {
    const safe = {
      ...EXAMPLE, palace: 'dui' as const, palaceNumber: 7, monthCenterStar: 1 as const,
    };
    expect(evaluateDirection({
      ...safe, yearStar: 7, monthStar: 1, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('priority');
    expect(evaluateDirection({
      ...safe, yearStar: 1, monthStar: 7, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('ordinary');
    expect(evaluateDirection({
      ...safe, yearStar: 7, monthStar: 1, dayStar: 3, hourStar: 7,
    }, CONTEXT).verdict).toBe('priority');
    expect(evaluateDirection({
      ...safe, yearStar: 2, monthStar: 5, dayStar: 2, hourStar: 4,
    }, CONTEXT).verdict).toBe('caution');
    expect(evaluateDirection({
      ...safe, palace: 'gen', palaceNumber: 8,
      yearStar: 7, monthStar: 7, dayStar: 7, hourStar: 7,
    }, CONTEXT).verdict).toBe('ordinary');
    const dayWithoutDirectQi = evaluateDirection({
      ...safe, yearStar: 7, monthStar: 7, dayStar: 1, hourStar: 7,
    }, CONTEXT);
    expect(dayWithoutDirectQi.qualifiedPurpleWhiteHits).toEqual(['day']);
    expect(dayWithoutDirectQi.verdict).toBe('usable');
    expect(evaluateDirection({
      ...safe, yearStar: 7, monthStar: 7, dayStar: 9, hourStar: 7,
    }, CONTEXT).verdict).toBe('priority');
    const hourOnly = evaluateDirection({
      ...safe, yearStar: 7, monthStar: 7, dayStar: 7, hourStar: 1,
    }, CONTEXT);
    const noWhite = evaluateDirection({
      ...safe, yearStar: 7, monthStar: 7, dayStar: 7, hourStar: 7,
    }, CONTEXT);
    expect(hourOnly.verdict).toBe('ordinary');
    expect(rankDirections([noWhite, hourOnly])[0]).toBe(hourOnly);
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
