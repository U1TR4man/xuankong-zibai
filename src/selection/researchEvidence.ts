import type { StarNumber } from '../overlay/types';
import type { Branch } from '../engine/time/ganzhi';
import type {
  EvidenceVerificationStatus, PurpleWhiteSignal, UseContext, WhiteKiller,
} from './types';

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
 * 第二至第五輪考源整理出的研究參考表。支序有氣只對年、月正式運用；
 * 日層只作警示，時層只作類推參考。五行支持型有氣仍未決定 periodElement，不能自行加權。
 */
export const STAR_QI_REFERENCE: Readonly<Record<StarNumber, StarQiReference>> = {
  1: { star: 1, element: '水', qiElements: ['金', '水'], tombBranch: '辰', absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序有氣層級為年 A／月 A／日 B 警示／時 C 類推。' },
  2: { star: 2, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  3: { star: 3, element: '木', qiElements: ['水', '木'], tombBranch: '未', absoluteBranch: '申', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  4: { star: 4, element: '木', qiElements: ['水', '木'], tombBranch: '未', absoluteBranch: '申', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  5: { star: 5, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  6: { star: 6, element: '金', qiElements: ['土', '金'], tombBranch: '丑', absoluteBranch: '寅', directQiBranches: ['巳', '午', '未', '申', '酉'], auditNote: '支序有氣層級為年 A／月 A／日 B 警示／時 C 類推。' },
  7: { star: 7, element: '金', qiElements: ['土', '金'], tombBranch: '丑', absoluteBranch: '寅', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  8: { star: 8, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序有氣層級為年 A／月 A／日 B 警示／時 C 類推。' },
  9: { star: 9, element: '火', qiElements: ['木', '火'], tombBranch: '戌', absoluteBranch: '亥', directQiBranches: ['寅', '卯', '辰', '巳', '午'], auditNote: '支序有氣層級為年 A／月 A／日 B 警示／時 C 類推；早期「辰入墓」轉錄衝突仍待原頁核對。' },
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
    summary: '支序生旺型有氣對年月正式運用、日層警示、時層類推；白中殺及 generic 五行關係繼續分開。',
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
    summary: '一般九宮暗建預設依九星本位，五黃為中宮；五黃四隅及本宮加中宮另存傳本，不疊加。年月白中殺正式運用，日時只作參考。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'variant',
    primarySourceVerified: false,
    witnesses: [
      { source: '《儒門崇理折衷堪輿完孝錄》卷六〈九宮紫白〉', note: '保存一般九宮暗建與白中殺總論架構；完整表仍待逐格核影。' },
      { source: '《三元寶海鈎玄》下卷', note: '修方操作文直接列山頭、年頭及月白殺；五黃四隅只作傳本異文。' },
    ],
    variants: [
      { reading: '五黃入中→中宮', source: '《九宮紫白》一般定局', note: 'V1 預設。' },
      { reading: '五黃入中→乾坤艮巽', source: '《三元寶海鈎玄》', note: '只作傳本異文，不與預設規則疊加。' },
    ],
  },
  {
    id: 'da_yue_jian_boundary',
    summary: '大月建屬月家神煞，以月干支飛宮獨立保存；未完成多年逐月比對前，不 alias 現有月紫白入中星。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [{ source: '《欽定協紀辨方書》卷三十四', note: '記大月建為月干支飛宮，取當月入中一星本宮；尚待與現行月紫白逐月比對。' }],
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
    summary: '日主為擇吉 Gate，時課用來扶日與細選；完整通書日課未建立前，狀態明示為尚未評估。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [
      { source: '《儒門崇理折衷堪輿完孝錄》卷六〈九宮紫白〉', note: '記「大抵至重者，日主也」與月令提綱。' },
      { source: '《造命宗鏡集》', note: '用日宜擇旺相，用時宜扶日主、幫四柱。' },
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
