/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
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

describe('Phase 2 疊盤 UI', () => {
  it('預設關閉並完整保留原有單層九宮', () => {
    expect($('.overlay-toggle')?.getAttribute('aria-checked')).toBe('false');
    expect($('.card__head .overlay-toggle')).not.toBeNull();
    expect($('.overlay-controls')).toBeNull();
    expect(document.querySelectorAll('.grid:not(.overlay-grid) .cell')).toHaveLength(9);
    expect($('.overlay-grid')).toBeNull();
  });

  it('開啟後每宮顯示五層文字值，並同步 URL', async () => {
    $<HTMLButtonElement>('.overlay-toggle')!.click();
    const { getState } = await import('../src/state/appState');

    expect(getState().overlayMode).toBe(true);
    expect(getState().overlayPrimaryLevel).toBe('hour');
    expect(location.search).toContain('overlay=1');
    expect(location.search).toContain('overlayPrimary=hour');
    expect(document.querySelectorAll('.overlay-cell')).toHaveLength(9);
    expect(document.querySelectorAll('.overlay-cell__layers')).toHaveLength(9);
    expect(document.querySelectorAll('.overlay-cell:first-child .overlay-cell__layer')).toHaveLength(5);
    expect(document.querySelectorAll('.overlay-cell__layer.is-search-match')).toHaveLength(0);
    expect(document.querySelectorAll('.overlay-cell__layer[data-layer="hour"].is-primary')).toHaveLength(9);
    expect(document.querySelectorAll('.overlay-cell__layer:not([data-layer="hour"]).is-primary')).toHaveLength(0);
    expect($('.overlay-primary')).toBeNull();
    expect($('.overlay-grid')?.getAttribute('aria-label')).toContain('主顯示流時');
  });

  it('疊盤主顯示跟隨唯一的層級導覽列', async () => {
    $<HTMLButtonElement>('#level-tab-ke')!.click();
    const { getState } = await import('../src/state/appState');

    expect(getState().level).toBe('ke');
    expect(getState().overlayPrimaryLevel).toBe('ke');
    expect($('[data-overlay-primary]')).toBeNull();
    expect(document.querySelectorAll('.overlay-cell__layer[data-layer="ke"].is-primary')).toHaveLength(9);
    expect(document.querySelectorAll('.overlay-cell__layer[data-layer="hour"].is-primary')).toHaveLength(0);
    expect($('.overlay-grid')?.getAttribute('aria-label')).toContain('主顯示流刻');
  });

  it('點離宮會選宮、高亮並開啟完整五層 Bottom Sheet', async () => {
    $<HTMLButtonElement>('[data-palace="li"]')!.click();
    await Promise.resolve();
    const { getState } = await import('../src/state/appState');

    expect(getState().selectedPalace).toBe('li');
    expect($('.overlay-grid')?.classList.contains('has-selection')).toBe(true);
    expect(document.querySelectorAll('.overlay-cell.is-selected')).toHaveLength(1);
    expect($('[data-palace="li"]')?.classList.contains('is-selected')).toBe(true);
    expect($('[data-palace="li"]')?.getAttribute('aria-pressed')).toBe('true');
    expect($<HTMLDialogElement>('dialog.sheet-dialog--palace')?.open).toBe(true);
    expect($('.sheet__title')?.textContent).toBe('離 · 南');
    expect(document.querySelectorAll('.palace-detail__row')).toHaveLength(5);
    expect($('.palace-detail__row[data-layer="ke"]')?.classList.contains('is-primary')).toBe(true);
    expect($('.palace-summary')?.textContent).toContain('日時');
    expect($('.palace-summary')?.textContent).toContain('不作吉凶');
  });

  it('關閉疊盤會清除選宮並回到原有九宮', async () => {
    $<HTMLButtonElement>('dialog .sheet__close')!.click();
    $<HTMLButtonElement>('.plain-toggle')!.click();
    const { getState } = await import('../src/state/appState');

    expect(getState().overlayMode).toBe(false);
    expect(getState().selectedPalace).toBeUndefined();
    expect($('.overlay-grid')).toBeNull();
    expect(document.querySelectorAll('.grid:not(.overlay-grid) .cell')).toHaveLength(9);
    expect(location.search).not.toContain('overlay=1');
  });

  it('舊 primary／palace URL 仍可讀取並正規化成明確 key', async () => {
    history.replaceState(null, '',
      '/?t=2026-08-07T11:38&level=day&overlay=1&primary=ke&palace=li');
    window.dispatchEvent(new PopStateEvent('popstate'));
    const { getState } = await import('../src/state/appState');
    const params = new URLSearchParams(location.search);

    expect(getState().level).toBe('day');
    expect(getState().overlayPrimaryLevel).toBe('day');
    expect(getState().selectedPalace).toBe('li');
    expect(params.get('view')).toBe('chart');
    expect(params.get('overlayPrimary')).toBe('day');
    expect(params.get('selectedPalace')).toBe('li');
    expect(params.has('primary')).toBe(false);
    expect(params.has('palace')).toBe(false);
  });
});
