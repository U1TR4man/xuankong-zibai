import { setSelectionPurpose, type AppState } from '../state/appState';
import { PURPOSE_OPTIONS } from '../selection/purpose';
import type { SelectionPurpose } from '../selection/types';
import { el } from './dom';

export function SelectionPurposeControl(state: AppState): HTMLElement {
  const select = el('select', {
    class: 'selection-purpose__select',
    'aria-label': '雙星用途參考',
  }, ...PURPOSE_OPTIONS.map((purpose) => el('option', {
    value: purpose.value,
    selected: state.selectionPurpose === purpose.value,
  }, purpose.label)));
  select.addEventListener('change', () => {
    setSelectionPurpose(select.value as SelectionPurpose);
  });
  return el('section', {
    class: 'selection-purpose-panel', 'aria-labelledby': 'selection-purpose-title',
  },
    el('label', { class: 'selection-purpose' },
      el('span', { class: 'selection-purpose__label', id: 'selection-purpose-title' },
        '雙星用途參考'),
      select,
    ),
    el('p', { class: 'selection-purpose__helper' },
      '僅篩選相關雙星斷語，不改變方向排序。'),
  );
}
