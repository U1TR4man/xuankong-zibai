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
    expect(document.querySelectorAll('.selection-cell__concentration')).toHaveLength(0);
    expect($('.selection-cell--center')?.textContent).toContain('不參與排序');
    expect(document.querySelectorAll('.selection-ranking__direction')).toHaveLength(8);
  });

  it('八方四星逐一等於同一 FullChart，沒有改寫原飛星', () => {
    const chart = computeFullChart(AT);
    const xun = $<HTMLButtonElement>('[data-selection-palace="xun"]')!;
    const labels = Array.from(xun.querySelectorAll('.selection-cell__star small'))
      .map((node) => node.textContent);
    const values = Array.from(xun.querySelectorAll('.selection-cell__star strong'))
      .map((node) => Number(node.textContent));
    expect(labels).toEqual(['年', '月', '日', '時']);
    expect(values).toEqual([
      chart.year.palaceStars.xun,
      chart.month.palaceStars.xun,
      chart.day.palaceStars.xun,
      chart.hour.palaceStars.xun,
    ]);
  });

  it('八方與中宮共用年月日時四欄，沒有加入流刻', () => {
    const groups = document.querySelectorAll('.selection-grid .selection-cell__stars');
    expect(groups).toHaveLength(9);
    for (const group of groups) {
      expect(Array.from(group.querySelectorAll('.selection-cell__star small'))
        .map((node) => node.textContent)).toEqual(['年', '月', '日', '時']);
    }
    expect($('.selection-grid')?.textContent).not.toContain('刻');
  });

  it('擇吉 ChartHeader 以輕量 metadata 顯示 canonical 干支，並可開完整四柱', () => {
    const trigger = $<HTMLButtonElement>('.temporal-ganzhi-meta')!;
    expect(trigger.textContent).toContain('癸丑日 · 戊午時');
    expect(trigger.getAttribute('aria-label')).toContain('丙午年、乙未月、癸丑日、戊午時');
    expect(trigger.getAttribute('aria-label')).toContain('查看完整四柱');
    trigger.click();
    expect($<HTMLDialogElement>('dialog.sheet-dialog--temporal-pillars')?.open).toBe(true);
    expect($('.sheet__title')?.textContent).toBe('時間干支');
    expect(Array.from(document.querySelectorAll('.temporal-pillars dt')).map((node) => node.textContent))
      .toEqual(['年柱', '月柱', '日柱', '時柱']);
    expect(Array.from(document.querySelectorAll('.temporal-pillars dd')).map((node) => node.textContent))
      .toEqual(['丙午', '乙未', '癸丑', '戊午']);
    $<HTMLButtonElement>('dialog .sheet__close')!.click();
  });

  it('方向詳情首屏只顯示結果，研究內容預設收起且仍可完整展開', async () => {
    $<HTMLButtonElement>('[data-selection-palace="xun"]')!.click();
    await Promise.resolve();
    const { getState } = await import('../src/state/appState');

    expect(getState().selectedPalace).toBe('xun');
    expect($<HTMLDialogElement>('dialog.sheet-dialog--direction')?.open).toBe(true);
    expect($('.sheet__title')?.textContent).toBe('巽 · 東南');
    expect(document.querySelectorAll('.direction-detail__star')).toHaveLength(4);
    expect(Array.from(document.querySelectorAll('.direction-detail__ganzhi'))
      .map((node) => node.textContent)).toEqual(['丙午', '乙未', '癸丑', '戊午']);
    expect($('.direction-detail__verdict')?.textContent).toBe('慎用');
    expect($('.direction-primary-conditions')).toBeNull();
    expect($('.direction-primary-signal')?.textContent).toContain('紫白主幹');
    expect($('.direction-primary-signal')?.textContent).toContain('3/4');
    const conditionOrder = $('.direction-primary-signal')?.compareDocumentPosition(
      $('.direction-primary-reference')!,
    ) ?? 0;
    expect(conditionOrder & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect($('.direction-primary-reference')?.textContent).toContain('雙星參考');
    expect($('[data-selection-palace="xun"] .selection-cell__condition')?.textContent)
      .toContain('鬥牛');
    expect($('[data-selection-palace="zhen"] .selection-cell__condition')?.textContent)
      .toContain('大月建／月暗建');
    const disclosures = Array.from(document.querySelectorAll<HTMLDetailsElement>('.direction-disclosure'));
    expect(disclosures).toHaveLength(4);
    expect(disclosures.every((item) => !item.open)).toBe(true);
    expect(disclosures.map((item) => item.querySelector('summary')?.textContent))
      .toEqual(['為甚麼', '全部六組', '五行關係', '研究說明']);
    expect($('.direction-temporal')?.textContent).toContain('三層紫白同到');
    expect($('.direction-temporal')?.textContent).toContain('有效');
    expect(document.querySelectorAll('.direction-condition-list li')).toHaveLength(4);
    expect($('.direction-branch-conditions')?.textContent).toContain('時序條件');
    expect($('.direction-branch-conditions')?.textContent).toContain('日 · 癸丑');
    expect($('.direction-branch-conditions')?.textContent).toContain('丑支 →');
    expect($('.direction-killers')?.textContent).toContain('鬥牛殺');
    expect($('.direction-killers')?.textContent).toContain('到巽宮 →');
    expect($('.direction-killers')?.textContent).toContain('白中殺類比');
    expect($('.direction-killers')?.textContent).toContain('研究參考');
    expect(document.querySelectorAll('.direction-pairs .direction-pair')).toHaveLength(6);
    expect($('.direction-main-pairs')?.parentElement?.textContent).toContain('雙星參考');
    expect($('.direction-reasons')?.textContent?.length).toBeGreaterThan(0);
    expect($('.direction-other-reasons')?.textContent).toContain('宮星五行');
    expect(document.querySelectorAll('.direction-elements')[1]?.textContent).toContain('年月');
    expect($('.selection-ranking__head')?.textContent).toBe('方向排序');
    expect($('.selection-ranking')?.textContent).not.toContain('TOOL_HEURISTIC');
    expect($('.selection-ranking')?.textContent).not.toContain('雙星不入排序');
    expect($('.direction-research')?.textContent)
      .toContain('雙星組合僅供研究參考，不參與方向排序。');
    expect($('.direction-research')?.textContent)
      .toContain('大月建取本月入中星的後天本宮');
    expect($('.direction-research')?.textContent)
      .toContain('五黃預設在中宮');
    expect($('.direction-research')?.textContent)
      .toContain('年、月白中殺正式參與判定');
    expect($('.direction-research')?.textContent)
      .toContain('紫白一時加／二時加');
    expect($('.direction-research')?.textContent)
      .toContain('日支為次級有效條件，時支仍只作類推參考');
    expect($('.direction-research')?.textContent)
      .toContain('日主與時課 Gate 尚未建立完整日課規則');
    expect($('dialog.sheet-dialog--direction')?.textContent).not.toContain('TOOL_HEURISTIC');
    expect($('dialog.sheet-dialog--direction')?.textContent).not.toContain('unknown');
    expect($('dialog.sheet-dialog--direction')?.textContent).not.toContain('rankingWeight');
    expect($('dialog.sheet-dialog--direction')?.textContent).not.toContain('研究簡寫');
    expect($('dialog.sheet-dialog--direction')?.textContent).not.toContain('二時紫白同加');
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
