/** Breadcrumb（規劃書 §3）：任何一層皆可點擊返回。 */

import { LEVELS, LEVEL_LABEL, setLevel, type Level } from '../state/appState';
import type { FullChart } from '../engine/flyingStar';
import { el } from './dom';

export function Breadcrumb(chart: FullChart, current: Level): HTMLElement {
  const titles: Record<Level, string> = {
    year: chart.year.title,
    month: chart.month.title,
    day: chart.day.title,
    hour: chart.hour.title,
    ke: chart.ke.title,
  };
  const wrap = el('nav', { class: 'crumb', 'aria-label': '層級導覽' });
  const currentIdx = LEVELS.indexOf(current);
  LEVELS.forEach((lv, i) => {
    if (i > 0) wrap.append(el('span', { class: 'crumb__sep' }, '›'));
    wrap.append(
      el(
        'button',
        {
          class: `crumb__item${lv === current ? ' is-current' : ''}${i > currentIdx ? ' is-ahead' : ''}`,
          type: 'button',
          'aria-current': lv === current ? 'page' : false,
          onclick: () => setLevel(lv, { push: true }),
        },
        el('span', { class: 'crumb__lv' }, LEVEL_LABEL[lv]),
        el('span', { class: 'crumb__title' }, titles[lv]),
      ),
    );
  });
  return wrap;
}
