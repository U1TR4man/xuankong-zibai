import { starName } from '../engine/flyingStar/types';
import { purposeLabel } from '../selection/purpose';
import { PURPLE_WHITE_SIGNAL_LABEL, WHITE_KILLER_LABEL } from '../selection/researchEvidence';
import {
  VERDICT_LABEL, type BranchQiState, type DirectionEvaluation, type DirectionLevel,
  type LayerRole, type PairHit, type PalaceElementRelation, type SeasonalState,
  type SourceGrade, type TemporalStarAssessment,
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
const SEASONAL_LABEL: Record<SeasonalState, string> = {
  command: '得令', support: '得生', rest: '休', imprisoned: '囚', controlled: '受制',
};
const QI_LABEL: Record<BranchQiState, string> = {
  active: '支序有氣', inactive: '支序未列有氣', unknown: '支序有氣未建表',
};
const ROLE_LABEL: Record<LayerRole, string> = {
  background_or_large_scale: '背景／大型修作', primary: '主要層', fine_tuning: '細選',
};
const ELEMENT_RELATION_LABEL: Record<PalaceElementRelation, (
  palace: string, star: string,
) => string> = {
  same: (palace) => `宮星同屬${palace}`,
  palace_generates_star: (palace, star) => `宮${palace}生星${star}`,
  star_generates_palace: (palace, star) => `星${star}生宮${palace}`,
  palace_controls_star: (palace, star) => `宮${palace}剋星${star}`,
  star_controls_palace: (palace, star) => `星${star}剋宮${palace}`,
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

function layerName(state: TemporalStarAssessment): string {
  return `${LEVEL_LABEL[state.level]}${starName(state.star)}`;
}

function temporalConditions(evaluation: DirectionEvaluation): HTMLElement {
  return el('ul', { class: 'direction-condition-list' },
    ...evaluation.temporalProfile.starStates.map((state) => {
      const qualified = evaluation.qualifiedPurpleWhiteHits.includes(state.level);
      const conditions = [
        `${state.periodBranch}支`,
        state.isPurpleWhite ? qualified ? '✓ 合格紫白' : '紫白條件未齊' : '',
        QI_LABEL[state.temporalState.branchQi],
        state.temporalState.liuJieTomb ? '入墓' : '',
        state.temporalState.absolute ? '臨絕' : '',
        `月令${SEASONAL_LABEL[state.seasonalState]}`,
        ELEMENT_RELATION_LABEL[state.elementRelation.relation](
          state.elementRelation.palaceElement, state.elementRelation.starElement,
        ),
      ].filter(Boolean);
      return el('li', {},
        el('strong', {}, layerName(state)),
        el('span', {}, conditions.join(' · ')),
        el('small', {}, `${ROLE_LABEL[state.role]} · 時層套用 ${state.temporalState.qiEvidence} 級`));
    }));
}

function killerConditions(evaluation: DirectionEvaluation): HTMLElement {
  const hits = evaluation.temporalProfile.whiteKillerAssessment.hits;
  if (hits.length === 0) {
    return el('p', { class: 'direction-condition-empty' }, '本方四層未命中白中殺定局');
  }
  return el('ul', { class: 'direction-killer-list' },
    ...hits.map((hit) => el('li', {},
      el('strong', {}, `${LEVEL_LABEL[hit.level]}${starName(hit.star)}`),
      el('span', {}, hit.killers.map((killer) => killer === 'an_jian'
        ? `月暗建（月白${evaluation.temporalProfile.monthAnJian.centerStar}入中）`
        : WHITE_KILLER_LABEL[killer]).join('、')))));
}

function conditionSummary(evaluation: DirectionEvaluation): string {
  const states = evaluation.temporalProfile.starStates;
  const active = states.filter((state) => state.temporalState.branchQi === 'active').length;
  const tomb = states.filter((state) => state.temporalState.liuJieTomb).length;
  const absolute = states.filter((state) => state.temporalState.absolute).length;
  const killers = evaluation.temporalProfile.whiteKillerAssessment.hits.length;
  return [
    `紫白到方 ${evaluation.purpleWhiteCount}/4`,
    `合格 ${evaluation.qualifiedPurpleWhiteCount} 層`,
    `白中殺 ${killers > 0 ? `${killers} 層` : '未命中'}`,
    active > 0 ? `支序有氣 ${active} 層` : '',
    tomb > 0 ? `入墓 ${tomb} 層` : '',
    absolute > 0 ? `臨絕 ${absolute} 層` : '',
  ].filter(Boolean).join(' · ');
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
    return `${LEVEL_LABEL[level]}${starName(state.star)}（${
      evaluation.qualifiedPurpleWhiteHits.includes(level) ? '合格' : '條件未齊'}）`;
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
      el('section', { class: 'direction-section direction-primary-conditions' },
        el('h3', {}, '時氣與白中殺'),
        el('p', {}, conditionSummary(evaluation))),
      el('section', { class: 'direction-section direction-primary-reference' },
        el('h3', {}, '主要參考'), main),
      el('div', { class: 'direction-disclosures' },
        disclosure('為甚麼',
          el('section', { class: 'direction-section direction-temporal' },
            el('h3', {}, '紫白擇方主幹'),
            el('p', { class: 'direction-temporal__signal' },
              `紫白到方 ${evaluation.purpleWhiteCount}/4 · ${PURPLE_WHITE_SIGNAL_LABEL[evaluation.purpleWhiteSignal]}`),
            el('p', {}, purpleWhiteLayers.length > 0
              ? `命中層：${purpleWhiteLayers.join('、')}` : '命中層：無')),
          el('section', { class: 'direction-section direction-branch-conditions' },
            el('h3', {}, '有氣、墓絕與月令'),
            temporalConditions(evaluation)),
          el('section', { class: 'direction-section direction-killers' },
            el('h3', {}, '白中殺'),
            killerConditions(evaluation)),
          reasons),
        disclosure('全部六組', pairList),
        disclosure('五行關係', elementList),
        disclosure('研究說明',
          el('div', { class: 'direction-research' },
            el('p', {}, '雙星組合僅供研究參考，不參與方向排序。'),
            el('p', {}, '月暗建依月白入中星反推禁修方；不是宮內飛星回本宮。受剋殺只採古表定局，一般宮星五行相剋另列。'),
            el('p', {}, '「紫白一時加／二時加」存在異文，不作至少兩層才成立的門檻；單一合格紫白亦可成為正面訊號。'),
            el('p', {}, '目前日常擇吉方是本工具對傳統修方紫白邏輯的延伸應用；月、日為主要層，年作背景，時作細選。'),
            el('p', {}, '月令狀態只作條件顯示；刑宮、害宮、四空亡、納音及固定數值權重尚未納入。'),
            el('p', {}, '目前判定名稱屬工具分級，不是古籍原有等級。'))),
      ),
    ),
  });
}
