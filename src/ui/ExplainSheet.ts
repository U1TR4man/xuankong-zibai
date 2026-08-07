/** 主畫面只留一句 trigger；推導鏈移入 Explain Sheet。 */

import { DIRECTION_LABEL, starName, type StarResult } from '../engine/flyingStar/types';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

export function openExplainSheet(trigger: HTMLElement, result: StarResult): HTMLDialogElement {
  const content = el('div', { class: 'explain-sheet' },
    el('ol', { class: 'chain' },
      ...result.explain.map((step) => el('li', { class: 'chain__step' },
        el('span', { class: 'chain__label' }, step.label),
        el('span', { class: 'chain__value' }, step.value))),
      el('li', { class: 'chain__step chain__step--final' },
        el('span', { class: 'chain__label' }, '結果'),
        el('span', { class: 'chain__value' },
          `${starName(result.centerStar)}入中 · ${DIRECTION_LABEL[result.direction]}`)),
    ),
    el('section', { class: 'explain-rule' },
      el('h3', { class: 'explain-rule__title' }, '規則來源'),
      el('p', { class: 'explain-rule__text' }, result.sourceRule)),
  );

  return openBottomSheet({
    title: `為何是${starName(result.centerStar)}？`, content, trigger,
    className: 'sheet-dialog--explain', returnFocusSelector: '.explain-trigger',
  }).dialog;
}

export function ExplainTrigger(result: StarResult): HTMLElement {
  return el('button', {
    class: 'explain-trigger', type: 'button',
    onclick: (event) => openExplainSheet(event.currentTarget as HTMLElement, result),
  }, `為何是${starName(result.centerStar)}？`, el('span', { 'aria-hidden': 'true' }, '›'));
}
