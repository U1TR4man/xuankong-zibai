/**
 * 下鑽選擇器（規劃書 §1）：年→月→日→時→刻，每層可點擊進入下一層。
 * 各項目直接顯示該子層的入中星，方便掃視。
 */

import { computeDayStar } from '../engine/flyingStar/dayStar';
import { computeHourStar } from '../engine/flyingStar/hourStar';
import { computeMonthStar } from '../engine/flyingStar/monthStar';
import { starName } from '../engine/flyingStar/types';
import { getSolarMonthByJieqi, getSolarTerms } from '../engine/time/solarTerms';
import { getGanzhiDay } from '../engine/time/ganzhiDay';
import { getChineseHour } from '../engine/time/chineseHour';
import { BRANCHES } from '../engine/time/ganzhi';
import { fromUtc8, formatUtc8Date, formatUtc8Time, nowUtc8, toUtc8Parts, MS_PER_DAY } from '../engine/time/utc8';
import { getState, setDateTimeAndLevel, type Level } from '../state/appState';
import { el } from './dom';

interface Item {
  key: string;
  main: string;
  sub: string;
  star: number;
  target: Date;
  active: boolean;
  isNow: boolean;
}

const JIE_NAMES = ['立春', '驚蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'] as const;

function monthItems(d: Date): Item[] {
  const s = getState().settings;
  const now = nowUtc8();
  const year = toUtc8Parts(d).year;
  const cur = getSolarMonthByJieqi(d);
  const terms = [...getSolarTerms(year - 1), ...getSolarTerms(year), ...getSolarTerms(year + 1)];
  // 取當前干支年（立春起）之後的 12 個節
  const lichun = terms.filter((t) => t.name === '立春' && t.date <= (cur.branchIndex >= 2 ? d : new Date(d.getTime() + 366 * MS_PER_DAY))).pop()!;
  const startIdx = terms.indexOf(lichun);
  const jie = terms.slice(startIdx).filter((t) => (JIE_NAMES as readonly string[]).includes(t.name)).slice(0, 12);
  return jie.map((t) => {
    const target = new Date(t.date.getTime() + 60_000);
    const sm = getSolarMonthByJieqi(target);
    return {
      key: t.name + t.date.getTime(),
      main: `${BRANCHES[sm.branchIndex]}月`,
      sub: `${t.name} ${formatUtc8Date(t.date).slice(5)}`,
      star: computeMonthStar(target, s.yearBoundary).centerStar,
      target,
      active: sm.branchIndex === cur.branchIndex,
      isNow: now >= sm.start && now < sm.end,
    };
  });
}

function dayItems(d: Date): Item[] {
  const s = getState().settings;
  const now = nowUtc8();
  const sm = getSolarMonthByJieqi(d);
  const curDay = formatUtc8Date(d);
  const out: Item[] = [];
  const first = toUtc8Parts(sm.start);
  let cursor = fromUtc8(first.year, first.month, first.day, 12, 0);
  while (cursor.getTime() < sm.end.getTime()) {
    const gz = getGanzhiDay(cursor, s.dayChangeMode);
    out.push({
      key: formatUtc8Date(cursor),
      main: gz.text,
      sub: formatUtc8Date(cursor).slice(5),
      star: computeDayStar(cursor, s.dayChangeMode).centerStar,
      target: new Date(cursor),
      active: formatUtc8Date(cursor) === curDay,
      isNow: formatUtc8Date(cursor) === formatUtc8Date(now),
    });
    cursor = new Date(cursor.getTime() + MS_PER_DAY);
  }
  return out;
}

function hourItems(d: Date): Item[] {
  const s = getState().settings;
  const now = nowUtc8();
  const cur = getChineseHour(d);
  const p = toUtc8Parts(d);
  return Array.from({ length: 12 }, (_, i) => {
    const startClock = (i * 2 + 23) % 24;
    const target = fromUtc8(p.year, p.month, p.day + (i === 0 ? -1 : 0), startClock, 30, 0);
    const ch = getChineseHour(target);
    return {
      key: ch.name,
      main: ch.name,
      sub: ch.rangeLabel,
      star: computeHourStar(target, s.dayChangeMode).centerStar,
      target,
      active: ch.branchIndex === cur.branchIndex,
      isNow: now >= ch.start && now < ch.end,
    };
  });
}

const TITLES: Partial<Record<Level, string>> = {
  year: '選擇月份（節氣月）',
  month: '選擇日期',
  day: '選擇時辰',
};

const NEXT_LEVEL: Partial<Record<Level, Level>> = { year: 'month', month: 'day', day: 'hour' };

export function ChildSelector(d: Date, level: Level): HTMLElement | null {
  const next = NEXT_LEVEL[level];
  if (!next) return null;
  const items = level === 'year' ? monthItems(d) : level === 'month' ? dayItems(d) : hourItems(d);
  return el(
    'section',
    { class: `picker picker--${level}` },
    el('h2', { class: 'picker__title' }, TITLES[level] ?? ''),
    el('div', { class: 'picker__grid' },
      ...items.map((it) =>
        el('button', {
          class: `pick${it.active ? ' is-active' : ''}`,
          type: 'button',
          onclick: () => setDateTimeAndLevel(it.target, next),
        },
          el('span', { class: 'pick__main' }, it.main),
          el('span', { class: 'pick__sub' }, it.sub),
          el('span', { class: `pick__star star-${it.star}` }, starName(it.star)),
          it.isNow ? el('span', { class: 'badge badge--now' }, '今') : null,
        ),
      ),
    ),
  );
}

export function formatClock(d: Date): string {
  return formatUtc8Time(d);
}
