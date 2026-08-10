import type { StarNumber } from '../overlay/types';
import type { Branch } from '../engine/time/ganzhi';
import type {
  EvidenceVerificationStatus, PurpleWhiteSignal, UseContext, WhiteKiller,
} from './types';
import { WHITE_KILLER_MATRIX } from './whiteKillerMatrix';

export const PURPLE_WHITE_STARS = new Set<StarNumber>([1, 6, 8, 9]);

export const PURPLE_WHITE_SIGNAL_LABEL: Record<PurpleWhiteSignal, string> = {
  none: '無紫白到方',
  single_arrival: '紫白到方',
  two_coarrival: '雙層紫白同到',
  three_coarrival: '三層紫白同到',
  all_four_coarrival: '年月日時紫白同到',
};

export interface StarQiReference {
  star: StarNumber;
  element: '木' | '火' | '土' | '金' | '水';
  qiElements: readonly ('木' | '火' | '土' | '金' | '水')[];
  tombBranch: Branch;
  absoluteBranch: Branch;
  directQiBranches?: readonly Branch[];
  auditNote: string;
}

/**
 * 第二至第七輪考源整理出的研究參考表。支序有氣對年、月正式運用；
 * 日層為 B+ 次級有效，時層只作類推參考。五行支持型有氣仍未決定 periodElement，不能自行加權。
 */
export const STAR_QI_REFERENCE: Readonly<Record<StarNumber, StarQiReference>> = {
  1: { star: 1, element: '水', qiElements: ['金', '水'], tombBranch: WHITE_KILLER_MATRIX[1].liuJieTomb, absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序有氣層級為年 A／月 A／日 B+ 次級有效／時 C 類推。' },
  2: { star: 2, element: '土', qiElements: ['火', '土'], tombBranch: WHITE_KILLER_MATRIX[2].liuJieTomb, absoluteBranch: '巳', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  3: { star: 3, element: '木', qiElements: ['水', '木'], tombBranch: WHITE_KILLER_MATRIX[3].liuJieTomb, absoluteBranch: '申', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  4: { star: 4, element: '木', qiElements: ['水', '木'], tombBranch: WHITE_KILLER_MATRIX[4].liuJieTomb, absoluteBranch: '申', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  5: { star: 5, element: '土', qiElements: ['火', '土'], tombBranch: WHITE_KILLER_MATRIX[5].liuJieTomb, absoluteBranch: '巳', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  6: { star: 6, element: '金', qiElements: ['土', '金'], tombBranch: WHITE_KILLER_MATRIX[6].liuJieTomb, absoluteBranch: '寅', directQiBranches: ['巳', '午', '未', '申', '酉'], auditNote: '支序有氣層級為年 A／月 A／日 B+ 次級有效／時 C 類推。' },
  7: { star: 7, element: '金', qiElements: ['土', '金'], tombBranch: WHITE_KILLER_MATRIX[7].liuJieTomb, absoluteBranch: '寅', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  8: { star: 8, element: '土', qiElements: ['火', '土'], tombBranch: WHITE_KILLER_MATRIX[8].liuJieTomb, absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序有氣層級為年 A／月 A／日 B+ 次級有效／時 C 類推。' },
  9: { star: 9, element: '火', qiElements: ['木', '火'], tombBranch: WHITE_KILLER_MATRIX[9].liuJieTomb, absoluteBranch: '亥', directQiBranches: ['寅', '卯', '辰', '巳', '午'], auditNote: '支序有氣層級為年 A／月 A／日 B+ 次級有效／時 C 類推；第七輪已依欄序與多源對讀封版為戌墓，原頁仍待核對。' },
};

export const WHITE_KILLER_LABEL: Record<WhiteKiller, string> = {
  ru_mu: '入墓',
  an_jian: '九宮暗建',
  shou_ke: '受剋殺',
  chuan_xin: '穿心殺',
  jiao_jian: '交劍殺',
  dou_niu: '鬥牛殺',
  xing_gong: '刑宮',
  hai_gong: '害宮',
  kong_wang: '空亡',
};

export interface SelectionMethodEvidence {
  id: 'temporal_coarrival' | 'qi_tomb_killers' | 'white_killer_tables'
    | 'da_yue_jian_boundary' | 'element_support_qi_boundary' | 'time_gate_boundary'
    | 'death_retreat_variant' | 'manuscript_purpose';
  summary: string;
  useContexts: UseContext[];
  verificationStatus: EvidenceVerificationStatus;
  primarySourceVerified: boolean;
  witnesses: { source: string; note: string }[];
  variants?: { reading: string; source: string; note: string }[];
}

/** 方法層證據與異文。沒有原頁影像／頁碼者一律不標 primarySourceVerified。 */
export const SELECTION_METHOD_EVIDENCE: readonly SelectionMethodEvidence[] = [
  {
    id: 'temporal_coarrival',
    summary: '單一合格紫白到方即可成立，多層同到逐級增強，年月日時四課皆到有直接研究依據；一時／二時異文不得作固定門檻。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'variant',
    primarySourceVerified: false,
    witnesses: [
      { source: '《造命宗鏡集》卷六及《三元寶海鈎玄》系傳本', note: '第四輪研究記為「紫白一時加」；仍待固定版本頁碼與原頁影像。' },
      { source: '《五要奇書》某數位本', note: '第四輪研究見「紫白二時加」；不得獨取此本作數值門檻。' },
      { source: '修方相關傳本', note: '保存年月日時紫白皆到所修方「尤為大利」的多層同到依據；待核原頁。' },
    ],
    variants: [
      { reading: '紫白一時加', source: '《造命宗鏡集》卷六、《三元寶海鈎玄》系傳本', note: '多個重要傳本讀法；未附本專案可重跑原頁。' },
      { reading: '紫白二時加', source: '《五要奇書》某數位本', note: '異文；禁止轉成 purpleWhiteCount >= 2 硬門檻。' },
    ],
  },
  {
    id: 'qi_tomb_killers',
    summary: '支序生旺型有氣對年月正式運用、日層 B+ 次級有效、時層類推；六捷墓與其他白中殺及一般五行關係繼續分開。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [
      { source: '《類編曆法通書大全》及《三才圖會》時令卷相關材料', note: '第三輪據研究整理星宮定局；未附原頁影像與頁碼。' },
      { source: '《儒門崇理折衷堪輿完孝錄》卷六〈九宮紫白〉', note: '第三輪據研究整理季節、墓絕與白中殺；仍需人工核影印頁。' },
      { source: '《五要奇書》及《三元選擇歌》相關材料', note: '支持年月日時、紫白同加、有氣與墓絕的選擇框架；待核版本原頁。' },
    ],
  },
  {
    id: 'white_killer_tables',
    summary: '第七輪已封版九星×六殺定局：暗建讀入中星，受剋、穿心、交劍、鬥牛讀到方星，六捷讀時間地支。五黃預設中宮，四隅只存異文；年月正式運用，日時只作參考。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'variant',
    primarySourceVerified: false,
    witnesses: [
      { source: '《儒門崇理折衷堪輿完孝錄》卷六〈九宮紫白〉', note: '提供九星六殺表格主線；第七輪以還原欄序及多源對讀重建定局，原頁影像仍待收入專案。' },
      { source: '《佐玄直指圖解》及《造命宗鏡集》相關傳文', note: '互證穿心、受剋、交劍與鬥牛的星宮定局；規則級已封版，固定版本頁碼仍待核。' },
      { source: '《類編曆法通書大全》及《五要奇書》相關材料', note: '對讀六捷墓、暗建及殺例；本專案尚無可重跑原頁影像，故不標記原典已核。' },
      { source: '《三元寶海鈎玄》下卷', note: '修方操作文直接列山頭、年頭及月白殺；五黃四隅只作傳本異文。' },
    ],
    variants: [
      { reading: '五黃入中→中宮', source: '《九宮紫白》一般定局', note: 'V1 預設。' },
      { reading: '五黃入中→乾坤艮巽', source: '《三元寶海鈎玄》', note: '只作傳本異文，不與預設規則疊加。' },
    ],
  },
  {
    id: 'da_yue_jian_boundary',
    summary: '第六輪已封版大月建為本月入中紫白星的後天本宮；與月九宮暗建同位時合流顯示，只計一次警示，舊年干起例已停用。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [{ source: '《欽定協紀辨方書》卷三十四', note: '取當月入中一星的本宮；第六輪已完成 36 個月型與現行月紫白的程式對讀，原頁影像仍待收入專案。' }],
  },
  {
    id: 'element_support_qi_boundary',
    summary: '五行生扶型有氣與支序生旺分開；月建干支納音作用範圍未封版，不以地支五行或單一納音套全盤。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [{ source: '《儒門崇理折衷堪輿完孝錄》卷六〈九宮紫白〉', note: '月白論及月建支干納音對星氣變化；未直接證明同月八方飛星全部改為一種五行。' }],
  },
  {
    id: 'time_gate_boundary',
    summary: 'Day Gate V1 依節氣月司令判日干旺相休囚死，只作 pass／mixed／caution；時課用來扶日與細選，四柱沖合未完成前不 hard reject。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'verified',
    primarySourceVerified: false,
    witnesses: [
      { source: '《多能鄙事》卷六〈旺相休囚死例〉', note: '保存春夏秋冬四季的五行旺相休囚死定表。' },
      { source: '《御定星曆考原》卷一', note: '記四立前各十八日土旺，合為七十二日。' },
      { source: '《造命宗鏡集》卷六', note: '記用日宜旺相、用時扶日；小修可用時扶日使日不休囚，故 V1 弱日只警示。' },
    ],
  },
  {
    id: 'death_retreat_variant',
    summary: '死退雙臨句存在相反判斷的異文，程式不得默選唯一版本。',
    useContexts: ['base_plus_flow'],
    verificationStatus: 'variant',
    primarySourceVerified: false,
    witnesses: [{ source: '今傳《紫白訣》與吳師青《紫白賦辨正》', note: '第二輪考源確認異文存在；待逐版本原頁校讀。' }],
    variants: [
      { reading: '死退雙臨始佳', source: '部分《紫白訣》傳本', note: '版本線索，未核原頁。' },
      { reading: '死退雙臨不利', source: '《紫白賦辨正》及另一傳文', note: '吳師青辨正採此讀；未核原頁。' },
    ],
  },
  {
    id: 'manuscript_purpose',
    summary: '「修方而設」只取得一致的書目／出版社報告，尚未直接核清精鈔本原頁。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [{ source: '清精鈔本《紫白訣》影印出版物書目介紹', note: '證據級別為 bibliographic report，不是 direct manuscript。' }],
  },
];
