import type { TemporalPillars } from '../selection/temporalPillars';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

const PILLAR_ROWS = [
  ['year', '年柱'], ['month', '月柱'], ['day', '日柱'], ['hour', '時柱'],
] as const;

export function openTemporalGanzhiSheet(
  trigger: HTMLElement,
  pillars: TemporalPillars,
): void {
  const rows = el('dl', { class: 'temporal-pillars' },
    ...PILLAR_ROWS.flatMap(([level, label]) => [
      el('dt', {}, label),
      el('dd', {}, pillars[level].text),
    ]),
  );
  openBottomSheet({
    title: '時間干支',
    trigger,
    className: 'sheet-dialog--temporal-pillars',
    content: el('div', { class: 'temporal-pillars-sheet' },
      rows,
      el('p', { class: 'temporal-pillars__note' },
        '年柱跟隨目前年界設定；月柱按節氣月，日柱跟隨換日設定，時柱按中國時辰。'),
    ),
  });
}
