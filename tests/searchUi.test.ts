/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
const $ = <T extends Element = Element>(selector: string) => document.querySelector<T>(selector);
const waitForSearch = () => new Promise((resolve) => window.setTimeout(resolve, 10));

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

  it('搜尋離宮流時九紫，結果顯示年月日時與明確命中', async () => {
    $<HTMLInputElement>('input[name="startDate"]')!.value = '2026-09-01';
    $<HTMLInputElement>('input[name="endDate"]')!.value = '2026-09-03';
    $<HTMLSelectElement>('select[name="palace"]')!.value = 'li';
    const star = $<HTMLInputElement>('input[name="star"][value="9"]')!;
    star.checked = true;
    star.dispatchEvent(new Event('change', { bubbles: true }));
    $<HTMLFormElement>('.search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));
    expect($('.search-status')?.textContent).toContain('正在裝置內計算');
    expect($<HTMLButtonElement>('.search-form__submit')?.disabled).toBe(true);
    await waitForSearch();

    const count = Number(/共 (\d+) 個結果/.exec($('.search-results__count')?.textContent ?? '')?.[1]);
    expect(count).toBeGreaterThan(0);
    expect(document.querySelectorAll('.search-result')).toHaveLength(count);
    const firstResult = $('.search-result')!;
    expect(firstResult.querySelectorAll('.search-result__layer')).toHaveLength(4);
    expect(firstResult.querySelectorAll('.search-result__layer.is-match')).toHaveLength(1);
    expect($('.search-results__summary')?.textContent).toContain('離 · 南 · 流時 九紫');
    expect(document.querySelectorAll('.search-result-group').length).toBeGreaterThan(0);
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

  it('進階搜尋支援同層多星 OR、跨層 AND 與組合摘要', async () => {
    const advanced = Array.from(document.querySelectorAll<HTMLButtonElement>('.search-mode__item'))
      .find((button) => button.textContent === '進階')!;
    advanced.click();

    expect($('.search-view__eyebrow')?.textContent).toBe('尋星 · 進階');
    expect($('.search-advanced__rule')?.textContent).toContain('同層選多星代表任一符合');
    expect(document.querySelectorAll('.search-advanced__level')).toHaveLength(3);
    for (const selector of [
      'input[name="hourStars"][value="8"]',
      'input[name="hourStars"][value="9"]',
      'input[name="keStars"][value="8"]',
      'input[name="keStars"][value="9"]',
    ]) $<HTMLInputElement>(selector)!.click();

    $<HTMLFormElement>('.search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));
    await waitForSearch();

    const count = Number(/共 (\d+) 個結果/.exec($('.search-results__count')?.textContent ?? '')?.[1]);
    expect(count).toBeGreaterThan(0);
    expect($('.search-results__summary')?.textContent).toContain('流時 八白／九紫 ＋ 流刻 八白／九紫');
    const firstResult = $('.search-result')!;
    expect(firstResult.querySelectorAll('.search-result__layer')).toHaveLength(5);
    expect(firstResult.querySelectorAll('.search-result__layer.is-match')).toHaveLength(2);
    expect(firstResult.querySelector('.search-result__combinations')?.textContent).toContain('時刻');
  });

  it('切回簡易模式不會遺失原有單星條件', () => {
    const simple = Array.from(document.querySelectorAll<HTMLButtonElement>('.search-mode__item'))
      .find((button) => button.textContent === '簡易')!;
    simple.click();

    expect($('.search-view__eyebrow')?.textContent).toBe('尋星 · 簡易');
    expect($<HTMLInputElement>('input[name="level"][value="hour"]')?.checked).toBe(true);
    expect($<HTMLInputElement>('input[name="star"][value="9"]')?.checked).toBe(true);
  });

  it('超過一年會明確拒絕，不會在背景無限掃描', () => {
    $<HTMLInputElement>('input[name="startDate"]')!.value = '2026-01-01';
    $<HTMLInputElement>('input[name="endDate"]')!.value = '2027-01-02';
    $<HTMLFormElement>('.search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));

    expect($('.search-form__error')?.textContent).toContain('最多搜尋一年');
    expect($('.search-status')).toBeNull();
  });
});
