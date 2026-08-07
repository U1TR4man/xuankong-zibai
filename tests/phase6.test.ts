/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
const LATER = fromUtc8(2026, 8, 7, 12, 5);
const $ = <T extends Element = Element>(selector: string) => document.querySelector<T>(selector);

function touch(target: Element, type: 'touchstart' | 'touchend', x: number, y: number): void {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'changedTouches', { value: [{ clientX: x, clientY: y }] });
  target.dispatchEvent(event);
}

function swipeLeft(target: Element): void {
  touch(target, 'touchstart', 220, 120);
  touch(target, 'touchend', 100, 120);
}

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/');
  __setNowForTesting(NOW);
  await import('../src/app');
});

describe('Phase 6 polish', () => {
  it('Chart Header 有清楚 hierarchy，導航只保留上一個／下一個', () => {
    expect($('.card__eyebrow')?.textContent).toBe('流時');
    expect($('.card__title')?.textContent).toContain('午時');
    expect($('.card__range')?.textContent).toContain('11:00–12:59');
    expect($('.card__result')?.textContent).toContain('入中');
    expect(document.querySelectorAll('.nav__btn')).toHaveLength(2);
    expect($('.nav__cur')).toBeNull();
  });

  it('主畫面只顯示一個「今」，且 UTC+8 留在設定／選時脈絡', () => {
    expect(document.querySelectorAll('.date-context > .badge--now')).toHaveLength(1);
    expect($('.card__head .badge--now')).toBeNull();
    expect($('.date-context__meta')?.textContent).not.toContain('UTC+8');
    expect($('#app')?.textContent).not.toContain('UTC+8');
  });

  it('層級仍保留 tab 語意', () => {
    expect($('.level-segment')?.getAttribute('role')).toBe('tablist');
    expect(document.querySelectorAll('.level-segment__item[role="tab"]')).toHaveLength(5);
    expect(document.querySelectorAll('.level-segment__item[aria-selected="true"]')).toHaveLength(1);
    expect($('.level-segment__item[aria-selected="true"]')?.getAttribute('tabindex')).toBe('0');
    expect(document.querySelectorAll('.level-segment__item[tabindex="-1"]')).toHaveLength(4);
    expect($('#current-chart')?.getAttribute('role')).toBe('tabpanel');
    expect($('#current-chart')?.getAttribute('aria-labelledby')).toBe('level-tab-hour');
  });

  it('層級 tabs 支援方向鍵、Home、End 與 automatic activation', async () => {
    const { getState } = await import('../src/state/appState');
    const press = (level: string, key: string) => {
      $<HTMLButtonElement>(`#level-tab-${level}`)?.dispatchEvent(new KeyboardEvent('keydown', {
        key, bubbles: true, cancelable: true,
      }));
    };

    $<HTMLButtonElement>('#level-tab-hour')?.focus();
    press('hour', 'ArrowRight');
    expect(getState().level).toBe('ke');
    expect(document.activeElement).toBe($('#level-tab-ke'));
    expect($('#level-tab-ke')?.getAttribute('aria-selected')).toBe('true');

    press('ke', 'Home');
    expect(getState().level).toBe('year');
    expect(document.activeElement).toBe($('#level-tab-year'));

    press('year', 'End');
    expect(getState().level).toBe('ke');
    press('ke', 'ArrowLeft');
    expect(getState().level).toBe('hour');
    expect(document.activeElement).toBe($('#level-tab-hour'));
  });

  it('頂欄圖示是可縮放的 SVG，不依賴平台 emoji', () => {
    expect(document.querySelectorAll('.topbar__icon svg')).toHaveLength(2);
    expect($('.topbar')?.textContent).not.toContain('ⓘ');
    expect($('.topbar')?.textContent).not.toContain('⚙');
    expect(document.querySelector('[aria-label="查看排盤說明"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="開啟設定"]')).not.toBeNull();
  });

  it('盤外 swipe 與盤內互動元素不會換盤', async () => {
    const { getState } = await import('../src/state/appState');
    const before = getState().selectedDateTime.getTime();
    swipeLeft($('.date-context')!);
    expect(getState().selectedDateTime.getTime()).toBe(before);

    const button = document.createElement('button');
    $('.card')!.append(button);
    swipeLeft(button);
    expect(getState().selectedDateTime.getTime()).toBe(before);
  });

  it('只有 [data-swipe-zone="chart"] 左滑會換到下一盤', async () => {
    const { getState } = await import('../src/state/appState');
    const { shiftByLevel } = await import('../src/ui/TimeNavigator');
    const before = getState().selectedDateTime;
    const expected = shiftByLevel(before, getState().level, 1);
    swipeLeft($('.grid')!);

    expect(getState().selectedDateTime.getTime()).toBe(expected.getTime());
    expect(getState().followNow).toBe(false);
  });

  it('followNow 只更新正在跟隨現在的狀態', async () => {
    const { getState, refreshFollowedNow, returnToNow } = await import('../src/state/appState');
    const manuallySelected = getState().selectedDateTime.getTime();
    __setNowForTesting(LATER);
    refreshFollowedNow();
    expect(getState().selectedDateTime.getTime()).toBe(manuallySelected);

    returnToNow();
    expect(getState().followNow).toBe(true);
    expect(getState().selectedDateTime.getTime()).toBe(LATER.getTime());
  });
});
