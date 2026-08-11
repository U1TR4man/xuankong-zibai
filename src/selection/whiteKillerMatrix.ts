import type { PalaceKey } from '../engine/flyingStar/types';
import type { Branch } from '../engine/time/ganzhi';
import type { StarNumber } from '../overlay/types';

export interface WhiteKillerMatrixRow {
  liuJieTomb: Branch;
  anJian: readonly PalaceKey[];
  shouKe: readonly PalaceKey[];
  chuanXin: readonly PalaceKey[];
  jiaoJian: readonly PalaceKey[];
  douNiu: readonly PalaceKey[];
}

/**
 * 第七輪封版的白中殺 9 星 × 6 殺定局。
 * 暗建讀 center star；四種宮位殺讀 arrival star；六捷讀 period branch。
 */
export const WHITE_KILLER_MATRIX = {
  1: {
    liuJieTomb: '辰', anJian: ['kan'], shouKe: ['center'],
    chuanXin: ['li'], jiaoJian: [], douNiu: [],
  },
  2: {
    liuJieTomb: '辰', anJian: ['kun'], shouKe: ['zhen', 'xun'],
    chuanXin: ['gen'], jiaoJian: [], douNiu: ['zhen', 'xun'],
  },
  3: {
    liuJieTomb: '未', anJian: ['zhen'], shouKe: ['qian', 'dui'],
    chuanXin: ['dui'], jiaoJian: [], douNiu: [],
  },
  4: {
    liuJieTomb: '未', anJian: ['xun'], shouKe: ['qian', 'dui'],
    chuanXin: ['qian'], jiaoJian: [], douNiu: [],
  },
  5: {
    liuJieTomb: '辰', anJian: ['center'], shouKe: ['zhen', 'xun'],
    chuanXin: [], jiaoJian: [], douNiu: ['zhen', 'xun'],
  },
  6: {
    liuJieTomb: '丑', anJian: ['qian'], shouKe: ['li'],
    chuanXin: ['xun'], jiaoJian: ['dui'], douNiu: ['zhen', 'xun'],
  },
  7: {
    liuJieTomb: '丑', anJian: ['dui'], shouKe: ['li'],
    chuanXin: ['zhen'], jiaoJian: ['qian'], douNiu: ['zhen', 'xun'],
  },
  8: {
    liuJieTomb: '辰', anJian: ['gen'], shouKe: ['zhen', 'xun'],
    chuanXin: ['kun'], jiaoJian: [], douNiu: ['zhen', 'xun'],
  },
  9: {
    liuJieTomb: '戌', anJian: ['li'], shouKe: ['kan'],
    chuanXin: ['kan'], jiaoJian: [], douNiu: [],
  },
} as const satisfies Readonly<Record<StarNumber, WhiteKillerMatrixRow>>;

export type WhiteKillerRule =
  | 'liuJieTomb' | 'anJian' | 'shouKe' | 'chuanXin' | 'jiaoJian' | 'douNiu';

/**
 * 古籍出處。**只存 stable chapter URL 與頁內 anchor**：
 * 該站的原書影像 URL 帶時效簽名，寫進專案必然過期。
 *
 * `searchAnchor` 刻意選用**已在自帶字體 subset 內**的字串。
 * anchor 只是 Ctrl+F 的落點、同頁有多個可選，不值得為它擴大 subset
 * （由 `tests/v21Assets.test.ts` 把關）。逐字引文一律留在考源文件，不進 `src/**`。
 */
export interface WhiteKillerSourceRef {
  book: 'wuyao_qishu' | 'lianbian_tongshu_daquan' | 'zaoming_zongjing_ji'
  | 'wanxiao_lu' | 'hebing_tongshu_daquan';
  volume: number;
  stableChapterUrl: string;
  searchAnchor: string;
}

/**
 * 六列的完整直證來源，2026-08-11 逐字核對。
 * 逐頁記錄見 `docs/primary-source-verification-2026-08.md` §11。
 */
const WUYAO_QISHU_38: WhiteKillerSourceRef = Object.freeze({
  book: 'wuyao_qishu',
  volume: 38,
  stableChapterUrl: 'https://www.shidianguji.com/zh/book/HY0461/chapter/1lpahol842689',
  searchAnchor: '三元暗劍殺例',
});

const HEBING_TONGSHU_14: WhiteKillerSourceRef = Object.freeze({
  book: 'hebing_tongshu_daquan',
  volume: 14,
  stableChapterUrl: 'https://www.shidianguji.com/zh/book/AMNL0134/chapter/1ma1mzcgdweuu',
  searchAnchor: '鬥牛殺',
});

const WANXIAO_LU_6: WhiteKillerSourceRef = Object.freeze({
  book: 'wanxiao_lu',
  volume: 6,
  stableChapterUrl: 'https://www.shidianguji.com/zh/book/DZ1471/chapter/1k1pzs8r1yip1',
  searchAnchor: '六捷殺',
});

export interface WhiteKillerVariant {
  rule: WhiteKillerRule;
  id: 'dou_niu_yuan_gui_three_four_same_palace' | 'an_jian_five_yellow_four_corners';
  source: WhiteKillerSourceRef;
  /** 古本自己是否已載明此為異說。 */
  acknowledgedBySource: boolean;
  /** 異說一律不進排序；主說維持現行格值。 */
  rankingUse: 'disabled';
}

/**
 * 兩項異說。**都不改 `WHITE_KILLER_MATRIX` 的格值**，只登記其存在。
 *
 * 鬥牛：主說「金土與木同位」三本一致；《合併通書大全》卷十四另引
 * 「元龜云鬥牛殺者三碧四緑同宫」，並自註「有此不同，未詳孰是，姑志以俟考」——
 * **是古本編者自己知道有異說**，因此本規則不得標為「無異說」。
 *
 * 五黃暗建：三本作中宮，《五要奇書》卷三十八作四隅。與 `fiveYellowFourCorners` 同義，
 * 此處補上出處。
 */
export const WHITE_KILLER_VARIANTS: readonly WhiteKillerVariant[] = Object.freeze([
  Object.freeze({
    rule: 'douNiu' as const,
    id: 'dou_niu_yuan_gui_three_four_same_palace' as const,
    source: HEBING_TONGSHU_14,
    acknowledgedBySource: true,
    rankingUse: 'disabled' as const,
  }),
  Object.freeze({
    rule: 'anJian' as const,
    id: 'an_jian_five_yellow_four_corners' as const,
    source: WUYAO_QISHU_38,
    acknowledgedBySource: false,
    rankingUse: 'disabled' as const,
  }),
]);

/**
 * 受剋殺的義理描述在三本間相反：《造命宗鏡集》作「爲客強主弱」，
 * 《合併通書大全》與《完孝錄》作「爲客弱主強」。
 * 純描述句，**不影響任何格值**，因此並存不修、不進任何判定。
 */
export const WHITE_KILLER_DEFINITION_VARIANTS = Object.freeze([
  Object.freeze({
    rule: 'shouKe' as const,
    id: 'shou_ke_guest_host_polarity' as const,
    witnesses: Object.freeze({ guest_strong_host_weak: 1, guest_weak_host_strong: 2 }),
    effectOnValues: 'none' as const,
  }),
]);

/**
 * 來源狀態。2026-08-11 逐頁核對五個古本，**格值一格未改**；
 * 本次只升證據狀態並登記異說，強度（`rankingUse`、severity）完全不變。
 */
export const WHITE_KILLER_MATRIX_AUDIT = {
  version: 'seventh_round_9x6',
  /**
   * 古本攤平後六列**一致地整體右移一位**（九紫的值排到最前）。
   * 六列同偏移本身就是分欄可還原的內部證據，不是逐列猜測；
   * 受剋列還原後恰為十三字「中／震巽／乾兌／乾兌／震巽／離／離／震巽／坎」，
   * 無剩餘、無短缺。
   */
  restoredColumnOrder: [9, 1, 2, 3, 4, 5, 6, 7, 8],
  confidence: {
    liuJieTomb: 'A+', anJian: 'A+', shouKe: 'A',
    chuanXin: 'A+', jiaoJian: 'A', douNiu: 'A',
  },
  fiveYellowDefault: 'center',
  fiveYellowFourCorners: 'variant_only',
  primarySourceVerified: true,
  /** 六列全部核到的那一本。 */
  primarySource: WUYAO_QISHU_38,
  /**
   * **單一完整版本，不是多本互校**。另外三本的受剋列各自脫格且彼此不同
   * （13＋1／14／4／4 字），只能佐證定義與部分列，不能佐證全表。
   * 這個限制必須明寫，否則會被讀成四本互證。
   */
  corroboration: 'single_complete_witness',
  /**
   * 矩陣**不是**完整的白中殺判定。《完孝錄》卷六明言
   * 「以上星煞所忌，特見其例耳」，還須論刑宮、害宮與四空亡。
   * 本專案未實作該層——這是已知缺口，不是錯誤，但不得宣稱判定完整。
   */
  completeness: 'example_set_not_exhaustive',
  completenessSource: WANXIAO_LU_6,
  variants: WHITE_KILLER_VARIANTS,
  definitionVariants: WHITE_KILLER_DEFINITION_VARIANTS,
} as const;
