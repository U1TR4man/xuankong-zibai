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
  A: '古法規則', 'A/B': '古法規則與研究整理',
  B: '研究整理', 'B/C': '研究整理', C: '研究中',
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
  background_or_large_scale: '長期背景',
  seasonal_command: '月令核心',
  day_gate: '日主 Gate',
  fine_tuning: '細選／扶日',
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

function starItem(label: string, ganzhi: string, value: number): HTMLElement {
  return el('span', { class: 'direction-detail__star' },
    el('small', {}, label),
    el('span', { class: 'direction-detail__ganzhi' }, ganzhi),
    el('strong', {}, String(value)));
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

function temporalConditions(evaluation: DirectionEvaluation): HTMLElement {
  return el('ul', { class: 'direction-condition-list' },
    ...evaluation.temporalProfile.starStates.map((state) => {
      const qualified = evaluation.qualifiedPurpleWhiteHits.includes(state.level);
      const conditions = [
        state.isPurpleWhite ? qualified ? '✓ 合格紫白' : '紫白條件未齊' : '',
        branchQiLabel(state),
        state.temporalState.liuJieTomb ? '入墓' : '',
        state.temporalState.absolute ? '臨絕' : '',
        `月令${SEASONAL_LABEL[state.seasonalState]}`,
      ].filter(Boolean);
      return el('li', {},
        el('strong', {}, `${LEVEL_LABEL[state.level]} · ${state.ganzhi.text} · ${starName(state.star)}`),
        el('span', {}, `${state.periodBranch}支 → ${conditions.join(' · ')}`),
        el('small', {}, `${ROLE_LABEL[state.role]} · ${qiUseLabel(state)} · 星與時間地支判讀`));
    }));
}

function branchQiLabel(state: TemporalStarAssessment): string {
  const label = QI_LABEL[state.temporalState.branchQi];
  if (state.temporalState.qiRankingUse === 'reference_only') return `${label}（類推參考）`;
  if (state.temporalState.qiRankingUse === 'warning_only') return `${label}（研究判讀）`;
  return label;
}

function qiUseLabel(state: TemporalStarAssessment): string {
  if (state.temporalState.qiRankingUse === 'active') return '年月正式運用';
  if (state.temporalState.qiRankingUse === 'warning_only') return '日支只作警示';
  return '時支只作類推參考';
}

function killerConditions(evaluation: DirectionEvaluation): HTMLElement {
  const hits = evaluation.temporalProfile.whiteKillerAssessment.hits;
  if (hits.length === 0) {
    return el('p', { class: 'direction-condition-empty' }, '本方四層未命中白中殺定局');
  }
  return el('ul', { class: 'direction-killer-list' },
    ...hits.flatMap((hit) => hit.killers.map((killer) => {
      const referenceOnly = hit.rankingUse === 'reference_only';
      if (killer === 'an_jian') {
        const assessment = evaluation.temporalProfile.anJian.genericWhiteKiller[hit.level];
        const centerStar = assessment.centerStar;
        return el('li', {},
          el('strong', {}, `${LEVEL_LABEL[hit.level]}白 · ${starName(centerStar)}入中${
            referenceOnly ? ' · 研究參考' : ''}`),
          el('span', {}, `${LEVEL_LABEL[hit.level]}白入中 → ${
            referenceOnly ? '白中殺類比：' : ''}${evaluation.snapshot.name}宮為一般九宮暗建方`),
          assessment.hasVariantReading
            ? el('small', {}, '⚑ 此條有傳本異法') : null);
      }
      return el('li', {},
        el('strong', {}, `${LEVEL_LABEL[hit.level]} · ${starName(hit.star)}${
          referenceOnly ? ' · 研究參考' : ''}`),
        el('span', {}, `到${evaluation.snapshot.name}宮 → ${
          referenceOnly ? '白中殺類比：' : ''}${WHITE_KILLER_LABEL[killer]}`));
    })));
}

export function openDirectionDetailSheet(
  trigger: HTMLElement,
  evaluation: DirectionEvaluation,
  matchedPair?: string,
  matchedLayer?: string,
): void {
  const { snapshot } = evaluation;
  const returnSelector = `[data-selection-palace="${snapshot.palace}"]`;
  const otherReasons = evaluation.reasons.filter((reason) => ![
    '紫白到方：', '支序有氣：', '主要層合格：', '白中殺：',
    '日時白中殺參考：', '一般九宮暗建：', '入墓：', '臨絕：',
  ].some((prefix) => reason.startsWith(prefix)));
  const reasons = el('ul', { class: 'direction-reasons' },
    ...otherReasons.map((reason) => el('li', {}, reason)));
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
        ...evaluation.temporalProfile.starStates.map((state) => (
          starItem(LEVEL_LABEL[state.level], state.ganzhi.text, state.star)
        ))),
      el('p', { class: `direction-detail__verdict verdict--${evaluation.verdict}` },
        VERDICT_LABEL[evaluation.verdict]),
      evaluation.purpose !== 'general'
        ? el('p', { class: 'direction-detail__purpose' },
          `雙星用途參考：${purposeLabel(evaluation.purpose)} · 命中 ${evaluation.purposeHits.length} 組`)
        : null,
      el('section', { class: 'direction-section direction-primary-signal' },
        el('h3', {}, '紫白主幹'),
        el('p', {}, `${evaluation.purpleWhiteCount}/4 · ${PURPLE_WHITE_SIGNAL_LABEL[evaluation.purpleWhiteSignal]}`)),
      el('section', { class: 'direction-section direction-primary-reference' },
        el('h3', {}, '雙星參考'), main),
      el('div', { class: 'direction-disclosures' },
        disclosure('為甚麼',
          el('section', { class: 'direction-section direction-temporal' },
            el('h3', {}, '紫白擇方主幹'),
            el('p', { class: 'direction-temporal__signal' },
              `紫白到方 ${evaluation.purpleWhiteCount}/4 · ${PURPLE_WHITE_SIGNAL_LABEL[evaluation.purpleWhiteSignal]}`),
            el('p', {}, purpleWhiteLayers.length > 0
              ? `命中層：${purpleWhiteLayers.join('、')}` : '命中層：無')),
          el('section', { class: 'direction-section direction-branch-conditions' },
            el('h3', {}, '時序條件'),
            temporalConditions(evaluation)),
          el('section', { class: 'direction-section direction-killers' },
            el('h3', {}, '白中殺'),
            killerConditions(evaluation)),
          el('section', { class: 'direction-section direction-other-reasons' },
            el('h3', {}, '其他判定理由'),
            el('h4', {}, '宮星五行'),
            el('ul', { class: 'direction-elements' },
              ...evaluation.temporalProfile.starStates.map((state) => el('li', {},
                `${LEVEL_LABEL[state.level]}${starName(state.star)}：${ELEMENT_RELATION_LABEL[state.elementRelation.relation](
                  state.elementRelation.palaceElement, state.elementRelation.starElement,
                )}`))),
            reasons)),
        disclosure('全部六組', pairList),
        disclosure('五行關係', elementList),
        disclosure('研究說明',
          el('div', { class: 'direction-research' },
            el('p', {}, '雙星組合僅供研究參考，不參與方向排序。'),
            el('p', {}, '一般九宮暗建與大月建分開保存；大月建的月干支飛宮尚待逐月核對，目前不參與方向判定。'),
            el('p', {}, '一般暗建預設採九宮本位，五黃為中宮；《三元寶海》的五黃四隅只作傳本異文，不與預設規則疊加。'),
            el('p', {}, '年、月白中殺正式參與判定；日、時只顯示類比參考。受剋殺只採古表定局，一般宮星五行相剋另列。'),
            el('p', {}, '「紫白一時加／二時加」存在異文，不作至少兩層才成立的門檻；單一合格紫白亦可成為正面訊號。'),
            el('p', {}, '支序有氣只對年、月正式運用；日支只作警示，時支只作類推參考。五行生扶型有氣未封版，不參與排序。'),
            el('p', {}, '月令是核心；日主與時課 Gate 尚未建立完整日課規則，目前不宣稱日期本身已通過古法篩選。'),
            el('p', {}, '月建納音的作用範圍、刑宮、害宮、四空亡及二十四山尚未納入判定。'),
            el('p', {}, '目前判定名稱屬工具分級，不是古籍原有等級。'))),
      ),
    ),
  });
}
