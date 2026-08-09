import type { StarNumber } from '../overlay/types';
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
  tombBranch: string;
  absoluteBranch: string;
  directQiBranches?: readonly string[];
  auditNote: string;
}

/**
 * 第二輪考源整理出的研究參考表。這些欄位尚未決定要套年／月／日／時的哪一套
 * 干支或節令，因此只供 schema 與學習顯示，不能直接產生 ranking。
 */
export const STAR_QI_REFERENCE: Readonly<Record<StarNumber, StarQiReference>> = {
  1: { star: 1, element: '水', qiElements: ['金', '水'], tombBranch: '辰', absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序說已整理；套用時間層的方法待考。' },
  2: { star: 2, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', auditNote: '五行框架已整理；套用時間層的方法待考。' },
  3: { star: 3, element: '木', qiElements: ['水', '木'], tombBranch: '未', absoluteBranch: '申', auditNote: '五行框架已整理；套用時間層的方法待考。' },
  4: { star: 4, element: '木', qiElements: ['水', '木'], tombBranch: '未', absoluteBranch: '申', auditNote: '五行框架已整理；套用時間層的方法待考。' },
  5: { star: 5, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', auditNote: '五行框架已整理；套用時間層的方法待考。' },
  6: { star: 6, element: '金', qiElements: ['土', '金'], tombBranch: '丑', absoluteBranch: '寅', directQiBranches: ['巳', '午', '未', '申', '酉'], auditNote: '支序說已整理；套用時間層的方法待考。' },
  7: { star: 7, element: '金', qiElements: ['土', '金'], tombBranch: '丑', absoluteBranch: '寅', auditNote: '五行框架已整理；套用時間層的方法待考。' },
  8: { star: 8, element: '土', qiElements: ['火', '土'], tombBranch: '辰', absoluteBranch: '巳', directQiBranches: ['申', '酉', '戌', '亥', '子'], auditNote: '支序說已整理；套用時間層的方法待考。' },
  9: { star: 9, element: '火', qiElements: ['木', '火'], tombBranch: '戌', absoluteBranch: '亥', directQiBranches: ['寅', '卯', '辰', '巳', '午'], auditNote: '轉錄有「辰入墓」衝突；本表依第二輪考源暫存戌墓，仍待原頁核對。' },
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
    summary: '紫白須論有氣、墓絕與白中有殺，不能把一六八九永久寫成固定吉星。',
    useContexts: ['selection_coarrival'],
    verificationStatus: 'awaiting_scan',
    primarySourceVerified: false,
    witnesses: [
      { source: '《儒門崇理折衷堪輿完孝錄》卷六〈九宮紫白〉', note: '第二輪考源摘要；表格仍需人工核影印頁。' },
      { source: '《選擇紀要》上編〈時家三元紫白〉、〈論紫白〉', note: '支序與墓絕摘要已存，但套用時間層的方法未定。' },
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
