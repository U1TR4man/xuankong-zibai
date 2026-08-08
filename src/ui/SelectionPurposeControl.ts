import { setSelectionPurpose, type AppState } from '../state/appState';
import { PURPOSE_OPTIONS } from '../selection/purpose';
import type { SelectionPurpose } from '../selection/types';
import { el } from './dom';

export function SelectionPurposeControl(state: AppState): HTMLElement {
  const select = el('select', {
    class: 'selection-purpose__select',
    'aria-label': '擇吉用途',
  }, ...PURPOSE_OPTIONS.map((purpose) => el('option', {
    value: purpose.value,
    selected: state.selectionPurpose === purpose.value,
  }, purpose.label)));
  select.addEventListener('change', () => {
    setSelectionPurpose(select.value as SelectionPurpose);
  });
  return el('label', { class: 'selection-purpose' },
    el('span', { class: 'selection-purpose__label' }, '用途'),
    select,
  );
}
