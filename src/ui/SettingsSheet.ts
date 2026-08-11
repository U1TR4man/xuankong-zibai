/** 設定 Bottom Sheet（V2 §21）。 */

import { DAY_CHANGE_LABEL, type DayChangeMode } from '../engine/time/ganzhiDay';
import { YEAR_BOUNDARY_LABEL, type YearBoundary } from '../engine/flyingStar/yearStar';
import { KE_STRATEGIES } from '../engine/flyingStar/ke/registry';
import type { SelectionMode } from '../selection/hourGate';
import { getState, updateSettings } from '../state/appState';
import type { DisplayMode } from '../state/settings';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

function row(label: string, control: HTMLElement): HTMLElement {
  return el('label', { class: 'set__row' }, el('span', { class: 'set__label' }, label), control);
}

function staticRow(label: string, value: string): HTMLElement {
  return el('div', { class: 'set__row' },
    el('span', { class: 'set__label' }, label),
    el('span', { class: 'set__static' }, value));
}

function select<T extends string>(
  value: T,
  options: Array<[T, string]>,
  onChange: (v: T) => void,
): HTMLElement {
  const control = el('select', {
    class: 'set__control',
    onchange: (event) => onChange((event.target as HTMLSelectElement).value as T),
  });
  for (const [optionValue, label] of options) {
    control.append(el('option', { value: optionValue, selected: optionValue === value }, label));
  }
  return control;
}

function toggle(value: boolean, onChange: (v: boolean) => void): HTMLElement {
  return el('input', {
    type: 'checkbox', class: 'set__toggle', checked: value,
    onchange: (event) => onChange((event.target as HTMLInputElement).checked),
  });
}

/** 設定項的補充說明；不是控制項，故不用 `row()` 的 label 結構。 */
function note(text: string): HTMLElement {
  return el('p', { class: 'set__note' }, text);
}

function group(title: string, ...rows: HTMLElement[]): HTMLElement {
  return el('section', { class: 'set-group' },
    el('h3', { class: 'set-group__title' }, title),
    el('div', { class: 'set' }, ...rows));
}

export function openSettingsSheet(trigger: HTMLElement): HTMLDialogElement {
  const settings = getState().settings;
  const content = el('div', { class: 'settings-sheet' },
    group('顯示',
      row('模式', select<DisplayMode>(settings.displayMode,
        [['simple', '簡潔'], ['study', '研習']],
        (v) => updateSettings({ displayMode: v }))),
      row('顯示星名', toggle(settings.showStarName, (v) => updateSettings({ showStarName: v }))),
      row('顯示宮名', toggle(settings.showPalaceName, (v) => updateSettings({ showPalaceName: v }))),
      row('顯示洛書數', toggle(settings.showLuoshu, (v) => updateSettings({ showLuoshu: v }))),
    ),
    group('排盤',
      row('日柱換日', select<DayChangeMode>(settings.dayChangeMode,
        [['midnight', DAY_CHANGE_LABEL.midnight], ['zishi2300', DAY_CHANGE_LABEL.zishi2300]],
        (v) => updateSettings({ dayChangeMode: v }))),
      row('年界', select<YearBoundary>(settings.yearBoundary,
        [['lichun', YEAR_BOUNDARY_LABEL.lichun], ['gregorian', YEAR_BOUNDARY_LABEL.gregorian]],
        (v) => updateSettings({ yearBoundary: v }))),
      row('刻盤算法', select(settings.keStrategyId,
        KE_STRATEGIES.map((strategy) => [strategy.id, strategy.name] as [string, string]),
        (v) => updateSettings({ keStrategyId: v }))),
    ),
    group('擇吉',
      row('用事', select<SelectionMode>(settings.selectionMode,
        [['daily', '日常'], ['construction', '修造']],
        (v) => updateSettings({ selectionMode: v }))),
      note('修造時，時沖月令或歲君由「不宜」提升為「不用」。依據是《協紀》'
        + '「大事則忌，小事可勿論」，只作用於時課，不改日課、方位與方向排序。'),
    ),
    group('關於',
      staticRow('時間制', 'UTC+8'),
      staticRow('節氣資料', '定氣法・離線計算'),
      staticRow('離線狀態', 'PWA 可離線使用'),
    ),
  );

  return openBottomSheet({
    title: '設定', content, trigger,
    className: 'sheet-dialog--settings', returnFocusSelector: '[data-sheet-trigger="settings"]',
  }).dialog;
}
