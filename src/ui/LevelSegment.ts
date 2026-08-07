/** 年／月／日／時／刻：主畫面唯一的層級控制。 */

import { LEVEL_LABEL, LEVELS, setLevel, type Level } from '../state/appState';
import { el } from './dom';

export function LevelSegment(current: Level): HTMLElement {
  return el(
    'div',
    { class: 'level-segment', role: 'tablist', 'aria-label': '排盤層級' },
    ...LEVELS.map((level) => el('button', {
      class: `level-segment__item${level === current ? ' is-active' : ''}`,
      type: 'button',
      role: 'tab',
      'aria-selected': level === current,
      'aria-controls': 'current-chart',
      onclick: () => setLevel(level, { push: true }),
    }, LEVEL_LABEL[level])),
  );
}
