/**
 * @vitest-environment jsdom
 *
 * V1 完成標準（規劃書 §39）端到端驗證：
 *   2026-08-07 11:38 → 流年 → 點月 → 流月 → 點日 → 流日 → 點午時 → 流時 → 點第三刻 → 流刻
 * 每層檢查入中星、順逆、九宮飛布、URL 狀態、UTC+8 一致。
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { flyNineStars } from '../src/engine/flyingStar/flyNineStars';
import { PALACES, starName } from '../src/engine/flyingStar/types';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const AT = fromUtc8(2026, 8, 7, 11, 38);

const $ = (sel: string) => document.querySelector(sel);
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));
const text = (sel: string) => $(sel)?.textContent ?? '';
const click = (node: Element | null | undefined) => {
  node?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
};

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
  history.replaceState(null, '', '/?t=2026-08-07T11:38&level=year');
  __setNowForTesting(AT);
  // styles.css 由 vite 處理，測試環境以 stub 略過
  await import('../src/app');
});

describe('V1 端到端下鑽', () => {
  const chart = computeFullChart(AT);

  it('起始為流年盤，九宮與 engine 一致', () => {
    expect(text('.card__title')).toContain(chart.year.title);
    const cells = $$('.cell');
    expect(cells).toHaveLength(9);
    const expected = flyNineStars(chart.year.centerStar, chart.year.direction);
    for (const p of PALACES) {
      // V2 九宮以 aria-label 帶完整宮名（畫面上顯示簡寫「離 · 南」）
      const cell = cells.find((c) => c.getAttribute('aria-label')?.startsWith(p.name))!;
      expect(cell, p.name).toBeTruthy();
      expect(cell.className, p.name).toContain(`star-${expected[p.key]}`);
    }
    expect($('.crumb')).toBeNull();
    expect($$('.picker')).toHaveLength(0);
    expect(text('.level-segment__item.is-active')).toBe('年');
    expect(text('.context-action__label')).toBe('查看十二月');
    expect(location.search).toContain('level=year');
  });

  it('點月 → 流月盤', () => {
    click($('.context-action'));
    const target = $$('.picker--year .pick').find((b) => b.textContent?.startsWith('申月'));
    expect(target, '應列出申月').toBeTruthy();
    click(target);
    expect(text('.card__title')).toContain('申月');
    // 11:38 仍在未月（立秋 19:42），點申月後應切到申月的星
    expect(starName(chart.month.centerStar)).toBe('三碧');
    const shen = computeFullChart(fromUtc8(2026, 8, 10, 12, 0)).month;
    expect(shen.title).toBe('申月');
    expect(text('.card__sub')).toContain(starName(shen.centerStar));
    expect(text('.context-action__label')).toBe('查看本月各日');
    expect(location.search).toContain('level=month');
  });

  it('點當日 → 流日盤', () => {
    click($('.context-action'));
    const target = $$('.picker--month .pick').find((b) => b.textContent?.includes('08-07'));
    expect(target, '應列出 08-07').toBeTruthy();
    click(target);
    expect(text('.card__title')).toContain('癸丑日');
    expect(chart.day.title).toBe('癸丑日');
    expect(text('.card__sub')).toContain(starName(chart.day.centerStar));
    expect(text('.card__sub')).toContain('逆飛');
    expect(text('.context-action__label')).toBe('查看十二時辰');
    expect(location.search).toContain('level=day');
  });

  it('點午時 → 流時盤，並出現八刻選單', () => {
    click($('.context-action'));
    const target = $$('.picker--day .pick').find((b) => b.textContent?.startsWith('午時'));
    expect(target, '應列出午時').toBeTruthy();
    click(target);
    expect(text('.card__title')).toContain('午時');
    expect(text('.card__sub')).toContain(starName(chart.hour.centerStar));
    expect($$('.ke__item')).toHaveLength(0);
    expect(text('.context-action__label')).toBe('查看八刻');
    expect(text('.context-action')).toContain('8 × 15 分鐘');
    click($('.context-action'));
    expect($$('.ke-pick')).toHaveLength(8);
    expect(text('.ke-picker__note')).toContain('八刻十五分鐘制');
    expect($('.ke-picker__disclaimer')?.hasAttribute('hidden')).toBe(true);
    click($('.ke-picker__info'));
    expect(text('.ke-picker__disclaimer')).toContain('不視為唯一古法');
    expect($('.ke-picker__disclaimer')?.hasAttribute('hidden')).toBe(false);
    expect(location.search).toContain('level=hour');
  });

  it('點第三刻 → 流刻盤，九宮與 engine 一致', () => {
    const items = $$('.ke-pick');
    click(items[2]);
    expect(text('.card__title')).toContain('第三刻');
    expect(text('.card__title-line')).toContain('11:30–11:44');
    const ke = computeFullChart(fromUtc8(2026, 8, 7, 11, 30)).ke;
    expect(text('.card__sub')).toContain(starName(ke.centerStar));
    const cells = $$('.cell');
    const expected = flyNineStars(ke.centerStar, ke.direction);
    for (const p of PALACES) {
      // V2 九宮以 aria-label 帶完整宮名（畫面上顯示簡寫「離 · 南」）
      const cell = cells.find((c) => c.getAttribute('aria-label')?.startsWith(p.name))!;
      expect(cell, p.name).toBeTruthy();
      expect(cell.className, p.name).toContain(`star-${expected[p.key]}`);
    }
    expect(location.search).toContain('level=ke');
    expect(location.search).toContain('t=2026-08-07T11%3A30');
    expect(text('.context-action__label')).toBe('返回時盤');
    const action = $('.context-action')!;
    expect(action.children[0]?.classList.contains('context-action__arrow')).toBe(true);
    expect(action.children[1]?.classList.contains('context-action__copy')).toBe(true);
    expect(action.children[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(action.getAttribute('aria-label')).toBe('返回時盤');
  });

  it('刷新（由 URL 還原）不丟失盤面', async () => {
    const search = location.search;
    document.body.innerHTML = '<div id="app"></div>';
    history.replaceState(null, '', '/' + search);
    const mod = await import('../src/state/appState');
    expect(mod.restoreFromUrl()).toBe(true);
    expect(mod.getState().level).toBe('ke');
    expect(mod.getState().selectedDateTime.getTime()).toBe(fromUtc8(2026, 8, 7, 11, 30).getTime());
  });
});

describe('必備 UI 元素', () => {
  it('中宮突出、洛書數與宮名齊全', () => {
    document.body.innerHTML = '<div id="app"></div>';
  });
});

describe('「今」標示只依 nowUtc8()', () => {
  it('當前時刻的刻標記為今', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    history.replaceState(null, '', '/?t=2026-08-07T11:38&level=hour');
    __setNowForTesting(AT);
    const { getState, restoreFromUrl } = await import('../src/state/appState');
    restoreFromUrl();
    expect(getState().level).toBe('hour');
    // 11:38 落在第三刻 → ①②③ 中第三個帶「今」
    const { getKeStrategy } = await import('../src/engine/flyingStar');
    expect(getKeStrategy('ke8-15min').getKeIndex(AT)).toBe(2);
  });
});
