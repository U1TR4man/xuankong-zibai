import { setOverlayMode, type AppState } from '../state/appState';
import { el } from './dom';

export function OverlayControls(state: AppState): HTMLElement {
  const toggle = el('button', {
    class: `overlay-toggle${state.overlayMode ? ' is-active' : ''}`,
    type: 'button',
    'aria-pressed': String(state.overlayMode),
    onclick: () => setOverlayMode(!state.overlayMode, { push: true }),
  }, state.overlayMode ? '關閉疊盤' : '開啟疊盤');

  return el('section', { class: 'overlay-controls', 'aria-label': '疊盤控制' },
    el('div', { class: 'overlay-controls__copy' },
      el('span', { class: 'overlay-controls__title' }, '疊盤'),
      el('span', { class: 'overlay-controls__hint' }, state.overlayMode
        ? '層級列切換主顯示；點宮查看五層詳情'
        : '在同一宮位查看年月日時刻'),
    ),
    toggle,
  );
}
