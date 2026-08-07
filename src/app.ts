/**
 * 應用進入點。
 *
 * 架構原則（規劃書 §40）：
 *   時間資料 → 規則 Engine → StarResult → 九宮 Rendering
 * 本檔只做狀態→畫面的組裝，不含任何玄學算法。
 */

import './styles.css';

import { computeFullChart, type FullChart } from './engine/flyingStar';
import { DIRECTION_LABEL, starName, type StarResult } from './engine/flyingStar/types';
import { getChineseHour } from './engine/time/chineseHour';
import { getKeStrategy } from './engine/flyingStar/ke/registry';
import { getSolarMonthByJieqi } from './engine/time/solarTerms';
import { formatUtc8, formatUtc8Date, nowUtc8, toUtc8Parts } from './engine/time/utc8';
import {
  getState, goHome, restoreFromUrl, setDateTime, setLevel, subscribe,
  LEVEL_LABEL, LEVELS, type AppState, type Level,
} from './state/appState';
import { Breadcrumb } from './ui/Breadcrumb';
import { ChildSelector } from './ui/ChildSelector';
import { DetailPanel } from './ui/DetailPanel';
import { ExplainPanel } from './ui/ExplainPanel';
import { Home } from './ui/Home';
import { KeSelector } from './ui/KeSelector';
import { NinePalaceGrid } from './ui/NinePalaceGrid';
import { SettingsSheet } from './ui/SettingsSheet';
import { TimeNavigator, shiftByLevel } from './ui/TimeNavigator';
import { el, clear } from './ui/dom';
import { registerServiceWorker } from './pwa/registerSW';

const root = document.getElementById('app')!;

function resultFor(chart: FullChart, level: Level): StarResult {
  return level === 'ke' ? chart.ke : chart[level];
}

/** 目前盤是否即為 UTC+8 此刻所在的盤（規劃書 §25）。 */
function isNow(d: Date, level: Level): boolean {
  const n = nowUtc8();
  switch (level) {
    case 'year': return toUtc8Parts(n).year === toUtc8Parts(d).year;
    case 'month': return getSolarMonthByJieqi(n).start.getTime() === getSolarMonthByJieqi(d).start.getTime();
    case 'day': return formatUtc8Date(n) === formatUtc8Date(d);
    case 'hour': return getChineseHour(n).start.getTime() === getChineseHour(d).start.getTime();
    case 'ke': {
      const s = getKeStrategy(getState().settings.keStrategyId);
      return getChineseHour(n).start.getTime() === getChineseHour(d).start.getTime()
        && s.getKeIndex(n) === s.getKeIndex(d);
    }
  }
}

function Header(state: AppState): HTMLElement {
  return el('header', { class: 'top' },
    el('button', { class: 'top__brand', type: 'button', onclick: goHome }, '玄空紫白'),
    el('div', { class: 'top__actions' },
      el('button', { class: 'btn btn--sm', type: 'button', onclick: () => setDateTime(nowUtc8()) }, '回到現在'),
      el('span', { class: 'top__stamp' }, formatUtc8(state.selectedDateTime)),
    ),
  );
}

function LevelTabs(current: Level): HTMLElement {
  return el('div', { class: 'tabs', role: 'tablist' },
    ...LEVELS.map((lv) =>
      el('button', {
        class: `tab${lv === current ? ' is-active' : ''}`,
        type: 'button', role: 'tab', 'aria-selected': lv === current,
        onclick: () => setLevel(lv, { push: true }),
      }, LEVEL_LABEL[lv]),
    ),
  );
}

function ChartCard(result: StarResult, now: boolean, state: AppState): HTMLElement {
  return el('section', { class: 'card' },
    el('div', { class: 'card__head' },
      el('h1', { class: 'card__title' },
        result.title,
        now ? el('span', { class: 'badge badge--now' }, '今') : null),
      el('p', { class: 'card__sub' },
        `${starName(result.centerStar)}入中 · ${DIRECTION_LABEL[result.direction]}`,
        result.subtitle ? el('span', { class: 'card__range' }, result.subtitle) : null),
    ),
    NinePalaceGrid(result, state.settings),
  );
}

function render(state: AppState): void {
  clear(root);

  if (state.home) {
    root.append(Home(state.selectedDateTime));
    return;
  }

  const chart = computeFullChart(state.selectedDateTime, {
    dayChangeMode: state.settings.dayChangeMode,
    yearBoundary: state.settings.yearBoundary,
    keStrategyId: state.settings.keStrategyId,
  });
  const result = resultFor(chart, state.level);

  root.append(
    Header(state),
    Breadcrumb(chart, state.level),
    LevelTabs(state.level),
    ChartCard(result, isNow(state.selectedDateTime, state.level), state),
    TimeNavigator(state.selectedDateTime, state.level),
  );

  if (state.level === 'hour' || state.level === 'ke') {
    root.append(KeSelector(chart.hour, state.selectedDateTime));
  }
  const picker = ChildSelector(state.selectedDateTime, state.level);
  if (picker) root.append(picker);

  root.append(ExplainPanel(result), DetailPanel(chart), SettingsSheet(),
    el('p', { class: 'foot' }, '所有時間以 UTC+8 判定 · 離線可用'));
}

/* 手勢：左滑下一個 / 右滑上一個。按鈕永遠保留，不可只靠手勢（規劃書 §24）。 */
let touchX = 0;
let touchY = 0;
root.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0]!;
  touchX = t.clientX; touchY = t.clientY;
}, { passive: true });
root.addEventListener('touchend', (e) => {
  const s = getState();
  if (s.home) return;
  const t = e.changedTouches[0]!;
  const dx = t.clientX - touchX;
  const dy = t.clientY - touchY;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  setDateTime(shiftByLevel(s.selectedDateTime, s.level, dx < 0 ? 1 : -1));
}, { passive: true });

subscribe(render);
restoreFromUrl();
render(getState());
registerServiceWorker();
