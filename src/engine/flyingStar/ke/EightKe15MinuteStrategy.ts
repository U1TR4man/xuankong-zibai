/**
 * 第一版刻盤算法（規劃書 §18–19）：八刻十五分鐘制。
 *
 *   一時辰 = 120 分鐘，均分 8 刻，每刻 15 分鐘。
 *   第一刻直接承接流時入中星；之後每刻沿流時方向推一星。
 *
 * ⚠ 此為可替換規則，不視為唯一古法。
 */

import { getChineseHour } from '../../time/chineseHour';
import { formatUtc8Time } from '../../time/utc8';
import { stepStar } from '../flyNineStars';
import type { Direction, StarResult } from '../types';
import type { KeInfo, KeStarStrategy } from './KeStarStrategy';

const KE_COUNT = 8;
const KE_MINUTES = 15;
const KE_ORDINALS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
const KE_CHINESE = ['一', '二', '三', '四', '五', '六', '七', '八'];

export function keOrdinalMark(index: number): string {
  return KE_ORDINALS[index] ?? String(index + 1);
}

export function keChineseLabel(index: number): string {
  return `第${KE_CHINESE[index] ?? index + 1}刻`;
}

export const EightKe15MinuteStrategy: KeStarStrategy = {
  id: 'ke8-15min',
  name: '八刻十五分鐘制',
  description: '一時辰 120 分鐘均分八刻，每刻 15 分鐘；第一刻承接流時入中星，之後沿流時方向逐刻推一星。',
  disclaimer: '此為可替換刻盤規則，不視為唯一古法。',
  keCount: KE_COUNT,

  getKeIndex(datetime: Date): number {
    const h = getChineseHour(datetime);
    const mins = (datetime.getTime() - h.start.getTime()) / 60000;
    return Math.min(KE_COUNT - 1, Math.max(0, Math.floor(mins / KE_MINUTES)));
  },

  listKe(datetime: Date): KeInfo[] {
    const h = getChineseHour(datetime);
    return Array.from({ length: KE_COUNT }, (_, i) => {
      const start = new Date(h.start.getTime() + i * KE_MINUTES * 60000);
      const end = new Date(start.getTime() + KE_MINUTES * 60000);
      return {
        index: i,
        ordinal: i + 1,
        start,
        end,
        label: keChineseLabel(i),
        rangeLabel: `${formatUtc8Time(start)}–${formatUtc8Time(new Date(end.getTime() - 60000))}`,
      };
    });
  },

  getCenterStar(hourResult: StarResult, datetime: Date): number {
    return stepStar(hourResult.centerStar, hourResult.direction, this.getKeIndex(datetime));
  },

  getDirection(hourResult: StarResult, _datetime: Date): Direction {
    return hourResult.direction;
  },
};
