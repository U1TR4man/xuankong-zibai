/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { getPairRule } from '../src/selection/pairRules';
import { openPairRuleSheet } from '../src/ui/PairRuleSheet';

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

beforeAll(() => {
  installDialogPolyfill();
  document.body.innerHTML = '<button id="pair-trigger">查看 68</button>';
});

describe('紫白擇吉 Phase 4 Pair 學習卡', () => {
  it('清楚分開核心、五行、來源、review、tags 與適用範圍', () => {
    const trigger = $<HTMLButtonElement>('#pair-trigger')!;
    openPairRuleSheet(trigger, getPairRule('68'));

    expect($<HTMLDialogElement>('dialog.sheet-dialog--pair-rule')?.open).toBe(true);
    expect($('.sheet__title')?.textContent).toBe('68｜六八');
    expect($('.pair-rule__meaning')?.textContent).toBe('武科 · 韜略');
    expect($('.pair-rule__badges')?.textContent).toContain('A · 古訣直述');
    expect($('.pair-rule__badges')?.textContent).toContain('需要覆核');
    expect($('.pair-rule')?.textContent).toContain('五行關係');
    expect($('.pair-rule')?.textContent).toContain('用途 tags');
    expect($('.pair-rule__tags')?.textContent).toContain('韜略');
    expect($('.pair-rule__source')?.textContent).toContain('尚未收錄可核對的逐字引文');
  });

  it('有序 pair 明示 68 ≠ 86，反向按鈕會開啟不同資料', () => {
    expect($('.pair-rule__direction')?.textContent).toContain('68 ≠ 86');
    $<HTMLButtonElement>('.pair-rule__reverse')!.click();

    expect($('.sheet__title')?.textContent).toBe('86｜八六');
    expect($('.pair-rule__meaning')?.textContent).toBe('文士參軍 · 異途');
    expect($('.pair-rule__direction')?.textContent).toContain('86 ≠ 68');
  });
});
