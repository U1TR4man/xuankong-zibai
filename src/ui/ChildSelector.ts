/**
 * V1 inline selector compatibility wrapper。
 * V2 主畫面不再使用；資料來源已抽到 selectors/childItems.ts 供 Sheet 共用。
 */

import { starName } from '../engine/flyingStar/types';
import { setDateTimeAndLevel, type Level } from '../state/appState';
import { el } from './dom';
import { getChildItems, NEXT_CHILD_LEVEL } from './selectors/childItems';

export function ChildSelector(d: Date, level: Level): HTMLElement | null {
  const next = NEXT_CHILD_LEVEL[level];
  if (!next) return null;
  const items = getChildItems(d, level);
  return el('section', { class: `picker picker--${level}` },
    el('div', { class: 'picker__grid' },
      ...items.map((item) => el('button', {
        class: `pick${item.active ? ' is-active' : ''}`,
        type: 'button', onclick: () => setDateTimeAndLevel(item.target, next),
      },
        el('span', { class: 'pick__main' }, item.main),
        el('span', { class: 'pick__sub' }, item.sub),
        el('span', { class: `pick__star star-${item.star}` }, starName(item.star)),
        item.isNow ? el('span', { class: 'badge badge--now' }, '今') : null,
      )),
    ));
}
