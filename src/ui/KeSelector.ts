/**
 * 八刻選擇（規劃書 §21–23）。
 * 手機版採底部滑出，選擇後主九宮盤直接更新，不必進新頁。
 * 盤面必須顯示所用刻盤算法與免責說明（§20）。
 */

import { getKeStrategy } from '../engine/flyingStar/ke/registry';
import { computeKeStar } from '../engine/flyingStar/keStar';
import { starName } from '../engine/flyingStar/types';
import type { StarResult } from '../engine/flyingStar/types';
import { nowUtc8 } from '../engine/time/utc8';
import { setDateTimeAndLevel, getState } from '../state/appState';
import { el } from './dom';

export function KeSelector(hourResult: StarResult, datetime: Date): HTMLElement {
  const s = getState().settings;
  const strat = getKeStrategy(s.keStrategyId);
  const list = strat.listKe(datetime);
  const activeIdx = strat.getKeIndex(datetime);
  const now = nowUtc8();

  const items = list.map((k, i) => {
    const star = computeKeStar(hourResult, k.start, strat).centerStar;
    const isNow = now >= k.start && now < k.end;
    return el(
      'button',
      {
        class: `ke__item${i === activeIdx ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => setDateTimeAndLevel(k.start, 'ke'),
      },
      el('span', { class: 'ke__ord' }, ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][i] ?? String(i + 1)),
      el('span', { class: 'ke__time' }, k.rangeLabel),
      el('span', { class: `ke__star star-${star}` }, starName(star)),
      isNow ? el('span', { class: 'badge badge--now' }, '今') : null,
    );
  });

  return el(
    'section',
    { class: 'ke' },
    el('h2', { class: 'ke__title' }, `${hourResult.title} · ${strat.keCount}刻`),
    el('div', { class: 'ke__list' }, ...items),
    el(
      'p',
      { class: 'ke__note' },
      el('strong', {}, `刻盤算法：${strat.name}`),
      el('span', {}, strat.disclaimer),
    ),
  );
}
