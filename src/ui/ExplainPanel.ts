/** Explain Mode（規劃書 §27）：為何是此星？ */

import type { StarResult } from '../engine/flyingStar/types';
import { DIRECTION_LABEL, starName } from '../engine/flyingStar/types';
import { el } from './dom';

export function ExplainPanel(result: StarResult): HTMLElement {
  return el(
    'details',
    { class: 'panel panel--explain' },
    el('summary', { class: 'panel__sum' }, '為何是此星？'),
    el('ol', { class: 'chain' },
      ...result.explain.map((s) =>
        el('li', { class: 'chain__step' },
          el('span', { class: 'chain__label' }, s.label),
          el('span', { class: 'chain__value' }, s.value)),
      ),
      el('li', { class: 'chain__step chain__step--final' },
        el('span', { class: 'chain__label' }, '結果'),
        el('span', { class: 'chain__value' },
          `${starName(result.centerStar)}入中 · ${DIRECTION_LABEL[result.direction]}`)),
    ),
    el('p', { class: 'panel__rule' }, result.sourceRule),
  );
}
