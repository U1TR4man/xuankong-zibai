/**
 * Gate 狀態的中文標籤 —— 全 App 唯一一份。
 *
 * 接手指南 §7：計算層回傳穩定代碼，**UI 才翻譯成自然中文**。因此這些表放在
 * `src/ui/`，不放 `src/selection/`。
 *
 * 之所以獨立成檔而不是各自複製：方向詳情與尋星結果都要顯示日課／時課，
 * 兩份表一旦分歧，同一個 `caution` 會在兩個畫面讀到不同的字。
 */

import type { HourGateStatus } from '../selection/hourGate';
import type {
  TimeWindowHourStatus, TimeWindowRejection,
} from '../selection/timeWindowRanking';
import type { DayGateStatus } from '../selection/types';

export const DAY_STATUS_LABEL: Record<DayGateStatus, string> = {
  pass: '通過', mixed: '偏弱', caution: '慎看',
};

export const HOUR_STATUS_LABEL: Record<HourGateStatus, string> = {
  preferred: '宜用', pass: '可用', mixed: '吉凶並見', caution: '慎用', reject: '不用',
};

/**
 * 時窗層另有一個 `not_applicable`：日精度涵蓋十二個時辰，沒有唯一時柱。
 * 標籤刻意寫成「不分時辰」而不是「未評估」——後者會被誤讀成「本版本還沒做」。
 */
export const TIME_WINDOW_HOUR_STATUS_LABEL: Record<TimeWindowHourStatus, string> = {
  ...HOUR_STATUS_LABEL,
  not_applicable: '不分時辰',
};

export const TIME_WINDOW_REJECTION_LABEL: Record<TimeWindowRejection, string> = {
  hour_gate_reject: '時課不用',
};
