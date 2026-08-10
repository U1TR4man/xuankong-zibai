/**
 * Direction Positive Evidence V1 —— 六德與三德叢聚（positive channel）。
 *
 * 契約見 `docs/direction-positive-v1-authoritative-rules.md`，特別是 §1、§2、§3、§7。
 *
 * 與 `directionGate.ts` 的關係：**兩個分離的 channel**，不得混為一鍋。
 *
 * ```text
 * DIRECTION CONSTRAINTS   歲破、月破方、三煞      → directionGate.ts
 * DIRECTION POSITIVES     六德、三德叢聚          → 本檔
 * ```
 *
 * V1 政策（§7.1）：
 *
 * ```ts
 * rankingUse: 'disabled'      // 正面 evidence 同樣不參與八方排序
 * ```
 *
 * **正面 evidence 不得翻轉 structural veto**（§6）：不得因六德或三德叢聚
 * 就解除歲破、三煞、大月建、破日或時破，不做數值化總分，不做正負抵消，
 * 也不得建立「命中 2 個吉神即優先」這類古法未明載的硬閾值。
 *
 * 全部為純函式：不讀 DOM、localStorage 或 URL state，不修改 `src/engine/**`。
 */

import type { Branch, Stem } from '../engine/time/ganzhi';
import { SAN_HE_GROUPS, getSanHeGroup } from './branchRelations';
import type { Mountain24 } from './mountains24';
import type { TemporalEvidenceLevel } from './types';

export type DirectionVirtueCode =
  | 'sui_de' | 'sui_de_he'
  | 'tian_de' | 'tian_de_he'
  | 'yue_de' | 'yue_de_he';

/** 中宮干。二十四山不含戊、己。 */
export type CentralStem = '戊' | '己';

/** 六德的原始值：24 山之一、中宮干，或官方曆例「無合」。 */
export type VirtueRawValue = Mountain24 | CentralStem | null;

/**
 * 六德值的空間解析結果。
 *
 * `outside_24_mountains` 刻意**不叫** `central_stem`：可確認的只有
 * 「二十四山無戊己」這個事實；「因而屬中宮、因而無方」是對六德的應用推論，
 * 未查得選擇原典明文（§2.1）。行為上都不映射任何山、不參排名，
 * 但命名不得冒充古法定例。
 */
export type VirtueSpatialPosition =
  | { kind: 'mountain'; mountain: Mountain24 }
  | { kind: 'outside_24_mountains'; stem: CentralStem }
  | { kind: 'none'; reason: 'classical_no_he' };

export interface DirectionVirtueEvidence {
  code: DirectionVirtueCode;
  rawValue: VirtueRawValue;
  position: VirtueSpatialPosition;
  /** 是否確實落在某個 15° 山。只有 true 才可作為方位正面 evidence。 */
  exactMountainHit: boolean;
  /** 見 §1：歲德與歲德合同為 primary（「並屬上吉」），不得分級。 */
  role: 'primary_virtue' | 'combined_virtue';
  evidenceLevel: TemporalEvidenceLevel;
  /** true 者已核對《御定星厯考原》四庫本卷三原文，見規則文件 §9.1。 */
  primarySourceVerified: boolean;
  /** `variant` 為傳本異法，default 不啟用。 */
  sourceMode: 'official' | 'variant';
  rankingUse: 'disabled';
}

/* ------------------------------------------------------------------ *
 * 六德六張表
 *
 * 值本身經獨立考源覆核，兩條路徑零差異；天德、天德合、月德、月德合
 * 另已逐字核對四庫本卷三原文。推導關係由測試鎖定，但六張表仍須明列——
 * 推導只解釋結構，不取代原典曆例（天德十二項不可由五合推出）。
 * ------------------------------------------------------------------ */

/** 歲德，按年干。甲己→甲、乙庚→庚、丙辛→丙、丁壬→壬、戊癸→戊。 */
const SUI_DE: Readonly<Record<Stem, VirtueRawValue>> = Object.freeze({
  甲: '甲', 乙: '庚', 丙: '丙', 丁: '壬', 戊: '戊',
  己: '甲', 庚: '庚', 辛: '丙', 壬: '壬', 癸: '戊',
});

/** 歲德合＝歲德的五合干。 */
const SUI_DE_HE: Readonly<Record<Stem, VirtueRawValue>> = Object.freeze({
  甲: '己', 乙: '乙', 丙: '辛', 丁: '丁', 戊: '癸',
  己: '己', 庚: '乙', 辛: '辛', 壬: '丁', 癸: '癸',
});

/** 天德，按節氣月支。八個天干山＋四維山，無法由五合推導。 */
const TIAN_DE: Readonly<Record<Branch, VirtueRawValue>> = Object.freeze({
  寅: '丁', 卯: '坤', 辰: '壬', 巳: '辛', 午: '乾', 未: '甲',
  申: '癸', 酉: '艮', 戌: '丙', 亥: '乙', 子: '巽', 丑: '庚',
});

/**
 * 天德合（官方曆例）。
 *
 * 子、卯、午、酉四仲月為 `null`：該四月天德在四維，非天干，故無五合之干。
 * 《御定星厯考原》四庫本卷三原文：「四仲之月天德居四維故無合也」。
 */
const TIAN_DE_HE_OFFICIAL: Readonly<Record<Branch, VirtueRawValue>> = Object.freeze({
  寅: '壬', 卯: null, 辰: '丁', 巳: '丙', 午: null, 未: '己',
  申: '戊', 酉: null, 戌: '辛', 亥: '庚', 子: null, 丑: '乙',
});

/**
 * 天德合的四維互合異文（乾↔艮、巽↔坤）。
 *
 * 出《三命通會》引《大統曆》「二月坤與巽合」，其餘三個四仲為推導。
 * **default 不啟用**，不與官方曆例疊加，V1 亦不提供 UI selector
 * （與五黃四隅異文的處理方式一致）。
 */
export const TIAN_DE_HE_CORNER_VARIANT_ID = 'tian_de_he_corner_directional_variant';

const TIAN_DE_HE_CORNER_VARIANT: Readonly<Partial<Record<Branch, Mountain24>>> = Object.freeze({
  卯: '巽', 午: '艮', 酉: '乾', 子: '坤',
});

/** 月德，按月支所屬三合局取該局陽干。寅午戌→丙、亥卯未→甲、申子辰→壬、巳酉丑→庚。 */
const YUE_DE_BY_GROUP: Readonly<Record<string, VirtueRawValue>> = Object.freeze({
  yin_wu_xu: '丙', hai_mao_wei: '甲', shen_zi_chen: '壬', si_you_chou: '庚',
});

/** 月德合＝月德的五合干。 */
const YUE_DE_HE_BY_GROUP: Readonly<Record<string, VirtueRawValue>> = Object.freeze({
  yin_wu_xu: '辛', hai_mao_wei: '己', shen_zi_chen: '丁', si_you_chou: '乙',
});

/** 月德。 */
function yueDe(monthBranch: Branch): VirtueRawValue {
  return YUE_DE_BY_GROUP[getSanHeGroup(monthBranch).key] ?? null;
}

/**
 * 月德合。
 *
 * 轉錄異文：《御定星厯考原》四庫本卷三該條作「二六十月在**巳**」，
 * 但同條按語作「各以月德所合之**干**為之」，甲之五合為己，
 * 故正字應為「己」，此本屬形近訛。表值取己，異文記於規則文件 §0.5.3，
 * 不修文、亦不默默忽略。
 */
function yueDeHe(monthBranch: Branch): VirtueRawValue {
  return YUE_DE_HE_BY_GROUP[getSanHeGroup(monthBranch).key] ?? null;
}

/* ------------------------------------------------------------------ *
 * 空間解析
 * ------------------------------------------------------------------ */

/**
 * 把六德的原始值解析成方位。
 *
 * **不得** `return value as Mountain24`：戊、己不在 24 山，
 * 四仲月天德合為官方「無合」，兩者都不可產生假的方位 boost。
 */
export function resolveVirtueSpatialPosition(value: VirtueRawValue): VirtueSpatialPosition {
  if (value === null) return { kind: 'none', reason: 'classical_no_he' };
  if (value === '戊' || value === '己') return { kind: 'outside_24_mountains', stem: value };
  return { kind: 'mountain', mountain: value };
}

/* ------------------------------------------------------------------ *
 * 六德組裝
 * ------------------------------------------------------------------ */

interface VirtueDefinition {
  role: DirectionVirtueEvidence['role'];
  evidenceLevel: TemporalEvidenceLevel;
  primarySourceVerified: boolean;
}

/**
 * 層級與證據等級。
 *
 * 層級（§1）：天德／月德 primary、兩合德 combined；**歲德與歲德合同為 primary**
 * （《協紀》「並屬上吉」），不得把歲德合降一級。
 *
 * `primarySourceVerified`（§9）：只有《御定星厯考原》四庫本卷三已逐字核對者為 true。
 * 歲德與歲德合目前只有篇名與線上連結，未親自讀取原文，維持 false。
 */
const VIRTUE_DEFINITIONS: Readonly<Record<DirectionVirtueCode, VirtueDefinition>> = Object.freeze({
  sui_de: { role: 'primary_virtue', evidenceLevel: 'B', primarySourceVerified: false },
  sui_de_he: { role: 'primary_virtue', evidenceLevel: 'B', primarySourceVerified: false },
  tian_de: { role: 'primary_virtue', evidenceLevel: 'A', primarySourceVerified: true },
  tian_de_he: { role: 'combined_virtue', evidenceLevel: 'A', primarySourceVerified: true },
  yue_de: { role: 'primary_virtue', evidenceLevel: 'A', primarySourceVerified: true },
  yue_de_he: { role: 'combined_virtue', evidenceLevel: 'A', primarySourceVerified: true },
});

export interface DirectionVirtueOptions {
  /**
   * 啟用天德合四維互合異文。**default false。**
   * 啟用後該項 `sourceMode` 為 `'variant'`，仍不參與排序。
   */
  tianDeHeCornerVariant?: boolean;
}

function evidence(
  code: DirectionVirtueCode,
  rawValue: VirtueRawValue,
  sourceMode: 'official' | 'variant' = 'official',
): DirectionVirtueEvidence {
  const definition = VIRTUE_DEFINITIONS[code];
  const position = resolveVirtueSpatialPosition(rawValue);
  return {
    code,
    rawValue,
    position,
    exactMountainHit: position.kind === 'mountain',
    role: definition.role,
    evidenceLevel: definition.evidenceLevel,
    primarySourceVerified: definition.primarySourceVerified,
    sourceMode,
    rankingUse: 'disabled',
  };
}

/**
 * 求某年干、某節氣月支的六德。
 *
 * 恆回傳六項（含 `outside_24_mountains` 與 `none`），不預先過濾，
 * 讓呼叫端能顯示「本月官方曆例無合」這類說明。
 */
export function getDirectionVirtues(
  yearStem: Stem,
  monthBranch: Branch,
  options: DirectionVirtueOptions = {},
): readonly DirectionVirtueEvidence[] {
  const official = TIAN_DE_HE_OFFICIAL[monthBranch];
  const variant = options.tianDeHeCornerVariant ? TIAN_DE_HE_CORNER_VARIANT[monthBranch] : undefined;
  const useVariant = official === null && variant !== undefined;
  return [
    evidence('sui_de', SUI_DE[yearStem]),
    evidence('sui_de_he', SUI_DE_HE[yearStem]),
    evidence('tian_de', TIAN_DE[monthBranch]),
    useVariant ? evidence('tian_de_he', variant, 'variant') : evidence('tian_de_he', official),
    evidence('yue_de', yueDe(monthBranch)),
    evidence('yue_de_he', yueDeHe(monthBranch)),
  ];
}

/* ------------------------------------------------------------------ *
 * 三德叢聚
 * ------------------------------------------------------------------ */

/** 三德＝歲德＋天德＋月德，**不含**三個合德。 */
const SAN_DE_CODES: readonly DirectionVirtueCode[] = Object.freeze(['sui_de', 'tian_de', 'yue_de']);

export interface SanDeCongJuResult {
  active: boolean;
  mountain?: Mountain24;
}

/**
 * 三德叢聚。
 *
 * 「三德叢聚」是古籍既有名詞（《新刊類編陰陽選擇合併通書大全》卷十二〈三德格〉），
 * 不是現代自創 heuristic。識別碼採正名 `sanDeCongJu`；原研究稿的
 * `sanDeCongJi` 屬誤植。
 *
 * 條件：歲德、天德、月德三者**皆有 peripheral mountain 且完全相同**。
 * 由三張表計算而不寫死四組，避免 drift；全枚舉結果見測試。
 *
 * 戊、癸年恆為 false：其歲德為戊，無外方。
 */
export function detectSanDeCongJu(
  virtues: readonly DirectionVirtueEvidence[],
): SanDeCongJuResult {
  const mountains = SAN_DE_CODES.map((code) => {
    const found = virtues.find((virtue) => virtue.code === code);
    return found?.position.kind === 'mountain' ? found.position.mountain : undefined;
  });
  const [first] = mountains;
  if (first === undefined || !mountains.every((mountain) => mountain === first)) {
    return { active: false };
  }
  return { active: true, mountain: first };
}

/* ------------------------------------------------------------------ *
 * 月金匱（reference only）
 * ------------------------------------------------------------------ */

/**
 * 月金匱＝月支所屬三合局的仲支（帝旺）。
 *
 * **複用 `SAN_HE_GROUPS[].center`，不建第二張表**（規則文件 §4.1）。
 */
export function getMonthJinKuiBranch(monthBranch: Branch): Branch {
  return getSanHeGroup(monthBranch).center;
}

/**
 * V1 月金匱政策：可計算、只在詳情顯示、不進排序。
 *
 * `evidenceStatus` 為 `source_tension` 而非「《協紀》否定」：
 * 〈諸家年月日吉凶神附論〉作「金匱星今亦不用」，但〈火星〉另作
 * 「月家金匱方，今通書不載，然亦有理」並保留完整起例與使用條件，
 * 同一權威本內部兩說並存（規則文件 §4.2）。
 * UI 不得寫成「《協紀》認為金匱無用」。
 *
 * 不 scoring ≠ 刪資料，比照 81 雙星的處理方式。
 */
export const MONTH_JIN_KUI_POLICY = Object.freeze({
  calculate: true,
  display: 'detail_only',
  rankingUse: 'disabled',
  mode: 'reference_only',
  evidenceStatus: 'source_tension',
} as const);

/** 四組三合局各自的月金匱，供資料檢查與 UI 說明使用。 */
export function listMonthJinKuiByGroup(): ReadonlyArray<{ label: string; branch: Branch }> {
  return SAN_HE_GROUPS.map((group) => ({ label: group.label, branch: group.center }));
}
