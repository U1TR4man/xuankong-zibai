import { setChartMode, type AppState, type ChartMode } from '../state/appState';
import { el } from './dom';

const MODES: readonly { value: ChartMode; label: string; className: string }[] = [
  { value: 'plain', label: '原盤', className: 'plain-toggle' },
  { value: 'overlay', label: '疊盤', className: 'overlay-toggle' },
  { value: 'selection', label: '擇吉', className: 'selection-toggle' },
];

function currentMode(state: AppState): ChartMode {
  if (state.selectionMode) return 'selection';
  if (state.overlayMode) return 'overlay';
  return 'plain';
}

export function ChartModeControl(state: AppState): HTMLElement {
  const active = currentMode(state);
  return el('div', { class: 'chart-mode', role: 'radiogroup', 'aria-label': '盤面模式' },
    ...MODES.map((mode) => el('button', {
      class: `chart-mode__item ${mode.className}${active === mode.value ? ' is-active' : ''}`,
      type: 'button',
      role: 'radio',
      'aria-checked': String(active === mode.value),
      'data-chart-mode': mode.value,
      onclick: () => setChartMode(mode.value, { push: true }),
    }, mode.label)),
  );
}
