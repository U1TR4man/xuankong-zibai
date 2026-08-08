import { STAR_ELEMENTS, starName } from '../engine/flyingStar/types';
import { asStarNumber, type StarNumber } from '../overlay/types';
import type {
  PairKey, Polarity, PurpleWhitePairRule, ReviewStatus, SourceLevel,
} from './types';

const GENERATES: Readonly<Record<string, string>> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};
const CONTROLS: Readonly<Record<string, string>> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};

function pairKey(first: StarNumber, second: StarNumber): PairKey {
  return `${first}${second}`;
}

function elementRelation(first: StarNumber, second: StarNumber): string {
  const firstElement = STAR_ELEMENTS[first]!;
  const secondElement = STAR_ELEMENTS[second]!;
  const prefix = `${starName(first)}${firstElement}、${starName(second)}${secondElement}`;
  if (firstElement === secondElement) return `${prefix}：比和`;
  if (GENERATES[firstElement] === secondElement) return `${prefix}：${firstElement}生${secondElement}`;
  if (GENERATES[secondElement] === firstElement) return `${prefix}：${secondElement}生${firstElement}`;
  if (CONTROLS[firstElement] === secondElement) return `${prefix}：${firstElement}剋${secondElement}`;
  return `${prefix}：${secondElement}剋${firstElement}`;
}

interface RuleOverride {
  title: string;
  shortMeaning: string;
  polarity: Polarity;
  priority?: 'high' | 'normal';
  tags: string[];
  sourceLevel: SourceLevel;
  reviewStatus: ReviewStatus;
  temporalSelection?: 'direct' | 'conditional' | 'reference';
  requiresPalaceContext?: boolean;
  requiresProsperityContext?: boolean;
  note: string;
}

/**
 * 只收錄使用者規格有直接給出名稱／用途的組合。
 * 沒有逐字古籍與版本資訊的條目一律標 needs-review，不偽造引文。
 */
const OVERRIDES: Partial<Record<PairKey, RuleOverride>> = {
  '14': {
    title: '四一同宮', shortMeaning: '文昌 · 科名', polarity: 'favorable',
    tags: ['文昌', '科名', '考試', '文書', '求名'], sourceLevel: 'A',
    reviewStatus: 'needs-review', temporalSelection: 'direct',
    note: 'V1 規格列為 A 級古訣直述；古籍版本與逐字引文仍待補錄。',
  },
  '25': {
    title: '二五交加', shortMeaning: '疾病 · 人口，慎用', polarity: 'caution',
    priority: 'high', tags: ['疾病', '人口', '慎用'], sourceLevel: 'A',
    reviewStatus: 'needs-review', temporalSelection: 'direct',
    note: 'V1 規格列為 A 級古訣直述；古籍版本與逐字引文仍待補錄。',
  },
  '37': {
    title: '三七組合', shortMeaning: '古訣象義待校對', polarity: 'neutral',
    tags: [], sourceLevel: 'A', reviewStatus: 'needs-review',
    note: 'V1 規格只確認此為有方向性的 A 級組合，未提供判語與適用條件。',
  },
  '68': {
    title: '六八', shortMeaning: '武科 · 韜略', polarity: 'favorable',
    tags: ['武職', '權力', '韜略', '功名', '求名'], sourceLevel: 'A',
    reviewStatus: 'needs-review', temporalSelection: 'direct',
    note: 'V1 規格列為 A 級古訣直述；古籍版本與逐字引文仍待補錄。',
  },
  '73': {
    title: '七三組合', shortMeaning: '古訣象義待校對', polarity: 'neutral',
    tags: [], sourceLevel: 'A', reviewStatus: 'needs-review',
    note: 'V1 規格只確認此為有方向性的 A 級組合，未提供判語與適用條件。',
  },
  '79': {
    title: '七九組合', shortMeaning: '古訣象義待校對', polarity: 'neutral',
    tags: [], sourceLevel: 'A', reviewStatus: 'needs-review',
    note: 'V1 規格只確認此為有方向性的 A 級組合，未提供判語與適用條件。',
  },
  '86': {
    title: '八六', shortMeaning: '文士參軍 · 異途', polarity: 'favorable',
    tags: ['文職', '異途', '功名', '求名'], sourceLevel: 'A',
    reviewStatus: 'needs-review', temporalSelection: 'direct',
    note: 'V1 規格列為 A 級古訣直述；古籍版本與逐字引文仍待補錄。',
  },
  '89': {
    title: '八九組合', shortMeaning: '婚喜 · 喜慶（資料待校對）', polarity: 'neutral',
    tags: ['婚喜', '喜慶'], sourceLevel: 'C', reviewStatus: 'needs-review',
    note: 'V1 規格只提供用途 tag 範例，未指定古訣等級、極性與適用條件。',
  },
  '97': {
    title: '九七組合', shortMeaning: '古訣象義待校對', polarity: 'neutral',
    tags: [], sourceLevel: 'A', reviewStatus: 'needs-review',
    note: 'V1 規格只確認此為有方向性的 A 級組合，未提供判語與適用條件。',
  },
};

function buildRule(first: StarNumber, second: StarNumber): PurpleWhitePairRule {
  const pair = pairKey(first, second);
  const override = OVERRIDES[pair];
  return {
    pair,
    firstStar: first,
    secondStar: second,
    elementRelation: elementRelation(first, second),
    title: override?.title ?? `${starName(first)} × ${starName(second)}`,
    shortMeaning: override?.shortMeaning ?? '資料待校對',
    polarity: override?.polarity ?? 'neutral',
    priority: override?.priority ?? 'normal',
    tags: [...(override?.tags ?? [])],
    reversePair: pairKey(second, first),
    directionSensitive: first !== second,
    sourceLevel: override?.sourceLevel ?? 'C',
    reviewStatus: override?.reviewStatus ?? 'pending',
    sources: [{
      title: override ? '紫白擇吉方向 V1 規格' : '九星五行結構',
      note: override?.note ?? '只保存五行結構；古訣、極性與用途仍待逐條校對。',
    }],
    applicability: {
      samePalace: true,
      temporalSelection: override?.temporalSelection ?? 'reference',
      requiresPalaceContext: override?.requiresPalaceContext ?? !override?.temporalSelection,
      requiresProsperityContext: override?.requiresProsperityContext ?? !override?.temporalSelection,
    },
  };
}

export const PURPLE_WHITE_PAIR_RULES: readonly PurpleWhitePairRule[] = Object.freeze(
  Array.from({ length: 9 }, (_, firstIndex) => asStarNumber(firstIndex + 1))
    .flatMap((first) => Array.from({ length: 9 }, (_, secondIndex) => (
      buildRule(first, asStarNumber(secondIndex + 1))
    ))),
);

const RULE_BY_PAIR = new Map(PURPLE_WHITE_PAIR_RULES.map((rule) => [rule.pair, rule]));

export function asPairKey(value: string): PairKey {
  if (/^[1-9]{2}$/.test(value)) return value as PairKey;
  throw new RangeError(`雙星組合必須是 11–99，目前為 ${value}`);
}

export function getPairRule(value: string): PurpleWhitePairRule {
  const pair = asPairKey(value);
  const rule = RULE_BY_PAIR.get(pair);
  if (!rule) throw new RangeError(`找不到雙星規則：${pair}`);
  return rule;
}
