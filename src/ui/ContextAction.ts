/** 每個層級只保留一個下鑽 action。 */

import type { FullChart } from '../engine/flyingStar';
import { setLevel, type AppState } from '../state/appState';
import { openChildPickerSheet } from './ChildPickerSheet';
import { el } from './dom';
import { openKePickerSheet } from './KePickerSheet';

const LABEL = {
  year: '查看十二月',
  month: '查看本月各日',
  day: '查看十二時辰',
} as const;

function actionContent(label: string, detail?: string, arrow = '›'): Node[] {
  return [
    el('span', { class: 'context-action__copy' },
      el('span', { class: 'context-action__label' }, label),
      detail ? el('span', { class: 'context-action__detail' }, detail) : null),
    el('span', { class: 'context-action__arrow', 'aria-hidden': 'true' }, arrow),
  ];
}

export function ContextAction(state: AppState, chart: FullChart): HTMLElement {
  if (state.level === 'ke') {
    return el('button', {
      class: 'context-action context-action--secondary', type: 'button',
      'data-context-action': 'true',
      onclick: () => setLevel('hour', { push: true }),
    }, ...actionContent('返回時盤', undefined, '‹'));
  }

  if (state.level === 'hour') {
    return el('button', {
      class: 'context-action', type: 'button', 'data-context-action': 'true',
      onclick: (event) => openKePickerSheet(
        event.currentTarget as HTMLElement, chart.hour, state.selectedDateTime),
    }, ...actionContent('查看八刻', '8 × 15 分鐘'));
  }

  return el('button', {
    class: 'context-action', type: 'button', 'data-context-action': 'true',
    onclick: (event) => openChildPickerSheet(
      event.currentTarget as HTMLElement, state.selectedDateTime, state.level),
  }, ...actionContent(LABEL[state.level]));
}
