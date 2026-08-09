import { starName } from '../engine/flyingStar/types';
import { purposeLabel } from '../selection/purpose';
import { PURPLE_WHITE_SIGNAL_LABEL } from '../selection/researchEvidence';
import {
  VERDICT_LABEL, type DirectionEvaluation, type DirectionLevel, type PairHit, type SourceGrade,
} from '../selection/types';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';
import { openPairRuleSheet } from './PairRuleSheet';

const SOURCE_LABEL: Record<SourceGrade, string> = {
  A: '研究簡寫 A', 'A/B': '研究簡寫 A/B',
  B: '研究簡寫 B', 'B/C': '研究簡寫 B/C', C: '研究簡寫 C',
};
const LEVEL_LABEL: Record<DirectionLevel, string> = {
  year: '年', month: '月', day: '日', hour: '時',
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
  el('small', { class: 'direction-pair__source' }, SOURCE_LABEL[hit.rule.sourceGrade]),
  );
}

function mainHits(evaluation: DirectionEvaluation): PairHit[] {
  const explicit = [
    ...evaluation.cautionHits, ...evaluation.favorableHits, ...evaluation.mixedHits,
  ];
  return (explicit.length > 0 ? explicit : [evaluation.topHit]).slice(0, 2);
}

function disclosure(title: string, ...content: HTMLElement[]): HTMLElement {
  return el('details', { class: 'direction-disclosure' },
    el('summary', {}, title),
    el('div', { class: 'direction-disclosure__body' }, ...content));
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
  const purpleWhiteLayers = evaluation.temporalProfile.purpleWhiteHits.map((level) => {
    const state = evaluation.temporalProfile.starStates.find((item) => item.level === level)!;
    return `${LEVEL_LABEL[level]}${starName(state.star)}`;
  });

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
        VERDICT_LABEL[evaluation.verdict]),
      evaluation.purpose !== 'general'
        ? el('p', { class: 'direction-detail__purpose' },
          `雙星用途參考：${purposeLabel(evaluation.purpose)} · 命中 ${evaluation.purposeHits.length} 組`)
        : null,
      el('section', { class: 'direction-section direction-primary-reference' },
        el('h3', {}, '主要參考'), main),
      el('div', { class: 'direction-disclosures' },
        disclosure('為甚麼',
          el('section', { class: 'direction-section direction-temporal' },
            el('h3', {}, '紫白擇方主幹'),
            el('p', { class: 'direction-temporal__signal' },
              `${evaluation.purpleWhiteCount}/4 · ${PURPLE_WHITE_SIGNAL_LABEL[evaluation.purpleWhiteSignal]}`),
            el('p', {}, purpleWhiteLayers.length > 0
              ? `命中層：${purpleWhiteLayers.join('、')}` : '命中層：無')),
          reasons),
        disclosure('全部六組', pairList),
        disclosure('五行關係', elementList),
        disclosure('研究說明',
          el('div', { class: 'direction-research' },
            el('p', {}, '雙星組合僅供研究參考，不參與方向排序。'),
            el('p', {}, '有氣、墓絕及白中殺目前尚未納入判定。'))),
      ),
    ),
  });
}
