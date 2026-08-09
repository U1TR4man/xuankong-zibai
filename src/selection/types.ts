import type { PalaceKey } from '../engine/flyingStar/types';
import type { StarNumber } from '../overlay/types';

export type DirectionCode = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type DirectionPalaceKey = Exclude<PalaceKey, 'center'>;
export type DirectionLevel = 'year' | 'month' | 'day' | 'hour';
export type PairLayer = 'YM' | 'YD' | 'YH' | 'MD' | 'MH' | 'DH';
export type PairKey = `${StarNumber}${StarNumber}`;

export type SourceLevel = 'A' | 'B' | 'C';
export type SourceGrade = SourceLevel | 'A/B' | 'B/C';
export type Polarity = 'favorable' | 'caution' | 'mixed' | 'neutral';
export type ReviewStatus = 'verified' | 'needs-review' | 'pending';
export type PairContext =
  | 'general_pair' | 'palace_conditioned' | 'house_double_star' | 'temporal_experimental';
export type PairEvidenceType =
  | 'direct_pair' | 'named_pattern' | 'palace_conditioned'
  | 'related_classic' | 'derived' | 'research_summary';
export type DirectionVerdict = 'priority' | 'usable' | 'ordinary' | 'mixed' | 'caution';
export type SelectionPurpose =
  | 'general' | 'writing' | 'wealth' | 'negotiation' | 'fame' | 'celebration' | 'travel';

export interface PairLayerDefinition {
  key: PairLayer;
  label: string;
  first: DirectionLevel;
  second: DirectionLevel;
}

export const PAIR_LAYERS: readonly PairLayerDefinition[] = [
  { key: 'YM', label: '年月', first: 'year', second: 'month' },
  { key: 'YD', label: '年日', first: 'year', second: 'day' },
  { key: 'YH', label: '年時', first: 'year', second: 'hour' },
  { key: 'MD', label: '月日', first: 'month', second: 'day' },
  { key: 'MH', label: '月時', first: 'month', second: 'hour' },
  { key: 'DH', label: '日時', first: 'day', second: 'hour' },
];

export interface DirectionSnapshot {
  direction: DirectionCode;
  palace: DirectionPalaceKey;
  palaceNumber: number;
  name: string;
  bearing: string;
  row: number;
  col: number;
  yearStar: StarNumber;
  monthStar: StarNumber;
  dayStar: StarNumber;
  hourStar: StarNumber;
}

export interface PurpleWhitePairRule {
  pair: PairKey;
  firstStar: StarNumber;
  secondStar: StarNumber;
  elementRelation: string;
  title: string;
  shortMeaning: string;
  polarity: Polarity;
  priority: 'high' | 'normal';
  tags: string[];
  reversePair: PairKey;
  directionSensitive: boolean;
  orderSensitive: boolean;
  sourceLevel: SourceLevel;
  sourceGrade: SourceGrade;
  reviewStatus: ReviewStatus;
  sources: {
    title: string;
    evidenceType: PairEvidenceType;
    quote?: string;
    note?: string;
  }[];
  context: PairContext;
  modernInterpretation: string;
  originalText?: string;
  edition?: string;
  sourceDate?: string;
  verified: boolean;
  temporalUse: 'reference_only';
  rankingWeight: 0;
  applicability: {
    samePalace: boolean;
    temporalSelection: 'direct' | 'conditional' | 'reference';
    requiresPalaceContext: boolean;
    requiresProsperityContext: boolean;
  };
}

export interface PairHit {
  layer: PairLayer;
  layerLabel: string;
  pair: PairKey;
  firstStar: StarNumber;
  secondStar: StarNumber;
  rule: PurpleWhitePairRule;
}

export interface DirectionEvaluation {
  snapshot: DirectionSnapshot;
  hits: PairHit[];
  verdict: DirectionVerdict;
  purpleWhiteCount: number;
  purpleWhiteStars: StarNumber[];
  favorableHits: PairHit[];
  cautionHits: PairHit[];
  mixedHits: PairHit[];
  highestSourceLevel: SourceLevel;
  purpose: SelectionPurpose;
  purposeHits: PairHit[];
  topHit: PairHit;
  reasons: string[];
}

export const VERDICT_LABEL: Record<DirectionVerdict, string> = {
  priority: '優先',
  usable: '可用',
  ordinary: '普通',
  mixed: '吉凶並見',
  caution: '慎用',
};
