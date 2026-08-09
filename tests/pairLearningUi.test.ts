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
  it('清楚分開核心、五行、來源、校對、標籤與適用範圍', () => {
    const trigger = $<HTMLButtonElement>('#pair-trigger')!;
    openPairRuleSheet(trigger, getPairRule('68'));

    expect($<HTMLDialogElement>('dialog.sheet-dialog--pair-rule')?.open).toBe(true);
    expect($('.sheet__title')?.textContent).toBe('68｜六八');
    expect($('.pair-rule__meaning')?.textContent).toContain('武科、韜略、權位');
    expect($('.pair-rule__badges')?.textContent).toContain('古法規則');
    expect($('.pair-rule__badges')?.textContent).toContain('待逐條覆核');
    expect($('.pair-rule__badges')?.textContent).toContain('待核原頁影像');
    expect($('.pair-rule')?.textContent).toContain('五行關係');
    expect($('.pair-rule__audit')?.textContent).toContain('直接有序組合');
    expect($('.pair-rule__audit')?.textContent).toContain('古句明確有次序');
    expect($('.pair-rule__audit')?.textContent).toContain('原始來源直接核對：否');
    expect($('.pair-rule')?.textContent).toContain('宮／宅基礎星＋流年星');
    expect($('.pair-rule')?.textContent).toContain('用途標籤');
    expect($('.pair-rule__tags')?.textContent).toContain('韜略');
    expect($('.pair-rule__source')?.textContent).toContain('尚未收錄可核對版本／頁碼的逐字引文');
    expect($('.pair-rule__disclaimer')?.textContent).toContain('僅供研究參考，不參與擇吉排序');
    expect($('.pair-rule')?.textContent).not.toContain('rankingWeight');
    expect($('.pair-rule')?.textContent).not.toContain('reference_only');
    expect($('.pair-rule')?.textContent).not.toContain('convention');
  });

  it('有序 pair 明示 68 ≠ 86，反向按鈕會開啟不同資料', () => {
    expect($('.pair-rule__direction')?.textContent).toContain('68 ≠ 86');
    $<HTMLButtonElement>('.pair-rule__reverse')!.click();

    expect($('.sheet__title')?.textContent).toBe('86｜八六');
    expect($('.pair-rule__meaning')?.textContent).toContain('文士參軍、異途擢用');
    expect($('.pair-rule__direction')?.textContent).toContain('86 ≠ 68');
  });

  it('轉錄疑點以 variant 顯示，不會默默覆寫 pair', () => {
    openPairRuleSheet($<HTMLButtonElement>('#pair-trigger')!, getPairRule('37'));

    expect($('.sheet__title')?.textContent).toBe('37｜三七疊至');
    expect($('.pair-rule__variants')?.textContent).toContain('此句有異文／轉錄疑點');
    expect($('.pair-rule__variants')?.textContent).toContain('三六迭逢而遇盜');
    expect($('.pair-rule__variants')?.textContent).toContain('疑似轉錄錯誤');
    expect($('.pair-rule__variants')?.textContent).toContain('不作 36 的直接證據');
  });
});
