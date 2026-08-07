/** 飛星層共用型別（規劃書 §6）。 */

export type Direction = 'forward' | 'reverse';

export type PalaceKey =
  | 'center' | 'qian' | 'dui' | 'gen' | 'li' | 'kan' | 'kun' | 'zhen' | 'xun';

export type PalaceStars = Record<PalaceKey, number>;

export type StarLevel = 'year' | 'month' | 'day' | 'hour' | 'ke';

/** 推算鏈的一步，供 Explain Mode 顯示（規劃書 §27）。 */
export interface ExplainStep {
  label: string;
  value: string;
}

export interface StarResult {
  level: StarLevel;
  centerStar: number;
  direction: Direction;
  palaceStars: PalaceStars;
  /** 規則名稱／出處，例如 '三元年紫白（上元甲子一白，逐年逆行）' */
  sourceRule: string;
  /** 這一層的標題，例如 '午時'、'第三刻' */
  title: string;
  /** 副標，例如 '11:00–12:59' */
  subtitle?: string;
  explain: ExplainStep[];
}

export const PALACE_KEYS: readonly PalaceKey[] = [
  'center', 'qian', 'dui', 'gen', 'li', 'kan', 'kun', 'zhen', 'xun',
];

export interface PalaceMeta {
  key: PalaceKey;
  /** 宮名 */
  name: string;
  /** 洛書數 */
  luoshu: number;
  /** 方位 */
  bearing: string;
  /** 在 3x3 版面中的位置（row, col），左上為 (0,0） */
  row: number;
  col: number;
}

/** 固定盤面（規劃書 §5）：巽4 離9 坤2 / 震3 中5 兌7 / 艮8 坎1 乾6 */
export const PALACES: readonly PalaceMeta[] = [
  { key: 'xun',    name: '巽宮', luoshu: 4, bearing: '東南', row: 0, col: 0 },
  { key: 'li',     name: '離宮', luoshu: 9, bearing: '南',   row: 0, col: 1 },
  { key: 'kun',    name: '坤宮', luoshu: 2, bearing: '西南', row: 0, col: 2 },
  { key: 'zhen',   name: '震宮', luoshu: 3, bearing: '東',   row: 1, col: 0 },
  { key: 'center', name: '中宮', luoshu: 5, bearing: '中',   row: 1, col: 1 },
  { key: 'dui',    name: '兌宮', luoshu: 7, bearing: '西',   row: 1, col: 2 },
  { key: 'gen',    name: '艮宮', luoshu: 8, bearing: '東北', row: 2, col: 0 },
  { key: 'kan',    name: '坎宮', luoshu: 1, bearing: '北',   row: 2, col: 1 },
  { key: 'qian',   name: '乾宮', luoshu: 6, bearing: '西北', row: 2, col: 2 },
];

export const STAR_NAMES: readonly string[] = [
  '', '一白', '二黑', '三碧', '四綠', '五黃', '六白', '七赤', '八白', '九紫',
];

export const STAR_ELEMENTS: readonly string[] = [
  '', '水', '土', '木', '木', '土', '金', '金', '土', '火',
];

export function starName(n: number): string {
  return STAR_NAMES[n] ?? String(n);
}

export const DIRECTION_LABEL: Record<Direction, string> = {
  forward: '順飛',
  reverse: '逆飛',
};
