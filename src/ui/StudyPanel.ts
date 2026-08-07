/** 研習模式才顯示的詳細時間資料，預設收合。 */

import type { FullChart } from '../engine/flyingStar';
import { el } from './dom';
import { getDetailRows } from './DetailPanel';

export function StudyPanel(chart: FullChart): HTMLElement {
  const rows = getDetailRows(chart);
  return el('details', { class: 'panel study-panel' },
    el('summary', { class: 'panel__sum' }, '研習資料'),
    el('dl', { class: 'kv' },
      ...rows.flatMap(([key, value]) => [el('dt', {}, key), el('dd', {}, value)])),
  );
}
