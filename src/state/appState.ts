/**
 * AppState（規劃書 §32–33）。
 *
 * 選中狀態集中在此，不散落 DOM。
 * `selectedDateTime` 是唯一真實來源：年／月／日／時／刻全部由它推導，
 * 因此 URL 只需帶時間點與層級即可完整還原盤面。
 */

import { formatUtc8Date, formatUtc8Time, nowUtc8, parseUtc8 } from '../engine/time/utc8';
import { loadSettings, saveSettings, type Settings } from './settings';

export type Level = 'year' | 'month' | 'day' | 'hour' | 'ke';

export const LEVELS: readonly Level[] = ['year', 'month', 'day', 'hour', 'ke'];

export const LEVEL_LABEL: Record<Level, string> = {
  year: '年', month: '月', day: '日', hour: '時', ke: '刻',
};

export interface AppState {
  selectedDateTime: Date;
  level: Level;
  settings: Settings;
  /** true 時才會由背景 timer 持續更新 nowUtc8。 */
  followNow: boolean;
  /** 舊版首頁相容標記；V2 Phase 2 起不再 render landing。 */
  home: boolean;
}

type Listener = (s: AppState) => void;

const listeners = new Set<Listener>();

const state: AppState = {
  selectedDateTime: nowUtc8(),
  level: 'hour',
  settings: loadSettings(),
  followNow: true,
  home: true,
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
  state.followNow = opts.followNow ?? false;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setLevel(level: Level, opts: { push?: boolean } = {}): void {
  state.level = level;
  state.home = false;
  syncUrl(opts.push);
  emit();
}

export function setDateTimeAndLevel(d: Date, level: Level): void {
  state.selectedDateTime = d;
  state.level = level;
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
  state.followNow = true;
}

export function goHome(): void {
  state.selectedDateTime = nowUtc8();
  state.level = 'hour';
  state.followNow = true;
  state.home = true;
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

/* ------------------------------------------------------------------ */
/* URL 同步（可分享、可 bookmark、刷新不丟失）                          */
/* ------------------------------------------------------------------ */

function syncUrl(push = false): void {
  const p = new URLSearchParams();
  p.set('t', `${formatUtc8Date(state.selectedDateTime)}T${formatUtc8Time(state.selectedDateTime)}`);
  p.set('level', state.level);
  const url = `${location.pathname}?${p.toString()}`;
  try {
    if (push) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  } catch {
    /* 沙箱 iframe 等環境不允許改寫 URL；不影響排盤 */
  }
}

/** 由 URL 還原狀態。回傳是否成功還原。 */
export function restoreFromUrl(): boolean {
  const p = new URLSearchParams(location.search);
  const t = p.get('t');
  const level = p.get('level') as Level | null;
  const d = t ? parseUtc8(t) : null;
  if (!d) return false;
  state.selectedDateTime = d;
  if (level && LEVELS.includes(level)) state.level = level;
  state.followNow = false;
  state.home = false;
  return true;
}

window.addEventListener('popstate', () => {
  if (!restoreFromUrl()) {
    state.home = true;
    migrateLegacyHome();
  }
  emit();
});
