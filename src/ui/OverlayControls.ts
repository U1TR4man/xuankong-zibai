import {
  LEVELS, LEVEL_LABEL, setOverlayMode, setOverlayPrimaryLevel, type AppState,
} from '../state/appState';
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

export function OverlayPrimaryControls(state: AppState): HTMLElement | null {
  if (!state.overlayMode) return null;
  return el('div', {
    class: 'overlay-primary', role: 'group', 'aria-label': '疊盤主顯示層',
  },
  el('span', { class: 'overlay-primary__label' }, '主顯示'),
  ...LEVELS.map((level) => el('button', {
    class: `overlay-primary__item${state.overlayPrimaryLevel === level ? ' is-active' : ''}`,
    type: 'button',
    'data-overlay-primary': level,
    'aria-pressed': String(state.overlayPrimaryLevel === level),
    onclick: () => setOverlayPrimaryLevel(level, { push: true }),
  }, LEVEL_LABEL[level])),
  );
}
