import { PALACES, starName, type StarLevel } from '../engine/flyingStar/types';
import { formatUtc8Date, formatUtc8Time, parseUtc8 } from '../engine/time/utc8';
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

  return el('article', { class: 'search-result' },
    el('header', { class: 'search-result__head' },
      el('div', {},
        el('div', { class: 'search-result__date' }, time.date),
        el('div', { class: 'search-result__time' }, time.time),
      ),
      el('span', { class: 'search-result__palace' }, palaceLabel(match.palace)),
    ),
    layers,
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

export function SearchResults(query: StarSearchQuery, matches: readonly SearchMatch[]): HTMLElement {
  const palace = palaceLabel(query.palace);
  const condition = query.conditions[0]!;
  const stars = condition.stars.map(starName).join('、');

  return el('section', { class: 'search-results', 'aria-labelledby': 'search-results-title' },
    el('header', { class: 'search-results__summary' },
      el('div', {},
        el('h2', { id: 'search-results-title' }, `${palace} · 流${LEVEL_LABEL[condition.level]} · ${stars}`),
        el('p', {}, `${query.startDate} – ${query.endDate}`),
      ),
      el('strong', { class: 'search-results__count', 'aria-live': 'polite' }, `共 ${matches.length} 個結果`),
    ),
    matches.length > 0
      ? el('div', { class: 'search-results__list' }, ...matches.map(ResultCard))
      : el('div', { class: 'search-empty' },
        el('p', {}, '這段時間沒有找到符合條件的時段'),
        el('p', {}, '請修改日期、宮位、層級或飛星後再搜尋。'),
      ),
  );
}
