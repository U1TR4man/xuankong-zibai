import { describe, expect, it } from 'vitest';
import { BRANCHES, STEMS, type Branch, type Stem } from '../src/engine/time/ganzhi';
import { SAN_HE_GROUPS, getSanHeGroup } from '../src/selection/branchRelations';
import {
  MONTH_JIN_KUI_POLICY,
  type DirectionVirtueCode,
  type DirectionVirtueEvidence,
  detectSanDeCongJu,
  getDirectionVirtues,
  getMonthJinKuiBranch,
  listMonthJinKuiByGroup,
  resolveVirtueSpatialPosition,
} from '../src/selection/directionVirtues';
import { isMountain24 } from '../src/selection/mountains24';

/** 測試自備天干五合表，不從 production 匯入，避免循環論證。 */
const WU_HE: Record<Stem, Stem> = {
  甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛',
  辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊',
};

const FOUR_CORNERS = ['乾', '坤', '艮', '巽'];

function virtueMap(yearStem: Stem, monthBranch: Branch): Record<DirectionVirtueCode, DirectionVirtueEvidence> {
  const entries = getDirectionVirtues(yearStem, monthBranch).map((virtue) => [virtue.code, virtue] as const);
  return Object.fromEntries(entries) as Record<DirectionVirtueCode, DirectionVirtueEvidence>;
}

function raw(yearStem: Stem, monthBranch: Branch, code: DirectionVirtueCode) {
  return virtueMap(yearStem, monthBranch)[code].rawValue;
}

describe('六德六張表', () => {
  it('恆回傳六項，次序固定，全部 rankingUse=disabled', () => {
    const virtues = getDirectionVirtues('甲', '未');
    expect(virtues.map((virtue) => virtue.code)).toEqual([
      'sui_de', 'sui_de_he', 'tian_de', 'tian_de_he', 'yue_de', 'yue_de_he',
    ]);
    for (const virtue of virtues) expect(virtue.rankingUse).toBe('disabled');
  });

  it('歲德：甲己→甲、乙庚→庚、丙辛→丙、丁壬→壬、戊癸→戊', () => {
    const expected: Record<Stem, string> = {
      甲: '甲', 己: '甲', 乙: '庚', 庚: '庚', 丙: '丙',
      辛: '丙', 丁: '壬', 壬: '壬', 戊: '戊', 癸: '戊',
    };
    for (const stem of STEMS) expect(raw(stem, '寅', 'sui_de'), stem).toBe(expected[stem]);
  });

  it('天德十二月表（四庫本卷三已核對）', () => {
    const expected: Record<string, string> = {
      寅: '丁', 卯: '坤', 辰: '壬', 巳: '辛', 午: '乾', 未: '甲',
      申: '癸', 酉: '艮', 戌: '丙', 亥: '乙', 子: '巽', 丑: '庚',
    };
    for (const branch of BRANCHES) expect(raw('甲', branch, 'tian_de'), branch).toBe(expected[branch]);
  });

  it('月德依三合局取陽干：寅午戌丙、亥卯未甲、申子辰壬、巳酉丑庚', () => {
    const expected: Record<string, string> = {
      yin_wu_xu: '丙', hai_mao_wei: '甲', shen_zi_chen: '壬', si_you_chou: '庚',
    };
    for (const branch of BRANCHES) {
      expect(raw('甲', branch, 'yue_de'), branch).toBe(expected[getSanHeGroup(branch).key]);
    }
  });
});

describe('§1.7 八組推導不變式', () => {
  it('1／2：歲德合＝歲德五合干；五合年組的歲德與歲德合各自相同', () => {
    for (const stem of STEMS) {
      expect(raw(stem, '寅', 'sui_de_he'), stem).toBe(WU_HE[raw(stem, '寅', 'sui_de') as Stem]);
    }
    for (const [a, b] of [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']] as Array<[Stem, Stem]>) {
      expect(raw(a, '寅', 'sui_de')).toBe(raw(b, '寅', 'sui_de'));
      expect(raw(a, '寅', 'sui_de_he')).toBe(raw(b, '寅', 'sui_de_he'));
    }
  });

  it('3／4：天德為天干時天德合＝其五合干；為四維時無合，且無合月恰為四仲', () => {
    const noHe: Branch[] = [];
    for (const branch of BRANCHES) {
      const tianDe = raw('甲', branch, 'tian_de') as string;
      const tianDeHe = raw('甲', branch, 'tian_de_he');
      if (FOUR_CORNERS.includes(tianDe)) {
        expect(tianDeHe, branch).toBeNull();
        noHe.push(branch);
      } else {
        expect(tianDeHe, branch).toBe(WU_HE[tianDe as Stem]);
      }
    }
    expect(noHe.sort()).toEqual(['子', '午', '卯', '酉'].sort());
  });

  it('5／6／7：月德與月德合同局相同，且月德合＝月德五合干', () => {
    for (const group of SAN_HE_GROUPS) {
      const des = group.branches.map((branch) => raw('甲', branch, 'yue_de'));
      const hes = group.branches.map((branch) => raw('甲', branch, 'yue_de_he'));
      expect(new Set(des).size, group.label).toBe(1);
      expect(new Set(hes).size, group.label).toBe(1);
      expect(hes[0]).toBe(WU_HE[des[0] as Stem]);
    }
  });

  it('8：月金匱＝月支所屬三合局的仲支，且複用同一份三合表', () => {
    for (const group of SAN_HE_GROUPS) {
      for (const branch of group.branches) {
        expect(getMonthJinKuiBranch(branch), branch).toBe(group.center);
      }
    }
    expect(Object.fromEntries(listMonthJinKuiByGroup().map((g) => [g.label, g.branch]))).toEqual({
      申子辰: '子', 寅午戌: '午', 亥卯未: '卯', 巳酉丑: '酉',
    });
  });
});

describe('§2 空間解析', () => {
  it('resolveVirtueSpatialPosition 三態正確，且戊己不映射成山', () => {
    expect(resolveVirtueSpatialPosition('丙')).toEqual({ kind: 'mountain', mountain: '丙' });
    expect(resolveVirtueSpatialPosition('戊')).toEqual({ kind: 'outside_24_mountains', stem: '戊' });
    expect(resolveVirtueSpatialPosition('己')).toEqual({ kind: 'outside_24_mountains', stem: '己' });
    expect(resolveVirtueSpatialPosition(null)).toEqual({ kind: 'none', reason: 'classical_no_he' });
  });

  it('全枚舉：六德落在 24 山之外者恰 9 例，且只涉及戊、己', () => {
    const cases: string[] = [];
    for (const stem of STEMS) {
      for (const virtue of getDirectionVirtues(stem, '寅')) {
        if (virtue.position.kind === 'outside_24_mountains' && virtue.code.startsWith('sui_de')) {
          cases.push(`${virtue.code}:${stem}年:${virtue.position.stem}`);
        }
      }
    }
    for (const branch of BRANCHES) {
      for (const virtue of getDirectionVirtues('甲', branch)) {
        if (virtue.position.kind === 'outside_24_mountains' && !virtue.code.startsWith('sui_de')) {
          cases.push(`${virtue.code}:${branch}月:${virtue.position.stem}`);
        }
      }
    }
    expect(cases.sort()).toEqual([
      'sui_de:戊年:戊', 'sui_de:癸年:戊',
      'sui_de_he:己年:己', 'sui_de_he:甲年:己',
      'tian_de_he:申月:戊', 'tian_de_he:未月:己',
      'yue_de_he:亥月:己', 'yue_de_he:卯月:己', 'yue_de_he:未月:己',
    ].sort());
  });

  it('無外方者 exactMountainHit 為 false，不得產生方位 boost', () => {
    for (const virtue of getDirectionVirtues('戊', '卯')) {
      if (virtue.position.kind !== 'mountain') expect(virtue.exactMountainHit, virtue.code).toBe(false);
      else expect(isMountain24(virtue.position.mountain)).toBe(true);
    }
  });

  it('四仲月天德合為 none，且 default 不自動補四維互合', () => {
    for (const branch of ['子', '卯', '午', '酉'] as Branch[]) {
      const tianDeHe = virtueMap('甲', branch).tian_de_he;
      expect(tianDeHe.position, branch).toEqual({ kind: 'none', reason: 'classical_no_he' });
      expect(tianDeHe.sourceMode).toBe('official');
      expect(tianDeHe.exactMountainHit).toBe(false);
    }
  });

  it('四維互合異文只在明確啟用時生效，且標記為 variant、仍不參排序', () => {
    const expected: Record<string, string> = { 卯: '巽', 午: '艮', 酉: '乾', 子: '坤' };
    for (const branch of ['子', '卯', '午', '酉'] as Branch[]) {
      const on = getDirectionVirtues('甲', branch, { tianDeHeCornerVariant: true })
        .find((virtue) => virtue.code === 'tian_de_he')!;
      expect(on.rawValue, branch).toBe(expected[branch]);
      expect(on.sourceMode).toBe('variant');
      expect(on.rankingUse).toBe('disabled');
    }
    // 非四仲月不受異文影響
    expect(raw('甲', '寅', 'tian_de_he')).toBe('壬');
    const yin = getDirectionVirtues('甲', '寅', { tianDeHeCornerVariant: true })
      .find((virtue) => virtue.code === 'tian_de_he')!;
    expect(yin.rawValue).toBe('壬');
    expect(yin.sourceMode).toBe('official');
  });
});

describe('§1 層級與證據等級', () => {
  it('天德／月德 primary、兩合德 combined，歲德與歲德合同為 primary', () => {
    const roles = Object.fromEntries(
      getDirectionVirtues('甲', '未').map((virtue) => [virtue.code, virtue.role]),
    );
    expect(roles).toEqual({
      sui_de: 'primary_virtue',
      sui_de_he: 'primary_virtue', // 原文未給歲家等級，同級屬消極推論（見考源記錄 §1.1）
      tian_de: 'primary_virtue',
      tian_de_he: 'combined_virtue',
      yue_de: 'primary_virtue',
      yue_de_he: 'combined_virtue',
    });
  });

  it('六張表全部已核到固定版本原文，primarySourceVerified 皆為 true', () => {
    // 歲德／歲德合：協紀四庫本卷十四年表一（甲子至癸酉恰涵蓋十天干）
    // 天德／天德合／月德／月德合：星厯考原四庫本卷三，協紀卷二十至三十一月表佐證
    const verified = Object.fromEntries(
      getDirectionVirtues('甲', '未').map((v) => [v.code, v.primarySourceVerified]),
    );
    expect(verified).toEqual({
      sui_de: true, sui_de_he: true,
      tian_de: true, tian_de_he: true, yue_de: true, yue_de_he: true,
    });
    for (const virtue of getDirectionVirtues('甲', '未')) {
      expect(virtue.evidenceLevel, virtue.code).toBe('A');
      // 證據升級不等於強度升級
      expect(virtue.rankingUse, virtue.code).toBe('disabled');
    }
  });
});

describe('§3 三德叢聚', () => {
  it('全枚舉 120 組年干×月支，恰 8 組命中、對應四山', () => {
    const hits: string[] = [];
    for (const stem of STEMS) {
      for (const branch of BRANCHES) {
        const result = detectSanDeCongJu(getDirectionVirtues(stem, branch));
        if (result.active) hits.push(`${stem}${branch}${result.mountain}`);
      }
    }
    expect(hits.sort()).toEqual([
      '甲未甲', '己未甲', '乙丑庚', '庚丑庚', '丙戌丙', '辛戌丙', '丁辰壬', '壬辰壬',
    ].sort());
    expect(hits).toHaveLength(8);
  });

  it('與古籍〈三德格〉四組年月一致', () => {
    for (const [stemA, stemB, branch, mountain] of [
      ['甲', '己', '未', '甲'], ['乙', '庚', '丑', '庚'],
      ['丙', '辛', '戌', '丙'], ['丁', '壬', '辰', '壬'],
    ] as Array<[Stem, Stem, Branch, string]>) {
      for (const stem of [stemA, stemB]) {
        expect(detectSanDeCongJu(getDirectionVirtues(stem, branch)), `${stem}${branch}`)
          .toEqual({ active: true, mountain });
      }
    }
  });

  it('戊年、癸年在十二個月皆不成立（歲德為戊，無外方）', () => {
    for (const stem of ['戊', '癸'] as Stem[]) {
      for (const branch of BRANCHES) {
        expect(detectSanDeCongJu(getDirectionVirtues(stem, branch)).active, `${stem}${branch}`).toBe(false);
      }
    }
  });

  it('三德不含合德：天德＝月德但歲德不同方時不成立', () => {
    // 辰未戌丑月天德＝月德，但歲德須同方才算三德叢聚
    expect(raw('甲', '辰', 'tian_de')).toBe(raw('甲', '辰', 'yue_de'));
    expect(detectSanDeCongJu(getDirectionVirtues('甲', '辰')).active).toBe(false);
  });

  it('天德＝月德的月份恰為辰未戌丑', () => {
    const same = BRANCHES.filter((branch) => raw('甲', branch, 'tian_de') === raw('甲', branch, 'yue_de'));
    expect(same.sort()).toEqual(['丑', '未', '戌', '辰'].sort());
  });
});

describe('§4 月金匱：可計算但不進排序', () => {
  it('policy 固定為 reference_only / disabled，且理由是 source tension', () => {
    expect(MONTH_JIN_KUI_POLICY).toEqual({
      calculate: true,
      display: 'detail_only',
      rankingUse: 'disabled',
      mode: 'reference_only',
      evidenceStatus: 'source_tension',
    });
  });

  it('十二月起例正確：寅月→午', () => {
    expect(getMonthJinKuiBranch('寅')).toBe('午');
    expect(getMonthJinKuiBranch('卯')).toBe('卯');
    expect(getMonthJinKuiBranch('辰')).toBe('子');
    expect(getMonthJinKuiBranch('巳')).toBe('酉');
  });
});

describe('計算層不得內嵌 user-facing 中文（接手指南 §7）', () => {
  it('六德輸出、三德結果與月金匱 policy 全部無中文', () => {
    const payload = JSON.stringify({
      virtues: getDirectionVirtues('甲', '未', { tianDeHeCornerVariant: true }),
      sanDe: detectSanDeCongJu(getDirectionVirtues('甲', '未')),
      policy: MONTH_JIN_KUI_POLICY,
    });
    // rawValue／mountain／stem 是干支與四維字，屬既有 UI 字元；
    // 這裡檢查的是不得出現中文「句子」——以標點與常見敘述字判斷。
    expect(payload).not.toMatch(/[，。；：、？！]/u);
    for (const word of ['本版本', '不判定', '參考', '警示', '排序']) {
      expect(payload, word).not.toContain(word);
    }
  });
});
