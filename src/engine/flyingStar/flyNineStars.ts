/**
 * 九宮飛布（規劃書 §7）。
 *
 * 全 App 只有這一份飛宮定義。任何 Engine 都不得自行重寫。
 * 飛行順序：中 → 乾 → 兌 → 艮 → 離 → 坎 → 坤 → 震 → 巽
 */

import type { Direction, PalaceKey, PalaceStars } from './types';

export const FLY_ORDER: readonly PalaceKey[] = [
  'center', 'qian', 'dui', 'gen', 'li', 'kan', 'kun', 'zhen', 'xun',
];

/** 將任意整數正規化到 1–9。 */
export function norm9(n: number): number {
  return (((n - 1) % 9) + 9) % 9 + 1;
}

export function flyNineStars(centerStar: number, direction: Direction): PalaceStars {
  const start = norm9(centerStar);
  const step = direction === 'forward' ? 1 : -1;
  const out = {} as PalaceStars;
  FLY_ORDER.forEach((key, i) => {
    out[key] = norm9(start + step * i);
  });
  return out;
}

/** 自入中星沿指定方向推 n 步。 */
export function stepStar(star: number, direction: Direction, n: number): number {
  return norm9(star + (direction === 'forward' ? 1 : -1) * n);
}
