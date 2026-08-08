/**
 * AppState（規劃書 §32–33）。
 *
 * 選中狀態集中在此，不散落 DOM。
 * `selectedDateTime` 是唯一真實來源：年／月／日／時／刻全部由它推導，
 * 因此 URL 只需帶時間點與層級即可完整還原盤面。
 */

import { formatUtc8Date, formatUtc8Time, nowUtc8, parseUtc8 } from '../engine/time/utc8';
import { PALACE_KEYS, type PalaceKey } from '../engine/flyingStar/types';
import type { PairKey, PairLayer, SelectionPurpose } from '../selection/types';
import { loadSettings, saveSettings, type Settings } from './settings';

export type Level = 'year' | 'month' | 'day' | 'hour' | 'ke';
export type AppView = 'chart' | 'search';
export type SearchPrecision = 'day' | 'hour' | 'ke';
export type ChartMode = 'plain' | 'overlay' | 'selection';

export const LEVELS: readonly Level[] = ['year', 'month', 'day', 'hour', 'ke'];

export const LEVEL_LABEL: Record<Level, string> = {
  year: '年', month: '月', day: '日', hour: '時', ke: '刻',
};

const SEARCH_PRECISIONS: readonly SearchPrecision[] = ['day', 'hour', 'ke'];
const SELECTION_PURPOSES: readonly SelectionPurpose[] = [
  'general', 'writing', 'wealth', 'negotiation', 'fame', 'celebration', 'travel',
];
const PAIR_LAYERS: readonly PairLayer[] = ['YM', 'YD', 'YH', 'MD', 'MH', 'DH'];

/** 第一輪只序列化 A 類簡易尋星；進階條件仍留在頁面生命週期內。 */
export interface SimpleSearchUrlState {
  from: string;
  to: string;
  searchPalace: PalaceKey;
  precision: SearchPrecision;
  star: number;
}

export interface AppState {
  view: AppView;
  selectedDateTime: Date;
  level: Level;
  settings: Settings;
  /** true 時才會由背景 timer 持續更新 nowUtc8。 */
  followNow: boolean;
  /** 舊版首頁相容標記；V2 Phase 2 起不再 render landing。 */
  home: boolean;
  /** 疊盤只改變資訊呈現，不建立另一份盤面 truth source。 */
  overlayMode: boolean;
  /** 擇吉只消費正式年月日時盤，不建立另一份飛星計算。 */
  selectionMode: boolean;
  selectionPurpose: SelectionPurpose;
  selectedPalace?: PalaceKey;
  /** 尋組合跳盤時只供 UI 高亮；時間／模式／方向改變即清除。 */
  selectedPair?: PairKey;
  selectedPairLayer?: PairLayer;
  /** 疊盤的大字主顯示層；目前主畫面不另設控制，跟隨 `level`。 */
  overlayPrimaryLevel: Level;
  /** Search → Chart 時命中的層，只供 selected palace 的輕量 UI 標示。 */
  searchMatchedLevels: Level[];
  simpleSearch?: SimpleSearchUrlState;
  /** 只在 URL restore 時遞增，讓 SearchView 可辨識 refresh／back。 */
  searchRestoreVersion: number;
}

type Listener = (s: AppState) => void;

const listeners = new Set<Listener>();

const state: AppState = {
  view: 'chart',
  selectedDateTime: nowUtc8(),
  level: 'hour',
  settings: loadSettings(),
  followNow: true,
  home: true,
  overlayMode: false,
  selectionMode: false,
  selectionPurpose: 'general',
  selectedPalace: undefined,
  selectedPair: undefined,
  selectedPairLayer: undefined,
  overlayPrimaryLevel: 'hour',
  searchMatchedLevels: [],
  simpleSearch: undefined,
  searchRestoreVersion: 0,
};

export function getState(): AppState {
  return state;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(): void {
  for (const fn of listeners) fn(state);
}

export function setDateTime(
  d: Date,
  opts: { push?: boolean; followNow?: boolean } = {},
): void {
  state.selectedDateTime = d;
  state.searchMatchedLevels = [];
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.followNow = opts.followNow ?? false;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setLevel(level: Level, opts: { push?: boolean } = {}): void {
  state.level = level;
  state.overlayPrimaryLevel = level;
  state.searchMatchedLevels = [];
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setDateTimeAndLevel(d: Date, level: Level): void {
  state.view = 'chart';
  state.selectedDateTime = d;
  state.level = level;
  state.overlayPrimaryLevel = level;
  state.searchMatchedLevels = [];
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.followNow = false;
  state.home = false;
  syncUrl(true);
  emit();
}

/**
 * Phase 2 過渡：舊版以 `home=true` 表示尚未排盤；V2 不再顯示 landing，
 * 而是把這個舊狀態正規化成「現在的流時盤」。先保留欄位，避免一次破壞舊流程。
 */
export function migrateLegacyHome(): void {
  if (!state.home) return;
  state.selectedDateTime = nowUtc8();
  state.level = 'hour';
  state.overlayPrimaryLevel = 'hour';
  state.followNow = true;
}

export function goHome(): void {
  state.view = 'chart';
  state.selectedDateTime = nowUtc8();
  state.level = 'hour';
  state.followNow = true;
  state.home = true;
  state.overlayMode = false;
  state.selectionMode = false;
  state.selectionPurpose = 'general';
  state.selectedPalace = undefined;
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.overlayPrimaryLevel = 'hour';
  state.searchMatchedLevels = [];
  try {
    history.pushState(null, '', location.pathname);
  } catch { /* 同上 */ }
  emit();
}

export function returnToNow(): void {
  setDateTime(nowUtc8(), { followNow: true });
}

/** App 開著跨分鐘／刻／時辰時，只更新仍在 follow-now 的使用者。 */
export function refreshFollowedNow(): void {
  if (!state.followNow) return;
  state.selectedDateTime = nowUtc8();
  if (!state.home) syncUrl();
  emit();
}

export function updateSettings(patch: Partial<Settings>): void {
  Object.assign(state.settings, patch);
  saveSettings(state.settings);
  emit();
}

export function setView(view: AppView, opts: { push?: boolean } = {}): void {
  state.view = view;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

/** 更新簡易尋星 URL，不觸發整頁重繪，避免輸入欄位失去焦點。 */
export function setSimpleSearchUrlState(value: SimpleSearchUrlState | undefined): void {
  state.simpleSearch = value;
  if (state.view === 'search') syncUrl();
}

/** Search → Chart 的單一 transition；盤面會由 app.ts 使用正式 Engine 重新計算。 */
export function showOverlayChart(
  d: Date,
  level: Level,
  palace: PalaceKey,
  matchedLevels: readonly Level[] = [level],
): void {
  state.view = 'chart';
  state.selectedDateTime = d;
  state.level = level;
  state.overlayMode = true;
  state.selectionMode = false;
  state.overlayPrimaryLevel = level;
  state.selectedPalace = palace;
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.searchMatchedLevels = [...matchedLevels];
  state.followNow = false;
  state.home = false;
  syncUrl(true);
  emit();
}

/** 尋組合 → 擇吉盤的單一 transition；app.ts 仍會以正式 Engine 重算。 */
export function showSelectionChart(
  d: Date,
  palace: Exclude<PalaceKey, 'center'>,
  pair: PairKey,
  layer: PairLayer,
): void {
  state.view = 'chart';
  state.selectedDateTime = d;
  state.level = 'hour';
  state.overlayPrimaryLevel = 'hour';
  state.overlayMode = false;
  state.selectionMode = true;
  state.selectedPalace = palace;
  state.selectedPair = pair;
  state.selectedPairLayer = layer;
  state.searchMatchedLevels = [];
  state.followNow = false;
  state.home = false;
  syncUrl(true);
  emit();
}

export function setOverlayMode(enabled: boolean, opts: { push?: boolean } = {}): void {
  if (enabled && !state.overlayMode) state.overlayPrimaryLevel = state.level;
  state.overlayMode = enabled;
  if (enabled) state.selectionMode = false;
  if (!enabled) state.selectedPalace = undefined;
  if (!enabled) state.searchMatchedLevels = [];
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setSelectionMode(enabled: boolean, opts: { push?: boolean } = {}): void {
  state.selectionMode = enabled;
  if (enabled) {
    state.overlayMode = false;
    state.searchMatchedLevels = [];
  } else {
    state.selectedPalace = undefined;
  }
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setChartMode(mode: ChartMode, opts: { push?: boolean } = {}): void {
  if (mode === 'overlay') {
    setOverlayMode(true, opts);
    return;
  }
  if (mode === 'selection') {
    setSelectionMode(true, opts);
    return;
  }
  state.overlayMode = false;
  state.selectionMode = false;
  state.selectedPalace = undefined;
  state.searchMatchedLevels = [];
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setSelectionPurpose(purpose: SelectionPurpose): void {
  state.selectionPurpose = purpose;
  state.selectedPair = undefined;
  state.selectedPairLayer = undefined;
  syncUrl();
  emit();
}

export function setOverlayPrimaryLevel(level: Level, opts: { push?: boolean } = {}): void {
  state.overlayPrimaryLevel = level;
  syncUrl(opts.push);
  emit();
}

export function selectPalace(palace: PalaceKey | undefined, opts: { push?: boolean } = {}): void {
  if (palace !== state.selectedPalace) {
    state.searchMatchedLevels = [];
    state.selectedPair = undefined;
    state.selectedPairLayer = undefined;
  }
  state.selectedPalace = palace;
  syncUrl(opts.push);
  emit();
}

/* ------------------------------------------------------------------ */
/* URL 同步（可分享、可 bookmark、刷新不丟失）                          */
/* ------------------------------------------------------------------ */

function syncUrl(push = false): void {
  const p = new URLSearchParams();
  p.set('t', `${formatUtc8Date(state.selectedDateTime)}T${formatUtc8Time(state.selectedDateTime)}`);
  p.set('view', state.view);
  if (state.view === 'search') {
    appendSimpleSearchUrlState(p, state.simpleSearch);
  } else {
    p.set('level', state.level);
    if (state.selectionMode) {
      p.set('selection', '1');
      if (state.selectionPurpose !== 'general') p.set('purpose', state.selectionPurpose);
      if (state.selectedPalace) p.set('selectedPalace', state.selectedPalace);
      if (state.selectedPair) p.set('selectedPair', state.selectedPair);
      if (state.selectedPairLayer) p.set('selectedPairLayer', state.selectedPairLayer);
    } else if (state.overlayMode) {
      p.set('overlay', '1');
      p.set('overlayPrimary', state.overlayPrimaryLevel);
      if (state.selectedPalace) p.set('selectedPalace', state.selectedPalace);
    }
  }
  const url = `${location.pathname}?${p.toString()}`;
  try {
    if (push) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  } catch {
    /* 沙箱 iframe 等環境不允許改寫 URL；不影響排盤 */
  }
}

export function appendSimpleSearchUrlState(
  params: URLSearchParams,
  value: SimpleSearchUrlState | undefined,
): void {
  if (!value) return;
  params.set('from', value.from);
  params.set('to', value.to);
  params.set('searchPalace', value.searchPalace);
  params.set('precision', value.precision);
  params.set('star', String(value.star));
}

export function parseSimpleSearchUrlState(
  params: URLSearchParams,
): SimpleSearchUrlState | undefined {
  const from = params.get('from');
  const to = params.get('to');
  const searchPalace = params.get('searchPalace') as PalaceKey | null;
  const precision = params.get('precision') as SearchPrecision | null;
  const star = Number(params.get('star'));
  if (!from || !to || !parseUtc8(from) || !parseUtc8(to)) return undefined;
  if (!searchPalace || !PALACE_KEYS.includes(searchPalace)) return undefined;
  if (!precision || !SEARCH_PRECISIONS.includes(precision)) return undefined;
  if (!Number.isInteger(star) || star < 1 || star > 9) return undefined;
  return { from, to, searchPalace, precision, star };
}

/** 由 URL 還原狀態。回傳是否成功還原。 */
export function restoreFromUrl(): boolean {
  const p = new URLSearchParams(location.search);
  const t = p.get('t');
  const d = t ? parseUtc8(t) : null;
  const searchView = p.get('view') === 'search';
  if (!d && !searchView) return false;
  if (d) state.selectedDateTime = d;
  state.view = searchView ? 'search' : 'chart';
  if (searchView) {
    state.simpleSearch = parseSimpleSearchUrlState(p);
    state.searchRestoreVersion += 1;
  } else {
    const level = p.get('level') as Level | null;
    if (level && LEVELS.includes(level)) state.level = level;
    state.overlayPrimaryLevel = state.level;
    state.selectionMode = p.get('selection') === '1';
    state.overlayMode = !state.selectionMode && p.get('overlay') === '1';
    const purpose = p.get('purpose') as SelectionPurpose | null;
    state.selectionPurpose = purpose && SELECTION_PURPOSES.includes(purpose) ? purpose : 'general';
    const palace = (p.get('selectedPalace') ?? p.get('palace')) as PalaceKey | null;
    const validSelectedPalace = palace && PALACE_KEYS.includes(palace)
      && (!state.selectionMode || palace !== 'center');
    state.selectedPalace = (state.overlayMode || state.selectionMode) && validSelectedPalace
      ? palace
      : undefined;
    const selectedPair = p.get('selectedPair');
    state.selectedPair = state.selectionMode && selectedPair && /^[1-9]{2}$/.test(selectedPair)
      ? selectedPair as PairKey
      : undefined;
    const selectedPairLayer = p.get('selectedPairLayer') as PairLayer | null;
    state.selectedPairLayer = state.selectionMode && selectedPairLayer
      && PAIR_LAYERS.includes(selectedPairLayer) ? selectedPairLayer : undefined;
  }
  state.searchMatchedLevels = [];
  state.followNow = false;
  state.home = false;
  syncUrl();
  return true;
}

window.addEventListener('popstate', () => {
  if (!restoreFromUrl()) {
    state.home = true;
    migrateLegacyHome();
  }
  emit();
});
