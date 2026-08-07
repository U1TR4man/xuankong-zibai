/**
 * 刻盤策略介面（規劃書 §16–17、§41）。
 *
 * 重要：刻紫白沒有像日、時紫白那樣高度統一的古法標準。
 * 因此 KeStarEngine 一律以 Strategy 形式存在，禁止寫死成唯一真理。
 * 未來要加入別派算法，只需新增一個 KeStarStrategy 實作，
 * 完全不需修改流年／流月／流日／流時／九宮 UI。
 */

import type { Direction, StarResult } from '../types';

export interface KeInfo {
  /** 0-based 刻序 */
  index: number;
  /** 1-based，顯示用 */
  ordinal: number;
  start: Date;
  end: Date;
  label: string;
  rangeLabel: string;
}

export interface KeStarStrategy {
  id: string;
  name: string;
  description: string;
  /** 免責說明，UI 必須顯示（規劃書 §20） */
  disclaimer: string;
  /** 一個時辰切成幾刻 */
  keCount: number;

  /** 該時間點落在第幾刻（0-based） */
  getKeIndex(datetime: Date): number;

  /** 列出該時間點所在時辰的全部刻 */
  listKe(datetime: Date): KeInfo[];

  getCenterStar(hourResult: StarResult, datetime: Date): number;

  getDirection(hourResult: StarResult, datetime: Date): Direction;
}
