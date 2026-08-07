/** V2 極簡頂欄。設定與說明在 Phase 3/5 會改成真正的 Sheet。 */

import { goHome, LEVEL_LABEL, type AppState } from '../state/appState';
import { el } from './dom';
import { openSettingsSheet } from './SettingsSheet';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgIcon(kind: 'info' | 'settings'): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [name, value] of Object.entries({
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': 'true', focusable: 'false',
  })) svg.setAttribute(name, value);

  const add = (tag: 'circle' | 'path', attrs: Record<string, string>) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    svg.append(node);
  };

  if (kind === 'info') {
    add('circle', { cx: '12', cy: '12', r: '9' });
    add('path', { d: 'M12 11v6M12 7.5h.01' });
  } else {
    add('path', { d: 'M4 7h5m6 0h5M4 17h10m6 0h0' });
    add('circle', { cx: '12', cy: '7', r: '2.5' });
    add('circle', { cx: '17', cy: '17', r: '2.5' });
  }
  return svg;
}

function openCurrentExplanation(): void {
  document.querySelector<HTMLButtonElement>('.explain-trigger')?.click();
}

export function TopBar(state: AppState): HTMLElement {
  return el(
    'header',
    { class: 'topbar', 'aria-label': state.view === 'search'
      ? '玄空紫白・尋星'
      : `玄空紫白・目前為流${LEVEL_LABEL[state.level]}盤` },
    el('button', { class: 'topbar__brand', type: 'button', onclick: goHome }, '玄空紫白'),
    el('div', { class: 'topbar__actions' },
      state.view === 'chart' ? el('button', {
        class: 'topbar__icon', type: 'button', 'aria-label': '查看排盤說明',
        onclick: openCurrentExplanation,
      }, svgIcon('info')) : null,
      el('button', {
        class: 'topbar__icon', type: 'button', 'aria-label': '開啟設定',
        'data-sheet-trigger': 'settings',
        onclick: (event) => openSettingsSheet(event.currentTarget as HTMLElement),
      }, svgIcon('settings')),
    ),
  );
}
