/** 詳細資料 Panel（規劃書 §26）：debug / 研究 / 驗算 / 截圖用。 */

import { getCurrentSolarTerm, getDayStarSegment, getNextSolarTerm, getSolarMonthByJieqi, getYinYangPeriod } from '../engine/time/solarTerms';
import { getGanzhiDay } from '../engine/time/ganzhiDay';
import { getChineseHour } from '../engine/time/chineseHour';
import { branchGroup, BRANCH_GROUP_LABEL, BRANCHES } from '../engine/time/ganzhi';
import { getKeStrategy } from '../engine/flyingStar/ke/registry';
import { DIRECTION_LABEL, starName } from '../engine/flyingStar/types';
import type { FullChart } from '../engine/flyingStar';
import { formatUtc8, formatUtc8Time } from '../engine/time/utc8';
import { getState } from '../state/appState';
import { el } from './dom';

export function getDetailRows(chart: FullChart): Array<[string, string]> {
  const d = chart.datetime;
  const s = getState().settings;
  const term = getCurrentSolarTerm(d);
  const nextTerm = getNextSolarTerm(d);
  const seg = getDayStarSegment(d);
  const yy = getYinYangPeriod(d);
  const gz = getGanzhiDay(d, s.dayChangeMode);
  const ch = getChineseHour(d);
  const sm = getSolarMonthByJieqi(d);
  const strat = getKeStrategy(s.keStrategyId);
  const keInfo = strat.listKe(d)[chart.ke.keIndex]!;

  return [
    ['公曆', `${formatUtc8(d, true)}（UTC+8）`],
    ['節氣', `${term.name}後 · ${formatUtc8(term.date)}${term.source === 'algorithm' ? '（演算法推算）' : ''}`],
    ['下一節氣', `${nextTerm.name} · ${formatUtc8(nextTerm.date)}`],
    ['月建', `${BRANCHES[sm.branchIndex]}月（${sm.startTerm.name}起）`],
    ['日柱', `${gz.text}（第 ${gz.index60 + 1} 位）`],
    ['時支', `${ch.branch}（${ch.rangeLabel}）`],
    ['日類', `${BRANCH_GROUP_LABEL[branchGroup(gz.branchIndex)]}日`],
    ['陰陽', yy.label],
    ['日盤段', `${seg.label} · 甲子${starName(seg.jiaziStar)} · ${DIRECTION_LABEL[seg.direction]}`],
    ['流年', `${starName(chart.year.centerStar)}入中 · ${DIRECTION_LABEL[chart.year.direction]}`],
    ['流月', `${starName(chart.month.centerStar)}入中 · ${DIRECTION_LABEL[chart.month.direction]}`],
    ['流日', `${starName(chart.day.centerStar)}入中 · ${DIRECTION_LABEL[chart.day.direction]}`],
    ['流時', `${starName(chart.hour.centerStar)}入中 · ${DIRECTION_LABEL[chart.hour.direction]}`],
    ['刻', `${keInfo.label}（${formatUtc8Time(keInfo.start)}–${formatUtc8Time(new Date(keInfo.end.getTime() - 60000))}）`],
    ['刻星', `${starName(chart.ke.centerStar)}入中 · ${DIRECTION_LABEL[chart.ke.direction]}`],
    ['刻盤算法', strat.name],
  ];
}

/** V1 compatibility；V2 主畫面改用 StudyPanel。 */
export function DetailPanel(chart: FullChart): HTMLElement {
  const rows = getDetailRows(chart);

  return el(
    'details',
    { class: 'panel' },
    el('summary', { class: 'panel__sum' }, '時間資訊'),
    el(
      'dl',
      { class: 'kv' },
      ...rows.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, v)]),
    ),
  );
}
