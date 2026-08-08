import { starName, type PalaceKey, type StarLevel } from '../engine/flyingStar/types';
import type { OverlayResult, PalaceOverlayViewModel } from '../overlay/types';
import { selectPalace } from '../state/appState';
import { el } from './dom';
import { openPalaceOverlaySheet } from './PalaceOverlaySheet';

const LEVEL_LABEL: Record<StarLevel, string> = {
  year: '年', month: '月', day: '日', hour: '時', ke: '刻',
};

const LEVELS: readonly StarLevel[] = ['year', 'month', 'day', 'hour', 'ke'];

function accessibleLabel(
  palace: PalaceOverlayViewModel,
  primary: StarLevel,
  matchedLevels: readonly StarLevel[],
): string {
  const place = palace.key === 'center' ? '中宮' : `${palace.name}宮${palace.bearing}`;
  const layers = LEVELS.map((level) => `流${LEVEL_LABEL[level]}${starName(palace.stars[level])}`).join('，');
  const matches = matchedLevels.length > 0
    ? `，命中${matchedLevels.map((level) => `流${LEVEL_LABEL[level]}`).join('、')}`
    : '';
  return `${place}，${layers}，主顯示流${LEVEL_LABEL[primary]}${starName(palace.stars[primary])}${matches}`;
}

function openSelectedPalace(palace: PalaceOverlayViewModel, primary: StarLevel): void {
  selectPalace(palace.key);
  queueMicrotask(() => {
    const trigger = document.querySelector<HTMLElement>(`[data-palace="${palace.key}"]`);
    if (trigger) openPalaceOverlaySheet(trigger, palace, primary);
  });
}

export function NinePalaceOverlayGrid(
  overlay: OverlayResult,
  primaryLevel: StarLevel,
  selectedPalace?: PalaceKey,
  searchMatchedLevels: readonly StarLevel[] = [],
): HTMLElement {
  const grid = el('div', {
    class: `grid overlay-grid${selectedPalace ? ' has-selection' : ''}`,
    role: 'grid',
    'aria-label': `九宮疊盤，主顯示流${LEVEL_LABEL[primaryLevel]}`,
  });

  for (const palace of overlay.palaces) {
    const meta = palace.key === 'center' ? '中' : `${palace.name} · ${palace.bearing}`;
    const selected = palace.key === selectedPalace;
    const matchedLevels = selected ? searchMatchedLevels : [];
    const cell = el('button', {
      class: [
        'cell', 'overlay-cell', palace.key === 'center' ? 'cell--center' : '',
        palace.col === 2 ? 'is-lastcol' : '',
        palace.row === 2 ? 'is-lastrow' : '',
        selected ? 'is-selected' : '',
      ].filter(Boolean).join(' '),
      style: `grid-row:${palace.row + 1};grid-column:${palace.col + 1}`,
      type: 'button',
      role: 'gridcell',
      'data-palace': palace.key,
      'aria-pressed': String(selected),
      'aria-label': accessibleLabel(palace, primaryLevel, matchedLevels),
      onclick: () => openSelectedPalace(palace, primaryLevel),
    },
      el('span', { class: 'cell__palace' }, meta),
      el('span', { class: 'cell__star' }, starName(palace.stars[primaryLevel])),
      el('span', { class: 'overlay-cell__layers', 'aria-hidden': 'true' },
        ...LEVELS.map((level) => {
          const searchMatch = matchedLevels.includes(level);
          return el('span', {
            class: [
              'overlay-cell__layer',
              level === primaryLevel ? 'is-primary' : '',
              searchMatch ? 'is-search-match' : '',
            ].filter(Boolean).join(' '),
            'data-layer': level,
          },
          el('span', { class: 'overlay-cell__label' }, LEVEL_LABEL[level]),
          el('span', { class: 'overlay-cell__value' },
            String(palace.stars[level]),
            searchMatch
              ? el('span', { class: 'overlay-cell__match', 'aria-label': '命中' }, '✓')
              : null,
          ),
          );
        }),
      ),
    );
    grid.append(cell);
  }

  return grid;
}
