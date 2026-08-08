import { purposeLabel } from '../selection/purpose';
import {
  VERDICT_LABEL, type DirectionEvaluation, type PairHit, type SourceLevel,
} from '../selection/types';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';
import { openPairRuleSheet } from './PairRuleSheet';

const SOURCE_LABEL: Record<SourceLevel, string> = {
  A: 'A · 古訣直述', B: 'B · 古訣旁證', C: 'C · 推演／結構',
};

function starItem(label: string, value: number): HTMLElement {
  return el('span', { class: 'direction-detail__star' },
    el('small', {}, label), el('strong', {}, String(value)));
}

function pairRow(hit: PairHit, matched = false, returnFocusSelector?: string): HTMLElement {
  return el('button', {
    class: `direction-pair${matched ? ' is-match' : ''}`,
    type: 'button',
    'data-pair': hit.pair,
    'data-pair-layer': hit.layer,
    onclick: (event: Event) => openPairRuleSheet(
      event.currentTarget as HTMLElement, hit.rule, returnFocusSelector,
    ),
  },
  el('span', { class: 'direction-pair__layer' }, hit.layerLabel),
  el('strong', { class: 'direction-pair__key' }, hit.pair),
  el('span', { class: 'direction-pair__meaning' },
    hit.rule.reviewStatus === 'pending' ? '資料待校對' : `${hit.rule.title} · ${hit.rule.shortMeaning}`),
  el('small', { class: 'direction-pair__source' }, SOURCE_LABEL[hit.rule.sourceLevel]),
  );
}

function mainHits(evaluation: DirectionEvaluation): PairHit[] {
  const explicit = [
    ...evaluation.cautionHits, ...evaluation.favorableHits, ...evaluation.mixedHits,
  ];
  return (explicit.length > 0 ? explicit : [evaluation.topHit]).slice(0, 2);
}

export function openDirectionDetailSheet(
  trigger: HTMLElement,
  evaluation: DirectionEvaluation,
  matchedPair?: string,
  matchedLayer?: string,
): void {
  const { snapshot } = evaluation;
  const returnSelector = `[data-selection-palace="${snapshot.palace}"]`;
  const reasons = el('ul', { class: 'direction-reasons' },
    ...evaluation.reasons.map((reason) => el('li', {}, reason)));
  const pairList = el('div', { class: 'direction-pairs' },
    ...evaluation.hits.map((hit) => pairRow(
      hit, hit.pair === matchedPair && (!matchedLayer || hit.layer === matchedLayer),
      returnSelector,
    )),
  );
  const elementList = el('ul', { class: 'direction-elements' },
    ...evaluation.hits.map((hit) => el('li', {}, `${hit.layerLabel} ${hit.pair}｜${hit.rule.elementRelation}`)),
  );
  const main = el('div', { class: 'direction-main-pairs' },
    ...mainHits(evaluation).map((hit) => pairRow(
      hit, hit.pair === matchedPair, returnSelector,
    )));

  openBottomSheet({
    title: `${snapshot.name} · ${snapshot.bearing}`,
    trigger,
    className: 'sheet-dialog--direction',
    returnFocusSelector: returnSelector,
    content: el('div', { class: 'direction-detail' },
      el('div', { class: 'direction-detail__stars', 'aria-label': '年月日時四星' },
        starItem('年', snapshot.yearStar), starItem('月', snapshot.monthStar),
        starItem('日', snapshot.dayStar), starItem('時', snapshot.hourStar)),
      el('p', { class: `direction-detail__verdict verdict--${evaluation.verdict}` },
        `狀態：${VERDICT_LABEL[evaluation.verdict]}`),
      evaluation.purpose !== 'general'
        ? el('p', { class: 'direction-detail__purpose' },
          `用途：${purposeLabel(evaluation.purpose)} · 命中 ${evaluation.purposeHits.length} 組`)
        : null,
      el('section', { class: 'direction-section' },
        el('h3', {}, '主要組合'), main),
      el('section', { class: 'direction-section' },
        el('h3', {}, '為甚麼'), reasons),
      el('section', { class: 'direction-section' },
        el('h3', {}, '全部六組'), pairList),
      el('section', { class: 'direction-section' },
        el('h3', {}, '五行關係'), elementList),
      el('p', { class: 'direction-detail__disclaimer' },
        '狀態屬 TOOL_HEURISTIC；古訣、五行結構與工具排序分層顯示，不代表個人化吉凶保證。'),
    ),
  });
}
