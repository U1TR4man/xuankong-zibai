import { starName, type StarLevel } from '../engine/flyingStar/types';
import type { PalaceOverlayViewModel } from '../overlay/types';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

const LEVEL_LABEL: Record<StarLevel, string> = {
  year: '流年', month: '流月', day: '流日', hour: '流時', ke: '流刻',
};

const LEVELS: readonly StarLevel[] = ['year', 'month', 'day', 'hour', 'ke'];

export function openPalaceOverlaySheet(
  trigger: HTMLElement,
  palace: PalaceOverlayViewModel,
  primaryLevel: StarLevel,
): void {
  const rows = el('dl', { class: 'palace-detail__layers' });
  for (const level of LEVELS) {
    const star = palace.stars[level];
    rows.append(
      el('div', {
        class: `palace-detail__row${level === primaryLevel ? ' is-primary' : ''}`,
        'data-layer': level,
      },
      el('dt', {}, LEVEL_LABEL[level]),
      el('dd', {}, `${starName(star)} · ${star}`),
      level === primaryLevel ? el('span', { class: 'palace-detail__primary' }, '主顯示') : null),
    );
  }

  const summary = el('section', { class: 'palace-summary', 'aria-labelledby': 'palace-summary-title' },
    el('h3', { class: 'palace-summary__title', id: 'palace-summary-title' }, '組合摘要'),
    el('div', { class: 'palace-summary__items' },
      el('span', {}, `日時 ${palace.stars.day}${palace.stars.hour}`),
      el('span', {}, `時刻 ${palace.stars.hour}${palace.stars.ke}`),
    ),
    el('p', { class: 'palace-summary__note' }, '只列出飛星組合，不作吉凶或最佳時窗判定。'),
  );

  openBottomSheet({
    title: palace.key === 'center' ? '中宮' : `${palace.name} · ${palace.bearing}`,
    content: el('div', { class: 'palace-detail' }, rows, summary),
    trigger,
    className: 'sheet-dialog--palace',
    returnFocusSelector: `[data-palace="${palace.key}"]`,
  });
}
