import { rankDirections } from '../selection/evaluateDirection';
import { VERDICT_LABEL, type DirectionEvaluation, type DirectionVerdict } from '../selection/types';
import { selectPalace, type AppState } from '../state/appState';
import { openDirectionDetailSheet } from './DirectionDetailSheet';
import { el } from './dom';

const VERDICTS: readonly DirectionVerdict[] = ['priority', 'usable', 'mixed', 'ordinary', 'caution'];

export function DirectionRanking(
  evaluations: readonly DirectionEvaluation[],
  state: AppState,
): HTMLElement {
  const ranked = rankDirections(evaluations);
  const groups = VERDICTS.flatMap((verdict) => {
    const items = ranked.filter((evaluation) => evaluation.verdict === verdict);
    if (items.length === 0) return [];
    return [el('div', { class: `selection-ranking__group verdict--${verdict}` },
      el('h3', {}, VERDICT_LABEL[verdict]),
      el('div', { class: 'selection-ranking__directions' },
        ...items.map((evaluation) => el('button', {
          class: 'selection-ranking__direction', type: 'button',
          'data-ranking-palace': evaluation.snapshot.palace,
          onclick: (event: Event) => {
            const trigger = event.currentTarget as HTMLElement;
            selectPalace(evaluation.snapshot.palace);
            queueMicrotask(() => openDirectionDetailSheet(
              trigger,
              evaluation,
              state.selectedPair,
              state.selectedPairLayer,
            ));
          },
        }, evaluation.snapshot.bearing)),
      ),
    )];
  });
  return el('section', { class: 'selection-ranking', 'aria-labelledby': 'selection-ranking-title' },
    el('div', { class: 'selection-ranking__head' },
      el('h2', { id: 'selection-ranking-title' }, '方向排序'),
      el('small', {}, 'TOOL_HEURISTIC · 雙星不入排序')),
    ...groups,
  );
}
