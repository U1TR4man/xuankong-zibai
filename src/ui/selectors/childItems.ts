/** 子層選項資料；計算與 Sheet markup 分離，app.ts 不承擔 selector 邏輯。 */

import { computeDayStar } from '../../engine/flyingStar/dayStar';
import { computeHourStar } from '../../engine/flyingStar/hourStar';
import { computeMonthStar } from '../../engine/flyingStar/monthStar';
import { getChineseHour } from '../../engine/time/chineseHour';
import { BRANCHES } from '../../engine/time/ganzhi';
import { getGanzhiDay } from '../../engine/time/ganzhiDay';
import { getSolarMonthByJieqi, getSolarTerms } from '../../engine/time/solarTerms';
import {
  formatUtc8Date, fromUtc8, MS_PER_DAY, nowUtc8, toUtc8Parts,
} from '../../engine/time/utc8';
import { getState, type Level } from '../../state/appState';

export interface ChildItem {
  key: string;
  main: string;
  sub: string;
  star: number;
  target: Date;
  active: boolean;
  isNow: boolean;
}

const JIE_NAMES = ['立春', '驚蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'] as const;

function monthItems(d: Date): ChildItem[] {
  const settings = getState().settings;
  const now = nowUtc8();
  const year = toUtc8Parts(d).year;
  const current = getSolarMonthByJieqi(d);
  const terms = [...getSolarTerms(year - 1), ...getSolarTerms(year), ...getSolarTerms(year + 1)];
  const lichun = terms
    .filter((term) => term.name === '立春'
      && term.date <= (current.branchIndex >= 2 ? d : new Date(d.getTime() + 366 * MS_PER_DAY)))
    .pop()!;
  const jie = terms.slice(terms.indexOf(lichun))
    .filter((term) => (JIE_NAMES as readonly string[]).includes(term.name))
    .slice(0, 12);

  return jie.map((term) => {
    const target = new Date(term.date.getTime() + 60_000);
    const month = getSolarMonthByJieqi(target);
    return {
      key: term.name + term.date.getTime(),
      main: `${BRANCHES[month.branchIndex]}月`,
      sub: `${term.name} ${formatUtc8Date(term.date).slice(5)}`,
      star: computeMonthStar(target, settings.yearBoundary).centerStar,
      target,
      active: month.branchIndex === current.branchIndex,
      isNow: now >= month.start && now < month.end,
    };
  });
}

function dayItems(d: Date): ChildItem[] {
  const settings = getState().settings;
  const now = nowUtc8();
  const month = getSolarMonthByJieqi(d);
  const currentDay = formatUtc8Date(d);
  const first = toUtc8Parts(month.start);
  const items: ChildItem[] = [];
  let cursor = fromUtc8(first.year, first.month, first.day, 12, 0);

  while (cursor.getTime() < month.end.getTime()) {
    const ganzhi = getGanzhiDay(cursor, settings.dayChangeMode);
    items.push({
      key: formatUtc8Date(cursor),
      main: ganzhi.text,
      sub: formatUtc8Date(cursor).slice(5),
      star: computeDayStar(cursor, settings.dayChangeMode).centerStar,
      target: new Date(cursor),
      active: formatUtc8Date(cursor) === currentDay,
      isNow: formatUtc8Date(cursor) === formatUtc8Date(now),
    });
    cursor = new Date(cursor.getTime() + MS_PER_DAY);
  }
  return items;
}

function hourItems(d: Date): ChildItem[] {
  const settings = getState().settings;
  const now = nowUtc8();
  const current = getChineseHour(d);
  const parts = toUtc8Parts(d);

  return Array.from({ length: 12 }, (_, index) => {
    const startClock = (index * 2 + 23) % 24;
    const target = fromUtc8(parts.year, parts.month, parts.day + (index === 0 ? -1 : 0), startClock, 30, 0);
    const hour = getChineseHour(target);
    return {
      key: hour.name,
      main: hour.name,
      sub: hour.rangeLabel,
      star: computeHourStar(target, settings.dayChangeMode).centerStar,
      target,
      active: hour.branchIndex === current.branchIndex,
      isNow: now >= hour.start && now < hour.end,
    };
  });
}

export function getChildItems(d: Date, level: Level): ChildItem[] {
  if (level === 'year') return monthItems(d);
  if (level === 'month') return dayItems(d);
  if (level === 'day') return hourItems(d);
  return [];
}

export const NEXT_CHILD_LEVEL: Partial<Record<Level, Level>> = {
  year: 'month', month: 'day', day: 'hour',
};
