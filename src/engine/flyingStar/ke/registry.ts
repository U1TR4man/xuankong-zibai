/** 刻盤策略註冊表。未來新增流派只需在此登記。 */

import { EightKe15MinuteStrategy } from './EightKe15MinuteStrategy';
import type { KeStarStrategy } from './KeStarStrategy';

export const KE_STRATEGIES: readonly KeStarStrategy[] = [EightKe15MinuteStrategy];

export const DEFAULT_KE_STRATEGY_ID = EightKe15MinuteStrategy.id;

export function getKeStrategy(id: string): KeStarStrategy {
  return KE_STRATEGIES.find((s) => s.id === id) ?? EightKe15MinuteStrategy;
}
