/**
 * 上一個／目前／下一個（規劃書 §24）。
 * 手勢在 app.ts 另外綁定，但按鈕永遠存在，不可只依賴 gesture。
 */

import { getSolarMonthByJieqi, getSolarTerms } from '../engine/time/solarTerms';
import { getChineseHour, shiftChineseHour } from '../engine/time/chineseHour';
import { getKeStrategy } from '../engine/flyingStar/ke/registry';
import { getGanzhiDay } from '../engine/time/ganzhiDay';
import { fromUtc8, toUtc8Parts, MS_PER_DAY } from '../engine/time/utc8';
import { getState, setDateTime, type Level } from '../state/appState';
import { el } from './dom';

/** 依層級平移時間點。 */
export function shiftByLevel(d: Date, level: Level, delta: number): Date {
  const s = getState().settings;
  switch (level) {
    case 'year': {
      const p = toUtc8Parts(d);
      return fromUtc8(p.year + delta, p.month, p.day, p.hour, p.minute, p.second);
    }
    case 'month': {
      // 以節氣月為單位：跳到下/上一個節氣月的相同相對位置
      const m = getSolarMonthByJieqi(d);
      const offset = d.getTime() - m.start.getTime();
      let cursor = delta > 0 ? new Date(m.end.getTime() + 1000) : new Date(m.start.getTime() - 1000);
      for (let i = 1; i < Math.abs(delta); i++) {
        const mm = getSolarMonthByJieqi(cursor);
        cursor = delta > 0 ? new Date(mm.end.getTime() + 1000) : new Date(mm.start.getTime() - 1000);
      }
      const target = getSolarMonthByJieqi(cursor);
      return new Date(Math.min(target.start.getTime() + offset, target.end.getTime() - 1000));
    }
    case 'day':
      return new Date(d.getTime() + delta * MS_PER_DAY);
    case 'hour':
      return shiftChineseHour(d, delta);
    case 'ke': {
      const strat = getKeStrategy(s.keStrategyId);
      const list = strat.listKe(d);
      const idx = strat.getKeIndex(d);
      const next = idx + delta;
      if (next >= 0 && next < list.length) return list[next]!.start;
      const nb = shiftChineseHour(list[0]!.start, next < 0 ? -1 : 1);
      const nl = strat.listKe(nb);
      return (next < 0 ? nl[nl.length - 1]! : nl[0]!).start;
    }
  }
}

function labelFor(d: Date, level: Level): string {
  const s = getState().settings;
  switch (level) {
    case 'year': return `${toUtc8Parts(d).year}年`;
    case 'month': return `${'子丑寅卯辰巳午未申酉戌亥'[getSolarMonthByJieqi(d).branchIndex]}月`;
    case 'day': return `${getGanzhiDay(d, s.dayChangeMode).text}日`;
    case 'hour': return getChineseHour(d).name;
    case 'ke': return getKeStrategy(s.keStrategyId).listKe(d)[getKeStrategy(s.keStrategyId).getKeIndex(d)]!.label;
  }
}

export function TimeNavigator(d: Date, level: Level): HTMLElement {
  const prev = shiftByLevel(d, level, -1);
  const next = shiftByLevel(d, level, 1);
  return el(
    'div',
    { class: 'nav' },
    el('button', { class: 'nav__btn', type: 'button', onclick: () => setDateTime(prev) },
      '← ', labelFor(prev, level)),
    el('div', { class: 'nav__cur' }, labelFor(d, level)),
    el('button', { class: 'nav__btn', type: 'button', onclick: () => setDateTime(next) },
      labelFor(next, level), ' →'),
  );
}

/** 供 §31 節氣資料離線檢查使用（確保表已載入）。 */
export function warmSolarTermCache(d: Date): void {
  getSolarTerms(toUtc8Parts(d).year);
}
