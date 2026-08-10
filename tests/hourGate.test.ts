import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import {
  BRANCHES, STEMS, ganzhiFromIndex60, type Branch, type Ganzhi, type Stem,
} from '../src/engine/time/ganzhi';
import { fromUtc8 } from '../src/engine/time/utc8';
import { evaluateDirections, rankDirections } from '../src/selection/evaluateDirection';
import { type SelectionMode, buildHourGate } from '../src/selection/hourGate';
import { type TemporalPillars, buildTemporalPillars } from '../src/selection/temporalPillars';
import { buildTemporalBranchContext, buildTimeGateAssessment } from '../src/selection/temporalRules';

/** 干支必須同陰陽；不合法組合直接拋錯，避免測試建出不存在的柱。 */
function ganzhi(stem: Stem, branch: Branch): Ganzhi {
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  for (let index60 = 0; index60 < 60; index60 += 1) {
    if (index60 % 10 === stemIndex && index60 % 12 === branchIndex) return ganzhiFromIndex60(index60);
  }
  throw new Error(`不存在的干支：${stem}${branch}`);
}

/** 年、月柱只用到地支，天干取任一合法者。 */
function anyGanzhiWithBranch(branch: Branch): Ganzhi {
  const branchIndex = BRANCHES.indexOf(branch);
  for (let index60 = 0; index60 < 60; index60 += 1) {
    if (index60 % 12 === branchIndex) return ganzhiFromIndex60(index60);
  }
  throw new Error(`unreachable ${branch}`);
}

/** 五鼠遁：由日干與時支求時柱。 */
function hourPillar(dayStem: Stem, hourBranch: Branch): Ganzhi {
  const ziHourStemIndex = (STEMS.indexOf(dayStem) % 5) * 2;
  return ganzhi(STEMS[(ziHourStemIndex + BRANCHES.indexOf(hourBranch)) % 10]!, hourBranch);
}

interface Case {
  day: Ganzhi;
  hourBranch: Branch;
  /** 預設同時支，確保不產生非本意的沖月令／沖歲君。 */
  yearBranch?: Branch;
  monthBranch?: Branch;
}

function pillarsOf({ day, hourBranch, yearBranch, monthBranch }: Case): TemporalPillars {
  return {
    year: anyGanzhiWithBranch(yearBranch ?? hourBranch),
    month: anyGanzhiWithBranch(monthBranch ?? hourBranch),
    day,
    hour: hourPillar(day.stem, hourBranch),
  };
}

function gate(input: Case, mode?: SelectionMode) {
  return buildHourGate(pillarsOf(input), mode ? { mode } : {});
}

describe('§7 precedence', () => {
  it('時破為 structural veto', () => {
    const result = gate({ day: ganzhi('甲', '子'), hourBranch: '午' });
    expect(result.conflicts.hourBreak).toBe(true);
    expect(result.status).toBe('reject');
  });

  it('正面支持不得把 reject 翻回 pass：全枚舉時破組合', () => {
    for (const dayStem of STEMS) {
      for (const hourBranch of BRANCHES) {
        for (const dayBranch of BRANCHES) {
          if ((STEMS.indexOf(dayStem) % 2) !== (BRANCHES.indexOf(dayBranch) % 2)) continue;
          const result = gate({ day: ganzhi(dayStem, dayBranch), hourBranch });
          if (result.conflicts.hourBreak) {
            expect(result.status, `${dayStem}${dayBranch}日${hourBranch}時`).toBe('reject');
          }
        }
      }
    }
  });

  it('五不遇為 caution，不是 reject', () => {
    // 甲日的五不遇為庚午，即甲日午時
    const result = gate({ day: ganzhi('甲', '寅'), hourBranch: '午' });
    expect(result.conflicts.fiveBuYu).toBe(true);
    expect(result.conflicts.hourBreak).toBe(false);
    expect(result.status).toBe('caution');
  });

  it('時刑或日害至少 mixed', () => {
    // 子刑卯，且子卯既不相沖也不相害，可單獨測時刑
    const punish = gate({ day: ganzhi('甲', '子'), hourBranch: '卯' });
    expect(punish.conflicts).toMatchObject({ punishment: true, hourBreak: false, harm: false });
    expect(punish.status).toBe('mixed');
    // 子未六害，且子未不相沖、不相刑
    const harm = gate({ day: ganzhi('甲', '子'), hourBranch: '未' });
    expect(harm.conflicts).toMatchObject({ harm: true, hourBreak: false, punishment: false });
    expect(harm.status).toBe('mixed');
  });

  it('無衝突且有正面支持為 preferred', () => {
    // 甲祿在寅
    const result = gate({ day: ganzhi('甲', '辰'), hourBranch: '寅' });
    expect(result.support.dayLu).toBe(true);
    expect(result.conflicts).toMatchObject({ hourBreak: false, fiveBuYu: false, punishment: false, harm: false });
    expect(result.status).toBe('preferred');
  });

  it('無衝突且無支持為 pass', () => {
    const result = gate({ day: ganzhi('丙', '辰'), hourBranch: '丑' });
    expect(result.reasons).toEqual([]);
    expect(result.status).toBe('pass');
  });
});

describe('§3.2 祿時不凌駕負面規則', () => {
  it('辛日酉時同時是日祿與五不遇，必須是 caution 而非 preferred', () => {
    const result = gate({ day: ganzhi('辛', '丑'), hourBranch: '酉' });
    expect(result.hourStem).toBe('丁');
    expect(result.support.dayLu).toBe(true);
    expect(result.conflicts.fiveBuYu).toBe(true);
    expect(result.status).toBe('caution');
    // 正負兩邊都完整保存，沒有互相消除
    expect(result.reasons).toContain('conflict_five_bu_yu');
    expect(result.reasons).toContain('support_day_lu');
  });

  it('祿時遇時破仍為 reject', () => {
    // 甲祿在寅；申日寅時同時是時破（寅申六沖）與時刑（申刑寅）
    const result = gate({ day: ganzhi('甲', '申'), hourBranch: '寅' });
    expect(result.support.dayLu).toBe(true);
    expect(result.conflicts).toMatchObject({ hourBreak: true, punishment: true });
    expect(result.status).toBe('reject');
    // 祿仍完整保留，只是不解除 reject
    expect(result.reasons).toContain('support_day_lu');
    expect(result.reasons).toContain('conflict_hour_break');
  });

  it('rescuesWeakDay 在有 structural veto 或五不遇時恆為 false', () => {
    expect(gate({ day: ganzhi('甲', '子'), hourBranch: '午' }).support.rescuesWeakDay).toBe(false);
    expect(gate({ day: ganzhi('辛', '丑'), hourBranch: '酉' }).support.rescuesWeakDay).toBe(false);
    expect(gate({ day: ganzhi('甲', '辰'), hourBranch: '寅' }).support.rescuesWeakDay).toBe(true);
  });
});

describe('§3.1 正負關係必須可同時存在', () => {
  it('巳日申時同時是六合與刑', () => {
    const result = gate({ day: ganzhi('己', '巳'), hourBranch: '申' });
    expect(result.support.liuHe).toBe(true);
    expect(result.conflicts.punishment).toBe(true);
    expect(result.reasons).toContain('support_liu_he');
    expect(result.reasons).toContain('conflict_punishment');
    expect(result.status).toBe('mixed');
  });

  it('自刑支日時相同時同時是時建與時刑', () => {
    // 日干需避開該時辰恰為其五不遇者：甲日午時為庚午、辛日酉時為丁酉，故改取丙午與乙酉
    for (const [stem, branch] of [['甲', '辰'], ['丙', '午'], ['乙', '酉'], ['辛', '亥']] as Array<[Stem, Branch]>) {
      const result = gate({ day: ganzhi(stem, branch), hourBranch: branch });
      expect(result.support.build, branch).toBe(true);
      expect(result.conflicts.punishment, branch).toBe(true);
      expect(result.status, branch).toBe('mixed');
    }
  });

  it('非自刑支的時建不帶時刑', () => {
    const result = gate({ day: ganzhi('丙', '寅'), hourBranch: '寅' });
    expect(result.support.build).toBe(true);
    expect(result.conflicts.punishment).toBe(false);
  });
});

describe('§4 時沖月令／歲君依模式分歧', () => {
  // 丙寅日午時為甲午，不是丙日的五不遇（丙為壬辰），可乾淨測沖月令
  const clashMonth: Case = { day: ganzhi('丙', '寅'), hourBranch: '午', yearBranch: '寅', monthBranch: '子' };

  it('construction 模式下沖月令為 reject，daily 不是', () => {
    expect(gate(clashMonth, 'construction').status).toBe('reject');
    expect(gate(clashMonth, 'daily').status).not.toBe('reject');
  });

  it('daily 模式記為 warning，且不得升為 preferred', () => {
    const result = gate(clashMonth, 'daily');
    expect(result.conflicts.clashMonth).toEqual({ active: true, severity: 'warning' });
    expect(result.status).toBe('mixed');
  });

  it('沖歲君同樣依模式分歧', () => {
    const clashYear: Case = { day: ganzhi('丙', '寅'), hourBranch: '午', yearBranch: '子', monthBranch: '寅' };
    expect(gate(clashYear, 'construction').conflicts.clashYear.severity).toBe('reject');
    expect(gate(clashYear, 'daily').conflicts.clashYear.severity).toBe('warning');
    expect(gate(clashYear, 'construction').status).toBe('reject');
  });

  it('預設模式為 daily', () => {
    const p = pillarsOf(clashMonth);
    expect(buildHourGate(p).mode).toBe('daily');
    expect(buildHourGate(p).status).toBe(gate(clashMonth, 'daily').status);
  });

  it('未沖時 severity 為 ignore_for_small', () => {
    const result = gate({ day: ganzhi('甲', '辰'), hourBranch: '寅' });
    expect(result.conflicts.clashMonth.severity).toBe('ignore_for_small');
    expect(result.conflicts.clashYear.severity).toBe('ignore_for_small');
  });
});

describe('Gate 不做算術抵消', () => {
  it('reject 與 caution 的時辰仍完整列出正面條目', () => {
    const caution = gate({ day: ganzhi('辛', '丑'), hourBranch: '酉' });
    expect(caution.status).toBe('caution');
    expect(caution.reasons.some((r) => r.startsWith('support_'))).toBe(true);
  });

  it('reasons 衝突在前、支持在後，且沒有任何抵銷欄位', () => {
    const result = gate({ day: ganzhi('辛', '丑'), hourBranch: '酉' });
    const firstSupport = result.reasons.findIndex((r) => r.startsWith('support_'));
    const lastConflict = result.reasons.map((r) => r.startsWith('conflict_')).lastIndexOf(true);
    expect(lastConflict).toBeLessThan(firstSupport);
    const serialized = JSON.stringify(result).toLowerCase();
    for (const token of ['cancel', 'offset', 'score', 'total', 'net']) {
      expect(serialized, token).not.toContain(token);
    }
  });

  it('全枚舉合法日柱×十二時辰：status 恆合法，且五種狀態都出現過', () => {
    const valid = new Set(['preferred', 'pass', 'mixed', 'caution', 'reject']);
    const seen = new Set<string>();
    for (const dayStem of STEMS) {
      for (const dayBranch of BRANCHES) {
        if ((STEMS.indexOf(dayStem) % 2) !== (BRANCHES.indexOf(dayBranch) % 2)) continue;
        for (const hourBranch of BRANCHES) {
          const result = gate({ day: ganzhi(dayStem, dayBranch), hourBranch });
          expect(valid.has(result.status)).toBe(true);
          expect(result.rankingUse).toBe('disabled');
          seen.add(result.status);
        }
      }
    }
    expect(seen.size).toBe(5);
  });
});

describe('regression：Hour Gate 不得改動既有輸出', () => {
  const AT = fromUtc8(2026, 8, 7, 11, 38);

  it('TimeGateAssessment.hourStatus 仍為 not_evaluated（§11 stop condition 2）', () => {
    expect(buildTimeGateAssessment(buildTemporalBranchContext(AT)).hourStatus).toBe('not_evaluated');
    buildHourGate(buildTemporalPillars(AT));
    expect(buildTimeGateAssessment(buildTemporalBranchContext(AT)).hourStatus).toBe('not_evaluated');
  });

  it('計算 Hour Gate 前後，八方 verdict 與排序完全相同', () => {
    const fingerprint = () => {
      const chart = computeFullChart(AT);
      const evaluations = evaluateDirections(chart);
      return {
        verdicts: evaluations.map((e) => `${e.snapshot.palace}:${e.verdict}`),
        order: rankDirections(evaluations).map((e) => e.snapshot.palace),
      };
    };
    const before = fingerprint();
    expect(buildHourGate(buildTemporalPillars(AT)).status).toBeDefined();
    expect(fingerprint()).toEqual(before);
  });

  it('DirectionEvaluation 完全沒有 Hour Gate 欄位', () => {
    const serialized = JSON.stringify(evaluateDirections(computeFullChart(AT)));
    for (const token of [
      'hourBreak', 'fiveBuYu', 'conflict_hour_break', 'support_day_lu',
      'rescuesWeakDay', 'ignore_for_small',
    ]) {
      expect(serialized, token).not.toContain(token);
    }
  });
});

describe('計算層不得內嵌 user-facing 中文（接手指南 §7）', () => {
  it('HourGate 輸出只有代碼與干支字', () => {
    const payload = JSON.stringify(buildHourGate(buildTemporalPillars(fromUtc8(2026, 8, 7, 11, 38))));
    expect(payload).not.toMatch(/[，。；：、？！]/u);
  });
});
