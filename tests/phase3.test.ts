/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
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
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/');
  __setNowForTesting(NOW);
  await import('../src/app');
});

describe('Phase 3 Bottom Sheet', () => {
  it('日期列開啟 native dialog，draft 不會立即改 state', async () => {
    const { getState } = await import('../src/state/appState');
    const trigger = $<HTMLButtonElement>('[data-sheet-trigger="time"]')!;
    trigger.click();
    await Promise.resolve();

    const dialog = $<HTMLDialogElement>('dialog.sheet-dialog--time')!;
    expect(dialog?.open).toBe(true);
    expect(document.body.classList.contains('has-open-sheet')).toBe(true);
    expect(document.activeElement).toBe($('input[type="date"]'));

    const date = $<HTMLInputElement>('input[type="date"]')!;
    const time = $<HTMLInputElement>('input[type="time"]')!;
    expect(document.querySelectorAll('.sheet-input-shell')).toHaveLength(2);
    expect(date.classList.contains('sheet-native-input')).toBe(true);
    expect(time.classList.contains('sheet-native-input')).toBe(true);
    expect(date.parentElement?.classList.contains('sheet-input-shell')).toBe(true);
    expect(time.parentElement?.classList.contains('sheet-input-shell')).toBe(true);
    expect(document.querySelector('.sheet-form__meta')?.textContent).toBe('時間基準：UTC+8');
    date.value = '2025-12-03';
    time.value = '14:20';
    expect(getState().selectedDateTime.getTime()).toBe(NOW.getTime());
  });

  it('按「查看此時」才套用時間、更新 URL 並關閉', async () => {
    const { getState } = await import('../src/state/appState');
    const apply = Array.from(document.querySelectorAll<HTMLButtonElement>('dialog button'))
      .find((button) => button.textContent === '查看此時')!;
    apply.click();

    expect($('dialog')).toBeNull();
    expect(document.body.classList.contains('has-open-sheet')).toBe(false);
    expect(getState().selectedDateTime.getTime()).toBe(fromUtc8(2025, 12, 3, 14, 20).getTime());
    expect(location.search).toContain('t=2025-12-03T14%3A20');
  });

  it('backdrop 關閉後焦點回日期按鈕', async () => {
    const trigger = $<HTMLButtonElement>('[data-sheet-trigger="time"]')!;
    trigger.click();
    await Promise.resolve();
    const dialog = $<HTMLDialogElement>('dialog')!;
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));

    expect($('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Esc 可關閉並回復焦點', async () => {
    const trigger = $<HTMLButtonElement>('[data-sheet-trigger="time"]')!;
    trigger.click();
    await Promise.resolve();
    $('input[type="date"]')!.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape', bubbles: true, cancelable: true,
    }));

    expect($('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('設定由頂欄開啟，且同時間只有一個 sheet', async () => {
    $<HTMLButtonElement>('[data-sheet-trigger="time"]')!.click();
    $<HTMLButtonElement>('[data-sheet-trigger="settings"]')!.click();
    await Promise.resolve();

    expect(document.querySelectorAll('dialog')).toHaveLength(1);
    expect($<HTMLDialogElement>('dialog.sheet-dialog--settings')?.open).toBe(true);
    expect(document.activeElement).toBe($('.sheet__surface'));
    expect($('.sheet__surface')?.getAttribute('tabindex')).toBe('-1');
    const closeIcon = $('.sheet__close svg');
    expect(closeIcon?.getAttribute('stroke')).toBe('currentColor');
    expect(closeIcon?.getAttribute('stroke-width')).toBe('1.5');
    expect(closeIcon?.getAttribute('stroke-linecap')).toBe('round');
    const closeButton = $<HTMLButtonElement>('.sheet__close')!;
    expect(closeButton.tabIndex).toBe(0);
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
    expect(document.body.textContent).toContain('日柱換日');
    expect(document.body.textContent).toContain('節氣資料');
  });

  it('從頂部向下滑可關閉 sheet', async () => {
    $<HTMLButtonElement>('dialog .sheet__close')!.click();
    const trigger = $<HTMLButtonElement>('[data-sheet-trigger="time"]')!;
    trigger.click();
    const surface = $('.sheet__surface')!;
    const start = new Event('touchstart', { bubbles: true });
    Object.defineProperty(start, 'changedTouches', { value: [{ clientX: 100, clientY: 100 }] });
    surface.dispatchEvent(start);
    const end = new Event('touchend', { bubbles: true });
    Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 110, clientY: 210 }] });
    surface.dispatchEvent(end);

    expect($('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
