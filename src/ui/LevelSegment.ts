/** 年／月／日／時／刻：主畫面唯一的層級控制。 */

import { LEVEL_LABEL, LEVELS, setLevel, type Level } from '../state/appState';
import { el } from './dom';

function tabId(level: Level): string {
  return `level-tab-${level}`;
}

function activateLevel(level: Level): void {
  setLevel(level, { push: true });
  document.getElementById(tabId(level))?.focus();
}

function handleTabKey(event: KeyboardEvent, level: Level): void {
  const index = LEVELS.indexOf(level);
  let target: Level | undefined;
  switch (event.key) {
    case 'ArrowLeft': target = LEVELS[(index - 1 + LEVELS.length) % LEVELS.length]; break;
    case 'ArrowRight': target = LEVELS[(index + 1) % LEVELS.length]; break;
    case 'Home': target = LEVELS[0]; break;
    case 'End': target = LEVELS[LEVELS.length - 1]; break;
    default: return;
  }
  event.preventDefault();
  if (target) activateLevel(target);
}

export function LevelSegment(current: Level): HTMLElement {
  return el(
    'div',
    { class: 'level-segment', role: 'tablist', 'aria-label': '排盤層級' },
    ...LEVELS.map((level) => el('button', {
      class: `level-segment__item${level === current ? ' is-active' : ''}`,
      id: tabId(level),
      type: 'button',
      role: 'tab',
      tabindex: level === current ? '0' : '-1',
      'aria-selected': level === current,
      'aria-controls': 'current-chart',
      onclick: () => activateLevel(level),
      onkeydown: (event) => handleTabKey(event as KeyboardEvent, level),
    }, LEVEL_LABEL[level])),
  );
}
