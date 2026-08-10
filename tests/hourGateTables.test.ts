import { describe, expect, it } from 'vitest';
import {
  BRANCHES, STEMS, ganzhiFromIndex60, type Branch, type Ganzhi, type Stem,
} from '../src/engine/time/ganzhi';
import {
  type HourStemSupport,
  assessHourStemSupport,
  dayLuBranchFor,
  fiveBuYuGanzhiFor,
  isDayLuHour,
  isFiveBuYu,
  isSupportiveHourStem,
} from '../src/selection/hourGateTables';

/** 測試自備十干五行與剋表，不從 production 匯入，避免循環論證。 */
const ELEMENT: Record<Stem, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
const CONTROLS: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const GENERATES: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };

/** 五鼠遁：甲己日甲子起，其後每個時支順推一干。 */
function hourGanzhi(dayStem: Stem, hourBranch: Branch): Ganzhi {
  const dayStemIndex = STEMS.indexOf(dayStem);
  const branchIndex = BRANCHES.indexOf(hourBranch);
  const ziHourStemIndex = (dayStemIndex % 5) * 2;
  const stemIndex = (ziHourStemIndex + branchIndex) % 10;
  for (let index60 = 0; index60 < 60; index60 += 1) {
    if (index60 % 10 === stemIndex && index60 % 12 === branchIndex) return ganzhiFromIndex60(index60);
  }
  throw new Error('unreachable');
}

describe('五不遇時', () => {
  it('十組定局完全正確', () => {
    const expected: Record<Stem, string> = {
      甲: '庚午', 乙: '辛巳', 丙: '壬辰', 丁: '癸卯', 戊: '甲寅',
      己: '乙丑', 庚: '丙子', 辛: '丁酉', 壬: '戊申', 癸: '己未',
    };
    for (const stem of STEMS) expect(fiveBuYuGanzhiFor(stem), stem).toBe(expected[stem]);
  });

  it('每個日干在十二時辰中恰有一個五不遇時', () => {
    for (const dayStem of STEMS) {
      const hits = BRANCHES.filter((branch) => isFiveBuYu(dayStem, hourGanzhi(dayStem, branch)));
      expect(hits, dayStem).toHaveLength(1);
    }
  });

  it('十組的時干確實剋日干且同陰陽', () => {
    for (const dayStem of STEMS) {
      const hourStem = fiveBuYuGanzhiFor(dayStem)[0] as Stem;
      expect(CONTROLS[ELEMENT[hourStem]], dayStem).toBe(ELEMENT[dayStem]);
      // 同陰陽：十干序號同奇偶
      expect(STEMS.indexOf(hourStem) % 2, dayStem).toBe(STEMS.indexOf(dayStem) % 2);
    }
  });

  it('十組的時支與五鼠遁一致（一致性是驗證手段，不是取值來源）', () => {
    for (const dayStem of STEMS) {
      const text = fiveBuYuGanzhiFor(dayStem);
      const branch = text[1] as Branch;
      expect(hourGanzhi(dayStem, branch).text, dayStem).toBe(text);
    }
  });

  it('不得混入「時支剋日支」：時支剋日支但時干不剋日干者不命中', () => {
    // 甲日的五不遇只有庚午。甲日子時為甲子，時支子（水）不剋任何日支關係，
    // 但更關鍵的是即使時支對日支有剋，只要時干不剋日干就不算五不遇。
    for (const branch of BRANCHES) {
      const ganzhi = hourGanzhi('甲', branch);
      const hourStem = ganzhi.stem;
      const controlsDay = CONTROLS[ELEMENT[hourStem]] === ELEMENT['甲'];
      expect(isFiveBuYu('甲', ganzhi), ganzhi.text).toBe(controlsDay && ganzhi.text === '庚午');
    }
  });

  it('非該日干的五不遇時不命中', () => {
    expect(isFiveBuYu('甲', hourGanzhi('甲', '午'))).toBe(true);
    // 乙日的午時是壬午，不是乙日的五不遇（乙日為辛巳）
    expect(isFiveBuYu('乙', hourGanzhi('乙', '午'))).toBe(false);
    expect(isFiveBuYu('乙', hourGanzhi('乙', '巳'))).toBe(true);
  });
});

describe('日祿時', () => {
  it('十干祿位正確，戊祿在巳、己祿在午與丙丁同位', () => {
    const expected: Record<Stem, Branch> = {
      甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳',
      己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
    };
    for (const stem of STEMS) {
      expect(dayLuBranchFor(stem), stem).toBe(expected[stem]);
      expect(isDayLuHour(stem, expected[stem])).toBe(true);
    }
    expect(dayLuBranchFor('戊')).toBe(dayLuBranchFor('丙'));
    expect(dayLuBranchFor('己')).toBe(dayLuBranchFor('丁'));
  });

  it('每個日干恰有一個祿時，其餘十一時不命中', () => {
    for (const stem of STEMS) {
      expect(BRANCHES.filter((branch) => isDayLuHour(stem, branch)), stem).toHaveLength(1);
    }
  });

  it('祿時與五不遇時恰有一組重疊：辛日酉時同時是日祿與五不遇', () => {
    const overlapping = STEMS.filter(
      (dayStem) => isFiveBuYu(dayStem, hourGanzhi(dayStem, dayLuBranchFor(dayStem))),
    );
    expect(overlapping).toEqual(['辛']);
    // 辛祿在酉，而辛日酉時為丁酉，正是辛日的五不遇
    expect(dayLuBranchFor('辛')).toBe('酉');
    expect(hourGanzhi('辛', '酉').text).toBe('丁酉');
    expect(fiveBuYuGanzhiFor('辛')).toBe('丁酉');
    // 這正是規則文件 §3.2「祿時＋五不遇不得直接升為 preferred」的唯一實例，
    // 組裝層 precedence 必須以此為 fixture，不可假設兩者互斥。
  });
});

describe('時干扶日', () => {
  it('五種關係逐項正確', () => {
    expect(assessHourStemSupport('甲', '乙')).toBe('same_element');   // 木木
    expect(assessHourStemSupport('甲', '壬')).toBe('generates_day');  // 水生木
    expect(assessHourStemSupport('甲', '丙')).toBe('drains_day');     // 木生火，日干洩
    expect(assessHourStemSupport('甲', '庚')).toBe('controls_day');   // 金剋木
    expect(assessHourStemSupport('甲', '戊')).toBe('controlled_by_day'); // 木剋土
  });

  it('100 組全枚舉：關係與自備五行表一致', () => {
    for (const dayStem of STEMS) {
      for (const hourStem of STEMS) {
        const day = ELEMENT[dayStem];
        const hour = ELEMENT[hourStem];
        const expected: HourStemSupport = day === hour ? 'same_element'
          : GENERATES[hour] === day ? 'generates_day'
            : GENERATES[day] === hour ? 'drains_day'
              : CONTROLS[hour] === day ? 'controls_day'
                : 'controlled_by_day';
        expect(assessHourStemSupport(dayStem, hourStem), `${dayStem}日${hourStem}時`).toBe(expected);
      }
    }
  });

  it('neutral 永不出現（五行兩兩必屬其餘五種之一）', () => {
    const seen = new Set<HourStemSupport>();
    for (const dayStem of STEMS) {
      for (const hourStem of STEMS) seen.add(assessHourStemSupport(dayStem, hourStem));
    }
    expect(seen.has('neutral')).toBe(false);
    expect([...seen].sort()).toEqual(
      ['controlled_by_day', 'controls_day', 'drains_day', 'generates_day', 'same_element'],
    );
  });

  it('V1 只把比助與生日當正面訊號', () => {
    expect(isSupportiveHourStem('same_element')).toBe(true);
    expect(isSupportiveHourStem('generates_day')).toBe(true);
    for (const support of ['drains_day', 'controls_day', 'controlled_by_day', 'neutral'] as HourStemSupport[]) {
      expect(isSupportiveHourStem(support), support).toBe(false);
    }
  });

  it('關係有向：時干扶日與日干扶時不可對調', () => {
    expect(assessHourStemSupport('甲', '壬')).toBe('generates_day');
    expect(assessHourStemSupport('壬', '甲')).toBe('drains_day');
    expect(assessHourStemSupport('甲', '庚')).toBe('controls_day');
    expect(assessHourStemSupport('庚', '甲')).toBe('controlled_by_day');
  });

  it('五不遇的時干對日干恆為 controls_day', () => {
    for (const dayStem of STEMS) {
      const hourStem = fiveBuYuGanzhiFor(dayStem)[0] as Stem;
      expect(assessHourStemSupport(dayStem, hourStem), dayStem).toBe('controls_day');
    }
  });
});

describe('計算層不得內嵌 user-facing 中文（接手指南 §7）', () => {
  it('輸出只有代碼與干支字，無中文句子', () => {
    const payload = JSON.stringify({
      fiveBuYu: STEMS.map(fiveBuYuGanzhiFor),
      dayLu: STEMS.map(dayLuBranchFor),
      support: STEMS.map((stem) => assessHourStemSupport(stem, '甲')),
    });
    expect(payload).not.toMatch(/[，。；：、？！]/u);
  });
});
