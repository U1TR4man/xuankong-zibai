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
  an_jian: '月暗建',
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
    summary: '紫白須論支序有氣、墓絕與白中有殺；第四輪修正月暗建及 classical 受剋表，generic 五行關係不得冒充古殺名。',
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
    summary: '月暗建依月白入中星反推禁修方；五黃入中禁乾坤艮巽。鬥牛採金土入木宮，水字讀法保留為 OCR／轉錄異文。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'variant',
    primarySourceVerified: false,
    witnesses: [
      { source: '時家三元紫白相關古表', note: '第四輪整理暗建、受剋、穿心、交劍及鬥牛定局；仍待逐格原頁核影。' },
    ],
    variants: [
      { reading: '金土與木同位', source: '多個傳本／轉錄及定局', note: 'V1 採用。' },
      { reading: '金土與水同位', source: '部分 OCR／轉錄', note: '疑似 OCR 或轉錄異文，不進公式。' },
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
