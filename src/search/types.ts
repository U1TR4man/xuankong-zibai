import type { PalaceKey } from '../engine/flyingStar/types';
import type { PalaceLayerStars, StarNumber } from '../overlay/types';

export type SearchLevel = 'day' | 'hour' | 'ke';

export interface SearchCondition {
  level: SearchLevel;
  /** 同層多星為 OR。 */
  stars: StarNumber[];
}

export interface StarSearchQuery {
  version: 1;
  startDate: string;
  endDate: string;
  palace: PalaceKey;
  /** 跨層條件固定為 AND。 */
  conditions: SearchCondition[];
}

export interface SearchMatch {
  /** UTC+8 民用時間字串，格式 YYYY-MM-DDTHH:mm。 */
  startDateTime: string;
  /** 時窗終點（exclusive）；日／時／刻均提供。 */
  endDateTime: string;
  palace: PalaceKey;
  precision: SearchLevel;
  /** 只保存截至 precision 為止的上層資料。 */
  palaceStars: Partial<PalaceLayerStars>;
  matchedConditions: SearchCondition[];
  chartContext: Partial<PalaceLayerStars>;
}

export interface SearchCandidate {
  start: Date;
  end: Date;
}
