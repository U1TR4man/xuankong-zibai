import { PALACES, starName, type StarLevel } from '../engine/flyingStar/types';
import {
  formatUtc8Date, formatUtc8Time, MS_PER_DAY, parseUtc8, toUtc8Parts,
} from '../engine/time/utc8';
import { overlayLevelsThrough } from '../overlay/types';
import type { SelectionMode } from '../selection/hourGate';
import { buildTemporalPillars, type TemporalPillarOptions } from '../selection/temporalPillars';
import { type RankedTimeWindow, rankTimeWindows } from '../selection/timeWindowRanking';
import { showOverlayChart } from '../state/appState';
import type { SearchMatch, StarSearchQuery } from '../search/types';
import { el } from './dom';
import {
  DAY_STATUS_LABEL, TIME_WINDOW_HOUR_STATUS_LABEL, TIME_WINDOW_REJECTION_LABEL,
} from './gateLabels';

const LEVEL_LABEL: Record<StarLevel, string> = {
  year: '年', month: '月', day: '日', hour: '時', ke: '刻',
};

const RESULT_PAGE_SIZE = 50;

/**
 * 結果排序方式。
 *
 * `time` 是**既有預設，不得更動**——改變既有排序預設屬 UX 決策
 * （最佳時窗規則文件 §11 第 2 項）。
 *
 * `window` 依「可用性 → 日課 → 時課 → 時間」排序，見 `rankTimeWindows()`。
 */
export type ResultSort = 'time' | 'window';

const SORT_LABEL: Record<ResultSort, string> = {
  time: '依時間', window: '依日課時課',
};

export interface SearchResultsOptions extends TemporalPillarOptions {
  mode?: SelectionMode;
  sort?: ResultSort;
  onSortChange?: (sort: ResultSort) => void;
}

function palaceLabel(key: SearchMatch['palace']): string {
  const palace = PALACES.find((item) => item.key === key)!;
  return key === 'center' ? '中' : `${palace.name.replace(/宮$/, '')} · ${palace.bearing}`;
}

function resultTime(match: SearchMatch): { date: string; time: string } {
  const start = parseUtc8(match.startDateTime)!;
  if (match.precision === 'day') return { date: formatUtc8Date(start), time: '全日' };
  const end = new Date(parseUtc8(match.endDateTime)!.getTime() - 60_000);
  return {
    date: formatUtc8Date(start),
    time: `${formatUtc8Time(start)}–${formatUtc8Time(end)}`,
  };
}

/**
 * 結果的干支只有一個來源：`buildTemporalPillars()`。
 * 年界、換日與時辰邊界全在其中，UI 不得自行推算，也不得改用結果的字串時間去猜。
 *
 * 日精度沒有唯一時辰，因此只列年月日三柱；時與刻同屬一個時辰，四柱相同。
 */
function pillarChips(match: SearchMatch, options: TemporalPillarOptions): string[] {
  const start = parseUtc8(match.startDateTime);
  if (!start) return [];
  const pillars = buildTemporalPillars(start, options);
  const chips = [
    `${LEVEL_LABEL.year} ${pillars.year.text}`,
    `${LEVEL_LABEL.month} ${pillars.month.text}`,
    `${LEVEL_LABEL.day} ${pillars.day.text}`,
  ];
  if (match.precision !== 'day') chips.push(`${LEVEL_LABEL.hour} ${pillars.hour.text}`);
  return chips;
}

/**
 * 時窗評級只在**依日課時課**排序時顯示。
 *
 * 依時間排序時列表沒有用到這個判定，若照樣顯示，使用者會把清單讀成
 * 「已按吉凶排好」——那正是這裡要避免的誤導。
 */
function windowGateRow(window: RankedTimeWindow): HTMLElement {
  const parts = [
    `日課 ${DAY_STATUS_LABEL[window.dayStatus]}`,
    `時課 ${TIME_WINDOW_HOUR_STATUS_LABEL[window.hourStatus]}`,
  ];
  if (window.rejectedBy.length > 0) {
    parts.push(window.rejectedBy.map((reason) => TIME_WINDOW_REJECTION_LABEL[reason]).join('、'));
  }
  return el('span', {
    class: `search-result__gates gates--${window.admissibility}`,
    'aria-hidden': 'true',
  }, ...parts.map((part) => el('span', {}, part)));
}

function ResultCard(
  match: SearchMatch,
  options: TemporalPillarOptions,
  window?: RankedTimeWindow,
): HTMLElement {
  const time = resultTime(match);
  const chips = pillarChips(match, options);
  const gateChips = window ? [
    `日課 ${DAY_STATUS_LABEL[window.dayStatus]}`,
    `時課 ${TIME_WINDOW_HOUR_STATUS_LABEL[window.hourStatus]}`,
    ...window.rejectedBy.map((reason) => TIME_WINDOW_REJECTION_LABEL[reason]),
  ] : [];
  const matchedLevels = new Set(match.matchedConditions.map((condition) => condition.level));
  const layers = el('span', { class: 'search-result__layers', 'aria-label': '命中時的上層疊盤' });
  for (const level of overlayLevelsThrough(match.precision)) {
    const star = match.palaceStars[level];
    layers.append(el('span', {
      class: `search-result__layer${matchedLevels.has(level as SearchMatch['precision']) ? ' is-match' : ''}`,
      'data-layer': level,
    },
    el('span', { class: 'search-result__layer-label' }, LEVEL_LABEL[level]),
    el('span', { class: 'search-result__layer-star' }, star ? starName(star) : '—'),
    ));
  }

  const combinations: HTMLElement[] = [];
  if (match.matchedConditions.length > 1 && match.palaceStars.day && match.palaceStars.hour) {
    combinations.push(el('span', {}, `日時 ${match.palaceStars.day}${match.palaceStars.hour}`));
  }
  if (match.matchedConditions.length > 1 && match.palaceStars.hour && match.palaceStars.ke) {
    combinations.push(el('span', {}, `時刻 ${match.palaceStars.hour}${match.palaceStars.ke}`));
  }

  return el('button', {
    class: 'search-result',
    type: 'button',
    // button 有 explicit aria-label，內容不會被朗讀，故干支必須併入。
    'aria-label': [
      `${time.date} ${time.time}`,
      palaceLabel(match.palace),
      ...chips,
      ...gateChips,
      '查看此盤',
    ].join('，'),
    onclick: () => {
      const date = parseUtc8(match.startDateTime);
      if (date) showOverlayChart(
        date,
        match.precision,
        match.palace,
        match.matchedConditions.map((condition) => condition.level),
      );
    },
  },
    el('span', { class: 'search-result__head' },
      el('span', { class: 'search-result__time' }, time.time),
      el('span', { class: 'search-result__palace' }, palaceLabel(match.palace)),
    ),
    el('span', { class: 'search-result__pillars', 'aria-hidden': 'true' },
      ...chips.map((chip) => el('span', {}, chip))),
    window ? windowGateRow(window) : null,
    layers,
    el('span', { class: 'search-result__footer' },
      combinations.length > 0
        ? el('span', { class: 'search-result__combinations', 'aria-label': '組合摘要' }, ...combinations)
        : el('span', {}),
      el('span', { class: 'search-result__arrow', 'aria-hidden': 'true' }, '›'),
    ),
  );
}

function groupMatches(matches: readonly SearchMatch[]): Map<string, SearchMatch[]> {
  const groups = new Map<string, SearchMatch[]>();
  for (const match of matches) {
    const date = formatUtc8Date(parseUtc8(match.startDateTime)!);
    const group = groups.get(date) ?? [];
    group.push(match);
    groups.set(date, group);
  }
  return groups;
}

function groupLabel(date: string): string {
  const parts = toUtc8Parts(parseUtc8(date)!);
  return `${parts.month}月${parts.day}日`;
}

function groupSections(
  matches: readonly SearchMatch[],
  options: TemporalPillarOptions,
): HTMLElement[] {
  return Array.from(groupMatches(matches), ([date, group]) => el('section', {
    class: 'search-result-group', 'aria-labelledby': `search-group-${date}`,
  },
  el('header', { class: 'search-result-group__head' },
    el('h3', { id: `search-group-${date}` }, groupLabel(date)),
    el('span', {}, `${group.length} 個`),
  ),
  el('div', { class: 'search-result-group__items' },
    ...group.map((match) => ResultCard(match, options))),
  ));
}

/**
 * 依日課時課排序時改以 tier 分組——日期分組在這個次序下會被打散成無意義的碎片。
 * tier 是「可用性／日課／時課」三者相同的一群，正好是使用者要比較的單位。
 */
function tierSections(
  windows: readonly RankedTimeWindow[],
  options: TemporalPillarOptions,
): HTMLElement[] {
  const groups = new Map<number, RankedTimeWindow[]>();
  for (const window of windows) {
    const group = groups.get(window.tier) ?? [];
    group.push(window);
    groups.set(window.tier, group);
  }
  return Array.from(groups, ([tier, group]) => {
    const head = group[0]!;
    const title = `日課 ${DAY_STATUS_LABEL[head.dayStatus]} · `
      + `時課 ${TIME_WINDOW_HOUR_STATUS_LABEL[head.hourStatus]}`;
    return el('section', {
      class: `search-result-group search-tier--${head.admissibility}`,
      'aria-labelledby': `search-tier-${tier}`,
    },
    el('header', { class: 'search-result-group__head' },
      el('h3', { id: `search-tier-${tier}` }, title),
      el('span', {}, `${group.length} 個`),
    ),
    el('div', { class: 'search-result-group__items' },
      ...group.map((window) => ResultCard(window.match, options, window))),
    );
  });
}

/** 排序切換；`onSortChange` 未提供時不 render，避免出現點了沒反應的控制。 */
function sortControl(
  sort: ResultSort,
  onSortChange: (next: ResultSort) => void,
): HTMLElement {
  return el('div', { class: 'search-sort', role: 'group', 'aria-label': '結果排序' },
    ...(['time', 'window'] as const).map((value) => el('button', {
      class: `search-sort__item${sort === value ? ' is-active' : ''}`,
      type: 'button',
      'aria-pressed': String(sort === value),
      onclick: () => { if (value !== sort) onSortChange(value); },
    }, SORT_LABEL[value])),
  );
}

export function SearchResults(
  query: StarSearchQuery,
  matches: readonly SearchMatch[],
  options: SearchResultsOptions = {},
): HTMLElement {
  const sort = options.sort ?? 'time';
  // 只有依日課時課排序時才算；依時間排序完全不碰時窗層。
  const windows = sort === 'window' && matches.length > 0
    ? rankTimeWindows(matches, {
      mode: options.mode,
      dayChangeMode: options.dayChangeMode,
      yearBoundary: options.yearBoundary,
    })
    : [];
  const ordered: readonly SearchMatch[] = sort === 'window'
    ? windows.map((window) => window.match)
    : matches;
  const palace = palaceLabel(query.palace);
  const conditionText = query.conditions.map((condition) => (
    `流${LEVEL_LABEL[condition.level]} ${condition.stars.map(starName).join('／')}`
  )).join(' ＋ ');
  const start = parseUtc8(query.startDate)!;
  const end = parseUtc8(query.endDate)!;
  const rangeDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const notices: HTMLElement[] = [];
  if (rangeDays > 90) {
    notices.push(el('p', { class: 'search-results__notice' },
      `本次搜尋 ${rangeDays} 日；長範圍可能需要較多計算時間。`));
  }
  if (matches.length > RESULT_PAGE_SIZE) {
    notices.push(el('p', { class: 'search-results__notice' },
      '結果較多，可縮短日期或增加條件；列表會分批顯示，總結果不會被截斷。'));
  }

  if (sort === 'window') {
    notices.push(el('p', { class: 'search-results__notice' },
      '同一組內按時間先後排列，先後不代表吉凶。日課、時課只作參考，不改方向排序。'));
  }

  let visibleCount = Math.min(RESULT_PAGE_SIZE, ordered.length);
  const list = el('div', { class: 'search-results__list' });
  const more = el('button', {
    class: 'btn btn--ghost search-results__more', type: 'button',
    hidden: visibleCount >= ordered.length,
  });
  const renderVisible = () => {
    list.replaceChildren(...(sort === 'window'
      ? tierSections(windows.slice(0, visibleCount), options)
      : groupSections(ordered.slice(0, visibleCount), options)));
    const remaining = ordered.length - visibleCount;
    more.textContent = remaining > 0
      ? `再顯示 ${Math.min(RESULT_PAGE_SIZE, remaining)} 個（尚餘 ${remaining}）`
      : '已顯示全部結果';
    more.hidden = remaining === 0;
  };
  more.addEventListener('click', () => {
    visibleCount = Math.min(visibleCount + RESULT_PAGE_SIZE, ordered.length);
    renderVisible();
  });
  renderVisible();

  return el('section', { class: 'search-results', 'aria-labelledby': 'search-results-title' },
    el('header', { class: 'search-results__summary' },
      el('div', {},
        el('h2', { id: 'search-results-title' }, `${palace} · ${conditionText}`),
        el('p', {}, `${query.startDate} – ${query.endDate}`),
      ),
      el('strong', { class: 'search-results__count', 'aria-live': 'polite' }, `共 ${matches.length} 個結果`),
      options.onSortChange && matches.length > 0
        ? sortControl(sort, options.onSortChange)
        : null,
      ...notices,
    ),
    matches.length > 0
      ? el('div', { class: 'search-results__body' }, list, more)
      : el('div', { class: 'search-empty' },
        el('p', {}, '這段時間沒有找到符合條件的時段'),
        el('p', {}, '請修改日期、宮位、層級或飛星後再搜尋。'),
      ),
  );
}
