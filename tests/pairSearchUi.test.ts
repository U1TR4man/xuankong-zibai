/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
const $ = <T extends Element = Element>(selector: string) => document.querySelector<T>(selector);

async function waitForPairSearch(): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (!$('.pair-search-status')) return;
    await new Promise((resolve) => window.setTimeout(resolve, 10));
  }
  throw new Error('尋組合未在 2 秒內完成');
}

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/?t=2026-08-07T11:38&level=hour');
  __setNowForTesting(NOW);
  await import('../src/app');
  const searchButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-nav__item'))
    .find((button) => button.textContent === '搜尋')!;
  searchButton.click();
});

describe('紫白擇吉 Phase 3 尋組合 UI', () => {
  it('搜尋頁先提供可鍵盤操作的尋星／尋組合 tabs，再顯示 helper', async () => {
    expect($('.search-view')?.firstElementChild?.classList.contains('search-tool')).toBe(true);
    expect(document.querySelectorAll('.search-tool__item')).toHaveLength(2);
    expect($('.search-tool')?.getAttribute('role')).toBe('tablist');
    const starButton = $<HTMLButtonElement>('#search-tab-stars')!;
    expect(starButton.getAttribute('role')).toBe('tab');
    expect(starButton.getAttribute('aria-selected')).toBe('true');
    expect(starButton.tabIndex).toBe(0);
    const pairButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.search-tool__item'))
      .find((button) => button.textContent === '尋組合')!;
    expect(pairButton.id).toBe('search-tab-pairs');
    starButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await Promise.resolve();

    expect($('.search-view h1')).toBeNull();
    expect($('.search-view__helper')?.textContent).toContain('有序或不分次序');
    expect($('.pair-search-view')).not.toBeNull();
    expect($('.pair-search-form__submit')?.textContent).toBe('開始尋組合');
    expect($('#search-tab-pairs')?.getAttribute('aria-selected')).toBe('true');
    expect($('#search-tab-pairs')?.getAttribute('aria-controls')).toBe('search-panel-pairs');
    expect($('#search-panel-pairs')?.getAttribute('aria-labelledby')).toBe('search-tab-pairs');
    expect(document.activeElement?.id).toBe('search-tab-pairs');
  });

  it('預設 14、有序、未來 7 日及六個 Pair Layer', () => {
    expect($<HTMLSelectElement>('select[name="firstStar"]')?.value).toBe('1');
    expect($<HTMLSelectElement>('select[name="secondStar"]')?.value).toBe('4');
    expect($<HTMLSelectElement>('select[name="pairRangePreset"]')?.value).toBe('7days');
    expect($<HTMLInputElement>('input[name="pairOrder"][value="ordered"]')?.checked).toBe(true);
    expect(document.querySelectorAll('input[name="pairLayers"]')).toHaveLength(6);
    expect(document.querySelectorAll('input[name="pairLayers"]:checked')).toHaveLength(6);
    expect($('.pair-search-form__convention')?.textContent).toContain('較慢層為第一碼');
    expect($('.pair-search-form__convention')?.textContent).not.toContain('convention');
  });

  it('指定次序搜尋 14，結果顯示日期、時段、方向、layer 與四星 context', async () => {
    $<HTMLInputElement>('input[name="pairStartDate"]')!.value = '2026-08-07';
    $<HTMLInputElement>('input[name="pairEndDate"]')!.value = '2026-08-07';
    $<HTMLFormElement>('.pair-search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));
    expect($('.pair-search-status')?.textContent).toContain('正在裝置內尋找雙星組合');
    await waitForPairSearch();

    const count = Number(/共 (\d+) 個結果/.exec($('.pair-search-results__count')?.textContent ?? '')?.[1]);
    expect(count).toBeGreaterThan(0);
    expect($('.pair-search-results .search-results__summary')?.textContent).toContain('14');
    expect(document.querySelectorAll('.pair-search-result-group').length).toBeGreaterThan(0);
    expect($('.pair-search-result')?.getAttribute('data-pair')).toBe('14');
    expect($('.pair-search-result__context')?.textContent).toMatch(/年\d · 月\d · 日\d · 時\d/);
  });

  it('點結果會跳回正式擇吉盤並高亮方向及命中 pair', async () => {
    const result = $<HTMLButtonElement>('.pair-search-result')!;
    const pair = result.getAttribute('data-pair');
    const layer = result.getAttribute('data-pair-layer');
    result.click();
    const { getState } = await import('../src/state/appState');
    const state = getState();

    expect(state.view).toBe('chart');
    expect(state.level).toBe('hour');
    expect(state.selectionMode).toBe(true);
    expect(state.overlayMode).toBe(false);
    expect(state.selectedPair).toBe(pair);
    expect(state.selectedPairLayer).toBe(layer);
    expect(state.selectedPalace).toBeDefined();
    expect($('.selection-cell.is-selected.is-search-match')).not.toBeNull();
    expect($('.selection-cell.is-search-match .selection-cell__top')?.textContent).toContain(pair!);
    expect($('.selection-cell.is-search-match .selection-cell__reference')?.textContent)
      .toMatch(/^參考 · /u);
    const params = new URLSearchParams(location.search);
    expect(params.get('selection')).toBe('1');
    expect(params.get('selectedPair')).toBe(pair);
    expect(params.get('selectedPairLayer')).toBe(layer);
  });

  it('擇吉 deep-link refresh 可還原方向與 pair 高亮', async () => {
    const savedUrl = location.href;
    history.replaceState(null, '', savedUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    const { getState } = await import('../src/state/appState');

    expect(getState().selectionMode).toBe(true);
    expect(getState().selectedPair).toBe('14');
    expect($('.selection-cell.is-search-match')).not.toBeNull();
  });

  it('不分次序搜尋可命中 14／41，並可限制單一 layer', async () => {
    const searchButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-nav__item'))
      .find((button) => button.textContent === '搜尋')!;
    searchButton.click();
    $<HTMLInputElement>('input[name="pairOrder"][value="unordered"]')!.click();
    const layerInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="pairLayers"]'));
    for (const input of layerInputs) input.checked = input.value === 'DH';
    $<HTMLFormElement>('.pair-search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));
    await waitForPairSearch();

    expect($('.pair-search-results .search-results__summary')?.textContent).toContain('14／41');
    expect(Array.from(document.querySelectorAll('.pair-search-result'))
      .every((result) => result.getAttribute('data-pair-layer') === 'DH')).toBe(true);
    expect(Array.from(document.querySelectorAll('.pair-search-result'))
      .every((result) => ['14', '41'].includes(result.getAttribute('data-pair') ?? ''))).toBe(true);
  });

  it('可以按用途 tags 搜尋雙星參考，結果明示來源與紫白集中', async () => {
    $<HTMLInputElement>('input[name="pairSearchBy"][value="purpose"]')!.click();
    expect($('.pair-search-form__submit')?.textContent).toBe('開始尋用途參考');
    expect($<HTMLSelectElement>('select[name="pairPurpose"]')?.value).toBe('writing');
    for (const input of Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="pairLayers"]'),
    )) input.checked = true;
    $<HTMLFormElement>('.pair-search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));
    await waitForPairSearch();

    expect($('.pair-search-results .search-results__summary')?.textContent)
      .toContain('用途參考：文書／考試');
    expect(document.querySelectorAll('.pair-search-result').length).toBeGreaterThan(0);
    expect($('.pair-search-result__quality')?.textContent).toContain('古法規則');
    expect($('.pair-search-result__quality')?.textContent).toContain('紫白集中');
  });

  it('超過一年會明確拒絕，不啟動背景搜尋', () => {
    $<HTMLInputElement>('input[name="pairStartDate"]')!.value = '2026-01-01';
    $<HTMLInputElement>('input[name="pairEndDate"]')!.value = '2027-01-02';
    $<HTMLFormElement>('.pair-search-form')!.dispatchEvent(new Event('submit', {
      bubbles: true, cancelable: true,
    }));
    expect($('.search-form__error')?.textContent).toContain('最多搜尋一年');
    expect($('.pair-search-status')).toBeNull();
  });
});
