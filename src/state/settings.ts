/** 設定（規劃書 §28）。以 localStorage 保存，完全離線。 */

import type { DayChangeMode } from '../engine/time/ganzhiDay';
import type { YearBoundary } from '../engine/flyingStar/yearStar';
import { DEFAULT_KE_STRATEGY_ID } from '../engine/flyingStar/ke/registry';

export interface Settings {
  /** 時間制固定 UTC+8，列出僅供顯示 */
  readonly timezone: 'UTC+8';
  dayChangeMode: DayChangeMode;
  yearBoundary: YearBoundary;
  keStrategyId: string;
  showStarName: boolean;
  showPalaceName: boolean;
  showLuoshu: boolean;
}

const KEY = 'zibai.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  timezone: 'UTC+8',
  dayChangeMode: 'midnight',
  yearBoundary: 'lichun',
  keStrategyId: DEFAULT_KE_STRATEGY_ID,
  showStarName: true,
  showPalaceName: true,
  showLuoshu: true,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw), timezone: 'UTC+8' };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 隱私模式下忽略 */
  }
}
