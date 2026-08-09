import type { TemporalBranchContext } from '../selection/types';
import { el } from './dom';
import { openTemporalGanzhiSheet } from './TemporalGanzhiSheet';

export function TemporalGanzhiMeta(context: TemporalBranchContext): HTMLButtonElement {
  const { pillars } = context;
  const fullLabel = `${pillars.year.text}年、${pillars.month.text}月、${pillars.day.text}日、${pillars.hour.text}時`;
  const trigger = el('button', {
    class: 'temporal-ganzhi-meta',
    type: 'button',
    'aria-label': `時間干支：${fullLabel}；查看完整四柱`,
  },
  el('span', { class: 'temporal-ganzhi-meta__compact', 'aria-hidden': 'true' },
    `${pillars.day.text}日 · ${pillars.hour.text}時`),
  el('span', { class: 'temporal-ganzhi-meta__wide', 'aria-hidden': 'true' },
    `${pillars.year.text}年 · ${pillars.month.text}月 · ${pillars.day.text}日 · ${pillars.hour.text}時`),
  el('span', { class: 'temporal-ganzhi-meta__arrow', 'aria-hidden': 'true' }, '›'),
  );
  trigger.addEventListener('click', () => openTemporalGanzhiSheet(trigger, pillars));
  return trigger;
}
