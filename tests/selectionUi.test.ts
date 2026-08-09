/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const AT = fromUtc8(2026, 8, 7, 11, 38);
const $ = <T extends Element = Element>(selector: string) => document.querySelector<T>(selector);

function installDialogPolyfill(): void {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute('open', ''); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      if (!this.open) return;
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    },
  });
}

beforeAll(async () => {
  installDialogPolyfill();
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/?t=2026-08-07T11:38&level=hour');
  __setNowForTesting(AT);
  await import('../src/app');
});

describe('紫白擇吉 Phase 2 主盤 UI', () => {
  it('原盤／疊盤／擇吉是互斥的三段模式控制', () => {
    expect($('.chart-mode')?.getAttribute('role')).toBe('radiogroup');
    expect(document.querySelectorAll('.chart-mode__item')).toHaveLength(3);
    expect($('.plain-toggle')?.getAttribute('aria-checked')).toBe('true');
    expect($('.overlay-toggle')?.getAttribute('aria-checked')).toBe('false');
    expect($('.selection-toggle')?.getAttribute('aria-checked')).toBe('false');
  });

  it('開啟擇吉後只排名八方，中宮保留但不成為方向按鈕', async () => {
    $<HTMLButtonElement>('.selection-toggle')!.click();
    const { getState } = await import('../src/state/appState');
    const state = getState();

    expect(state.selectionMode).toBe(true);
    expect(state.overlayMode).toBe(false);
    expect(location.search).toContain('selection=1');
    expect(document.querySelectorAll('.selection-grid .selection-cell')).toHaveLength(9);
    expect(document.querySelectorAll('.selection-grid button.selection-cell')).toHaveLength(8);
    expect($('.selection-cell--center')?.textContent).toContain('不參與排序');
    expect(document.querySelectorAll('.selection-ranking__direction')).toHaveLength(8);
  });

  it('八方四星逐一等於同一 FullChart，沒有改寫原飛星', () => {
    const chart = computeFullChart(AT);
    const xun = $<HTMLButtonElement>('[data-selection-palace="xun"]')!;
    const values = Array.from(xun.querySelectorAll('.selection-cell__star strong'))
      .map((node) => Number(node.textContent));
    expect(values).toEqual([
      chart.year.palaceStars.xun,
      chart.month.palaceStars.xun,
      chart.day.palaceStars.xun,
      chart.hour.palaceStars.xun,
    ]);
  });

  it('點方向可查看 verdict 原因、六組參考 pair、五行與方法聲明', async () => {
    $<HTMLButtonElement>('[data-selection-palace="xun"]')!.click();
    await Promise.resolve();
    const { getState } = await import('../src/state/appState');

    expect(getState().selectedPalace).toBe('xun');
    expect($<HTMLDialogElement>('dialog.sheet-dialog--direction')?.open).toBe(true);
    expect($('.sheet__title')?.textContent).toBe('巽 · 東南');
    expect(document.querySelectorAll('.direction-detail__star')).toHaveLength(4);
    expect(document.querySelectorAll('.direction-pairs .direction-pair')).toHaveLength(6);
    expect($('.direction-main-pairs')?.parentElement?.textContent).toContain('雙星參考');
    expect($('.direction-reasons')?.textContent?.length).toBeGreaterThan(0);
    expect($('.direction-elements')?.textContent).toContain('年月');
    expect($('.direction-detail__disclaimer')?.textContent).toContain('TOOL_HEURISTIC');
    expect($('.direction-detail__disclaimer')?.textContent).toContain('rankingWeight 為 0');
    const pairButton = $<HTMLButtonElement>('.direction-pairs .direction-pair')!;
    expect(pairButton.tagName).toBe('BUTTON');
    pairButton.click();
    expect($<HTMLDialogElement>('dialog.sheet-dialog--pair-rule')?.open).toBe(true);
    expect($('.pair-rule__section')?.textContent).toContain('五行關係');
  });

  it('用途只更新雙星參考 context，不改方向排序，並保留在 URL', async () => {
    $<HTMLButtonElement>('dialog .sheet__close')!.click();
    const before = Array.from(document.querySelectorAll('.selection-ranking__direction'))
      .map((item) => item.textContent);
    const purpose = $<HTMLSelectElement>('.selection-purpose__select')!;
    purpose.value = 'writing';
    purpose.dispatchEvent(new Event('change', { bubbles: true }));
    const { getState } = await import('../src/state/appState');

    expect(getState().selectionPurpose).toBe('writing');
    expect(getState().selectionMode).toBe(true);
    expect(location.search).toContain('purpose=writing');
    expect(document.querySelectorAll('.selection-grid button.selection-cell')).toHaveLength(8);
    expect(Array.from(document.querySelectorAll('.selection-ranking__direction'))
      .map((item) => item.textContent)).toEqual(before);
  });

  it('疊盤與擇吉互相切換時不會同時開啟', async () => {
    $<HTMLButtonElement>('.overlay-toggle')!.click();
    const { getState } = await import('../src/state/appState');
    expect(getState().overlayMode).toBe(true);
    expect(getState().selectionMode).toBe(false);
    expect($('.overlay-grid')).not.toBeNull();
    expect($('.selection-grid')).toBeNull();

    $<HTMLButtonElement>('.selection-toggle')!.click();
    expect(getState().overlayMode).toBe(false);
    expect(getState().selectionMode).toBe(true);
    expect($('.overlay-grid')).toBeNull();
    expect($('.selection-grid')).not.toBeNull();
  });

  it('selection URL refresh 可還原用途與選中方向', async () => {
    history.replaceState(null, '',
      '/?t=2026-08-07T11:38&level=hour&selection=1&purpose=writing&selectedPalace=xun');
    window.dispatchEvent(new PopStateEvent('popstate'));
    const { getState } = await import('../src/state/appState');

    expect(getState().selectionMode).toBe(true);
    expect(getState().selectionPurpose).toBe('writing');
    expect(getState().selectedPalace).toBe('xun');
    expect($('[data-selection-palace="xun"]')?.classList.contains('is-selected')).toBe(true);
    expect(new URLSearchParams(location.search).get('selection')).toBe('1');
  });

  it('切回原盤後九宮仍是原有九格', async () => {
    $<HTMLButtonElement>('.plain-toggle')!.click();
    const { getState } = await import('../src/state/appState');
    expect(getState().selectionMode).toBe(false);
    expect(getState().overlayMode).toBe(false);
    expect($('.selection-grid')).toBeNull();
    expect(document.querySelectorAll('.grid:not(.selection-grid):not(.overlay-grid) .cell')).toHaveLength(9);
  });
});
