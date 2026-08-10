import { describe, expect, it } from 'vitest';
import { BRANCHES, type Branch } from '../src/engine/time/ganzhi';
import {
  SAN_HE_GROUPS,
  getSanHeGroup,
  isClash,
  isPunishment,
  isSameSanHeGroup,
  isSelfPunishment,
  isSixHarm,
  isSixHarmony,
  opposingTrineBranches,
  oppositeBranch,
  sixHarmBranch,
  sixHarmonyBranch,
} from '../src/selection/branchRelations';

const ALL: readonly Branch[] = BRANCHES;

function pairs(): Array<[Branch, Branch]> {
  const out: Array<[Branch, Branch]> = [];
  for (const a of ALL) {
    for (const b of ALL) out.push([a, b]);
  }
  return out;
}

describe('六沖 primitive', () => {
  it('六組沖正反向皆命中', () => {
    const six: Array<[Branch, Branch]> = [
      ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
    ];
    for (const [a, b] of six) {
      expect(isClash(a, b), `${a}${b}`).toBe(true);
      expect(isClash(b, a), `${b}${a}`).toBe(true);
    }
  });

  it('全部 144 組鎖定 isClash(a, b) === (oppositeBranch(a) === b)', () => {
    for (const [a, b] of pairs()) {
      expect(isClash(a, b), `${a}-${b}`).toBe(oppositeBranch(a) === b);
    }
  });

  it('oppositeBranch 與「相隔六位」一致且自身為對合', () => {
    for (const branch of ALL) {
      const index = BRANCHES.indexOf(branch);
      expect(oppositeBranch(branch)).toBe(BRANCHES[(index + 6) % 12]);
      expect(oppositeBranch(oppositeBranch(branch))).toBe(branch);
    }
  });

  it('每支恰有一個沖支，且不自沖', () => {
    for (const a of ALL) {
      expect(ALL.filter((b) => isClash(a, b))).toHaveLength(1);
      expect(isClash(a, a)).toBe(false);
    }
  });

  it('非沖組合不命中', () => {
    const notClash: Array<[Branch, Branch]> = [
      ['子', '丑'], ['子', '未'], ['寅', '巳'], ['巳', '申'], ['辰', '酉'], ['卯', '戌'],
    ];
    for (const [a, b] of notClash) {
      expect(isClash(a, b), `${a}-${b}`).toBe(false);
    }
  });

  it('六個具名消費者共用同一 primitive：破日、時破、時沖月令／歲君、歲破方、月破方', () => {
    // 破日：月支沖日支
    expect(isClash('子', '午')).toBe(true);
    // 時破：日支沖時支
    expect(isClash('子', '午')).toBe(true);
    // 歲破方／月破方：由單一柱地支導出對沖支
    expect(oppositeBranch('子')).toBe('午');
    expect(oppositeBranch('寅')).toBe('申');
    expect(oppositeBranch('丑')).toBe('未');
  });
});

describe('六合 primitive', () => {
  it('六組合正反向皆命中', () => {
    const six: Array<[Branch, Branch]> = [
      ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未'],
    ];
    for (const [a, b] of six) {
      expect(isSixHarmony(a, b), `${a}${b}`).toBe(true);
      expect(isSixHarmony(b, a), `${b}${a}`).toBe(true);
      expect(sixHarmonyBranch(a)).toBe(b);
      expect(sixHarmonyBranch(b)).toBe(a);
    }
  });

  it('每支恰有一個合支，不自合，且合支不等於沖支', () => {
    for (const a of ALL) {
      expect(ALL.filter((b) => isSixHarmony(a, b))).toHaveLength(1);
      expect(isSixHarmony(a, a)).toBe(false);
      expect(sixHarmonyBranch(a)).not.toBe(oppositeBranch(a));
    }
  });

  it('非合組合不命中', () => {
    expect(isSixHarmony('子', '午')).toBe(false);
    expect(isSixHarmony('子', '未')).toBe(false);
    expect(isSixHarmony('寅', '巳')).toBe(false);
  });
});

describe('六害 primitive', () => {
  it('六組害正反向皆命中', () => {
    const six: Array<[Branch, Branch]> = [
      ['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
    ];
    for (const [a, b] of six) {
      expect(isSixHarm(a, b), `${a}${b}`).toBe(true);
      expect(isSixHarm(b, a), `${b}${a}`).toBe(true);
      expect(sixHarmBranch(a)).toBe(b);
      expect(sixHarmBranch(b)).toBe(a);
    }
  });

  it('每支恰有一個害支，不自害，且害支不等於沖支或合支', () => {
    for (const a of ALL) {
      expect(ALL.filter((b) => isSixHarm(a, b))).toHaveLength(1);
      expect(isSixHarm(a, a)).toBe(false);
      expect(sixHarmBranch(a)).not.toBe(oppositeBranch(a));
      expect(sixHarmBranch(a)).not.toBe(sixHarmonyBranch(a));
    }
  });

  it('害與合不可混淆：子未為害不為合，子丑為合不為害', () => {
    expect(isSixHarm('子', '未')).toBe(true);
    expect(isSixHarmony('子', '未')).toBe(false);
    expect(isSixHarmony('子', '丑')).toBe(true);
    expect(isSixHarm('子', '丑')).toBe(false);
  });
});

describe('三合 primitive（單一資料源）', () => {
  it('四組三合局完整且十二支各屬且只屬一局', () => {
    expect(SAN_HE_GROUPS.map((group) => group.label)).toEqual(['申子辰', '寅午戌', '亥卯未', '巳酉丑']);
    const seen = SAN_HE_GROUPS.flatMap((group) => [...group.branches]);
    expect(seen).toHaveLength(12);
    expect(new Set(seen).size).toBe(12);
    for (const branch of ALL) {
      expect(getSanHeGroup(branch).branches).toContain(branch);
    }
  });

  it('同局兩兩命中，跨局不命中', () => {
    for (const group of SAN_HE_GROUPS) {
      const [a, b, c] = group.branches;
      expect(isSameSanHeGroup(a, b)).toBe(true);
      expect(isSameSanHeGroup(b, c)).toBe(true);
      expect(isSameSanHeGroup(c, a)).toBe(true);
      expect(isSameSanHeGroup(a, a)).toBe(true);
    }
    expect(isSameSanHeGroup('申', '午')).toBe(false);
    expect(isSameSanHeGroup('子', '卯')).toBe(false);
    expect(isSameSanHeGroup('辰', '酉')).toBe(false);
  });

  it('Direction Gate 的三煞由同一份三合表導出「對面三支」，不另建第二張表', () => {
    const derived = Object.fromEntries(
      SAN_HE_GROUPS.map((group) => [group.label, opposingTrineBranches(group).join('')]),
    );
    expect(derived).toEqual({
      申子辰: '巳午未',
      寅午戌: '亥子丑',
      亥卯未: '申酉戌',
      巳酉丑: '寅卯辰',
    });
  });

  it('三煞三支恆為連續，且中心恰為本局仲支的對沖支', () => {
    for (const group of SAN_HE_GROUPS) {
      const trine = opposingTrineBranches(group);
      expect(trine[1]).toBe(oppositeBranch(group.center));
      const first = BRANCHES.indexOf(trine[0]);
      expect(trine[1]).toBe(BRANCHES[(first + 1) % 12]);
      expect(trine[2]).toBe(BRANCHES[(first + 2) % 12]);
      // 對面三支與本局三支完全不重疊
      for (const branch of trine) {
        expect(group.branches).not.toContain(branch);
      }
    }
  });

  it('寅午戌的三煞跨 0° 邊界仍正確回傳亥子丑', () => {
    const yinWuXu = SAN_HE_GROUPS.find((group) => group.key === 'yin_wu_xu')!;
    expect(opposingTrineBranches(yinWuXu)).toEqual(['亥', '子', '丑']);
  });
});

describe('刑 primitive（有向）', () => {
  it('刑是有向關係：申日寅時為刑，巳日寅時不是', () => {
    expect(isPunishment('申', '寅')).toBe(true);
    expect(isPunishment('巳', '寅')).toBe(false);
  });

  it('無恃之刑寅→巳→申→寅為單向，反向不成立', () => {
    expect(isPunishment('寅', '巳')).toBe(true);
    expect(isPunishment('巳', '申')).toBe(true);
    expect(isPunishment('申', '寅')).toBe(true);
    expect(isPunishment('巳', '寅')).toBe(false);
    expect(isPunishment('申', '巳')).toBe(false);
    expect(isPunishment('寅', '申')).toBe(false);
  });

  it('無恩之刑丑→戌→未→丑為單向，反向不成立', () => {
    expect(isPunishment('丑', '戌')).toBe(true);
    expect(isPunishment('戌', '未')).toBe(true);
    expect(isPunishment('未', '丑')).toBe(true);
    expect(isPunishment('戌', '丑')).toBe(false);
    expect(isPunishment('未', '戌')).toBe(false);
    expect(isPunishment('丑', '未')).toBe(false);
  });

  it('無禮之刑子卯為雙向', () => {
    expect(isPunishment('子', '卯')).toBe(true);
    expect(isPunishment('卯', '子')).toBe(true);
  });

  it('自刑只有辰午酉亥，其餘八支不自刑', () => {
    const self: Branch[] = ['辰', '午', '酉', '亥'];
    for (const branch of ALL) {
      const expected = self.includes(branch);
      expect(isSelfPunishment(branch), branch).toBe(expected);
      expect(isPunishment(branch, branch), `${branch}日${branch}時`).toBe(expected);
    }
  });

  it('刑不可退化為「同組即成立」：整體並非對稱關係', () => {
    const asymmetric = pairs().filter(([a, b]) => isPunishment(a, b) !== isPunishment(b, a));
    expect(asymmetric.length).toBeGreaterThan(0);
    expect(asymmetric).toContainEqual(['寅', '巳']);
    expect(asymmetric).toContainEqual(['丑', '戌']);
  });

  it('每個日支恰有一個被刑的時支', () => {
    for (const a of ALL) {
      expect(ALL.filter((b) => isPunishment(a, b))).toHaveLength(1);
    }
  });
});

describe('正負關係必須可同時存在（不做抵消）', () => {
  it('巳日申時同時是六合與刑', () => {
    expect(isSixHarmony('巳', '申')).toBe(true);
    expect(isPunishment('巳', '申')).toBe(true);
    // 反向：申日巳時仍是六合，但不是刑
    expect(isSixHarmony('申', '巳')).toBe(true);
    expect(isPunishment('申', '巳')).toBe(false);
  });

  it('自刑支在日時相同時成立時刑；時建（日支＝時支）由 Hour Gate 另行判定', () => {
    for (const branch of ['辰', '午', '酉', '亥'] as Branch[]) {
      expect(isPunishment(branch, branch), branch).toBe(true);
      // 同支必然不沖、不合、不害，因此「時建 + 時刑」是唯一並存組合
      expect(isClash(branch, branch)).toBe(false);
      expect(isSixHarmony(branch, branch)).toBe(false);
      expect(isSixHarm(branch, branch)).toBe(false);
    }
  });

  it('子日卯時同時是刑與跨局，且既非沖亦非合亦非害', () => {
    expect(isPunishment('子', '卯')).toBe(true);
    expect(isClash('子', '卯')).toBe(false);
    expect(isSixHarmony('子', '卯')).toBe(false);
    expect(isSixHarm('子', '卯')).toBe(false);
    expect(isSameSanHeGroup('子', '卯')).toBe(false);
  });

  it('primitive 之間不互相取代：沖、合、害、三合、刑各自獨立判定', () => {
    // 卯戌：合而非沖、非害、非同局、非刑
    expect(isSixHarmony('卯', '戌')).toBe(true);
    expect(isClash('卯', '戌')).toBe(false);
    expect(isSixHarm('卯', '戌')).toBe(false);
    expect(isSameSanHeGroup('卯', '戌')).toBe(false);
    expect(isPunishment('卯', '戌')).toBe(false);
    // 申子：同局而非合、非沖、非害、非刑
    expect(isSameSanHeGroup('申', '子')).toBe(true);
    expect(isSixHarmony('申', '子')).toBe(false);
    expect(isClash('申', '子')).toBe(false);
    expect(isSixHarm('申', '子')).toBe(false);
    expect(isPunishment('申', '子')).toBe(false);
  });
});
