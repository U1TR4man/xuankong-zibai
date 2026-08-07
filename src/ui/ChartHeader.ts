/** 盤面資訊 hierarchy：層級 → 主名稱 → 時間範圍 → 入中結果。 */

import { DIRECTION_LABEL, starName, type StarResult } from '../engine/flyingStar/types';
import type { Level } from '../state/appState';
import { el } from './dom';

const CHART_LABEL: Record<Level, string> = {
  year: '流年盤', month: '流月盤', day: '流日盤', hour: '流時盤', ke: '流刻盤',
};

export function ChartHeader(result: StarResult, level: Level, isNow: boolean): HTMLElement {
  return el('div', { class: 'card__head' },
    el('div', { class: 'card__eyebrow' },
      el('span', {}, CHART_LABEL[level]),
      isNow ? el('span', { class: 'badge badge--now' }, '今') : null),
    el('h1', { class: 'card__title' }, result.title),
    el('p', { class: 'card__sub' },
      result.subtitle ? el('span', { class: 'card__range' }, result.subtitle) : null,
      el('span', { class: 'card__result' },
        `${starName(result.centerStar)}入中 · ${DIRECTION_LABEL[result.direction]}`)),
  );
}
