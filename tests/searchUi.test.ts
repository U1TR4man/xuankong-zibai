/** @vitest-environment jsdom */

import { beforeAll, describe, expect, it } from 'vitest';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
const $ = <T extends Element = Element>(selector: string) => document.querySelector<T>(selector);
async function waitForSearch(): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (!$('.search-status')) return;
    await new Promise((resolve) => window.setTimeout(resolve, 10));
  }
  throw new Error('搜尋未在 2 秒內完成');
}

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/?t=2026-08-07T11:38&level=hour');
  __setNowForTesting(NOW);
  await import('../src/app');
});

describe('Phase 3 搜尋 UI', () => {
  it('以排盤／搜尋兩個核心入口切換，預設仍是排盤', () => {
    expect(document.querySelectorAll('.workspace-nav__item')).toHaveLength(2);
    expect($('.workspace-nav__item[aria-current="page"]')?.textContent).toBe('排盤');
    expect($('.search-view')).toBeNull();
  });

  it('簡易搜尋提供日期、宮位、日／時／刻與單星條件', () => {
    $<HTMLButtonElement>('.overlay-toggle')!.click();
    const searchButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-nav__item'))
      .find((button) => button.textContent === '搜尋')!;
    searchButton.click();

    const params = new URLSearchParams(location.search);
    expect(params.get('view')).toBe('search');
    expect(params.has('level')).toBe(false);
    expect(params.has('overlay')).toBe(false);
    expect(params.has('overlayPrimary')).toBe(false);
    expect(params.has('selectedPalace')).toBe(false);
    expect($('.workspace-nav__item[aria-current="page"]')?.textContent).toBe('搜尋');
    expect($('.search-view h1')).toBeNull();
    expect($('.search-view')?.firstElementChild?.classList.contains('search-tool')).toBe(true);
    expect($('.search-tool')?.getAttribute('role')).toBe('tablist');
    expect($('.search-tool-panel')?.getAttribute('role')).toBe('tabpanel');
    expect($('.search-view__helper')?.textContent).toBe(
      '選擇宮位、層級與飛星，找出指定日期內所有符合的時間。',
    );
    expect($('.search-mode')).toBeNull();
    expect($('.search-advanced-toggle')?.textContent).toContain('進階條件');
    expect($('.search-advanced-toggle')?.getAttribute('aria-expanded')).toBe('false');
    expect($('.search-form__submit')?.textContent).toBe('開始尋星');
    const toggleBeforeSubmit = $('.search-advanced-toggle')?.compareDocumentPosition(
      $('.search-form__submit')!,
    ) ?? 0;
    expect(toggleBeforeSubmit & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelectorAll('.search-date-range input[type="date"]')).toHaveLength(2);
    expect(document.querySelectorAll('select[name="palace"] option')).toHaveLength(10);
    expect(document.querySelectorAll('input[name="level"]')).toHaveLength(3);
    expect(document.querySelectorAll('input[name="star"]')).toHaveLength(9);
    expect(Array.from(document.querySelectorAll<HTMLInputElement>('input[name="star"]'))
      .map((input) => input.value)).toEqual(['4', '9', '2', '3', '5', '7', '8', '1', '6']);
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
    expect(firstResult.querySelector('.search-result__match')).toBeNull();
    expect($('.search-results__summary')?.textContent).toContain('離 · 南 · 流時 九紫');
    expect(document.querySelectorAll('.search-result-group').length).toBeGreaterThan(0);
    const params = new URLSearchParams(location.search);
    expect(params.get('view')).toBe('search');
    expect(params.get('from')).toBe('2026-09-01');
    expect(params.get('to')).toBe('2026-09-03');
    expect(params.get('searchPalace')).toBe('li');
    expect(params.get('precision')).toBe('hour');
    expect(params.get('star')).toBe('9');
    expect(params.has('level')).toBe(false);
  });

  it('查看結果會由正式盤面重算，開啟疊盤並高亮離宮', async () => {
    expect($('.search-result__open')).toBeNull();
    $<HTMLButtonElement>('.search-result')!.click();
    const { getState } = await import('../src/state/appState');

    expect(getState().view).toBe('chart');
    expect(getState().level).toBe('hour');
    expect(getState().overlayMode).toBe(true);
    expect(getState().overlayPrimaryLevel).toBe('hour');
    expect(getState().selectedPalace).toBe('li');
    expect($('[data-palace="li"]')?.classList.contains('is-selected')).toBe(true);
    expect(getState().searchMatchedLevels).toEqual(['hour']);
    expect(document.querySelectorAll(
      '[data-palace="li"] .overlay-cell__layer.is-search-match',
    )).toHaveLength(1);
    expect($('[data-palace="li"] [data-layer="hour"]')?.classList.contains('is-search-match'))
      .toBe(true);
    expect($('[data-palace="li"] [data-layer="hour"] .overlay-cell__match')).toBeNull();
    expect($('#app')?.textContent).not.toMatch(/[⚠✦✓⚑]/u);
    expect(document.querySelectorAll(
      '.overlay-cell:not([data-palace="li"]) .overlay-cell__layer.is-search-match',
    )).toHaveLength(0);
    const params = new URLSearchParams(location.search);
    expect(params.get('view')).toBe('chart');
    expect(params.get('level')).toBe('hour');
    expect(params.get('overlay')).toBe('1');
    expect(params.get('overlayPrimary')).toBe('hour');
    expect(params.get('selectedPalace')).toBe('li');
    expect(params.has('primary')).toBe(false);
    expect(params.has('palace')).toBe(false);
    expect(params.has('searchPalace')).toBe(false);

    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(getState().view).toBe('chart');
    expect(getState().level).toBe('hour');
    expect(getState().overlayMode).toBe(true);
    expect(getState().selectedPalace).toBe('li');
    expect($('[data-palace="li"]')?.classList.contains('is-selected')).toBe(true);
  });

  it('回到尋星會保留上一輪條件與結果', () => {
    const searchButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-nav__item'))
      .find((button) => button.textContent === '搜尋')!;
    searchButton.click();

    expect($<HTMLSelectElement>('select[name="palace"]')?.value).toBe('li');
    expect($<HTMLInputElement>('input[name="star"][value="9"]')?.checked).toBe(true);
    expect(document.querySelectorAll('.search-result').length).toBeGreaterThan(0);
    expect(new URLSearchParams(location.search).get('searchPalace')).toBe('li');
  });

  it('簡易尋星 URL refresh 可還原日期、宮位、層級與飛星', async () => {
    const savedUrl = location.href;
    history.replaceState(null, '', savedUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    const { getState } = await import('../src/state/appState');

    expect(getState().view).toBe('search');
    expect(getState().starSearch).toEqual({
      mode: 'simple',
      from: '2026-09-01', to: '2026-09-03', searchPalace: 'li', precision: 'hour', star: 9,
    });
    // 舊連結沒有 mode 參數，仍須解析為簡易模式。
    expect(new URLSearchParams(location.search).has('mode')).toBe(false);
    expect($<HTMLInputElement>('input[name="startDate"]')?.value).toBe('2026-09-01');
    expect($<HTMLInputElement>('input[name="endDate"]')?.value).toBe('2026-09-03');
    expect($<HTMLSelectElement>('select[name="palace"]')?.value).toBe('li');
    expect($<HTMLInputElement>('input[name="level"][value="hour"]')?.checked).toBe(true);
    expect($<HTMLInputElement>('input[name="star"][value="9"]')?.checked).toBe(true);
  });

  it('進階搜尋支援同層多星 OR、跨層 AND 與組合摘要', async () => {
    const advanced = $<HTMLButtonElement>('.search-advanced-toggle')!;
    advanced.click();

    expect(new URLSearchParams(location.search).has('from')).toBe(false);
    expect($('.search-view h1')).toBeNull();
    expect($('.search-view__helper')?.textContent).toBe(
      '可同時指定多個層級；同層選多星代表任一符合，跨層條件必須同時成立。',
    );
    expect($('.search-advanced-toggle')?.getAttribute('aria-expanded')).toBe('true');
    expect($('.search-advanced__rule')?.textContent).toContain('同層選多星代表任一符合');
    expect(document.querySelectorAll('.search-advanced__level')).toHaveLength(3);
    for (const name of ['dayStars', 'hourStars', 'keStars']) {
      expect(Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`))
        .map((input) => input.value)).toEqual(['4', '9', '2', '3', '5', '7', '8', '1', '6']);
    }
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
    $<HTMLButtonElement>('.search-advanced-toggle')!.click();

    expect($('.search-advanced-toggle')?.getAttribute('aria-expanded')).toBe('false');
    expect(new URLSearchParams(location.search).get('searchPalace')).toBe('li');
    expect($<HTMLInputElement>('input[name="level"][value="hour"]')?.checked).toBe(true);
    expect($<HTMLInputElement>('input[name="star"][value="9"]')?.checked).toBe(true);

    $<HTMLButtonElement>('.search-advanced-toggle')!.click();
    expect($<HTMLInputElement>('input[name="hourStars"][value="8"]')?.checked).toBe(true);
    expect($<HTMLInputElement>('input[name="keStars"][value="9"]')?.checked).toBe(true);
    $<HTMLButtonElement>('.search-advanced-toggle')!.click();
  });

  it('進階條件可由 URL refresh 還原三層飛星', async () => {
    $<HTMLButtonElement>('.search-advanced-toggle')!.click();
    expect($('.search-advanced-toggle')?.getAttribute('aria-expanded')).toBe('true');

    // 承接上一輪保留下來的 時 8／9、刻 8／9，改成 日 1／3 ＋ 時 9。
    for (const selector of [
      'input[name="hourStars"][value="8"]',
      'input[name="keStars"][value="8"]',
      'input[name="keStars"][value="9"]',
      'input[name="dayStars"][value="1"]',
      'input[name="dayStars"][value="3"]',
    ]) $<HTMLInputElement>(selector)!.click();

    const params = new URLSearchParams(location.search);
    expect(params.get('mode')).toBe('advanced');
    expect(params.get('searchPalace')).toBe('li');
    // 飛星恆為一位數，同層集合序列化為升序連續數字。
    expect(params.get('dayStars')).toBe('13');
    expect(params.get('hourStars')).toBe('9');
    // 空集合不寫入，且進階模式不得殘留簡易模式的欄位。
    expect(params.has('keStars')).toBe(false);
    expect(params.has('precision')).toBe(false);
    expect(params.has('star')).toBe(false);

    window.dispatchEvent(new PopStateEvent('popstate'));
    const { getState } = await import('../src/state/appState');
    expect(getState().starSearch).toEqual({
      mode: 'advanced',
      from: $<HTMLInputElement>('input[name="startDate"]')!.value,
      to: $<HTMLInputElement>('input[name="endDate"]')!.value,
      searchPalace: 'li',
      dayStars: [1, 3],
      hourStars: [9],
      keStars: [],
    });
    expect($('.search-advanced-toggle')?.getAttribute('aria-expanded')).toBe('true');
    expect($<HTMLSelectElement>('select[name="palace"]')?.value).toBe('li');
    for (const selector of [
      'input[name="dayStars"][value="1"]',
      'input[name="dayStars"][value="3"]',
      'input[name="hourStars"][value="9"]',
    ]) expect($<HTMLInputElement>(selector)?.checked).toBe(true);
    expect($<HTMLInputElement>('input[name="dayStars"][value="9"]')?.checked).toBe(false);
    expect(document.querySelectorAll('input[name="keStars"]:checked')).toHaveLength(0);

    // 復原成簡易模式：URL restore 後單星欄位已清空，需重新選星。
    $<HTMLButtonElement>('.search-advanced-toggle')!.click();
    $<HTMLInputElement>('input[name="star"][value="9"]')!.click();
    expect(new URLSearchParams(location.search).has('mode')).toBe(false);
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
