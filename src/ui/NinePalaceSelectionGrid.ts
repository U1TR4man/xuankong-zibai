import type { FullChart } from '../engine/flyingStar';
import { PALACES, starName, type PalaceMeta } from '../engine/flyingStar/types';
import {
  VERDICT_LABEL, type DirectionEvaluation, type PairHit, type PalaceKiller,
} from '../selection/types';
import { selectPalace, type AppState } from '../state/appState';
import { openDirectionDetailSheet } from './DirectionDetailSheet';
import { el } from './dom';

const LEVELS = [
  { key: 'year', label: '年' }, { key: 'month', label: '月' },
  { key: 'day', label: '日' }, { key: 'hour', label: '時' },
] as const;
const KILLER_SHORT_LABEL: Record<PalaceKiller, string> = {
  an_jian: '暗建', shou_ke: '受剋', chuan_xin: '穿心',
  jiao_jian: '交劍', dou_niu: '鬥牛',
};
const LEVEL_SHORT_LABEL = { year: '年', month: '月', day: '日', hour: '時' } as const;

function layerStars(evaluation: DirectionEvaluation): HTMLElement {
  const snapshot = evaluation.snapshot;
  return el('span', { class: 'selection-cell__stars', 'aria-hidden': 'true' },
    ...LEVELS.map((level) => el('span', { class: 'selection-cell__star' },
      el('small', {}, level.label), el('strong', {}, String(snapshot[`${level.key}Star`])))),
  );
}

function matchedHit(evaluation: DirectionEvaluation, state: AppState): PairHit | undefined {
  if (!state.selectedPair) return undefined;
  return evaluation.hits.find((hit) => hit.pair === state.selectedPair
    && (!state.selectedPairLayer || hit.layer === state.selectedPairLayer));
}

function primaryCondition(evaluation: DirectionEvaluation): string | undefined {
  const states = evaluation.temporalProfile.starStates;
  const killer = states.find((state) => state.palaceKillers.length >= 2)
    ?? states.find((state) => state.palaceKillers.length > 0);
  if (killer) {
    return `⚠ ${LEVEL_SHORT_LABEL[killer.level]}${starName(killer.star)}：${killer.palaceKillers
      .map((item) => KILLER_SHORT_LABEL[item]).join('、')}`;
  }
  const branchWarning = states.find((state) => (
    state.temporalState.liuJieTomb || state.temporalState.absolute
  ));
  if (branchWarning) {
    return `⚠ ${LEVEL_SHORT_LABEL[branchWarning.level]}${starName(branchWarning.star)}：${
      branchWarning.temporalState.liuJieTomb ? '入墓' : '臨絕'}`;
  }
  if (evaluation.temporalProfile.yellowBlackLayers.length >= 2) return '⚠ 二黑、五黃同到';
  return undefined;
}

function openDirection(trigger: HTMLElement, evaluation: DirectionEvaluation, state: AppState): void {
  selectPalace(evaluation.snapshot.palace);
  queueMicrotask(() => {
    const replacement = document.querySelector<HTMLElement>(
      `[data-selection-palace="${evaluation.snapshot.palace}"]`,
    );
    openDirectionDetailSheet(
      replacement ?? trigger, evaluation, state.selectedPair, state.selectedPairLayer,
    );
  });
}

function centerCell(palace: PalaceMeta, chart: FullChart): HTMLElement {
  return el('div', {
    class: [
      'cell', 'selection-cell', 'selection-cell--center', 'cell--center',
      palace.col === 2 ? 'is-lastcol' : '', palace.row === 2 ? 'is-lastrow' : '',
    ].filter(Boolean).join(' '),
    style: `grid-row:${palace.row + 1};grid-column:${palace.col + 1}`,
    role: 'gridcell',
    'aria-label': `中宮，年${chart.year.palaceStars.center}，月${chart.month.palaceStars.center}，日${chart.day.palaceStars.center}，時${chart.hour.palaceStars.center}，不參與方向排序`,
  },
  el('span', { class: 'cell__palace' }, '中宮'),
  el('span', { class: 'selection-cell__stars', 'aria-hidden': 'true' },
    ...LEVELS.map((level) => el('span', { class: 'selection-cell__star' },
      el('small', {}, level.label), el('strong', {}, String(chart[level.key].palaceStars.center)))),
  ),
  el('span', { class: 'selection-cell__excluded' }, '不參與排序'),
  );
}

export function NinePalaceSelectionGrid(
  chart: FullChart,
  evaluations: readonly DirectionEvaluation[],
  state: AppState,
): HTMLElement {
  const grid = el('div', {
    class: `grid selection-grid${state.selectedPalace ? ' has-selection' : ''}`,
    role: 'grid',
    'aria-label': '紫白擇吉八方盤；中宮不參與排序',
  });

  for (const palace of PALACES) {
    if (palace.key === 'center') {
      grid.append(centerCell(palace, chart));
      continue;
    }
    const evaluation = evaluations.find((item) => item.snapshot.palace === palace.key)!;
    const selected = state.selectedPalace === palace.key;
    const match = matchedHit(evaluation, state);
    const shownHit = match ?? evaluation.topHit;
    const condition = match ? undefined : primaryCondition(evaluation);
    const summary = condition ?? (shownHit.rule.reviewStatus === 'pending'
      ? `${shownHit.pair} 資料待校對`
      : `${match ? '✓ ' : '✦ '}${shownHit.pair} ${shownHit.rule.title}`);
    const cell = el('button', {
      class: [
        'cell', 'selection-cell', selected ? 'is-selected' : '', match ? 'is-search-match' : '',
        palace.col === 2 ? 'is-lastcol' : '', palace.row === 2 ? 'is-lastrow' : '',
      ].filter(Boolean).join(' '),
      style: `grid-row:${palace.row + 1};grid-column:${palace.col + 1}`,
      type: 'button', role: 'gridcell',
      'data-selection-palace': palace.key,
      'aria-pressed': String(selected),
      'aria-label': `${evaluation.snapshot.bearing}，年${evaluation.snapshot.yearStar}，月${evaluation.snapshot.monthStar}，日${evaluation.snapshot.dayStar}，時${evaluation.snapshot.hourStar}，狀態${VERDICT_LABEL[evaluation.verdict]}，${condition ?? `雙星參考${shownHit.pair}${shownHit.rule.title}`}`,
      onclick: (event: Event) => openDirection(event.currentTarget as HTMLElement, evaluation, state),
    },
    el('span', { class: 'cell__palace' }, evaluation.snapshot.bearing),
    layerStars(evaluation),
    el('span', { class: `selection-verdict verdict--${evaluation.verdict}` },
      evaluation.verdict === 'priority' ? '優先' : evaluation.verdict === 'usable' ? '可用'
        : evaluation.verdict === 'mixed' ? '吉凶並見'
          : evaluation.verdict === 'caution' ? '慎用' : '普通'),
    el('span', {
      class: `selection-cell__top${condition ? ' selection-cell__condition' : ''}`,
      ...(condition ? {} : { 'data-pair': shownHit.pair }),
    }, summary),
    );
    grid.append(cell);
  }
  return grid;
}
