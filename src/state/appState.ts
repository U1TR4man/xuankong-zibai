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
  /** 是否顯示首頁（尚未排盤） */
  home: boolean;
}

type Listener = (s: AppState) => void;

const listeners = new Set<Listener>();

const state: AppState = {
  selectedDateTime: nowUtc8(),
  level: 'day',
  settings: loadSettings(),
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

export function setDateTime(d: Date, opts: { push?: boolean } = {}): void {
  state.selectedDateTime = d;
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
  state.home = false;
  syncUrl(true);
  emit();
}

export function goHome(): void {
  state.home = true;
  try {
    history.pushState(null, '', location.pathname);
  } catch { /* 同上 */ }
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
  state.home = false;
  return true;
}

window.addEventListener('popstate', () => {
  if (!restoreFromUrl()) state.home = true;
  emit();
});
