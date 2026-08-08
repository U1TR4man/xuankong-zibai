import { getPairRule } from '../selection/pairRules';
import type { PurpleWhitePairRule, ReviewStatus, SourceLevel } from '../selection/types';
import { openBottomSheet } from './BottomSheet';
import { el } from './dom';

const SOURCE_LABEL: Record<SourceLevel, string> = {
  A: 'A · 古訣直述', B: 'B · 古訣旁證', C: 'C · 推演／結構',
};
const REVIEW_LABEL: Record<ReviewStatus, string> = {
  verified: '已校對', 'needs-review': '需要覆核', pending: '資料待校對',
};
const TEMPORAL_LABEL = {
  direct: '可直接用於時間擇方',
  conditional: '需條件判讀',
  reference: '只供參考，不進入工具吉凶判定',
} as const;

function sourceList(rule: PurpleWhitePairRule): HTMLElement {
  return el('div', { class: 'pair-rule__sources' },
    ...rule.sources.map((source) => el('article', { class: 'pair-rule__source' },
      el('h4', {}, source.title),
      source.quote ? el('blockquote', {}, source.quote) : el('p', {}, '尚未收錄可核對的逐字引文。'),
      source.note ? el('p', {}, source.note) : null,
    )),
  );
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
        el('span', {}, SOURCE_LABEL[rule.sourceLevel]),
        el('span', {}, REVIEW_LABEL[rule.reviewStatus]),
      ),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '五行關係'),
        el('p', {}, rule.elementRelation)),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '適用範圍'),
        el('p', {}, TEMPORAL_LABEL[rule.applicability.temporalSelection]),
        rule.applicability.requiresPalaceContext
          ? el('p', {}, '需要宮位 context，不直接用於時間排序。') : null,
        rule.applicability.requiresProsperityContext
          ? el('p', {}, '需要旺衰 context，不直接用於時間排序。') : null),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '用途 tags'),
        rule.tags.length > 0
          ? el('div', { class: 'pair-rule__tags' }, ...rule.tags.map((tag) => el('span', {}, tag)))
          : el('p', { class: 'pair-rule__empty' }, '尚未校對用途 tags。')),
      el('section', { class: 'pair-rule__section' },
        el('h3', {}, '來源'), sourceList(rule)),
      rule.directionSensitive
        ? el('section', { class: 'pair-rule__section pair-rule__direction' },
          el('h3', {}, '有序組合'),
          el('p', {}, `${rule.pair} ≠ ${rule.reversePair}`),
          el('p', {}, `${reverse.pair}｜${reverse.title} · ${reverse.shortMeaning}`),
          reverseButton)
        : null,
      el('p', { class: 'pair-rule__disclaimer' },
        'A／B／C 表示來源直接程度，不代表吉凶力度；review 狀態與 TOOL_HEURISTIC 分開。'),
    ),
  });
}
