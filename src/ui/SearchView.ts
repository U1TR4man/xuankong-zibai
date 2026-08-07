import { PALACES, STAR_NAMES, type PalaceKey } from '../engine/flyingStar/types';
import { addDays, formatUtc8Date, nowUtc8 } from '../engine/time/utc8';
import { asStarNumber } from '../overlay/types';
import { searchStars } from '../search/StarSearchEngine';
import type { SearchLevel, SearchMatch, StarSearchQuery } from '../search/types';
import { setView, type AppState } from '../state/appState';
import { el } from './dom';
import { SearchResults } from './SearchResults';

interface SearchDraft {
  startDate: string;
  endDate: string;
  palace: string;
  level: SearchLevel;
  star: string;
}

interface SearchViewModel {
  draft: SearchDraft;
  query?: StarSearchQuery;
  matches?: SearchMatch[];
  error?: string;
}

let model: SearchViewModel | undefined;

function defaults(): SearchViewModel {
  const today = nowUtc8();
  return {
    draft: {
      startDate: formatUtc8Date(today),
      endDate: formatUtc8Date(addDays(today, 30)),
      palace: '',
      level: 'hour',
      star: '',
    },
  };
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

  const level = el('fieldset', { class: 'search-choice-group' },
    el('legend', { class: 'search-field__label' }, '層級'),
    el('div', { class: 'search-levels' },
      ...(['day', 'hour', 'ke'] as const).map((value) => el('label', {
        class: `search-choice${draft.level === value ? ' is-selected' : ''}`,
      },
      el('input', { type: 'radio', name: 'level', value, checked: draft.level === value }),
      el('span', {}, value === 'day' ? '日' : value === 'hour' ? '時' : '刻'),
      )),
    ),
  );

  const stars = el('fieldset', { class: 'search-choice-group' },
    el('legend', { class: 'search-field__label' }, '飛星'),
    el('div', { class: 'search-stars' },
      ...Array.from({ length: 9 }, (_, index) => {
        const value = String(index + 1);
        return el('label', { class: `search-star${draft.star === value ? ' is-selected' : ''}` },
          el('input', { type: 'radio', name: 'star', value, checked: draft.star === value }),
          el('span', {}, STAR_NAMES[index + 1]!),
        );
      }),
    ),
  );

  form.append(
    dateFields,
    el('label', { class: 'search-field' },
      el('span', { class: 'search-field__label' }, '宮位'),
      palace,
    ),
    level,
    stars,
  );
  if (viewModel.error) {
    form.append(el('p', { class: 'search-form__error', role: 'alert' }, viewModel.error));
  }
  form.append(el('button', { class: 'btn btn--primary search-form__submit', type: 'submit' }, '尋找'));

  form.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.name === 'level' || input.name === 'star') {
      const group = input.closest('fieldset');
      group?.querySelectorAll('label').forEach((label) => {
        label.classList.toggle('is-selected', label.contains(input));
      });
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nextDraft: SearchDraft = {
      startDate: String(data.get('startDate') ?? ''),
      endDate: String(data.get('endDate') ?? ''),
      palace: String(data.get('palace') ?? ''),
      level: String(data.get('level') ?? 'hour') as SearchLevel,
      star: String(data.get('star') ?? ''),
    };
    model = { draft: nextDraft };
    try {
      if (!nextDraft.palace || !nextDraft.star) throw new RangeError('請選擇宮位與飛星');
      const query: StarSearchQuery = {
        version: 1,
        startDate: nextDraft.startDate,
        endDate: nextDraft.endDate,
        palace: nextDraft.palace as PalaceKey,
        conditions: [{ level: nextDraft.level, stars: [asStarNumber(Number(nextDraft.star))] }],
      };
      const matches = searchStars(query, {
        dayChangeMode: state.settings.dayChangeMode,
        yearBoundary: state.settings.yearBoundary,
        keStrategyId: state.settings.keStrategyId,
      });
      model = { draft: nextDraft, query, matches };
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
  return el('main', { class: 'search-view' },
    el('header', { class: 'search-view__head' },
      el('p', { class: 'search-view__eyebrow' }, '尋星 · 簡易'),
      el('h1', {}, '尋找宮內飛星'),
      el('p', {}, '選擇宮位、層級與飛星，找出指定日期內所有符合的時間。'),
    ),
    SearchForm(state, model),
    model.query && model.matches ? SearchResults(model.query, model.matches) : null,
  );
}
