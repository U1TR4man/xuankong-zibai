/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { starName } from '../src/engine/flyingStar/types';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
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
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/');
  __setNowForTesting(NOW);
  await import('../src/app');
});

describe('Phase 5 簡潔／研習模式', () => {
  it('新用戶預設簡潔模式，不顯示洛書數或研習資料', async () => {
    const { getState } = await import('../src/state/appState');
    expect(getState().settings.displayMode).toBe('simple');
    expect(getState().settings.showLuoshu).toBe(false);
    expect($('.study-panel')).toBeNull();
    expect(document.querySelectorAll('.cell:not(.cell--center) .cell__meta')).toHaveLength(0);
  });

  it('「為何是…」只留 trigger，點擊才開推導 Sheet', () => {
    const result = computeFullChart(NOW).hour;
    const trigger = $<HTMLButtonElement>('.explain-trigger')!;
    expect(trigger.textContent).toContain(`為何是${starName(result.centerStar)}？`);
    expect($('.chain')).toBeNull();

    trigger.click();
    expect($<HTMLDialogElement>('dialog.sheet-dialog--explain')?.open).toBe(true);
    expect($('.chain')?.textContent).toContain('結果');
    expect($('.chain')?.textContent).toContain(`${starName(result.centerStar)}入中`);
    expect($('.explain-rule')?.textContent).toContain('規則來源');
  });

  it('頂欄資訊按鈕也會開啟目前盤的解說', () => {
    $<HTMLButtonElement>('dialog .sheet__close')!.click();
    $<HTMLButtonElement>('[aria-label="查看排盤說明"]')!.click();
    expect($<HTMLDialogElement>('dialog.sheet-dialog--explain')?.open).toBe(true);
  });

  it('設定切為研習後顯示預設收合的 StudyPanel，並寫入 localStorage', async () => {
    $<HTMLButtonElement>('dialog .sheet__close')!.click();
    $<HTMLButtonElement>('[data-sheet-trigger="settings"]')!.click();
    const mode = $<HTMLSelectElement>('dialog.sheet-dialog--settings select')!;
    mode.value = 'study';
    mode.dispatchEvent(new Event('change', { bubbles: true }));

    const { getState } = await import('../src/state/appState');
    const panel = $<HTMLDetailsElement>('.study-panel')!;
    expect(getState().settings.displayMode).toBe('study');
    expect(panel).toBeTruthy();
    expect(panel.open).toBe(false);
    expect(panel.textContent).toContain('節氣');
    expect(JSON.parse(localStorage.getItem('zibai.settings.v1')!).displayMode).toBe('study');
  });
});
