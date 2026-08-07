/**
 * 刻盤結果組裝（規劃書 §41）。
 *
 * 流刻是獨立算法層：HourStarResult → KeStarStrategy → KeStarResult → 九宮盤。
 * 本檔只負責把 strategy 的輸出包成標準 StarResult，不含任何刻算法本身。
 */

import { flyNineStars } from './flyNineStars';
import { starName, DIRECTION_LABEL, type StarResult } from './types';
import type { KeStarStrategy } from './ke/KeStarStrategy';
import { keChineseLabel } from './ke/EightKe15MinuteStrategy';

export interface KeStarResult extends StarResult {
  level: 'ke';
  keIndex: number;
  strategyId: string;
  strategyName: string;
  disclaimer: string;
}

export function computeKeStar(
  hourResult: StarResult,
  datetime: Date,
  strategy: KeStarStrategy,
): KeStarResult {
  const keIndex = strategy.getKeIndex(datetime);
  const centerStar = strategy.getCenterStar(hourResult, datetime);
  const direction = strategy.getDirection(hourResult, datetime);
  const info = strategy.listKe(datetime)[keIndex]!;
  return {
    level: 'ke',
    keIndex,
    strategyId: strategy.id,
    strategyName: strategy.name,
    disclaimer: strategy.disclaimer,
    centerStar,
    direction,
    palaceStars: flyNineStars(centerStar, direction),
    sourceRule: `刻盤算法：${strategy.name}（可替換 Strategy）`,
    title: info.label,
    subtitle: info.rangeLabel,
    explain: [
      { label: '刻盤算法', value: strategy.name },
      { label: '流時', value: `${starName(hourResult.centerStar)}入中 · ${DIRECTION_LABEL[hourResult.direction]}` },
      { label: '刻序', value: `${keChineseLabel(keIndex)}（${info.rangeLabel}）` },
      {
        label: '推算',
        value: `${starName(hourResult.centerStar)} ${direction === 'forward' ? '順' : '逆'}行 ${keIndex} 步 → ${starName(centerStar)}`,
      },
      { label: '注意', value: strategy.disclaimer },
    ],
  };
}
