/**
 * @vitest-environment jsdom
 *
 * V2 Phase 2：沒有 landing friction，空 URL 直接進現在流時盤；
 * 同時保留明確 URL 與舊 home 狀態的相容性。
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { fromUtc8, __setNowForTesting } from '../src/engine/time/utc8';

const NOW = fromUtc8(2026, 8, 7, 11, 38);
const OLD_TIME = fromUtc8(2025, 12, 3, 14, 20);

const $ = (selector: string) => document.querySelector(selector);
const text = (selector: string) => $(selector)?.textContent ?? '';
const click = (node: Element | null) => {
  node?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
};

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', '/');
  __setNowForTesting(NOW);
  await import('../src/app');
});

describe('Phase 2 首次進入', () => {
  it('空 URL 零操作直接顯示現在流時盤', async () => {
    const { getState } = await import('../src/state/appState');
    const state = getState();
    const chart = computeFullChart(NOW);

    expect(state.home).toBe(true); // migration 期間保留欄位，但不再 render Home
    expect(state.level).toBe('hour');
    expect(state.selectedDateTime.getTime()).toBe(NOW.getTime());
    expect($('.home')).toBeNull();
    expect($('.crumb')).toBeNull();
    expect(text('.card__title')).toContain(chart.hour.title);
    expect(text('.level-segment__item.is-active')).toBe('時');
    expect(text('.date-context__value')).toBe('2026.08.07 · 11:38');
  });

  it('按一次「刻」直接顯示所在刻盤，時間點不變', async () => {
    const { getState } = await import('../src/state/appState');
    const keButton = Array.from(document.querySelectorAll('.level-segment__item'))
      .find((node) => node.textContent === '刻') ?? null;

    click(keButton);
    expect(getState().level).toBe('ke');
    expect(getState().selectedDateTime.getTime()).toBe(NOW.getTime());
    expect(text('.card__title')).toContain('第三刻');
    expect(location.search).toContain('level=ke');
  });
});

describe('Phase 2 舊狀態相容', () => {
  it('明確 t/level URL 仍優先還原', async () => {
    const { getState } = await import('../src/state/appState');
    history.replaceState(null, '', '/?t=2025-12-03T14:20&level=day');
    window.dispatchEvent(new window.PopStateEvent('popstate'));

    expect(getState().home).toBe(false);
    expect(getState().level).toBe('day');
    expect(getState().selectedDateTime.getTime()).toBe(OLD_TIME.getTime());
    expect(text('.level-segment__item.is-active')).toBe('日');
    expect(text('.date-context__now')).toBe('回到今');
  });

  it('「回到今」保留目前層級並改回 nowUtc8', async () => {
    const { getState } = await import('../src/state/appState');
    click($('.date-context__now'));

    expect(getState().home).toBe(false);
    expect(getState().level).toBe('day');
    expect(getState().selectedDateTime.getTime()).toBe(NOW.getTime());
  });

  it('舊 home=true 不再顯示 landing，正規化成現在流時盤', async () => {
    const { getState } = await import('../src/state/appState');
    history.replaceState(null, '', '/?home=true');
    window.dispatchEvent(new window.PopStateEvent('popstate'));

    expect(getState().home).toBe(true);
    expect(getState().level).toBe('hour');
    expect(getState().selectedDateTime.getTime()).toBe(NOW.getTime());
    expect($('.home')).toBeNull();
    expect(text('.card__title')).toContain(computeFullChart(NOW).hour.title);
  });
});
