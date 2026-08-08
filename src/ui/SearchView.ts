import { PALACES, STAR_NAMES, type PalaceKey } from '../engine/flyingStar/types';
import { addDays, formatUtc8Date, MS_PER_DAY, nowUtc8 } from '../engine/time/utc8';
import { asStarNumber } from '../overlay/types';
import { parseCandidateRange } from '../search/candidateIterator';
import { searchStars } from '../search/StarSearchEngine';
import type { SearchLevel, SearchMatch, StarSearchQuery } from '../search/types';
import {
  getState, setSimpleSearchUrlState, setView, type AppState, type SimpleSearchUrlState,
} from '../state/appState';
import { el } from './dom';
import { SearchResults } from './SearchResults';

type SearchMode = 'simple' | 'advanced';

interface SearchDraft {
  mode: SearchMode;
  startDate: string;
  endDate: string;
  palace: string;
  level: SearchLevel;
  star: string;
  advancedStars: Record<SearchLevel, string[]>;
}

interface SearchViewModel {
  draft: SearchDraft;
  query?: StarSearchQuery;
  matches?: SearchMatch[];
  error?: string;
  searching?: boolean;
}

let model: SearchViewModel | undefined;
let searchRunId = 0;
let appliedSearchRestoreVersion = -1;

const SEARCH_LEVELS: readonly SearchLevel[] = ['day', 'hour', 'ke'];
const LUOSHU_STARS = [
  { value: '4', position: '巽' }, { value: '9', position: '離' }, { value: '2', position: '坤' },
  { value: '3', position: '震' }, { value: '5', position: '中' }, { value: '7', position: '兌' },
  { value: '8', position: '艮' }, { value: '1', position: '坎' }, { value: '6', position: '乾' },
] as const;

function levelLabel(level: SearchLevel): string {
  return level === 'day' ? '日' : level === 'hour' ? '時' : '刻';
}

function sortStarValues(values: string[]): string[] {
  return values.sort((a, b) => Number(a) - Number(b));
}

function defaults(state: AppState): SearchViewModel {
  const today = nowUtc8();
  const restored = state.simpleSearch;
  return {
    draft: {
      mode: 'simple',
      startDate: restored?.from ?? formatUtc8Date(today),
      endDate: restored?.to ?? formatUtc8Date(addDays(today, 30)),
      palace: restored?.searchPalace ?? '',
      level: restored?.precision ?? 'hour',
      star: restored ? String(restored.star) : '',
      advancedStars: { day: [], hour: [], ke: [] },
    },
  };
}

function simpleUrlState(draft: SearchDraft): SimpleSearchUrlState | undefined {
  if (draft.mode !== 'simple') return undefined;
  const palace = PALACES.find((item) => item.key === draft.palace)?.key;
  const star = Number(draft.star);
  if (!draft.startDate || !draft.endDate || !palace) return undefined;
  if (!Number.isInteger(star) || star < 1 || star > 9) return undefined;
  return {
    from: draft.startDate,
    to: draft.endDate,
    searchPalace: palace,
    precision: draft.level,
    star,
  };
}

function starChoices(
  name: string,
  selected: readonly string[],
  multiple: boolean,
): HTMLElement {
  return el('div', { class: 'search-stars', 'data-layout': 'luoshu' },
    ...LUOSHU_STARS.map(({ value, position }) => {
      const checked = selected.includes(value);
      return el('label', { class: `search-star${checked ? ' is-selected' : ''}` },
        el('input', {
          type: multiple ? 'checkbox' : 'radio', name, value, checked,
          'aria-label': `${position}位 ${STAR_NAMES[Number(value)]}`,
        }),
        el('span', {}, STAR_NAMES[Number(value)]!),
      );
    }),
  );
}

function option(value: string, label: string, selected: boolean): HTMLOptionElement {
  return el('option', { value, selected }, label);
}

function SearchForm(
  state: AppState,
  viewModel: SearchViewModel,
  toggleAdvanced: () => void,
): HTMLFormElement {
  const form = el('form', { class: 'search-form' });
  const draft = viewModel.draft;

  const dateFields = el('div', { class: 'search-date-range' },
    el('label', { class: 'search-field' },
      el('span', { class: 'search-field__label' }, '開始日期'),
      el('span', { class: 'sheet-input-shell' },
        el('input', {
          class: 'sheet-native-input', type: 'date', name: 'startDate',
          value: draft.startDate, required: true,
        }),
      ),
    ),
    el('label', { class: 'search-field' },
      el('span', { class: 'search-field__label' }, '結束日期'),
      el('span', { class: 'sheet-input-shell' },
        el('input', {
          class: 'sheet-native-input', type: 'date', name: 'endDate',
          value: draft.endDate, required: true,
        }),
      ),
    ),
  );

  const palace = el('select', { class: 'search-select', name: 'palace', required: true },
    option('', '請選擇宮位', draft.palace === ''),
    ...PALACES.map((item) => option(
      item.key,
      item.key === 'center' ? '中' : `${item.name.replace(/宮$/, '')} · ${item.bearing}`,
      draft.palace === item.key,
    )),
  );

  const simpleLevel = el('fieldset', { class: 'search-choice-group' },
    el('legend', { class: 'search-field__label' }, '層級'),
    el('div', { class: 'search-levels' },
      ...SEARCH_LEVELS.map((value) => el('label', {
        class: `search-choice${draft.level === value ? ' is-selected' : ''}`,
      },
      el('input', { type: 'radio', name: 'level', value, checked: draft.level === value }),
      el('span', {}, levelLabel(value)),
      )),
    ),
  );

  const simpleStars = el('fieldset', { class: 'search-choice-group' },
    el('legend', { class: 'search-field__label' }, '飛星'),
    starChoices('star', draft.star ? [draft.star] : [], false),
  );

  const advanced = el('section', {
    class: 'search-advanced', id: 'search-advanced-fields', 'aria-label': '進階多層條件',
  },
    el('p', { class: 'search-advanced__rule' },
      '同層選多星代表任一符合；跨層條件必須同時成立。'),
    ...SEARCH_LEVELS.map((searchLevel) => el('fieldset', {
      class: 'search-choice-group search-advanced__level',
      'data-condition-level': searchLevel,
    },
    el('legend', { class: 'search-field__label' }, `流${levelLabel(searchLevel)}`),
    starChoices(`${searchLevel}Stars`, draft.advancedStars[searchLevel], true),
    )),
  );

  form.append(
    dateFields,
    el('label', { class: 'search-field' },
      el('span', { class: 'search-field__label' }, '宮位'),
      palace,
    ),
    draft.mode === 'simple' ? simpleLevel : advanced,
  );
  if (draft.mode === 'simple') form.append(simpleStars);
  if (viewModel.error) {
    form.append(el('p', { class: 'search-form__error', role: 'alert' }, viewModel.error));
  }
  form.append(el('button', {
    class: 'btn btn--primary search-form__submit', type: 'submit',
    disabled: viewModel.searching,
  }, viewModel.searching ? '尋星中…' : '開始尋星'));
  form.append(el('button', {
    class: 'search-advanced-toggle',
    type: 'button',
    disabled: viewModel.searching,
    'aria-expanded': String(draft.mode === 'advanced'),
    'aria-controls': 'search-advanced-fields',
    onclick: toggleAdvanced,
  }, draft.mode === 'advanced' ? '− 收起進階條件' : '＋ 進階條件'));
  if (viewModel.searching) {
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
      .forEach((control) => { control.disabled = true; });
  }

  form.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    if (input.name === 'startDate') draft.startDate = input.value;
    if (input.name === 'endDate') draft.endDate = input.value;
    if (input.name === 'palace') draft.palace = input.value;
    if (input.name === 'level') draft.level = input.value as SearchLevel;
    if (input.name === 'star') draft.star = input.value;
    for (const searchLevel of SEARCH_LEVELS) {
      if (input.name !== `${searchLevel}Stars`) continue;
      draft.advancedStars[searchLevel] = Array.from(
        form.querySelectorAll<HTMLInputElement>(`input[name="${searchLevel}Stars"]:checked`),
      ).map((item) => item.value).sort((a, b) => Number(a) - Number(b));
    }
    if (input.name === 'level' || input.name === 'star') {
      const group = input.closest('fieldset');
      group?.querySelectorAll('label').forEach((label) => {
        label.classList.toggle('is-selected', label.contains(input));
      });
    } else if (input instanceof HTMLInputElement && input.type === 'checkbox') {
      input.closest('label')?.classList.toggle('is-selected', input.checked);
    }
    setSimpleSearchUrlState(simpleUrlState(draft));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nextDraft: SearchDraft = {
      mode: draft.mode,
      startDate: String(data.get('startDate') ?? ''),
      endDate: String(data.get('endDate') ?? ''),
      palace: String(data.get('palace') ?? ''),
      level: String(data.get('level') ?? draft.level) as SearchLevel,
      star: String(data.get('star') ?? draft.star),
      advancedStars: {
        day: draft.mode === 'advanced'
          ? sortStarValues(data.getAll('dayStars').map(String)) : draft.advancedStars.day,
        hour: draft.mode === 'advanced'
          ? sortStarValues(data.getAll('hourStars').map(String)) : draft.advancedStars.hour,
        ke: draft.mode === 'advanced'
          ? sortStarValues(data.getAll('keStars').map(String)) : draft.advancedStars.ke,
      },
    };
    setSimpleSearchUrlState(simpleUrlState(nextDraft));
    let query: StarSearchQuery;
    try {
      if (!nextDraft.palace) throw new RangeError('請選擇宮位');
      const conditions = nextDraft.mode === 'simple'
        ? nextDraft.star
          ? [{ level: nextDraft.level, stars: [asStarNumber(Number(nextDraft.star))] }]
          : []
        : SEARCH_LEVELS.flatMap((searchLevel) => {
          const values = nextDraft.advancedStars[searchLevel];
          return values.length > 0 ? [{
            level: searchLevel,
            stars: values.map((value) => asStarNumber(Number(value))),
          }] : [];
        });
      if (conditions.length === 0) throw new RangeError(
        nextDraft.mode === 'simple' ? '請選擇飛星' : '請至少設定一個層級條件',
      );
      query = {
        version: 1,
        startDate: nextDraft.startDate,
        endDate: nextDraft.endDate,
        palace: nextDraft.palace as PalaceKey,
        conditions,
      };
      const range = parseCandidateRange(query.startDate, query.endDate);
      const rangeDays = Math.floor(
        (range.endInclusive.getTime() - range.start.getTime()) / MS_PER_DAY,
      ) + 1;
      if (rangeDays > 366) throw new RangeError('第一版每次最多搜尋一年（366 日）');
      const options = {
        dayChangeMode: state.settings.dayChangeMode,
        yearBoundary: state.settings.yearBoundary,
        keStrategyId: state.settings.keStrategyId,
      };
      const runId = ++searchRunId;
      model = { draft: nextDraft, query, searching: true };
      setView('search');
      window.setTimeout(() => {
        if (runId !== searchRunId) return;
        try {
          const matches = searchStars(query, options);
          model = { draft: nextDraft, query, matches };
        } catch (error) {
          model = {
            draft: nextDraft,
            error: error instanceof Error ? error.message : '搜尋失敗，請檢查條件。',
          };
        }
        if (getState().view === 'search') setView('search');
      }, 0);
      return;
    } catch (error) {
      model = {
        draft: nextDraft,
        error: error instanceof Error ? error.message : '搜尋失敗，請檢查條件。',
      };
    }
    setView('search');
  });

  return form;
}

export function SearchView(state: AppState): HTMLElement {
  if (!model || appliedSearchRestoreVersion !== state.searchRestoreVersion) {
    model = defaults(state);
    appliedSearchRestoreVersion = state.searchRestoreVersion;
  }
  const mode = model.draft.mode;
  const switchMode = (nextMode: SearchMode) => {
    searchRunId += 1;
    const nextDraft = { ...model!.draft, mode: nextMode };
    model = { draft: nextDraft };
    setSimpleSearchUrlState(simpleUrlState(nextDraft));
    setView('search');
  };
  return el('main', { class: 'search-view', 'aria-busy': String(Boolean(model.searching)) },
    el('header', { class: 'search-view__head' },
      el('h1', {}, '尋星'),
      el('p', {}, mode === 'simple'
        ? '選擇宮位、層級與飛星，找出指定日期內所有符合的時間。'
        : '可同時指定多個層級；同層選多星代表任一符合，跨層條件必須同時成立。'),
    ),
    SearchForm(state, model, () => switchMode(mode === 'simple' ? 'advanced' : 'simple')),
    model.searching
      ? el('div', { class: 'search-status', role: 'status', 'aria-live': 'polite' },
        el('span', { class: 'search-status__mark', 'aria-hidden': 'true' }),
        el('span', {}, '正在裝置內計算，請稍候…'),
      )
      : null,
    model.query && model.matches ? SearchResults(model.query, model.matches) : null,
  );
}
