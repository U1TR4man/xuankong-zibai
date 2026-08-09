import { STAR_NAMES } from '../engine/flyingStar/types';
import { addDays, formatUtc8Date, MS_PER_DAY, nowUtc8 } from '../engine/time/utc8';
import { asStarNumber } from '../overlay/types';
import { parseCandidateRange } from '../search/candidateIterator';
import {
  searchPairOccurrences, type PairSearchMatch, type PairSearchQuery,
} from '../selection/searchPairOccurrences';
import { PURPOSE_OPTIONS } from '../selection/purpose';
import {
  PAIR_LAYERS, type PairLayer, type SelectionPurpose,
} from '../selection/types';
import { getState, setView, type AppState } from '../state/appState';
import { el } from './dom';
import { PairSearchResults } from './PairSearchResults';

type RangePreset = 'today' | '7days' | '30days' | 'custom';

interface PairSearchDraft {
  searchBy: 'pair' | 'purpose';
  purpose: SelectionPurpose;
  rangePreset: RangePreset;
  startDate: string;
  endDate: string;
  firstStar: string;
  secondStar: string;
  ordered: boolean;
  layers: PairLayer[];
}

interface PairSearchModel {
  draft: PairSearchDraft;
  query?: PairSearchQuery;
  matches?: PairSearchMatch[];
  error?: string;
  searching?: boolean;
}

let pairModel: PairSearchModel | undefined;
let pairSearchRunId = 0;

function defaults(): PairSearchModel {
  const today = nowUtc8();
  return {
    draft: {
      searchBy: 'pair',
      purpose: 'writing',
      rangePreset: '7days',
      startDate: formatUtc8Date(today),
      endDate: formatUtc8Date(addDays(today, 6)),
      firstStar: '1',
      secondStar: '4',
      ordered: true,
      layers: PAIR_LAYERS.map((layer) => layer.key),
    },
  };
}

function option(value: string, label: string, selected: boolean): HTMLOptionElement {
  return el('option', { value, selected }, label);
}

function starSelect(name: string, selected: string, label: string): HTMLElement {
  return el('label', { class: 'search-field pair-search-form__star' },
    el('span', { class: 'search-field__label' }, label),
    el('select', { class: 'search-select', name },
      ...Array.from({ length: 9 }, (_, index) => String(index + 1)).map((value) => option(
        value, `${value} · ${STAR_NAMES[Number(value)]}`, selected === value,
      )),
    ),
  );
}

function applyPreset(form: HTMLFormElement, draft: PairSearchDraft, preset: RangePreset): void {
  if (preset === 'custom') return;
  const today = nowUtc8();
  const days = preset === 'today' ? 0 : preset === '7days' ? 6 : 29;
  draft.startDate = formatUtc8Date(today);
  draft.endDate = formatUtc8Date(addDays(today, days));
  form.querySelector<HTMLInputElement>('input[name="pairStartDate"]')!.value = draft.startDate;
  form.querySelector<HTMLInputElement>('input[name="pairEndDate"]')!.value = draft.endDate;
}

function PairSearchForm(state: AppState, model: PairSearchModel): HTMLFormElement {
  const draft = model.draft;
  const form = el('form', { class: 'search-form pair-search-form' });
  const rangePreset = el('select', { class: 'search-select', name: 'pairRangePreset' },
    option('today', '今天', draft.rangePreset === 'today'),
    option('7days', '未來 7 日（含今天）', draft.rangePreset === '7days'),
    option('30days', '未來 30 日（含今天）', draft.rangePreset === '30days'),
    option('custom', '自訂日期', draft.rangePreset === 'custom'),
  );
  const searchBy = el('fieldset', { class: 'search-choice-group' },
    el('legend', { class: 'search-field__label' }, '搜尋方式'),
    el('div', { class: 'search-levels pair-search-form__kind' },
      el('label', { class: `search-choice${draft.searchBy === 'pair' ? ' is-selected' : ''}` },
        el('input', {
          type: 'radio', name: 'pairSearchBy', value: 'pair', checked: draft.searchBy === 'pair',
        }),
        el('span', {}, '指定雙星')),
      el('label', { class: `search-choice${draft.searchBy === 'purpose' ? ' is-selected' : ''}` },
        el('input', {
          type: 'radio', name: 'pairSearchBy', value: 'purpose', checked: draft.searchBy === 'purpose',
        }),
        el('span', {}, '用途參考')),
    ),
  );
  const pairCriteria = [
    el('div', { class: 'pair-search-form__stars' },
      starSelect('firstStar', draft.firstStar, '第一星'),
      starSelect('secondStar', draft.secondStar, '第二星')),
    el('fieldset', { class: 'search-choice-group' },
      el('legend', { class: 'search-field__label' }, '次序'),
      el('div', { class: 'search-levels pair-search-form__order' },
        el('label', { class: `search-choice${draft.ordered ? ' is-selected' : ''}` },
          el('input', { type: 'radio', name: 'pairOrder', value: 'ordered', checked: draft.ordered }),
          el('span', {}, `指定次序：${draft.firstStar}${draft.secondStar}`)),
        el('label', { class: `search-choice${!draft.ordered ? ' is-selected' : ''}` },
          el('input', { type: 'radio', name: 'pairOrder', value: 'unordered', checked: !draft.ordered }),
          el('span', {}, `不分次序：${draft.firstStar}${draft.secondStar}／${draft.secondStar}${draft.firstStar}`)),
      ),
    ),
    el('p', { class: 'pair-search-form__convention' },
      '有序搜尋以較慢層為第一碼、較快層為第二碼；這是本工具的時間疊盤 convention。'),
  ];
  const purposeCriteria = el('label', { class: 'search-field' },
    el('span', { class: 'search-field__label' }, '用途'),
    el('select', { class: 'search-select', name: 'pairPurpose' },
      ...PURPOSE_OPTIONS.filter((purpose) => purpose.value !== 'general').map((purpose) => option(
        purpose.value, purpose.label, draft.purpose === purpose.value,
      )),
    ),
  );
  form.append(
    searchBy,
    el('label', { class: 'search-field' },
      el('span', { class: 'search-field__label' }, '日期範圍'), rangePreset),
    el('div', { class: 'search-date-range' },
      el('label', { class: 'search-field' },
        el('span', { class: 'search-field__label' }, '開始日期'),
        el('span', { class: 'sheet-input-shell' }, el('input', {
          class: 'sheet-native-input', type: 'date', name: 'pairStartDate',
          value: draft.startDate, required: true,
        })),
      ),
      el('label', { class: 'search-field' },
        el('span', { class: 'search-field__label' }, '結束日期'),
        el('span', { class: 'sheet-input-shell' }, el('input', {
          class: 'sheet-native-input', type: 'date', name: 'pairEndDate',
          value: draft.endDate, required: true,
        })),
      ),
    ),
    ...(draft.searchBy === 'pair' ? pairCriteria : [purposeCriteria]),
    el('fieldset', { class: 'search-choice-group pair-search-form__layers' },
      el('legend', { class: 'search-field__label' }, 'Pair Layer'),
      el('div', { class: 'pair-layer-choices' }, ...PAIR_LAYERS.map((layer) => {
        const checked = draft.layers.includes(layer.key);
        return el('label', { class: `pair-layer-choice${checked ? ' is-selected' : ''}` },
          el('input', { type: 'checkbox', name: 'pairLayers', value: layer.key, checked }),
          el('span', {}, `${layer.label} · ${layer.key}`));
      })),
    ),
  );
  if (model.error) form.append(el('p', { class: 'search-form__error', role: 'alert' }, model.error));
  form.append(el('button', {
    class: 'btn btn--primary pair-search-form__submit', type: 'submit', disabled: model.searching,
  }, model.searching
    ? draft.searchBy === 'purpose' ? '尋用途參考中…' : '尋組合中…'
    : draft.searchBy === 'purpose' ? '開始尋用途參考' : '開始尋組合'));

  if (model.searching) form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
    .forEach((control) => { control.disabled = true; });

  form.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    if (input.name === 'pairSearchBy') {
      draft.searchBy = input.value as PairSearchDraft['searchBy'];
      pairModel = { draft: { ...draft, layers: [...draft.layers] } };
      setView('search');
      return;
    }
    if (input.name === 'pairPurpose') draft.purpose = input.value as SelectionPurpose;
    if (input.name === 'pairRangePreset') {
      draft.rangePreset = input.value as RangePreset;
      applyPreset(form, draft, draft.rangePreset);
    }
    if (input.name === 'pairStartDate') { draft.startDate = input.value; draft.rangePreset = 'custom'; }
    if (input.name === 'pairEndDate') { draft.endDate = input.value; draft.rangePreset = 'custom'; }
    if (input.name === 'firstStar') draft.firstStar = input.value;
    if (input.name === 'secondStar') draft.secondStar = input.value;
    if (input.name === 'pairOrder') draft.ordered = input.value === 'ordered';
    if (input instanceof HTMLInputElement && input.name === 'pairLayers') {
      draft.layers = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="pairLayers"]:checked'))
        .map((item) => item.value as PairLayer);
      input.closest('label')?.classList.toggle('is-selected', input.checked);
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nextDraft: PairSearchDraft = {
      searchBy: String(data.get('pairSearchBy') ?? draft.searchBy) as PairSearchDraft['searchBy'],
      purpose: String(data.get('pairPurpose') ?? draft.purpose) as SelectionPurpose,
      rangePreset: String(data.get('pairRangePreset') ?? draft.rangePreset) as RangePreset,
      startDate: String(data.get('pairStartDate') ?? ''),
      endDate: String(data.get('pairEndDate') ?? ''),
      firstStar: String(data.get('firstStar') ?? draft.firstStar),
      secondStar: String(data.get('secondStar') ?? draft.secondStar),
      ordered: data.get('pairOrder') !== 'unordered',
      layers: data.getAll('pairLayers').map((value) => String(value) as PairLayer),
    };
    try {
      const query: PairSearchQuery = {
        version: 1,
        startDate: nextDraft.startDate,
        endDate: nextDraft.endDate,
        firstStar: asStarNumber(Number(nextDraft.firstStar)),
        secondStar: asStarNumber(Number(nextDraft.secondStar)),
        ordered: nextDraft.ordered,
        layers: nextDraft.layers,
        purpose: nextDraft.searchBy === 'purpose' ? nextDraft.purpose : undefined,
      };
      const range = parseCandidateRange(query.startDate, query.endDate);
      const rangeDays = Math.floor(
        (range.endInclusive.getTime() - range.start.getTime()) / MS_PER_DAY,
      ) + 1;
      if (rangeDays > 366) throw new RangeError('第一版每次最多搜尋一年（366 日）');
      if (query.layers.length === 0) throw new RangeError('請至少選擇一個 Pair Layer');
      const options = {
        dayChangeMode: state.settings.dayChangeMode,
        yearBoundary: state.settings.yearBoundary,
        keStrategyId: state.settings.keStrategyId,
      };
      const runId = ++pairSearchRunId;
      pairModel = { draft: nextDraft, query, searching: true };
      setView('search');
      window.setTimeout(() => {
        if (runId !== pairSearchRunId) return;
        try {
          pairModel = { draft: nextDraft, query, matches: searchPairOccurrences(query, options) };
        } catch (error) {
          pairModel = {
            draft: nextDraft,
            error: error instanceof Error ? error.message : '尋組合失敗，請檢查條件。',
          };
        }
        if (getState().view === 'search') setView('search');
      }, 0);
      return;
    } catch (error) {
      pairModel = {
        draft: nextDraft,
        error: error instanceof Error ? error.message : '尋組合失敗，請檢查條件。',
      };
    }
    setView('search');
  });
  return form;
}

export function cancelPairSearch(): void {
  pairSearchRunId += 1;
}

export function PairSearchView(state: AppState): HTMLElement {
  pairModel ??= defaults();
  return el('section', { class: 'pair-search-view', 'aria-busy': String(Boolean(pairModel.searching)) },
    PairSearchForm(state, pairModel),
    pairModel.searching
      ? el('div', { class: 'search-status pair-search-status', role: 'status', 'aria-live': 'polite' },
        el('span', { class: 'search-status__mark', 'aria-hidden': 'true' }),
        el('span', {}, '正在裝置內尋找雙星組合，請稍候…'))
      : null,
    pairModel.query && pairModel.matches
      ? PairSearchResults(pairModel.query, pairModel.matches)
      : null,
  );
}
