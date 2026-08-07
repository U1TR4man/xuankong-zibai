/** 規劃書 §36 A — 飛九宮 */
import { describe, expect, it } from 'vitest';
import { flyNineStars, norm9, FLY_ORDER } from '../src/engine/flyingStar/flyNineStars';

const seq = (center: number, dir: 'forward' | 'reverse') => {
  const p = flyNineStars(center, dir);
  return FLY_ORDER.map((k) => p[k]);
};

describe('norm9', () => {
  it('wraps into 1..9', () => {
    expect(norm9(0)).toBe(9);
    expect(norm9(9)).toBe(9);
    expect(norm9(10)).toBe(1);
    expect(norm9(-1)).toBe(8);
    expect(norm9(19)).toBe(1);
  });
});

describe('flyNineStars 飛行順序 中→乾→兌→艮→離→坎→坤→震→巽', () => {
  it('1 順飛', () => {
    expect(seq(1, 'forward')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('9 順飛 wrap', () => {
    expect(seq(9, 'forward')).toEqual([9, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('1 逆飛 wrap', () => {
    expect(seq(1, 'reverse')).toEqual([1, 9, 8, 7, 6, 5, 4, 3, 2]);
  });
  it('9 逆飛', () => {
    expect(seq(9, 'reverse')).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });
  it('5 入中順飛：中5 乾6 兌7 艮8 離9 坎1 坤2 震3 巽4', () => {
    const p = flyNineStars(5, 'forward');
    expect(p).toEqual({ center: 5, qian: 6, dui: 7, gen: 8, li: 9, kan: 1, kun: 2, zhen: 3, xun: 4 });
  });
  it('每盤九宮各數字恰好出現一次', () => {
    for (let c = 1; c <= 9; c++) {
      for (const d of ['forward', 'reverse'] as const) {
        expect(new Set(seq(c, d)).size).toBe(9);
      }
    }
  });
});
