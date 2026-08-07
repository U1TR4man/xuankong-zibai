/** V2 極簡頂欄。設定與說明在 Phase 3/5 會改成真正的 Sheet。 */

import { goHome, LEVEL_LABEL, type AppState } from '../state/appState';
import { el } from './dom';
import { openSettingsSheet } from './SettingsSheet';

function openCurrentExplanation(): void {
  document.querySelector<HTMLButtonElement>('.explain-trigger')?.click();
}

export function TopBar(state: AppState): HTMLElement {
  return el(
    'header',
    { class: 'topbar', 'aria-label': `玄空紫白・目前為流${LEVEL_LABEL[state.level]}盤` },
    el('button', { class: 'topbar__brand', type: 'button', onclick: goHome }, '玄空紫白'),
    el('div', { class: 'topbar__actions' },
      el('button', {
        class: 'topbar__icon', type: 'button', 'aria-label': '查看排盤說明',
        onclick: openCurrentExplanation,
      }, el('span', { 'aria-hidden': 'true' }, 'ⓘ')),
      el('button', {
        class: 'topbar__icon', type: 'button', 'aria-label': '開啟設定',
        'data-sheet-trigger': 'settings',
        onclick: (event) => openSettingsSheet(event.currentTarget as HTMLElement),
      }, el('span', { 'aria-hidden': 'true' }, '⚙')),
    ),
  );
}
