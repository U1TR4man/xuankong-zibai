/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
const $ = <T extends Element = Element>(selector: string) => document.querySelector<T>(selector);

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/?t=2026-08-07T11:38&level=hour');
  __setNowForTesting(NOW);
  await import('../src/app');
});

describe('Phase 3 尋星 A UI', () => {
  it('以排盤／尋星兩個核心入口切換，預設仍是排盤', () => {
    expect(document.querySelectorAll('.workspace-nav__item')).toHaveLength(2);
    expect($('.workspace-nav__item[aria-current="page"]')?.textContent).toBe('排盤');
    expect($('.search-view')).toBeNull();
  });

  it('簡易搜尋提供日期、宮位、日／時／刻與單星條件', () => {
    const searchButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-nav__item'))
      .find((button) => button.textContent === '尋星')!;
    searchButton.click();

    expect($('.workspace-nav__item[aria-current="page"]')?.textContent).toBe('尋星');
    expect($('.search-view__head')?.textContent).toContain('尋星 · 簡易');
    expect(document.querySelectorAll('.search-date-range input[type="date"]')).toHaveLength(2);
    expect(document.querySelectorAll('select[name="palace"] option')).toHaveLength(10);
    expect(document.querySelectorAll('input[name="level"]')).toHaveLength(3);
    expect(document.querySelectorAll('input[name="star"]')).toHaveLength(9);
    expect($<HTMLInputElement>('input[name="level"][value="hour"]')?.checked).toBe(true);
    expect(document.querySelector('input[name="star"]:checked')).toBeNull();
  });

  it('搜尋離宮流時九紫，結果顯示年月日時與明確命中', () => {
    $<HTMLInputElement>('input[name="startDate"]')!.value = '2026-09-01';
    $<HTMLInputElement>('input[name="endDate"]')!.value = '2026-09-03';
    $<HTMLSelectElement>('select[name="palace"]')!.value = 'li';
    const star = $<HTMLInputElement>('input[name="star"][value="9"]')!;
    star.checked = true;
    star.dispatchEvent(new Event('change', { bubbles: true }));
    $<HTMLFormElement>('.search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));

    const count = Number(/共 (\d+) 個結果/.exec($('.search-results__count')?.textContent ?? '')?.[1]);
    expect(count).toBeGreaterThan(0);
    expect(document.querySelectorAll('.search-result')).toHaveLength(count);
    expect(document.querySelectorAll('.search-result:first-child .search-result__layer')).toHaveLength(4);
    expect(document.querySelectorAll('.search-result:first-child .search-result__layer.is-match')).toHaveLength(1);
    expect($('.search-results__summary')?.textContent).toContain('離 · 南 · 流時 · 九紫');
  });

  it('查看結果會由正式盤面重算，開啟疊盤並高亮離宮', async () => {
    $<HTMLButtonElement>('.search-result__open')!.click();
    const { getState } = await import('../src/state/appState');

    expect(getState().view).toBe('chart');
    expect(getState().level).toBe('hour');
    expect(getState().overlayMode).toBe(true);
    expect(getState().overlayPrimaryLevel).toBe('hour');
    expect(getState().selectedPalace).toBe('li');
    expect($('[data-palace="li"]')?.classList.contains('is-selected')).toBe(true);
    expect(location.search).toContain('overlay=1');
    expect(location.search).toContain('palace=li');
  });

  it('回到尋星會保留上一輪條件與結果', () => {
    const searchButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-nav__item'))
      .find((button) => button.textContent === '尋星')!;
    searchButton.click();

    expect($<HTMLSelectElement>('select[name="palace"]')?.value).toBe('li');
    expect($<HTMLInputElement>('input[name="star"][value="9"]')?.checked).toBe(true);
    expect(document.querySelectorAll('.search-result').length).toBeGreaterThan(0);
  });
});
