/** 日期時間選擇 Sheet：draft 留在表單內，按「查看此時」才套用。 */

import { formatUtc8Date, formatUtc8Time, nowUtc8, parseUtc8 } from '../engine/time/utc8';
import { setDateTime } from '../state/appState';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

export function openTimePickerSheet(trigger: HTMLElement, selected: Date): HTMLDialogElement {
  const dateInput = el('input', {
    class: 'sheet-field', type: 'date', value: formatUtc8Date(selected),
    'aria-label': '日期', 'data-autofocus': 'true',
  });
  const timeInput = el('input', {
    class: 'sheet-field', type: 'time', value: formatUtc8Time(selected),
    'aria-label': '時間',
  });

  let handle: ReturnType<typeof openBottomSheet>;
  const apply = () => {
    const d = parseUtc8(`${dateInput.value}T${timeInput.value || '00:00'}`);
    if (!d) {
      dateInput.focus();
      return;
    }
    handle.close();
    setDateTime(d, { push: true });
  };
  const useNow = () => {
    const now = nowUtc8();
    dateInput.value = formatUtc8Date(now);
    timeInput.value = formatUtc8Time(now);
  };

  const content = el('form', {
    class: 'sheet-form', onsubmit: (event) => { event.preventDefault(); apply(); },
  },
    el('label', { class: 'sheet-field-group' },
      el('span', { class: 'sheet-field-label' }, '日期'), dateInput),
    el('label', { class: 'sheet-field-group' },
      el('span', { class: 'sheet-field-label' }, '時間'), timeInput),
    el('p', { class: 'sheet-form__meta' }, '所有時間以 UTC+8 判定'),
    el('div', { class: 'sheet-actions' },
      el('button', { class: 'btn btn--ghost', type: 'button', onclick: useNow }, '現在'),
      el('button', { class: 'btn btn--primary', type: 'submit' }, '查看此時'),
    ),
  );

  handle = openBottomSheet({
    title: '選擇時間', content, trigger,
    className: 'sheet-dialog--time', returnFocusSelector: '[data-sheet-trigger="time"]',
  });
  return handle.dialog;
}
