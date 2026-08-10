import type { TemporalPillars } from '../selection/temporalPillars';
import type { Settings } from '../state/settings';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

const PILLAR_ROWS = [
  ['year', '年柱'], ['month', '月柱'], ['day', '日柱'], ['hour', '時柱'],
] as const;

export function openTemporalGanzhiSheet(
  trigger: HTMLElement,
  pillars: TemporalPillars,
  settings: Pick<Settings, 'yearBoundary' | 'dayChangeMode'>,
): void {
  const rows = el('dl', { class: 'temporal-pillars' },
    ...PILLAR_ROWS.flatMap(([level, label]) => [
      el('dt', {}, label),
      el('dd', {}, pillars[level].text),
    ]),
  );
  const boundaries = el('section', {
    class: 'temporal-boundaries', 'aria-labelledby': 'temporal-boundaries-title',
  },
    el('h3', { id: 'temporal-boundaries-title' }, '計算設定'),
    el('dl', {},
      el('dt', {}, '年界'),
      el('dd', {}, settings.yearBoundary === 'lichun' ? '立春' : '公曆元旦'),
      el('dt', {}, '月柱'),
      el('dd', {}, '節氣月'),
      el('dt', {}, '換日'),
      el('dd', {}, settings.dayChangeMode === 'zishi2300' ? '子初 23:00' : '午夜 00:00'),
      el('dt', {}, '時辰'),
      el('dd', {}, '中國時辰'),
    ),
  );
  openBottomSheet({
    title: '時間干支',
    trigger,
    className: 'sheet-dialog--temporal-pillars',
    content: el('div', { class: 'temporal-pillars-sheet' },
      rows,
      boundaries,
    ),
  });
}
