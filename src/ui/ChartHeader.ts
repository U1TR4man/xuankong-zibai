/** 盤面資訊 hierarchy：層級 → 主名稱 → 時間範圍 → 入中結果。 */

import { DIRECTION_LABEL, starName, type StarResult } from '../engine/flyingStar/types';
import type { TemporalBranchContext } from '../selection/types';
import type { AppState, Level } from '../state/appState';
import { ChartModeControl } from './ChartModeControl';
import { el } from './dom';
import { TemporalGanzhiMeta } from './TemporalGanzhiMeta';

const CHART_LABEL: Record<Level, string> = {
  year: '流年', month: '流月', day: '流日', hour: '流時', ke: '流刻',
};

export function ChartHeader(
  result: StarResult,
  level: Level,
  state: AppState,
  temporalContext?: TemporalBranchContext,
): HTMLElement {
  return el('div', { class: 'card__head' },
    el('div', { class: 'card__eyebrow' }, CHART_LABEL[level]),
    el('div', { class: 'card__main-row' },
      el('div', { class: 'card__title-line' },
        el('h1', { class: 'card__title' }, result.title),
        result.subtitle ? el('span', { class: 'card__range' }, result.subtitle) : null,
      ),
    ),
    el('p', { class: 'card__sub' },
      el('span', { class: 'card__result' },
        `${starName(result.centerStar)}入中 · ${DIRECTION_LABEL[result.direction]}`)),
    ChartModeControl(state),
    state.selectionMode && temporalContext
      ? TemporalGanzhiMeta(temporalContext, state.settings) : null,
  );
}
