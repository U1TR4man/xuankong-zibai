/**
 * 九宮盤（規劃書 §5；V2 §13）。
 *
 * 純呈現：只消費 StarResult，絕不自行計算飛星。
 * 固定盤面 巽4 離9 坤2 / 震3 中5 兌7 / 艮8 坎1 乾6。
 *
 * V2 視覺：一個完整方盤（共用細線格線），不是九張獨立圓角卡；
 * 主顯示改為星名（一白／二黑…）而非 ①②③ —— circled number 偏工具感；
 * 九星不再各自著色，中宮是唯一的朱砂強調位。
 *
 * 每宮三層：
 *   離 · 南      12px  muted
 *   二黑         19–24px display
 *   洛書 9       11px  muted（可於設定關閉）
 */

import { PALACES, starName, type StarResult } from '../engine/flyingStar/types';
import type { Settings } from '../state/settings';
import { el } from './dom';

/** 「離宮」→「離」。types.ts 為 engine 共用，不在本輪改動範圍。 */
function shortPalaceName(name: string): string {
  return name.replace(/宮$/, '');
}

export function NinePalaceGrid(result: StarResult, settings: Settings): HTMLElement {
  const grid = el('div', {
    class: 'grid',
    role: 'table',
    'aria-label': `九宮飛星盤，${starName(result.centerStar)}入中`,
  });

  for (const p of PALACES) {
    const star = result.palaceStars[p.key];
    const isCenter = p.key === 'center';

    // 第一層：宮位 · 方位
    const head: string[] = [];
    if (settings.showPalaceName) head.push(isCenter ? '中' : shortPalaceName(p.name));
    if (!isCenter) head.push(p.bearing);
    const headText = head.join(' · ');

    // 第三層：洛書數 / 入中
    const metaText = isCenter ? '入中' : settings.showLuoshu ? `洛書 ${p.luoshu}` : '';

    grid.append(
      el(
        'div',
        {
          class: [
            'cell',
            isCenter ? 'cell--center' : '',
            p.col === 2 ? 'is-lastcol' : '',
            p.row === 2 ? 'is-lastrow' : '',
            `star-${star}`,
          ].filter(Boolean).join(' '),
          style: `grid-row:${p.row + 1};grid-column:${p.col + 1}`,
          role: 'cell',
          'aria-label': `${p.name}${p.bearing}，${starName(star)}`,
        },
        headText ? el('div', { class: 'cell__palace' }, headText) : null,
        el('div', { class: 'cell__star' }, settings.showStarName ? starName(star) : String(star)),
        metaText ? el('div', { class: 'cell__meta' }, metaText) : null,
      ),
    );
  }

  return grid;
}
