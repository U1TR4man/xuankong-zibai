import { PALACES, STAR_NAMES, type PalaceKey } from '../engine/flyingStar/types';
import { addDays, formatUtc8Date, MS_PER_DAY, nowUtc8 } from '../engine/time/utc8';
import { asStarNumber } from '../overlay/types';
import { parseCandidateRange } from '../search/candidateIterator';
import { searchStars } from '../search/StarSearchEngine';
import type { SearchLevel, SearchMatch, StarSearchQuery } from '../search/types';
import { getState, setView, type AppState } from '../state/appState';
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

const SEARCH_LEVELS: readonly SearchLevel[] = ['day', 'hour', 'ke'];

function levelLabel(level: SearchLevel): string {
  return level === 'day' ? '日' : level === 'hour' ? '時' : '刻';
}

function defaults(): SearchViewModel {
  const today = nowUtc8();
  return {
    draft: {
      mode: 'simple',
      startDate: formatUtc8Date(today),
      endDate: formatUtc8Date(addDays(today, 30)),
      palace: '',
      level: 'hour',
      star: '',
      advancedStars: { day: [], hour: [], ke: [] },
    },
  };
}

function starChoices(
  name: string,
  selected: readonly string[],
  multiple: boolean,
): HTMLElement {
  return el('div', { class: 'search-stars' },
    ...Array.from({ length: 9 }, (_, index) => {
      const value = String(index + 1);
      const checked = selected.includes(value);
      return el('label', { class: `search-star${checked ? ' is-selected' : ''}` },
        el('input', { type: multiple ? 'checkbox' : 'radio', name, value, checked }),
        el('span', {}, STAR_NAMES[index + 1]!),
      );
    }),
  );
}

function option(value: string, label: string, selected: boolean): HTMLOptionElement {
  return el('option', { value, selected }, label);
}

function SearchForm(state: AppState, viewModel: SearchViewModel): HTMLFormElement {
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

  const advanced = el('section', { class: 'search-advanced', 'aria-label': '進階多層條件' },
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
  }, viewModel.searching ? '搜尋中…' : '尋找'));
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
      ).map((item) => item.value);
    }
    if (input.name === 'level' || input.name === 'star') {
      const group = input.closest('fieldset');
      group?.querySelectorAll('label').forEach((label) => {
        label.classList.toggle('is-selected', label.contains(input));
      });
    } else if (input instanceof HTMLInputElement && input.type === 'checkbox') {
      input.closest('label')?.classList.toggle('is-selected', input.checked);
    }
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
        day: draft.mode === 'advanced' ? data.getAll('dayStars').map(String) : draft.advancedStars.day,
        hour: draft.mode === 'advanced' ? data.getAll('hourStars').map(String) : draft.advancedStars.hour,
        ke: draft.mode === 'advanced' ? data.getAll('keStars').map(String) : draft.advancedStars.ke,
      },
    };
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
  model ??= defaults();
  const mode = model.draft.mode;
  const switchMode = (nextMode: SearchMode) => {
    searchRunId += 1;
    model = { draft: { ...model!.draft, mode: nextMode } };
    setView('search');
  };
  return el('main', { class: 'search-view', 'aria-busy': String(Boolean(model.searching)) },
    el('header', { class: 'search-view__head' },
      el('p', { class: 'search-view__eyebrow' }, `尋星 · ${mode === 'simple' ? '簡易' : '進階'}`),
      el('h1', {}, '尋找宮內飛星'),
      el('p', {}, mode === 'simple'
        ? '選擇宮位、層級與飛星，找出指定日期內所有符合的時間。'
        : '可同時指定多個層級；同層選多星代表任一符合，跨層條件必須同時成立。'),
    ),
    el('div', { class: 'search-mode', role: 'group', 'aria-label': '搜尋模式' },
      el('button', {
        class: `search-mode__item${mode === 'simple' ? ' is-active' : ''}`,
        type: 'button', 'aria-pressed': String(mode === 'simple'),
        onclick: () => switchMode('simple'),
      }, '簡易'),
      el('button', {
        class: `search-mode__item${mode === 'advanced' ? ' is-active' : ''}`,
        type: 'button', 'aria-pressed': String(mode === 'advanced'),
        onclick: () => switchMode('advanced'),
      }, '進階'),
    ),
    SearchForm(state, model),
    model.searching
      ? el('div', { class: 'search-status', role: 'status', 'aria-live': 'polite' },
        el('span', { class: 'search-status__mark', 'aria-hidden': 'true' }),
        el('span', {}, '正在裝置內計算，請稍候…'),
      )
      : null,
    model.query && model.matches ? SearchResults(model.query, model.matches) : null,
  );
}
