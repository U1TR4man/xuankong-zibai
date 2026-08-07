/** 設定（規劃書 §28）。 */

import { DAY_CHANGE_LABEL, type DayChangeMode } from '../engine/time/ganzhiDay';
import { YEAR_BOUNDARY_LABEL, type YearBoundary } from '../engine/flyingStar/yearStar';
import { KE_STRATEGIES } from '../engine/flyingStar/ke/registry';
import { getState, updateSettings } from '../state/appState';
import { el } from './dom';

function row(label: string, control: HTMLElement): HTMLElement {
  return el('div', { class: 'set__row' }, el('span', { class: 'set__label' }, label), control);
}

function select<T extends string>(
  value: T,
  options: Array<[T, string]>,
  onChange: (v: T) => void,
): HTMLElement {
  const sel = el('select', {
    class: 'set__control',
    onchange: (e) => onChange((e.target as HTMLSelectElement).value as T),
  });
  for (const [v, label] of options) {
    sel.append(el('option', { value: v, selected: v === value }, label));
  }
  return sel;
}

function toggle(value: boolean, onChange: (v: boolean) => void): HTMLElement {
  return el('input', {
    type: 'checkbox',
    class: 'set__toggle',
    checked: value,
    onchange: (e) => onChange((e.target as HTMLInputElement).checked),
  });
}

export function SettingsSheet(): HTMLElement {
  const s = getState().settings;
  return el(
    'details',
    { class: 'panel panel--settings' },
    el('summary', { class: 'panel__sum' }, '設定'),
    el('div', { class: 'set' },
      row('時間制', el('span', { class: 'set__static' }, 'UTC+8（固定，不使用裝置時區）')),
      row('日柱換日', select<DayChangeMode>(s.dayChangeMode,
        [['midnight', DAY_CHANGE_LABEL.midnight], ['zishi2300', DAY_CHANGE_LABEL.zishi2300]],
        (v) => updateSettings({ dayChangeMode: v }))),
      row('年界', select<YearBoundary>(s.yearBoundary,
        [['lichun', YEAR_BOUNDARY_LABEL.lichun], ['gregorian', YEAR_BOUNDARY_LABEL.gregorian]],
        (v) => updateSettings({ yearBoundary: v }))),
      row('刻盤算法', select(s.keStrategyId,
        KE_STRATEGIES.map((k) => [k.id, k.name] as [string, string]),
        (v) => updateSettings({ keStrategyId: v }))),
      row('顯示星名', toggle(s.showStarName, (v) => updateSettings({ showStarName: v }))),
      row('顯示宮名', toggle(s.showPalaceName, (v) => updateSettings({ showPalaceName: v }))),
      row('顯示洛書數', toggle(s.showLuoshu, (v) => updateSettings({ showLuoshu: v }))),
    ),
  );
}
