/**
 * 應用進入點。
 *
 * 架構原則（規劃書 §40）：
 *   時間資料 → 規則 Engine → StarResult → 九宮 Rendering
 * 本檔只做狀態→畫面的組裝，不含任何玄學算法。
 */

import './styles.css';

import { computeFullChart, type FullChart } from './engine/flyingStar';
import type { StarResult } from './engine/flyingStar/types';
import { getChineseHour } from './engine/time/chineseHour';
import { getKeStrategy } from './engine/flyingStar/ke/registry';
import { getSolarMonthByJieqi } from './engine/time/solarTerms';
import { formatUtc8Date, nowUtc8, toUtc8Parts } from './engine/time/utc8';
import {
  getState, migrateLegacyHome, refreshFollowedNow, restoreFromUrl, setDateTime, subscribe,
  type AppState, type Level,
} from './state/appState';
import { ContextAction } from './ui/ContextAction';
import { ChartHeader } from './ui/ChartHeader';
import { DateTimeContext } from './ui/DateTimeContext';
import { ExplainTrigger } from './ui/ExplainSheet';
import { LevelSegment } from './ui/LevelSegment';
import { NinePalaceGrid } from './ui/NinePalaceGrid';
import { TimeNavigator, shiftByLevel } from './ui/TimeNavigator';
import { TopBar } from './ui/TopBar';
import { StudyPanel } from './ui/StudyPanel';
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

function ChartCard(result: StarResult, now: boolean, state: AppState): HTMLElement {
  const card = el('section', {
    class: 'card', id: 'current-chart', 'data-swipe-zone': 'chart',
  },
    ChartHeader(result, state.level, now),
    NinePalaceGrid(result, state.settings),
  );

  let touchX = 0;
  let touchY = 0;
  let tracking = false;
  card.addEventListener('touchstart', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('button,input,select,dialog,a')) {
      tracking = false;
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchX = touch.clientX;
    touchY = touch.clientY;
    tracking = true;
  }, { passive: true });
  card.addEventListener('touchend', (event) => {
    if (!tracking) return;
    tracking = false;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchX;
    const dy = touch.clientY - touchY;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    setDateTime(shiftByLevel(state.selectedDateTime, state.level, dx < 0 ? 1 : -1));
  }, { passive: true });
  card.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
  return card;
}

function render(state: AppState): void {
  clear(root);

  const chart = computeFullChart(state.selectedDateTime, {
    dayChangeMode: state.settings.dayChangeMode,
    yearBoundary: state.settings.yearBoundary,
    keStrategyId: state.settings.keStrategyId,
  });
  const result = resultFor(chart, state.level);

  root.append(
    TopBar(state),
    DateTimeContext(state),
    LevelSegment(state.level),
    ChartCard(result, isNow(state.selectedDateTime, state.level), state),
    TimeNavigator(state.selectedDateTime, state.level),
    ContextAction(state, chart),
  );

  root.append(ExplainTrigger(result));
  if (state.settings.displayMode === 'study') root.append(StudyPanel(chart));
  root.append(el('p', { class: 'foot' }, '所有時間以 UTC+8 判定 · 離線可用'));
}

subscribe(render);
restoreFromUrl();
migrateLegacyHome();
render(getState());
window.setInterval(refreshFollowedNow, 30_000);
registerServiceWorker();
