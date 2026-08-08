import { setOverlayMode, type AppState } from '../state/appState';
import { el } from './dom';

export function OverlayToggle(state: AppState): HTMLElement {
  return el('div', { class: 'overlay-toggle-control' },
    el('span', { class: 'overlay-toggle-control__label', 'aria-hidden': 'true' }, '疊盤'),
    el('button', {
    class: `overlay-toggle${state.overlayMode ? ' is-active' : ''}`,
    type: 'button',
    role: 'switch',
    'aria-checked': String(state.overlayMode),
    'aria-label': state.overlayMode ? '關閉疊盤' : '開啟疊盤',
    onclick: () => setOverlayMode(!state.overlayMode, { push: true }),
  }, el('span', { class: 'overlay-toggle__thumb', 'aria-hidden': 'true' })),
  );
}
