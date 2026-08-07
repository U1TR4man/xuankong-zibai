import type { PalaceLayerStars } from '../overlay/types';
import type { SearchCondition } from './types';

/** 同層 stars=OR；跨層 conditions=AND。 */
export function matchesConditions(
  palaceStars: PalaceLayerStars,
  conditions: readonly SearchCondition[],
): boolean {
  return conditions.every((condition) => condition.stars.includes(palaceStars[condition.level]));
}
