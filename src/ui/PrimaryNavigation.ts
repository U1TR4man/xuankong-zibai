import { setView, type AppState, type AppView } from '../state/appState';
import { el } from './dom';

const ITEMS: readonly { view: AppView; label: string }[] = [
  { view: 'chart', label: '排盤' },
  { view: 'search', label: '尋星' },
];

export function PrimaryNavigation(state: AppState): HTMLElement {
  return el('nav', { class: 'workspace-nav', 'aria-label': '主要功能' },
    ...ITEMS.map((item) => el('button', {
      class: `workspace-nav__item${state.view === item.view ? ' is-active' : ''}`,
      type: 'button',
      'aria-current': state.view === item.view ? 'page' : undefined,
      onclick: () => setView(item.view, { push: true }),
    }, item.label)),
  );
}
