import { PALACES, starName, type StarLevel } from '../engine/flyingStar/types';
import {
  formatUtc8Date, formatUtc8Time, MS_PER_DAY, parseUtc8, toUtc8Parts,
} from '../engine/time/utc8';
import { overlayLevelsThrough } from '../overlay/types';
import { showOverlayChart } from '../state/appState';
import type { SearchMatch, StarSearchQuery } from '../search/types';
import { el } from './dom';

const LEVEL_LABEL: Record<StarLevel, string> = {
  year: '年', month: '月', day: '日', hour: '時', ke: '刻',
};

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

function ResultCard(match: SearchMatch): HTMLElement {
  const time = resultTime(match);
  const matchedLevels = new Set(match.matchedConditions.map((condition) => condition.level));
  const layers = el('div', { class: 'search-result__layers', 'aria-label': '命中時的上層疊盤' });
  for (const level of overlayLevelsThrough(match.precision)) {
    const star = match.palaceStars[level];
    layers.append(el('div', {
      class: `search-result__layer${matchedLevels.has(level as SearchMatch['precision']) ? ' is-match' : ''}`,
      'data-layer': level,
    },
    el('span', { class: 'search-result__layer-label' }, LEVEL_LABEL[level]),
    el('span', { class: 'search-result__layer-star' }, star ? starName(star) : '—'),
    matchedLevels.has(level as SearchMatch['precision'])
      ? el('span', { class: 'search-result__match', 'aria-label': '命中' }, '✓')
      : null,
    ));
  }

  const combinations: HTMLElement[] = [];
  if (match.matchedConditions.length > 1 && match.palaceStars.day && match.palaceStars.hour) {
    combinations.push(el('span', {}, `日時 ${match.palaceStars.day}${match.palaceStars.hour}`));
  }
  if (match.matchedConditions.length > 1 && match.palaceStars.hour && match.palaceStars.ke) {
    combinations.push(el('span', {}, `時刻 ${match.palaceStars.hour}${match.palaceStars.ke}`));
  }

  return el('article', { class: 'search-result' },
    el('header', { class: 'search-result__head' },
      el('div', {},
        el('div', { class: 'search-result__date' }, time.date),
        el('div', { class: 'search-result__time' }, time.time),
      ),
      el('span', { class: 'search-result__palace' }, palaceLabel(match.palace)),
    ),
    layers,
    combinations.length > 0
      ? el('div', { class: 'search-result__combinations', 'aria-label': '組合摘要' }, ...combinations)
      : null,
    el('button', {
      class: 'btn btn--ghost search-result__open',
      type: 'button',
      onclick: () => {
        const date = parseUtc8(match.startDateTime);
        if (date) showOverlayChart(date, match.precision, match.palace);
      },
    }, '查看此盤'),
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

export function SearchResults(query: StarSearchQuery, matches: readonly SearchMatch[]): HTMLElement {
  const palace = palaceLabel(query.palace);
  const conditionText = query.conditions.map((condition) => (
    `流${LEVEL_LABEL[condition.level]} ${condition.stars.map(starName).join('／')}`
  )).join(' ＋ ');
  const groups = groupMatches(matches);
  const start = parseUtc8(query.startDate)!;
  const end = parseUtc8(query.endDate)!;
  const rangeDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const notices: HTMLElement[] = [];
  if (rangeDays > 90) {
    notices.push(el('p', { class: 'search-results__notice' },
      `本次搜尋 ${rangeDays} 日；長範圍可能需要較多計算時間。`));
  }
  if (matches.length > 200) {
    notices.push(el('p', { class: 'search-results__notice' },
      '結果較多，可縮短日期或增加條件；目前結果未被截斷。'));
  }

  return el('section', { class: 'search-results', 'aria-labelledby': 'search-results-title' },
    el('header', { class: 'search-results__summary' },
      el('div', {},
        el('h2', { id: 'search-results-title' }, `${palace} · ${conditionText}`),
        el('p', {}, `${query.startDate} – ${query.endDate}`),
      ),
      el('strong', { class: 'search-results__count', 'aria-live': 'polite' }, `共 ${matches.length} 個結果`),
      ...notices,
    ),
    matches.length > 0
      ? el('div', { class: 'search-results__list' },
        ...Array.from(groups, ([date, group]) => el('section', {
          class: 'search-result-group', 'aria-labelledby': `search-group-${date}`,
        },
        el('header', { class: 'search-result-group__head' },
          el('h3', { id: `search-group-${date}` }, groupLabel(date)),
          el('span', {}, `${group.length} 個`),
        ),
        el('div', { class: 'search-result-group__items' }, ...group.map(ResultCard)),
        )),
      )
      : el('div', { class: 'search-empty' },
        el('p', {}, '這段時間沒有找到符合條件的時段'),
        el('p', {}, '請修改日期、宮位、層級或飛星後再搜尋。'),
      ),
  );
}
