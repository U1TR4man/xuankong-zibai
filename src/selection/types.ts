import type { PalaceKey } from '../engine/flyingStar/types';
import type { Branch } from '../engine/time/ganzhi';
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
export type EvidenceForm =
  | 'direct_ordered_pair' | 'direct_same_palace_pair' | 'named_pattern'
  | 'classic_trigram_pair' | 'palace_conditioned' | 'shape_conditioned'
  | 'single_star_repeated' | 'derived';
export type UseContext =
  | 'selection_coarrival' | 'base_plus_flow' | 'house_double_star'
  | 'palace_specific' | 'temporal_pair_reference';
export type PairDirectionality =
  | 'explicit_order' | 'unordered_pair' | 'reverse_inferred' | 'unknown';
export type EvidenceVerificationStatus =
  | 'verified' | 'variant' | 'suspected_transcription_error' | 'awaiting_scan';
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
  /** 月暗建只看月白入中星，不以目標宮內飛星代替。 */
  monthCenterStar: StarNumber;
}

export type PurpleWhiteCount = 0 | 1 | 2 | 3 | 4;
export type PurpleWhiteSignal =
  | 'none' | 'single_arrival' | 'two_coarrival' | 'three_coarrival' | 'all_four_coarrival';
export type BranchQiState = 'active' | 'inactive' | 'unknown';
export type SeasonalState = 'command' | 'support' | 'rest' | 'imprisoned' | 'controlled';
export type TemporalEvidenceLevel = 'A' | 'B';
export type LayerRole = 'background_or_large_scale' | 'primary' | 'fine_tuning';
export type Element = '木' | '火' | '土' | '金' | '水';
export type PalaceElementRelation =
  | 'same' | 'palace_generates_star' | 'star_generates_palace'
  | 'palace_controls_star' | 'star_controls_palace';
export type WhiteKiller =
  | 'ru_mu' | 'an_jian' | 'shou_ke' | 'chuan_xin' | 'jiao_jian'
  | 'dou_niu' | 'xing_gong' | 'hai_gong' | 'kong_wang';
export type PalaceKiller = Extract<
  WhiteKiller,
  'an_jian' | 'shou_ke' | 'chuan_xin' | 'jiao_jian' | 'dou_niu'
>;

export interface TemporalStarAssessment {
  level: DirectionLevel;
  star: StarNumber;
  palace: PalaceKey;
  periodBranch: Branch;
  isPurpleWhite: boolean;
  role: LayerRole;
  palaceKillers: PalaceKiller[];
  elementRelation: {
    palaceElement: Element;
    starElement: Element;
    relation: PalaceElementRelation;
  };
  temporalState: {
    liuJieTomb: boolean;
    absolute: boolean;
    branchQi: BranchQiState;
    qiEvidence: TemporalEvidenceLevel;
  };
  seasonalState: SeasonalState;
}

export interface WhiteKillerAssessment {
  status: 'clear' | 'present';
  hits: {
    level: DirectionLevel;
    star: StarNumber;
    killers: PalaceKiller[];
  }[];
  note: string;
}

export interface TemporalBranchContext {
  branches: Record<DirectionLevel, Branch>;
  evidence: Record<DirectionLevel, TemporalEvidenceLevel>;
  monthSeason: 'spring' | 'summer' | 'autumn' | 'winter' | 'earth_transition';
}

export interface MonthAnJianAssessment {
  active: boolean;
  centerStar: StarNumber;
  forbiddenPalaces: DirectionPalaceKey[];
}

export interface DirectionTemporalProfile {
  direction: DirectionCode;
  purpleWhiteHits: DirectionLevel[];
  purpleWhiteCount: PurpleWhiteCount;
  purpleWhiteSignal: PurpleWhiteSignal;
  allFourPurpleWhite: boolean;
  qualifiedPurpleWhiteHits: DirectionLevel[];
  qualifiedPurpleWhiteCount: PurpleWhiteCount;
  starStates: TemporalStarAssessment[];
  monthAnJian: MonthAnJianAssessment;
  whiteKillerAssessment: WhiteKillerAssessment;
  yellowBlackLayers: DirectionLevel[];
  yellowBlackThriving: boolean;
}

export interface PairEvidenceCondition {
  palace?: number;
  direction?: string;
  layer?: string;
  form?: string;
  requiresQi?: boolean;
  requiresWang?: boolean;
}

export interface PairTextWitness {
  source: string;
  evidenceForm: EvidenceForm;
  verificationStatus: EvidenceVerificationStatus;
  reading?: string;
  note?: string;
}

export interface PairTextVariant {
  reading: string;
  source: string;
  verificationStatus: EvidenceVerificationStatus;
  note?: string;
}

export interface PairSourceAudit {
  evidenceForm: EvidenceForm;
  useContexts: UseContext[];
  directionality: PairDirectionality;
  verificationStatus: EvidenceVerificationStatus;
  primarySourceVerified: boolean;
  conditions?: PairEvidenceCondition;
  textWitnesses: PairTextWitness[];
  variants?: PairTextVariant[];
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
  /** V1 research shorthand retained for compact UI/search ordering; sourceAudit is the truth source. */
  sourceLevel: SourceLevel;
  sourceGrade: SourceGrade;
  reviewStatus: ReviewStatus;
  /** Legacy V1 summary fields; do not use them instead of sourceAudit for evidence claims. */
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
  sourceAudit: PairSourceAudit;
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
  temporalProfile: DirectionTemporalProfile;
  hits: PairHit[];
  verdict: DirectionVerdict;
  purpleWhiteCount: PurpleWhiteCount;
  purpleWhiteHits: DirectionLevel[];
  purpleWhiteSignal: PurpleWhiteSignal;
  purpleWhiteStars: StarNumber[];
  qualifiedPurpleWhiteCount: PurpleWhiteCount;
  qualifiedPurpleWhiteHits: DirectionLevel[];
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
