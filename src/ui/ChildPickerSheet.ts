/** 年→月、月→日、日→時的 contextual picker sheet。 */

import { starName } from '../engine/flyingStar/types';
import { setDateTimeAndLevel, type Level } from '../state/appState';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';
import { getChildItems, NEXT_CHILD_LEVEL } from './selectors/childItems';

const COPY: Partial<Record<Level, { title: string; hint: string }>> = {
  year: { title: '選月份', hint: '按節氣分月' },
  month: { title: '選日期', hint: '目前節氣月' },
  day: { title: '選時辰', hint: '每個時辰為兩小時' },
};

export function openChildPickerSheet(
  trigger: HTMLElement,
  datetime: Date,
  level: Level,
): HTMLDialogElement | null {
  const next = NEXT_CHILD_LEVEL[level];
  const copy = COPY[level];
  if (!next || !copy) return null;

  let handle: ReturnType<typeof openBottomSheet>;
  const items = getChildItems(datetime, level);
  const content = el('div', { class: `picker picker--sheet picker--${level}` },
    el('p', { class: 'picker__hint' }, copy.hint),
    el('div', { class: 'picker__grid' },
      ...items.map((item) => el('button', {
        class: `pick${item.active ? ' is-active' : ''}`,
        type: 'button',
        'aria-current': item.active ? 'true' : false,
        'data-autofocus': item.active ? 'true' : undefined,
        onclick: () => {
          handle.close();
          setDateTimeAndLevel(item.target, next);
        },
      },
        el('span', { class: 'pick__main' }, item.main),
        el('span', { class: 'pick__sub' }, item.sub),
        el('span', { class: `pick__star star-${item.star}` }, starName(item.star)),
        item.isNow ? el('span', { class: 'badge badge--now' }, '今') : null,
      )),
    ));

  handle = openBottomSheet({
    title: copy.title, content, trigger,
    className: `sheet-dialog--picker sheet-dialog--${level}`,
    returnFocusSelector: '[data-context-action="true"]',
  });
  return handle.dialog;
}
