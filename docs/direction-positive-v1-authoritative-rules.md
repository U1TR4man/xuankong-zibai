# Direction Positive Evidence V1 authoritative rules

> 狀態：2026-08-10 規則封版，**尚未實作**。本輪為 read-only 考源封版（接手指南 §5 Phase N0 的產物），不寫 production code、不改 `verdictFor()`、不改 `rankDirections()`、不動任何既有型別。

## 輸入與研究邊界

- 原始研究：`紫白擇吉_第十一至十三輪_正面DirectionGate與三德金匱總結.md`
- 原始檔 SHA-256：`c429963ad14e2b337b0efd35c150e4ba5bc7eeb0b100297db2220732eb53f46e`（1,864 行／22,702 bytes）
- 依使用者本輪決定，原檔**不收進 repo**，只保存 checksum，與第八至十輪處理方式一致。
- 承接：`docs/day-gate-v1-authoritative-rules.md`（第八輪，已實作）、`docs/hour-gate-v1-authoritative-rules.md`（第九輪，未實作）、`docs/direction-gate-v1-authoritative-rules.md`（第十輪，未實作）、`docs/gates-v1-integration.md`。
- 年干、月支一律取既有 canonical `TemporalPillars`；月支為精確節氣月。**不另建第二套四柱或曆法。**
- 不採納音，不做制煞判定，不建完整通勝神煞庫，不做四柱制化成局。

### 與第十輪的關係：不是 migration，是同一份未實作規格的第二半

研究稿 §七 名為「Migration Checklist」，前提是「Claude 已依前一份整合稿施工」。**本專案沒有這個前提**：Direction Gate V1（歲破／月破方／三煞／24 山）至今仍是 0 行 production code。

因此：

- 沒有既有 `DirectionGateV1` 需要遷移或改名。
- 研究稿 §37 的 `DirectionSelectionAssessmentV2` 是**第一版**就要直接採用的結構，不是 V1 之後的升級。
- Direction 層實作時，negative（constraints）與 positive（evidence）應一次做成分離 channel，不要先做成單一 `DirectionGate` 再拆。

## 0. 本三輪的定位

第十輪回答「哪些方向要避」，本三輪回答「在沒有犯重大 Gate 的前提下，哪些方向有古法上的正面依據」。

三個結論：

| 輪次 | 結論 |
|---|---|
| 第十一輪 | 六德可加入，但必須是 source-aware 的 24 山正面 evidence |
| 第十二輪 | 三德聚方是真正值得加入的強正面 pattern，但不能自動制歲破／三煞 |
| 第十三輪 | **月金匱撤回**，只留 reference_only |

第十三輪是本三輪唯一的「刪規則」結果，也是最重要的一項。

## 1. 六德六張表（deterministic，可封版）

「六德」＝歲德、歲德合、天德、天德合、月德、月德合。V1 保存全部六項，但**不同權**：歲德／天德／月德為 `primary_virtue`，三個合德為 `combined_virtue`。

### 1.1 歲德（按年干）

| 年干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
|---|---|---|---|---|---|---|---|---|---|---|
| 歲德 | 甲 | 庚 | 丙 | 壬 | 戊 | 甲 | 庚 | 丙 | 壬 | 戊 |

即：甲己年→甲、乙庚年→庚、丙辛年→丙、丁壬年→壬、戊癸年→戊。

### 1.2 歲德合（按年干）

| 年干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
|---|---|---|---|---|---|---|---|---|---|---|
| 歲德合 | 己 | 乙 | 辛 | 丁 | 癸 | 己 | 乙 | 辛 | 丁 | 癸 |

即：甲己年→己、乙庚年→乙、丙辛年→辛、丁壬年→丁、戊癸年→癸。

### 1.3 天德（按節氣月支，《協紀》官方月例）

| 月支 | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 | 子 | 丑 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 天德 | 丁 | 坤 | 壬 | 辛 | 乾 | 甲 | 癸 | 艮 | 丙 | 乙 | 巽 | 庚 |

十二項全部落在 24 山（八個天干山與四維山）。

### 1.4 天德合（按節氣月支）

| 月支 | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 | 子 | 丑 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 天德合 | 壬 | 無 | 丁 | 丙 | 無 | 己 | 戊 | 無 | 辛 | 庚 | 無 | 乙 |

**子、卯、午、酉四仲月為官方曆例「無合」**，因該四月天德在四維（巽、坤、乾、艮），非天干，故無五合之干。見 §2.2。

### 1.5 月德（按節氣月支，依三合局）

| 三合局 | 寅午戌 | 亥卯未 | 申子辰 | 巳酉丑 |
|---|---|---|---|---|
| 月德 | 丙 | 甲 | 壬 | 庚 |

四項全部是 24 山中的天干山。

### 1.6 月德合（按節氣月支，依三合局）

| 三合局 | 寅午戌 | 亥卯未 | 申子辰 | 巳酉丑 |
|---|---|---|---|---|
| 月德合 | 辛 | 己 | 丁 | 乙 |

**亥卯未月的月德合為己**，屬中宮干，無 24 山外方。見 §2.1。

### 1.7 六張表的內部推導關係（已逐項程式核對）

本輪以全枚舉核對，八組推導關係全部自洽，可作為實作時的不變式測試：

1. 歲德合＝歲德的五合干（甲己、乙庚、丙辛、丁壬、戊癸）。
2. 五合年組（甲己／乙庚／丙辛／丁壬／戊癸）的歲德與歲德合各自相同。
3. 天德為天干時，天德合＝天德的五合干。
4. 天德為四維時，天德合＝無；且無合月恰為子、卯、午、酉四仲。
5. 月德在同一三合局的三個月支相同。
6. 月德合在同一三合局的三個月支相同。
7. 月德合＝月德的五合干。
8. 月金匱＝月支所屬三合局的仲支（見 §4）。

**實作時應以推導關係加測試鎖定，而不是把六張表當成六份互不相干的魔術常量。** 但六張表仍須明列，因為推導只解釋結構，不取代原典曆例（尤其天德的十二項不可由五合推出）。

## 2. 空間解析：兩個必須保留的「無外方」情況

本節是第十一輪最重要的成果。**不可把所有吉神結果硬轉成 24 山。**

### 2.1 戊、己為中宮干，本無 24 山外方

24 山為：

```text
坎：壬 子 癸        艮：丑 艮 寅
震：甲 卯 乙        巽：辰 巽 巳
離：丙 午 丁        坤：未 坤 申
兌：庚 酉 辛        乾：戌 乾 亥
```

其中**沒有戊、己**。《協紀辨方書》明言「戊己為中宮之位，本無方」。

全枚舉後，六德命中中宮干的情況共 9 例：

| 規則 | 命中 | 值 |
|---|---|---|
| 歲德 | 戊年、癸年 | 戊 |
| 歲德合 | 甲年、己年 | 己 |
| 天德合 | 未月 | 己 |
| 天德合 | 申月 | 戊 |
| 月德合 | 卯月、未月、亥月 | 己 |

這些一律回傳 `central_stem`，**不得產生任何方位 boost**。

### 2.2 天德合四仲月：官方曆例無合

子、卯、午、酉月的天德分別為巽、坤、乾、艮，官方《協紀》／《星曆考原》系統作「無合」，回傳 `none`，`reason: 'classical_no_he'`。

**不得自動補四維互合。** 另有傳統材料以乾↔艮、巽↔坤為方向上的「合」，《協紀》稱可「備一義」，但不是其曆例 default，故只保存為異文：

```ts
variantId: 'tian_de_he_corner_directional_variant'
defaultEnabled: false
rankingUse: 'research_only'
```

異文不與 default 疊加，V1 亦不提供 UI selector（與五黃四隅異文的處理方式一致）。

### 2.3 禁止自造寄宮

**V1 明確禁止** `戊 → 艮`、`己 → 坤` 或任何後天寄宮映射，除非日後另做專門考源並經使用者批准。這是 stop condition，見 §8。

### 2.4 六德精度是 24 山，不是整宮

例：月德＝丙。丙只是離宮「丙 午 丁」三山之一。**不得顯示「整個南方都是月德」**，主八宮 UI 只能表達 partial positive hit，Detail 才逐山說明（丙山：月德；午、丁：非月德）。

與第十輪的 negative coverage 對稱，另開：

```ts
type PositiveHitCoverage = 'none' | 'partial' | 'full';
```

六德實務上幾乎恆為 `partial`（只落一個 15° 山）。

## 3. 三德聚方（deterministic，可封版）

### 3.1 三德不是六德

古法「三德」特指**歲德＋天德＋月德**，**不含**三個合德。命名與實作皆不得混用。

### 3.2 有直接古例

《造命宗鏡集》修方段：「甲年六月，歲德、天德、月德會於甲方」，並將「三德方」列為修吉神方的重要類型。因此 `sanDeCongJi` 不是現代自創 heuristic。

### 3.3 全枚舉結果（120 組年干 × 月支）

本輪以程式全枚舉，三德同方恰有 **8 組**，對應 **4 個山**：

| 年干 | 節氣月 | 三德聚方 |
|---|---|---|
| 甲年、己年 | 未月（六月） | 甲 |
| 乙年、庚年 | 丑月（十二月） | 庚 |
| 丙年、辛年 | 戌月（九月） | 丙 |
| 丁年、壬年 | 辰月（三月） | 壬 |

**戊年、癸年不產生任何 peripheral 三德聚方**：其歲德為戊（中宮干），而天德／月德並無相應外方聚會。全枚舉確認戊、癸兩個年干在十二個月中命中數為 0。

### 3.4 用計算，不寫死

推薦 `getDirectionVirtues(yearStem, monthBranch)` 後再 `detectSanDeCongJi(virtues)`，條件為：三者皆有 peripheral mountain **且** mountain 完全相同。寫死四組較易 drift。上表只作測試 fixture。

### 3.5 天德＝月德但非三德的月份

天德與月德本身在辰、未、戌、丑（三、六、九、十二月）重合為壬、甲、丙、庚。**只有歲德亦同方時才叫三德聚方**，否則只是 `multiple positive virtues`。不得濫用「三德」一詞。

## 4. 月金匱：本輪撤回（第十三輪）

### 4.1 原算法

較早選擇文獻有「本月旺方為金匱」，按三合局帝旺：

| 節氣月 | 申子辰 | 亥卯未 | 寅午戌 | 巳酉丑 |
|---|---|---|---|---|
| 月金匱 | 子 | 卯 | 午 | 酉 |

**此表即三合局的仲支**，已由 `src/selection/branchRelations.ts` 的 `SAN_HE_GROUPS[].center` 保存。實作時**必須複用該欄位，不得新建第二張月金匱表**（整合契約 §8 的單一資料源原則）。

### 4.2 《協紀》的校正

《協紀辨方書》整理舊例後指出：同一帝旺位置既被稱作金匱吉、又被稱作大煞／打頭火凶，若只因「帝旺」便固定判吉即自相矛盾，故明確提出「金匱星今亦不用」，並傾向理解為「疊吉則吉，疊凶則凶」，本身未必固定吉凶。

### 4.3 V1 policy

```ts
const MONTH_JIN_KUI_POLICY = {
  calculate: true,
  display: 'detail_only',
  rankingUse: 'disabled',
  mode: 'reference_only',
} as const;
```

**不得因為名字吉利就加分**——`if (direction === monthJinKui) boost()` 正是 source-critical research 要避免的「吉名即加分」。

### 4.4 但不刪資料

月金匱仍有研究價值（較早修方文獻確實使用、與三合帝旺／有氣系統相關、日後研究「旺方＋紫白＋四柱」可能有用）。**不 scoring ≠ 刪資料**，延續 81 雙星的處理方式。

## 5. severity 與模式（V1 政策）

### 5.1 construction／daily 分歧

| 規則 | construction／修方 | daily／日常 |
|---|---|---|
| 歲德、天德、月德 | active positive evidence | secondary evidence／tie-break |
| 歲德合、天德合、月德合 | secondary positive evidence | secondary evidence／tie-break |
| 三德聚方 | strong positive pattern | notable positive marker |
| 月金匱 | reference_only | reference_only |

前提一律是：**Direction constraints 沒有 structural avoid。**

### 5.2 daily 模式不得讓六德取代紫白

「三德方」最強的直接語境仍是修造、營構、取土、山方。日常模式的主要 direction quality 仍是紫白：

```text
daily：Purple White = primary；六德 = secondary evidence / tie-break
```

允許的用法是 tie-break：A、B 兩方紫白品質相近，A 同時得月德而 B 沒有 → A 可優先於 B。**不得**因單一歲德或月德就把方向直接升 priority，更不得變成「月德 > 紫白」。

### 5.3 承接整合契約：模式選擇仍未定義

`docs/gates-v1-integration.md` §5 已定：daily／construction 的使用者選擇方式尚未定義，規格確定前一律以 daily 為預設語義，construction 級 severity 只作文字說明。本輪不改變此結論，六德的 construction 級 active positive 同樣**在 UI 規格確定前不得進入 verdict**。

## 6. precedence：正面不得翻轉 structural veto

這是第十二輪最重要的成果，也是整個擇吉 engine 的 architecture invariant。

### 6.1 禁止的實作

```ts
// 明確禁止
if (sanDeCongJi) { suiPo = false; sanSha = false; }
```

《造命宗鏡集》要求「吉方必須不疊緊要殺」；《協紀辨方書》作「大煞避之，中煞制之，小煞不必論」，且即使太陽等強吉星遇某些猛煞亦不能簡單制伏。

### 6.2 Final synthesis 不用總分

```text
錯：歲德 +2、天德 +2、月德 +2、三德 +5 → 總分高即可用
對：positiveEvidence[] + patterns[]，由 precedence 決定 final status
```

禁止數值化的額外理由：**「三德」本身就是三條 evidence 的特定聚會，若三條各加分再加三德分即重複疊分。**

structural avoid 的例子：construction 模式下精確犯歲破山 → `avoid`，即使三德聚方且年月日時紫白俱佳，仍不得自動翻轉。

### 6.3 正面 evidence 必須支援多值

一個山可同時是歲德、天德、月德、天德合……故必須是陣列：

```ts
positiveEvidence: DirectionVirtueEvidence[];   // 對
positiveVirtue?: string;                       // 錯
```

與第十輪 negative hits 的陣列設計一致：overlap 並列顯示，不做數值相抵。

### 6.4 「六德能否制支煞」的文本辯論：V1 不判定

部分傳承作「六德俱走天干，不能制地支方煞」，但《協紀》編者明確批評此說不對，理由是「支煞正可由干制」。這意味真正的制煞不是「吉神 vs 凶神」的 boolean，而要看干犯干制、支犯支制、三合犯三合制、旺衰與四柱。

由於 V1 不做完整制煞、不採納音、不做四柱制化成局：

```ts
virtueCancelsKiller = false;
```

metadata 須明示：「古法另有制化理論，本版本不自動判定制煞成功。」這**不是**認定「六德永不能制煞」，而是 V1 不具備替使用者判定「已制化成功」的條件。UI 文字不得寫成「六德不能制煞」。

## 7. V1 程式契約（尚未實作）

命名須對齊 `src/selection/types.ts` 既有慣例；`Mountain24` 沿用 `docs/direction-gate-v1-authoritative-rules.md` §8 的定義。

```ts
export type DirectionVirtueCode =
  | 'sui_de' | 'sui_de_he'
  | 'tian_de' | 'tian_de_he'
  | 'yue_de' | 'yue_de_he';

export type VirtueSpatialPosition =
  | { kind: 'mountain'; mountain: Mountain24 }
  | { kind: 'central_stem'; stem: '戊' | '己'; peripheral: false }
  | { kind: 'none'; reason: string };

export interface DirectionVirtueEvidence {
  code: DirectionVirtueCode;
  position: VirtueSpatialPosition;
  exactMountainHit: boolean;
  role: 'primary_virtue' | 'combined_virtue';
  rankingUse: 'disabled';          // V1 一律 disabled，見 §7.1
  evidenceLevel: TemporalEvidenceLevel;
  explanation: string;
}

export type PositiveHitCoverage = 'none' | 'partial' | 'full';

export interface DirectionSelectionAssessmentV2 {
  target: SpatialTarget;
  constraints: DirectionGateAssessment;            // 第十輪，negative channel
  positives: {
    virtues: DirectionVirtueEvidence[];
    coverage: PositiveHitCoverage;
    patterns: { sanDeCongJi?: { active: boolean; mountain: Mountain24 } };
    references: { monthJinKui?: { branch: Branch; rankingUse: 'disabled' } };
  };
  purpleWhite: PurpleWhiteQuality;
  status: 'not_evaluated';                          // V1 不產生 final status
  reasons: string[];
}
```

共用函式（**新寫在 `src/selection/`，不得動 `src/engine/**`**）：

```ts
getDirectionVirtues(yearStem: Stem, monthBranch: Branch): DirectionVirtueEvidence[];
resolveVirtueSpatialPosition(value: Mountain24 | '戊' | '己' | null): VirtueSpatialPosition;
detectSanDeCongJi(virtues: DirectionVirtueEvidence[]): { active: boolean; mountain?: Mountain24 };
getMonthJinKuiBranch(monthBranch: Branch): Branch;   // 必須複用 SAN_HE_GROUPS[].center
```

### 7.1 V1 統一的 ranking 政策

延續 `docs/gates-v1-integration.md` §6：

```ts
rankingUse: 'disabled'      // 正面 evidence 同樣不參與八方排序
gateUse:    'reference_only'
```

`verdictFor()` 與 `rankDirections()` **不得讀取任何 Direction Positive 欄位**；實作時必須附 regression test 證明兩者輸出不變。研究稿 §42 的 construction active positive 與 daily tie-break 在使用者批准 ranking 前只作文字說明。

### 7.2 與既有 primitive 的銜接

- 三合局：複用 `src/selection/branchRelations.ts` 的 `SAN_HE_GROUPS`。月德／月德合按 `getSanHeGroup(monthBranch).key` 查表；月金匱直接取 `.center`。**不得新建第三張三合表。**
- 24 山：Direction Gate V1 尚未實作，`Mountain24` 型別與 24 山 mapping 應在該輪一併建立；正面 evidence 依賴它，故 §11 的實作順序不可顛倒。

## 8. Stop conditions

實作前或實作中遇到下列情形，必須停止並詢問使用者：

1. 要把六德或三德聚方接進 `verdictFor()` 或 `rankDirections()`。
2. 要把 §5.1 任何 severity 由 `reference_only` 升級為 active。
3. 要為戊、己建立寄宮映射（`戊→艮`、`己→坤` 或其他）。
4. 要把天德合四維互合異文設為 default，或自動補四仲月的合。
5. 要引入「修造／日常／葬事」模式切換而 UI 規格未定義使用者如何選擇。
6. 要讓任何吉神自動取消歲破、三煞、大月建、破日或時破。
7. 要建立「命中 2 個六德 ＝ priority」「3 個吉神 ＝ 固定加分」這類古法未明載的硬閾值。
8. 要把月金匱重新升為正面吉方。
9. 需要改 `src/engine/**`、`src/data/**` 或 `tests/fixtures/chart-snapshot.json`。
10. 研究稿與既有 repo 文件出現定義衝突。

## 9. 證據狀態

`primarySourceVerified = false`（全部條目）。

| 來源 | 用於 | 定位精度 |
|---|---|---|
| 《欽定協紀辨方書》 | 六德六表、戊己中宮本無外方、四仲天德合官方無合、真吉神／真凶神層級、大煞避中煞制小煞不必論、月金匱固定吉論的校正 | 僅書名，**無卷次、頁碼、版本或原頁影像** |
| 《御定星曆考原》 | 天德合的八月有合／四仲無合、天德合為天德五合之義 | 僅書名 |
| 《造命宗鏡集》 | 三德方作修吉方、「甲年六月三德會於甲方」直接例、吉方必須不疊緊要殺 | 僅書名 |
| 《選擇紀要》及同系材料 | 三德＝歲德＋天德＋月德、三德修方傳統用法 | 僅書名 |

與前三輪比較：

| 輪次 | 卷次級引用 | 可核對連結 | 評價 |
|---|---|---|---|
| 第八輪 Day | 有 | 有（ctext） | 最強 |
| 第九輪 Hour | 有 | 無 | 次之 |
| 第十輪 Direction 負面 | 無（僅篇名） | 無 | 弱 |
| **第十一至十三輪 正面** | **無（僅書名）** | 無 | **同第十輪或更弱** |

依接手指南 §6 與 §12，本輪 severity 因此**全部保留 `reference_only`／`rankingUse: 'disabled'`**，不得因「表格能 deterministic 計算」就升為 active。

需要區分兩件事：

- **六張表與三德聚方的曆法算法**可封版——本輪已用全枚舉驗證八組推導關係全部自洽，四組三德聚方可完全由三張表導出。
- **這些吉神的強度與適用性**不可封版——「active positive」「strong positive pattern」目前只有轉述語句支撐。

### 可封版

- [x] 六德六張表（歲德、歲德合、天德、天德合、月德、月德合）
- [x] 歲德合／天德合／月德合＝各自本德的五合干
- [x] 月德、月德合依三合局，同局三月相同
- [x] 戊、己為中宮干，本無 24 山外方（共 9 例）
- [x] 天德合在子、卯、午、酉四仲月官方曆例作「無合」
- [x] 四維互合為異文，default OFF
- [x] 三德＝歲德＋天德＋月德，不含合德
- [x] 三德聚方全枚舉恰 8 組年干×月支、4 個山；戊癸年無 peripheral 三德
- [x] 天德＝月德但歲德不同方時不得稱三德
- [x] 六德精度為 24 山，主八宮只能表達 partial positive hit
- [x] 正面 evidence 必須是陣列，overlap 並列
- [x] 不做數值化總分、不做正負抵消
- [x] 正面 evidence 不得翻轉 structural veto
- [x] `virtueCancelsKiller = false`，且不得聲稱「六德永不能制煞」
- [x] 月金匱＝三合局仲支，但 V1 撤回為 reference_only
- [x] 月金匱不刪資料

### 不可封版（須先補證據或使用者決策）

- [ ] 六德在 construction 模式的 active positive 強度原文（卷次、頁碼、原頁）
- [ ] 三德聚方作為 strong positive pattern 的量化邊界
- [ ] 六德在 daily 模式是否真有直接古例，或只是本專案的合理外推
- [ ] 戊己寄宮的專門考源
- [ ] 四維互合異文的採用條件
- [ ] 制煞理論（干制支、三合制三合、旺衰、四柱）
- [ ] 月金匱與「打頭火／大煞」同位的完整對照表
- [ ] construction／daily／burial 模式的使用者選擇 UI

## 10. 明確不做（研究稿 §44）

```text
吉神自動制歲破／三煞／大月建
戊己自行寄宮
四仲天德合自動補四維互合
2 個吉神 = priority；3 個吉神 = 固定加分
月金匱 = 自動吉方
```

另補本專案既有邊界：不採納音、不加十神、不加旬空、不建完整神煞庫、不做 24 山 UI 盤。

## 11. 建議實作順序（下一輪起）

正面 evidence 依賴 24 山幾何，故**必須排在 Direction Gate 負面規則之後**：

1. （第十輪）`Mountain24` 型別、24 山 mapping、`oppositeBranch()` 已備、`getSanShaMountains()` 與純函式測試。
2. （第十輪）`getMountainHitsForPalace()` 與 coverage 測試。
3. （第十輪）`DirectionGateAssessment` 組裝，`status` 恆 `'not_evaluated'`。
4. （本輪）六德六張表、`resolveVirtueSpatialPosition()`、`getDirectionVirtues()` 與純函式測試——含 §1.7 八組推導不變式、§2.1 九個中宮干例、§2.2 四仲無合。
5. （本輪）`detectSanDeCongJi()` 與測試——全枚舉 120 組驗證恰 8 組命中、戊癸年恆 false。
6. （本輪）`getMonthJinKuiBranch()` 複用 `SAN_HE_GROUPS[].center`，附 `rankingUse: 'disabled'` 的 policy 測試。
7. positives 與 constraints 分 channel 的 `DirectionSelectionAssessmentV2` 組裝，附 regression test 證明 `verdictFor()`／`rankDirections()` 輸出不變。
8. UI 最後才做：主九宮只能顯示「本宮含受影響／得吉山」，Detail 才逐山說明；中宮干情況不得顯示在任何方向，四仲無合須寫「本月官方曆例無合」。**不得使用 platform-dependent glyph**（接手指南 §8），研究稿 §38 的 `✦` 只是示意，實作改用既有色彩與文字。
