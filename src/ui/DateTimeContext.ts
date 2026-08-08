/** 主畫面的日期時間摘要；Phase 3 會由這裡開啟 TimePickerSheet。 */

import { getCurrentSolarTerm } from '../engine/time/solarTerms';
import { formatUtc8Date, formatUtc8Time, nowUtc8 } from '../engine/time/utc8';
import { returnToNow, type AppState } from '../state/appState';
import { el } from './dom';
import { openTimePickerSheet } from './TimePickerSheet';

function isCurrentMinute(d: Date, now: Date): boolean {
  return formatUtc8Date(d) === formatUtc8Date(now)
    && formatUtc8Time(d) === formatUtc8Time(now);
}

export function DateTimeContext(state: AppState): HTMLElement {
  const d = state.selectedDateTime;
  const now = nowUtc8();
  const current = isCurrentMinute(d, now);
  const dateTime = `${formatUtc8Date(d).replace(/-/g, '.')} · ${formatUtc8Time(d)}`;
  const term = getCurrentSolarTerm(d);

  return el(
    'section',
    { class: 'date-context', 'aria-label': '目前排盤時間' },
    el('button', {
      class: 'date-context__select', type: 'button', 'data-sheet-trigger': 'time',
      'aria-label': `選擇日期時間，目前為 ${dateTime}，${term.name}後`,
      onclick: (event) => openTimePickerSheet(event.currentTarget as HTMLElement, d),
    },
      el('span', { class: 'date-context__value' }, dateTime),
      el('span', { class: 'date-context__meta' }, `${term.name}後`),
    ),
    current
      ? el('span', { class: 'badge badge--now', 'aria-label': '現在' }, '今')
      : el('button', {
        class: 'date-context__now', type: 'button',
        onclick: returnToNow,
      }, '回到今'),
  );
}
