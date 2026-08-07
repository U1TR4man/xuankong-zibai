/** 流時的八刻 picker sheet。 */

import { computeKeStar } from '../engine/flyingStar/keStar';
import { getKeStrategy } from '../engine/flyingStar/ke/registry';
import { starName, type StarResult } from '../engine/flyingStar/types';
import { nowUtc8 } from '../engine/time/utc8';
import { getState, setDateTimeAndLevel } from '../state/appState';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

export function openKePickerSheet(
  trigger: HTMLElement,
  hourResult: StarResult,
  datetime: Date,
): HTMLDialogElement {
  const strategy = getKeStrategy(getState().settings.keStrategyId);
  const list = strategy.listKe(datetime);
  const activeIndex = strategy.getKeIndex(datetime);
  const now = nowUtc8();
  let handle: ReturnType<typeof openBottomSheet>;
  const disclaimer = el('p', {
    class: 'ke-picker__disclaimer', hidden: 'hidden',
  }, strategy.disclaimer);
  const info = el('button', {
    class: 'ke-picker__info', type: 'button', 'aria-label': '查看刻盤算法說明',
    'aria-expanded': 'false',
    onclick: (event) => {
      disclaimer.hidden = !disclaimer.hidden;
      (event.currentTarget as HTMLButtonElement)
        .setAttribute('aria-expanded', String(!disclaimer.hidden));
    },
  }, 'ⓘ');

  const content = el('div', { class: 'ke-picker' },
    el('p', { class: 'ke-picker__range' }, hourResult.subtitle ?? ''),
    el('div', { class: 'ke-picker__list' },
      ...list.map((ke, index) => {
        const star = computeKeStar(hourResult, ke.start, strategy).centerStar;
        const isNow = now >= ke.start && now < ke.end;
        return el('button', {
          class: `ke-pick${index === activeIndex ? ' is-active' : ''}`,
          type: 'button',
          'aria-current': index === activeIndex ? 'true' : false,
          'data-autofocus': index === activeIndex ? 'true' : undefined,
          onclick: () => {
            handle.close();
            setDateTimeAndLevel(ke.start, 'ke');
          },
        },
          el('span', { class: 'ke-pick__label' }, ke.label),
          el('span', { class: 'ke-pick__time' }, ke.rangeLabel),
          el('span', { class: 'ke-pick__star' }, starName(star)),
          isNow ? el('span', { class: 'badge badge--now' }, '今') : null,
        );
      }),
    ),
    el('div', { class: 'ke-picker__note' },
      el('span', {}, strategy.name), info),
    disclaimer,
  );

  handle = openBottomSheet({
    title: `${hourResult.title} · 八刻`, content, trigger,
    className: 'sheet-dialog--ke', returnFocusSelector: '[data-context-action="true"]',
  });
  return handle.dialog;
}
