/** 首頁（規劃書 §4）。預設時間一律取 nowUtc8()，不使用裝置時區。 */

import { formatUtc8Date, formatUtc8Time, nowUtc8, parseUtc8 } from '../engine/time/utc8';
import { LEVELS, LEVEL_LABEL, setDateTimeAndLevel, type Level } from '../state/appState';
import { el } from './dom';

export function Home(selected: Date): HTMLElement {
  const dateInput = el('input', {
    type: 'date', class: 'field', value: formatUtc8Date(selected), 'aria-label': '日期',
  });
  const timeInput = el('input', {
    type: 'time', class: 'field', value: formatUtc8Time(selected), 'aria-label': '時間',
  });

  const read = (): Date =>
    parseUtc8(`${dateInput.value}T${timeInput.value || '00:00'}`) ?? nowUtc8();

  const go = (level: Level) => setDateTimeAndLevel(read(), level);

  const now = nowUtc8();

  return el(
    'section',
    { class: 'home' },
    el('h1', { class: 'home__title' }, '玄空紫白'),
    el('p', { class: 'home__now' },
      el('span', { class: 'home__date' }, formatUtc8Date(now).replace('-', '年').replace('-', '月') + '日'),
      el('span', { class: 'home__clock' }, formatUtc8Time(now)),
      el('span', { class: 'home__tz' }, 'UTC+8'),
    ),
    el('div', { class: 'home__fields' }, dateInput, timeInput),
    el('button', { class: 'btn btn--primary', type: 'button', onclick: () => go('year') }, '立即排盤'),
    el('div', { class: 'home__levels' },
      ...LEVELS.map((lv) =>
        el('button', { class: 'btn btn--ghost', type: 'button', onclick: () => go(lv) }, LEVEL_LABEL[lv]),
      ),
    ),
    el('button', {
      class: 'btn btn--link', type: 'button',
      onclick: () => { const n = nowUtc8(); dateInput.value = formatUtc8Date(n); timeInput.value = formatUtc8Time(n); },
    }, '回到現在'),
    el('p', { class: 'home__note' },
      '節氣採定氣法，1900–2100 使用預先產生的精確表（與寿星天文历比對最大差 28 秒）；'
      + '表外年份自動改用截斷 VSOP87 演算法。所有計算離線完成。'),
  );
}
