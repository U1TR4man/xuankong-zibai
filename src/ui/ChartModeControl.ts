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
  const activate = (mode: ChartMode, focus = false) => {
    setChartMode(mode, { push: true });
    if (focus) queueMicrotask(() => document.getElementById(`chart-mode-${mode}`)?.focus());
  };
  return el('div', { class: 'chart-mode', role: 'tablist', 'aria-label': '盤面模式' },
    ...MODES.map((mode, index) => el('button', {
      id: `chart-mode-${mode.value}`,
      class: `chart-mode__item ${mode.className}${active === mode.value ? ' is-active' : ''}`,
      type: 'button',
      role: 'tab',
      tabindex: active === mode.value ? '0' : '-1',
      'aria-selected': String(active === mode.value),
      'aria-controls': 'chart-mode-panel',
      'data-chart-mode': mode.value,
      onclick: () => activate(mode.value),
      onkeydown: (rawEvent: Event) => {
        const event = rawEvent as KeyboardEvent;
        let nextIndex: number | undefined;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + MODES.length) % MODES.length;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % MODES.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = MODES.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        activate(MODES[nextIndex]!.value, true);
      },
    }, mode.label)),
  );
}
