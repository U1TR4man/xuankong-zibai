/**
 * 九宮盤（規劃書 §5）。
 *
 * 純呈現：只消費 StarResult，絕不自行計算飛星。
 * 固定盤面 巽4 離9 坤2 / 震3 中5 兌7 / 艮8 坎1 乾6，中宮視覺突出。
 */

import { PALACES, STAR_ELEMENTS, starName, type StarResult } from '../engine/flyingStar/types';
import type { Settings } from '../state/settings';
import { el } from './dom';

const CIRCLED = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

export function NinePalaceGrid(result: StarResult, settings: Settings): HTMLElement {
  const grid = el('div', { class: 'grid', role: 'table', 'aria-label': '九宮飛星盤' });
  for (const p of PALACES) {
    const star = result.palaceStars[p.key];
    grid.append(
      el(
        'div',
        {
          class: `cell${p.key === 'center' ? ' cell--center' : ''} star-${star}`,
          style: `grid-row:${p.row + 1};grid-column:${p.col + 1}`,
          role: 'cell',
        },
        el(
          'div',
          { class: 'cell__head' },
          settings.showPalaceName ? el('span', { class: 'cell__palace' }, p.name) : null,
          settings.showLuoshu ? el('span', { class: 'cell__luoshu' }, String(p.luoshu)) : null,
        ),
        el('div', { class: 'cell__star' }, CIRCLED[star] ?? String(star)),
        settings.showStarName
          ? el(
              'div',
              { class: 'cell__name' },
              starName(star),
              el('span', { class: 'cell__elem' }, STAR_ELEMENTS[star] ?? ''),
            )
          : null,
        el('div', { class: 'cell__bearing' }, p.key === 'center' ? '入中' : p.bearing),
      ),
    );
  }
  return grid;
}
