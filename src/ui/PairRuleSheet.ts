import { getPairRule } from '../selection/pairRules';
import type {
  EvidenceForm, EvidenceVerificationStatus, PairDirectionality, PurpleWhitePairRule,
  ReviewStatus, SourceGrade, UseContext,
} from '../selection/types';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

const SOURCE_LABEL: Record<SourceGrade, string> = {
  A: '古法規則', 'A/B': '古法規則與研究整理',
  B: '研究整理', 'B/C': '研究整理', C: '研究中',
};
const REVIEW_LABEL: Record<ReviewStatus, string> = {
  verified: '已校對', 'needs-review': '研究摘要待逐條覆核', pending: '資料待校對',
};
const TEMPORAL_LABEL = {
  direct: '可直接用於時間擇方',
  conditional: '需條件判讀',
  reference: '只供參考，不進入工具吉凶判定',
} as const;
const EVIDENCE_FORM_LABEL: Record<EvidenceForm, string> = {
  direct_ordered_pair: '直接有序組合',
  direct_same_palace_pair: '直接同宮組合',
  named_pattern: '傳統名目',
  classic_trigram_pair: '古典卦象組合',
  palace_conditioned: '宮位條件句',
  shape_conditioned: '形勢條件句',
  single_star_repeated: '單星重疊推演',
  derived: '後世整理／推演',
};
const USE_CONTEXT_LABEL: Record<UseContext, string> = {
  selection_coarrival: '年月日時紫白同方',
  base_plus_flow: '宮／宅基礎星＋流年星',
  house_double_star: '宅盤山星×向星',
  palace_specific: '指定宮位／方位',
  temporal_pair_reference: '本工具年月日時雙星參考',
};
const DIRECTIONALITY_LABEL: Record<PairDirectionality, string> = {
  explicit_order: '古句明確有次序',
  unordered_pair: '古句只證明同宮，未證反向異義',
  reverse_inferred: '由反向句推建索引',
  unknown: '次序可信度未定',
};
const VERIFICATION_LABEL: Record<EvidenceVerificationStatus, string> = {
  verified: '已核原始來源',
  variant: '有異文',
  suspected_transcription_error: '疑似轉錄錯誤',
  awaiting_scan: '待核原頁影像',
};

function sourceList(rule: PurpleWhitePairRule): HTMLElement {
  return el('div', { class: 'pair-rule__sources' },
    ...rule.sourceAudit.textWitnesses.map((witness) => el('article', { class: 'pair-rule__source' },
      el('h4', {}, witness.source),
      el('small', {}, `${EVIDENCE_FORM_LABEL[witness.evidenceForm]} · ${VERIFICATION_LABEL[witness.verificationStatus]}`),
      witness.reading
        ? el('blockquote', {}, `本輪記錄讀法：${witness.reading}`)
        : el('p', {}, '尚未收錄可核對版本／頁碼的逐字引文。'),
      witness.note ? el('p', {}, witness.note) : null,
    )),
  );
}

function conditions(rule: PurpleWhitePairRule): HTMLElement | null {
  const value = rule.sourceAudit.conditions;
  if (!value) return null;
  const parts = [
    value.palace ? `宮位：洛書 ${value.palace}` : '',
    value.direction ? `方位：${value.direction}` : '',
    value.layer ? `層級：${value.layer}` : '',
    value.form ? `形勢：${value.form}` : '',
    value.requiresQi ? '需要有氣' : '',
    value.requiresWang ? '需要值旺' : '',
  ].filter(Boolean);
  return el('p', {}, `不可省略的條件：${parts.join('；')}`);
}

export function openPairRuleSheet(
  trigger: HTMLElement,
  rule: PurpleWhitePairRule,
  returnFocusSelector?: string,
): void {
  const reverse = getPairRule(rule.reversePair);
  const reverseButton = el('button', {
    class: 'btn btn--ghost pair-rule__reverse', type: 'button',
    onclick: (event: Event) => openPairRuleSheet(
      event.currentTarget as HTMLElement, reverse, returnFocusSelector,
    ),
  }, `查看反向組合 ${reverse.pair}`);

  openBottomSheet({
    title: `${rule.pair}｜${rule.title}`,
    trigger,
    className: 'sheet-dialog--pair-rule',
    returnFocusSelector,
    content: el('article', { class: 'pair-rule' },
      el('p', { class: 'pair-rule__meaning' }, rule.shortMeaning),
      el('div', { class: 'pair-rule__badges' },
        el('span', {}, SOURCE_LABEL[rule.sourceGrade]),
        el('span', {}, REVIEW_LABEL[rule.reviewStatus]),
        el('span', {}, VERIFICATION_LABEL[rule.sourceAudit.verificationStatus]),
      ),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '五行關係'),
        el('p', {}, rule.elementRelation)),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '適用範圍'),
        el('p', {}, TEMPORAL_LABEL[rule.applicability.temporalSelection]),
        el('p', {}, `原始使用情境：${rule.sourceAudit.useContexts.map((context) => USE_CONTEXT_LABEL[context]).join('、')}`),
        rule.applicability.requiresPalaceContext
          ? el('p', {}, '需要配合宮位，不直接用於時間排序。') : null,
        rule.applicability.requiresProsperityContext
          ? el('p', {}, '需要配合旺衰，不直接用於時間排序。') : null),
      el('section', { class: 'pair-rule__section pair-rule__audit' },
        el('h3', {}, '證據審核'),
        el('p', {}, `證據形式：${EVIDENCE_FORM_LABEL[rule.sourceAudit.evidenceForm]}`),
        el('p', {}, `次序可信度：${DIRECTIONALITY_LABEL[rule.sourceAudit.directionality]}`),
        el('p', {}, `原始來源直接核對：${rule.sourceAudit.primarySourceVerified ? '是' : '否'}`),
        conditions(rule)),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '用途標籤'),
        rule.tags.length > 0
          ? el('div', { class: 'pair-rule__tags' }, ...rule.tags.map((tag) => el('span', {}, tag)))
          : el('p', { class: 'pair-rule__empty' }, '尚未校對用途標籤。')),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '來源'), sourceList(rule)),
      rule.sourceAudit.variants && rule.sourceAudit.variants.length > 0
        ? el('section', { class: 'pair-rule__section pair-rule__variants' },
          el('h3', {}, '⚑ 此句有異文／轉錄疑點'),
          ...rule.sourceAudit.variants.map((variant) => el('article', {},
            el('p', {}, variant.reading),
            el('small', {}, `${variant.source} · ${VERIFICATION_LABEL[variant.verificationStatus]}`),
            variant.note ? el('p', {}, variant.note) : null)))
        : null,
      rule.directionSensitive
        ? el('section', { class: 'pair-rule__section pair-rule__direction' },
          el('h3', {}, '有序組合'),
          el('p', {}, `${rule.pair} ≠ ${rule.reversePair}`),
          el('p', {}, `${reverse.pair}｜${reverse.title} · ${reverse.shortMeaning}`),
          reverseButton)
        : null,
      el('p', { class: 'pair-rule__disclaimer' },
        '雙星證據多源自宮星加流年、宅盤或古賦同宮組合；年月日時的第一、第二碼只是本工具的快慢層次記法。所有年月日時雙星組合僅供研究參考，不參與擇吉排序。'),
    ),
  });
}
