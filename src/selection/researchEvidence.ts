import type { StarNumber } from '../overlay/types';
import type { Branch } from '../engine/time/ganzhi';
import type {
  EvidenceVerificationStatus, PurpleWhiteSignal, UseContext, WhiteKiller,
} from './types';

export const PURPLE_WHITE_STARS = new Set<StarNumber>([1, 6, 8, 9]);

export const PURPLE_WHITE_SIGNAL_LABEL: Record<PurpleWhiteSignal, string> = {
  none: '無紫白集中',
  single_arrival: '紫白到方',
  two_coarrival: '二時紫白同加',
  three_concentration: '三時紫白集中',
  four_coarrival: '四時紫白同到',
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
 * 第二、第三輪考源整理出的研究參考表。支序有氣、墓與絕可依第三輪規則
 * 套入各層地支；五行支持型有氣仍未決定 periodElement，不能自行加權。
 */
export const STAR_QI_REFERENCE: Readonly<Record<StarNumber, StarQiReference>> = {
  1: { star: 1, element: '水', qiElements: ['金', '水'], tombBranch: '辰', absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序有氣可套年／月／日／時地支；證據級別依次 A／A／B／B。' },
  2: { star: 2, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  3: { star: 3, element: '木', qiElements: ['水', '木'], tombBranch: '未', absoluteBranch: '申', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  4: { star: 4, element: '木', qiElements: ['水', '木'], tombBranch: '未', absoluteBranch: '申', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  5: { star: 5, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  6: { star: 6, element: '金', qiElements: ['土', '金'], tombBranch: '丑', absoluteBranch: '寅', directQiBranches: ['巳', '午', '未', '申', '酉'], auditNote: '支序有氣可套年／月／日／時地支；證據級別依次 A／A／B／B。' },
  7: { star: 7, element: '金', qiElements: ['土', '金'], tombBranch: '丑', absoluteBranch: '寅', auditNote: '墓絕可套各層地支；支序有氣未取得直接表，不硬推。' },
  8: { star: 8, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序有氣可套年／月／日／時地支；證據級別依次 A／A／B／B。' },
  9: { star: 9, element: '火', qiElements: ['木', '火'], tombBranch: '戌', absoluteBranch: '亥', directQiBranches: ['寅', '卯', '辰', '巳', '午'], auditNote: '第三輪採戌墓並套各層地支；早期「辰入墓」轉錄衝突仍待原頁核對。' },
};

export const WHITE_KILLER_LABEL: Record<WhiteKiller, string> = {
  ru_mu: '入墓',
  an_jian: '暗建殺',
  shou_ke: '受剋殺',
  chuan_xin: '穿心殺',
  jiao_jian: '交劍殺',
  dou_niu: '鬥牛殺',
  xing_gong: '刑宮',
  hai_gong: '害宮',
  kong_wang: '空亡',
};

export interface SelectionMethodEvidence {
  id: 'temporal_coarrival' | 'qi_tomb_killers' | 'death_retreat_variant' | 'manuscript_purpose';
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
    summary: '年月日時紫白同到一方可作修方／選擇主幹；二時與四時有直接研究依據，三時是工具分級。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [
      { source: '《五要奇書》卷三十八相關紫白／修方材料', note: '第二輪考源摘要；未附原頁影像與頁碼。' },
      { source: '《三元選擇歌》', note: '研究摘要提及年月日時四課與紫白二時加；待核版本原頁。' },
    ],
  },
  {
    id: 'qi_tomb_killers',
    summary: '紫白須論支序有氣、墓絕與白中有殺；第三輪已定星宮與星支公式，但原頁仍待逐條覆核。',
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
