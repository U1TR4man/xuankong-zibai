import {
  formatUtc8Date, formatUtc8Time, MS_PER_DAY, parseUtc8, toUtc8Parts,
} from '../engine/time/utc8';
import { getPairRule } from '../selection/pairRules';
import { purposeLabel } from '../selection/purpose';
import type { PairSearchMatch, PairSearchQuery } from '../selection/searchPairOccurrences';
import { showSelectionChart } from '../state/appState';
import { el } from './dom';

const RESULT_PAGE_SIZE = 50;

function resultTime(match: PairSearchMatch): { date: string; time: string } {
  const start = parseUtc8(match.startDateTime)!;
  const end = new Date(parseUtc8(match.endDateTime)!.getTime() - 60_000);
  return {
    date: formatUtc8Date(start),
    time: `${formatUtc8Time(start)}–${formatUtc8Time(end)}`,
  };
}

function PairResultCard(match: PairSearchMatch): HTMLElement {
  const time = resultTime(match);
  const { snapshot, hit } = match;
  return el('button', {
    class: 'pair-search-result', type: 'button',
    'data-pair': hit.pair, 'data-pair-layer': hit.layer,
    'aria-label': `${time.date} ${time.time}，${snapshot.bearing}，${hit.layerLabel}${hit.pair}，查看擇吉盤`,
    onclick: () => {
      const date = parseUtc8(match.startDateTime);
      if (date) showSelectionChart(date, snapshot.palace, hit.pair, hit.layer);
    },
  },
  el('span', { class: 'pair-search-result__head' },
    el('span', { class: 'pair-search-result__time' }, time.time),
    el('span', { class: 'pair-search-result__direction' }, snapshot.bearing),
  ),
  el('span', { class: 'pair-search-result__match' },
    el('small', {}, hit.layerLabel),
    el('strong', {}, hit.pair),
    el('span', {}, hit.rule.reviewStatus === 'pending' ? '資料待校對' : hit.rule.title),
  ),
  el('span', { class: 'pair-search-result__context' },
    `年${snapshot.yearStar} · 月${snapshot.monthStar} · 日${snapshot.dayStar} · 時${snapshot.hourStar}`),
  match.purposeContext
    ? el('span', { class: 'pair-search-result__quality' },
      `來源 ${hit.rule.sourceLevel} · 紫白集中 ${match.purposeContext.purpleWhiteCount}`,
      match.purposeContext.otherCautionCount > 0 ? ' · 同方向另有警示' : '')
    : null,
  el('span', { class: 'pair-search-result__arrow', 'aria-hidden': 'true' }, '›'),
  );
}

function groupLabel(date: string): string {
  const parts = toUtc8Parts(parseUtc8(date)!);
  return `${parts.month}月${parts.day}日`;
}

function groupSections(matches: readonly PairSearchMatch[]): HTMLElement[] {
  const groups = new Map<string, PairSearchMatch[]>();
  for (const match of matches) {
    const date = formatUtc8Date(parseUtc8(match.startDateTime)!);
    const group = groups.get(date) ?? [];
    group.push(match);
    groups.set(date, group);
  }
  return Array.from(groups, ([date, group]) => el('section', {
    class: 'pair-search-result-group', 'aria-labelledby': `pair-search-group-${date}`,
  },
  el('header', { class: 'search-result-group__head' },
    el('h3', { id: `pair-search-group-${date}` }, groupLabel(date)),
    el('span', {}, `${group.length} 個`),
  ),
  el('div', { class: 'pair-search-result-group__items' }, ...group.map(PairResultCard)),
  ));
}

export function PairSearchResults(
  query: PairSearchQuery,
  matches: readonly PairSearchMatch[],
): HTMLElement {
  const pair = `${query.firstStar}${query.secondStar}`;
  const rule = getPairRule(pair);
  const reverse = `${query.secondStar}${query.firstStar}`;
  const rangeStart = parseUtc8(query.startDate)!;
  const rangeEnd = parseUtc8(query.endDate)!;
  const rangeDays = Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / MS_PER_DAY) + 1;
  const notices: HTMLElement[] = [];
  if (rangeDays > 90) notices.push(el('p', { class: 'search-results__notice' },
    `本次搜尋 ${rangeDays} 日；長範圍可能需要較多計算時間。`));
  if (matches.length > RESULT_PAGE_SIZE) notices.push(el('p', { class: 'search-results__notice' },
    '結果較多，列表會每次顯示 50 筆；完整總數不會被截斷。'));

  let visibleCount = Math.min(RESULT_PAGE_SIZE, matches.length);
  const list = el('div', { class: 'pair-search-results__list' });
  const more = el('button', {
    class: 'btn btn--ghost pair-search-results__more', type: 'button',
    hidden: visibleCount >= matches.length,
  });
  const renderVisible = () => {
    list.replaceChildren(...groupSections(matches.slice(0, visibleCount)));
    const remaining = matches.length - visibleCount;
    more.textContent = remaining > 0
      ? `再顯示 ${Math.min(RESULT_PAGE_SIZE, remaining)} 個（尚餘 ${remaining}）`
      : '已顯示全部結果';
    more.hidden = remaining === 0;
  };
  more.addEventListener('click', () => {
    visibleCount = Math.min(visibleCount + RESULT_PAGE_SIZE, matches.length);
    renderVisible();
  });
  renderVisible();

  const heading = query.purpose
    ? `適合用途：${purposeLabel(query.purpose)}`
    : query.ordered
      ? `${pair} ${rule.title}`
      : `${pair}／${reverse} · 不分次序`;
  return el('section', { class: 'pair-search-results', 'aria-labelledby': 'pair-search-results-title' },
    el('header', { class: 'search-results__summary' },
      el('div', {},
        el('h2', { id: 'pair-search-results-title' }, heading),
        el('p', {}, `${query.startDate} – ${query.endDate} · ${query.layers.join('／')}`),
      ),
      el('strong', { class: 'pair-search-results__count', 'aria-live': 'polite' },
        `共 ${matches.length} 個結果`),
      ...notices,
    ),
    matches.length > 0
      ? el('div', { class: 'search-results__body' }, list, more)
      : el('div', { class: 'search-empty' },
        el('p', {}, '這段時間沒有找到符合的雙星組合'),
        el('p', {}, '請修改日期、次序或 Pair Layer 後再搜尋。'),
      ),
  );
}
