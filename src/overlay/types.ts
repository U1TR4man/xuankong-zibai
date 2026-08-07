import type { PalaceKey, StarLevel } from '../engine/flyingStar/types';

/** Engine 飛星值的窄型別；核心比對一律保存數字，不保存「九紫」字串。 */
export type StarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const OVERLAY_LEVELS: readonly StarLevel[] = ['year', 'month', 'day', 'hour', 'ke'];

export type PalaceLayerStars = Record<StarLevel, StarNumber>;

export interface PalaceOverlayViewModel {
  key: PalaceKey;
  /** UI 短名，例如「離」；計算仍使用穩定的 PalaceKey。 */
  name: string;
  bearing: string;
  luoshu: number;
  stars: PalaceLayerStars;
}

export interface OverlayResult {
  datetime: Date;
  centerStars: PalaceLayerStars;
  palaces: readonly PalaceOverlayViewModel[];
}

export function asStarNumber(value: number): StarNumber {
  if (Number.isInteger(value) && value >= 1 && value <= 9) return value as StarNumber;
  throw new RangeError(`飛星值必須介乎 1–9，目前為 ${value}`);
}

/** 搜尋結果只顯示截至搜尋精度為止的上層：日=年月日、時=年月日時、刻=全部。 */
export function overlayLevelsThrough(level: StarLevel): readonly StarLevel[] {
  return OVERLAY_LEVELS.slice(0, OVERLAY_LEVELS.indexOf(level) + 1);
}
