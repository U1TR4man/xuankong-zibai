import { describe, expect, it } from 'vitest';
import { BRANCHES, type Branch } from '../src/engine/time/ganzhi';
import { SAN_HE_GROUPS, oppositeBranch } from '../src/selection/branchRelations';
import {
  MOUNTAINS_24,
  type Mountain24,
  getMonthBreakMountain,
  getMountainHitsForPalace,
  getSanShaMountains,
  getSuiPoMountain,
  isMountain24,
  listSanShaByGroup,
  mountainBearing,
  mountainsOfPalace,
  palaceOfMountain,
} from '../src/selection/mountains24';
import type { DirectionPalaceKey } from '../src/selection/types';

const PALACES: readonly DirectionPalaceKey[] = ['kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian'];

describe('24 山表', () => {
  it('恰 24 山、無重複，且與規則文件的八宮分組一致', () => {
    expect(MOUNTAINS_24).toHaveLength(24);
    expect(new Set(MOUNTAINS_24).size).toBe(24);
    expect(Object.fromEntries(PALACES.map((p) => [p, mountainsOfPalace(p).join('')]))).toEqual({
      kan: '壬子癸', gen: '丑艮寅', zhen: '甲卯乙', xun: '辰巽巳',
      li: '丙午丁', kun: '未坤申', dui: '庚酉辛', qian: '戌乾亥',
    });
  });

  it('含十二地支、八天干山與四維，且不含戊己', () => {
    for (const branch of BRANCHES) expect(isMountain24(branch), branch).toBe(true);
    for (const stem of ['甲', '乙', '丙', '丁', '庚', '辛', '壬', '癸']) {
      expect(isMountain24(stem), stem).toBe(true);
    }
    for (const corner of ['乾', '坤', '艮', '巽']) expect(isMountain24(corner), corner).toBe(true);
    // 戊己為中宮之位，本無外方
    expect(isMountain24('戊')).toBe(false);
    expect(isMountain24('己')).toBe(false);
  });

  it('四正方位角正確，壬跨 0° 邊界為 345°', () => {
    expect(mountainBearing('子')).toBe(0);
    expect(mountainBearing('卯')).toBe(90);
    expect(mountainBearing('午')).toBe(180);
    expect(mountainBearing('酉')).toBe(270);
    expect(mountainBearing('壬')).toBe(345);
    expect(mountainBearing('亥')).toBe(330);
    expect(mountainBearing('癸')).toBe(15);
  });

  it('24 個方位角互不重複、每 15° 一格且全部落在 0–359', () => {
    const bearings = MOUNTAINS_24.map(mountainBearing);
    expect(new Set(bearings).size).toBe(24);
    for (const bearing of bearings) {
      expect(bearing % 15).toBe(0);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    }
  });

  it('palaceOfMountain 與 mountainsOfPalace 互為反函式', () => {
    for (const mountain of MOUNTAINS_24) {
      expect(mountainsOfPalace(palaceOfMountain(mountain))).toContain(mountain);
    }
    for (const palace of PALACES) {
      for (const mountain of mountainsOfPalace(palace)) {
        expect(palaceOfMountain(mountain)).toBe(palace);
      }
    }
  });
});

describe('歲破方 / 月破方', () => {
  it('歲破山為年支的六沖對山，十二年全覆蓋', () => {
    const table: Record<string, Mountain24> = {
      子: '午', 丑: '未', 寅: '申', 卯: '酉', 辰: '戌', 巳: '亥',
      午: '子', 未: '丑', 申: '寅', 酉: '卯', 戌: '辰', 亥: '巳',
    };
    for (const branch of BRANCHES) {
      expect(getSuiPoMountain(branch), branch).toBe(table[branch]);
    }
  });

  it('月破方與歲破同構，且與六沖 primitive 一致', () => {
    for (const branch of BRANCHES) {
      expect(getMonthBreakMountain(branch)).toBe(oppositeBranch(branch));
      expect(getSuiPoMountain(branch)).toBe(oppositeBranch(branch));
    }
  });

  it('歲破命中單一山而非整宮：子年歲破午，丙、丁不命中', () => {
    const hits = getMountainHitsForPalace('li', [getSuiPoMountain('子')]);
    expect(hits.matched).toEqual(['午']);
    expect(hits.coverage).toBe('partial');
    expect(mountainsOfPalace('li')).toEqual(['丙', '午', '丁']);
  });

  it('歲破山恆為地支山，不會落在天干山或四維', () => {
    for (const branch of BRANCHES) {
      expect(BRANCHES).toContain(getSuiPoMountain(branch));
    }
  });
});

describe('三煞', () => {
  it('四組三煞由既有三合表導出，不另建第二張表', () => {
    expect(Object.fromEntries(listSanShaByGroup().map((g) => [g.label, g.mountains.join('')]))).toEqual({
      申子辰: '巳午未', 寅午戌: '亥子丑', 亥卯未: '申酉戌', 巳酉丑: '寅卯辰',
    });
  });

  it('年月日共用同一張表：同一支查得結果相同', () => {
    for (const group of SAN_HE_GROUPS) {
      const expected = getSanShaMountains(group.branches[0]);
      for (const branch of group.branches) {
        expect(getSanShaMountains(branch), branch).toEqual(expected);
      }
    }
  });

  it('三煞橫跨三個八宮，每宮各為 partial（寅午戌年三煞亥子丑）', () => {
    const sanSha = getSanShaMountains('午');
    expect(sanSha).toEqual(['亥', '子', '丑']);
    expect(sanSha.map(palaceOfMountain)).toEqual(['qian', 'kan', 'gen']);
    for (const palace of ['qian', 'kan', 'gen'] as DirectionPalaceKey[]) {
      expect(getMountainHitsForPalace(palace, sanSha).coverage, palace).toBe('partial');
    }
    // 「三煞在北方」不等於整個坎宮受影響
    expect(getMountainHitsForPalace('kan', sanSha).matched).toEqual(['子']);
  });

  it('子年三煞巳午未落在巽、離、坤三宮，各為 partial', () => {
    const sanSha = getSanShaMountains('子');
    expect(sanSha).toEqual(['巳', '午', '未']);
    expect(sanSha.map(palaceOfMountain)).toEqual(['xun', 'li', 'kun']);
    expect(getMountainHitsForPalace('xun', sanSha).matched).toEqual(['巳']);
    expect(getMountainHitsForPalace('li', sanSha).matched).toEqual(['午']);
    expect(getMountainHitsForPalace('kun', sanSha).matched).toEqual(['未']);
  });

  it('三煞在 24 山環上並不相鄰：中間夾的天干山不得命中', () => {
    const sanSha = getSanShaMountains('午'); // 亥子丑
    // 亥 330°、子 0°、丑 30°，彼此相隔 30° 而非 15°
    expect(sanSha.map(mountainBearing)).toEqual([330, 0, 30]);
    // 夾在中間的壬（345°）與癸（15°）不是三煞
    expect(sanSha).not.toContain('壬');
    expect(sanSha).not.toContain('癸');
  });

  it('十二支各有三煞，且三煞山恆與本支所屬三合局不重疊', () => {
    for (const branch of BRANCHES) {
      const sanSha = getSanShaMountains(branch);
      expect(sanSha).toHaveLength(3);
      expect(sanSha).not.toContain(branch);
    }
  });

  it('三煞恆不覆蓋整宮：任一支的三煞在八宮皆不產生 full', () => {
    for (const branch of BRANCHES) {
      const sanSha = getSanShaMountains(branch);
      for (const palace of PALACES) {
        expect(getMountainHitsForPalace(palace, sanSha).coverage, `${branch}-${palace}`)
          .not.toBe('full');
      }
    }
  });
});

describe('coverage 模型', () => {
  it('none / partial / full 三態齊備', () => {
    expect(getMountainHitsForPalace('kan', []).coverage).toBe('none');
    expect(getMountainHitsForPalace('kan', ['午']).coverage).toBe('none');
    expect(getMountainHitsForPalace('kan', ['子']).coverage).toBe('partial');
    expect(getMountainHitsForPalace('kan', ['壬', '癸']).coverage).toBe('partial');
    expect(getMountainHitsForPalace('kan', ['壬', '子', '癸']).coverage).toBe('full');
  });

  it('matched 依羅盤次序回傳，不跟隨輸入次序', () => {
    const hits = getMountainHitsForPalace('kan', ['癸', '壬', '子']);
    expect(hits.matched).toEqual(['壬', '子', '癸']);
  });

  it('重複輸入不重複計算', () => {
    const hits = getMountainHitsForPalace('kan', ['子', '子', '子']);
    expect(hits.matched).toEqual(['子']);
    expect(hits.coverage).toBe('partial');
  });

  it('本宮以外的受影響山不影響本宮 coverage', () => {
    const hits = getMountainHitsForPalace('kan', ['午', '卯', '酉']);
    expect(hits.matched).toEqual([]);
    expect(hits.coverage).toBe('none');
  });

  it('overlap 並列：同一山可同時歲破、月破與三煞，資料不相抵', () => {
    // 子年子月：歲破午、月破方午；子年三煞巳午未 → 午同時被三個名目命中
    const yearBranch: Branch = '子';
    const monthBranch: Branch = '子';
    const hits = [
      { rule: 'sui_po', affected: [getSuiPoMountain(yearBranch)] },
      { rule: 'month_break', affected: [getMonthBreakMountain(monthBranch)] },
      { rule: 'year_san_sha', affected: [...getSanShaMountains(yearBranch)] },
    ].map((hit) => ({
      rule: hit.rule,
      ...getMountainHitsForPalace('li', hit.affected),
    }));
    expect(hits.map((hit) => hit.rule)).toEqual(['sui_po', 'month_break', 'year_san_sha']);
    for (const hit of hits) {
      expect(hit.matched, hit.rule).toEqual(['午']);
      expect(hit.coverage, hit.rule).toBe('partial');
    }
  });
});
