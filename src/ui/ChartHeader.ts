/** 盤面資訊 hierarchy：層級 → 主名稱 → 時間範圍 → 入中結果。 */

import { DIRECTION_LABEL, starName, type StarResult } from '../engine/flyingStar/types';
import type { Level } from '../state/appState';
import { el } from './dom';

const CHART_LABEL: Record<Level, string> = {
  year: '流年', month: '流月', day: '流日', hour: '流時', ke: '流刻',
};

export function ChartHeader(result: StarResult, level: Level): HTMLElement {
  return el('div', { class: 'card__head' },
    el('div', { class: 'card__eyebrow' }, CHART_LABEL[level]),
    el('h1', { class: 'card__title' }, result.title),
    el('p', { class: 'card__sub' },
      result.subtitle ? el('span', { class: 'card__range' }, result.subtitle) : null,
      el('span', { class: 'card__result' },
        `${starName(result.centerStar)}入中 · ${DIRECTION_LABEL[result.direction]}`)),
  );
}
