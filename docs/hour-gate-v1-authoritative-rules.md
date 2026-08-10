# Hour Gate V1 authoritative rules

> 狀態：2026-08-10 規則封版，**尚未實作**。本輪為 read-only 考源封版，不寫 production code、不改 `verdictFor()`、不改 `rankDirections()`、不動 `TimeGateAssessment.hourStatus`。

## 輸入與研究邊界

- 原始研究：`紫白擇吉_第九輪考源_HourGate_V1封版.md`
- 原始檔 SHA-256：`176c41c2b5fc721b6c70d6e9d95f8ab262eae512564aeb3e7170b9c50f5d9468`
- 四柱一律取既有 canonical `TemporalPillars`（年界、節氣月、換日、中國時辰 boundary 皆沿用）。**不另建第二套四柱。**
- 不採納音，不建完整神煞庫，不做數值抵消。
- 承接 Day Gate V1（`docs/day-gate-v1-authoritative-rules.md`）。

## 0. 核心定位

《協紀辨方書》：「時者，日之用也」；《造命宗鏡集》傳文作「時者，日之臣僕也」。

> 時辰不是脫離日柱再擇一次吉凶，而是**日之用**：先不能破日、沖月令／歲君，再看能否扶日。

```ts
hourRole = 'support_and_refinement';   // 不是 'equal_to_day'
```

架構後果：**時白吉不得推翻 Hour Gate 明確不合格的時辰。** Hour Gate 先決定時辰是否進入候選，時白只在合格時辰內比較方向。

## 1. 負面規則（deterministic table，可封版）

### 1.1 時破 = 日支沖時支

《協紀辨方書》卷七：「破時大凶，時支沖日支也，如子日午時。」《造命宗鏡集》卷六：「古仙多用建時，決不用破時。」

```ts
isHourBreak = isClash(dayBranch, hourBranch);
```

六沖：子午、丑未、寅申、卯酉、辰戌、巳亥。

「時破／破時」是原典既有名詞，非本專案自造，UI 可直接顯示。

### 1.2 時沖月令 / 時沖歲君

```ts
hourClashesMonth = isClash(hourBranch, monthBranch);
hourClashesYear  = isClash(hourBranch, yearBranch);
```

《協紀辨方書》另有明文限制：「時沖月令、沖歲君皆凶，**大事則忌，小事可勿論**。」→ 因此**不得全域 hard reject**，必須依用途分級。

### 1.3 五不遇 = 時干剋日干（指定十組）

| 日干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
|---|---|---|---|---|---|---|---|---|---|---|
| 五不遇時 | 庚午 | 辛巳 | 壬辰 | 癸卯 | 甲寅 | 乙丑 | 丙子 | 丁酉 | 戊申 | 己未 |

```ts
isFiveBuYu = (hourGanzhi === FIVE_BU_YU[dayStem]);
```

**必須用十組定局表，不得用 generic「時干剋日干且同陰陽」的推導**，避免傳本干支配時差異造成 false positive。

**且不得把「時支剋日支」混入五不遇。** 《協紀辨方書》卷七專門校正：正法只看時干剋日干；另一傳法連時支剋日支亦算，《協紀》認為不如前法。時支與日支的關係另走時破／時刑／日害／合／建。

### 1.4 時刑 = 日支刑時支（有方向性）

```ts
const BRANCH_PUNISHES = {
  子: ['卯'], 卯: ['子'],
  寅: ['巳'], 巳: ['申'], 申: ['寅'],
  丑: ['戌'], 戌: ['未'], 未: ['丑'],
  辰: ['辰'], 午: ['午'], 酉: ['酉'], 亥: ['亥'],
};
isHourPunishment = BRANCH_PUNISHES[dayBranch].includes(hourBranch);
```

**是有向關係，不是「兩支同在一個刑組即 true」。** 例：申日寅時為刑，巳日寅時不是。

### 1.5 日害 = 日支與時支六害

六害：子未、丑午、寅巳、卯辰、申亥、酉戌。

## 2. 正面規則（deterministic table，可封版）

| 規則 | 判定 |
|---|---|
| 時建 | `dayBranch === hourBranch` |
| 六合 | 子丑、寅亥、卯戌、辰酉、巳申、午未 |
| 三合 | 申子辰／寅午戌／亥卯未／巳酉丑 同組 |
| 時干扶日 | 時干與日干同五行（比助）或時干生日干 |
| 日祿時 | 甲寅、乙卯、丙巳、丁午、戊巳、己午、庚申、辛酉、壬亥、癸子 |

三合只作「日時同在一個三合局」的正面關係，**不得自動聲稱三支已完整成局**（除非年月補足第三支）。

時干扶日的六種關係中，V1 只把 `same_element` 與 `generates_day` 當正面訊號。

## 3. 兩個必須保留的結構特性

### 3.1 正負關係必須可同時存在

自刑支（辰午酉亥）在日時相同時**同時是時建（吉）與時刑（凶）**；巳日申時**同時是六合與巳刑申**。

```ts
positiveRelations: string[];
warnings: string[];
```

**不得**用單一 `hourRelation = 'build'` 只存一個值。最終 status 由 precedence 決定，不靠正負抵消。

### 3.2 祿時不凌駕負面規則

《協紀辨方書》卷七原則：即使吉神／喜時，若同時犯日破仍不可用。

```text
祿時 + 時破  → 時破優先
祿時 + 五不遇 → 不得直接升為 preferred
```

#### 3.2.1 「祿時＋五不遇」的唯一實例（2026-08-10 補記）

實作十干日祿表與五不遇十組定局後全枚舉，兩者**恰有一組重疊**：

```text
辛日酉時 = 丁酉
辛祿在酉；辛日的五不遇正是丁酉
```

其餘九干的祿時與五不遇時各自落在不同時辰。

因此 §3.2 不是抽象防呆，而是有唯一具體案例。組裝層的 precedence 測試**必須以辛日酉時為 fixture**，不可假設祿時與五不遇互斥。已由 `tests/hourGateTables.test.ts` 鎖定。

## 4. severity 與救弱邊界

| 規則 | 層 | 修造／大事 | 日常 | 依據強度 |
|---|---|---|---|---|
| 時破 | A hard structural | `reject` | `hard_avoid` | 卷次直引，無「小事可勿論」豁免 |
| 時沖月令 | B major context | `reject` | `warning` | 卷次直引，**明文有小事豁免** |
| 時沖歲君 | B major context | `reject` | `warning` | 同上 |
| 五不遇 | C strong caution | 原則避用 | 慎用 | 非絕對死刑（見下） |
| 時刑 | D minor | `mild_caution` | `mild_caution` | 「次凶，亦輕可」 |
| 日害 | D minor | `mild_caution` | `mild_caution` | 原典未提到與時破同級 |
| 時建／六合／三合／扶日／日祿 | E positive | positive evidence | positive evidence | — |
| 時白紫白到方 | F tie-breaker | 最後細選 | 最後細選 | — |

### 4.1 五不遇不是絕對死刑

《造命宗鏡集》卷六保存楊公用課「曾犯五不遇，但取兩干不雜」；《協紀》卷七亦要求連所臨地支與日柱生扶一併看。

```ts
fiveBuYu.severity = 'strong_caution';   // 不是 hardReject
```

### 4.2 祿時／扶日可救弱日，但不能救 structural veto

接回 Day Gate 的「日干休囚且無比肩／印」：

```ts
hourSupport.canRescueWeakDay = true;   // 只能降低 caution
```

**不能**救破日、時破這類 structural veto。

## 5. 活動限定規則

《協紀辨方書》明確限縮旬中空亡與截路空亡：「忌出行，不忌葬事。」

因此**不可作 universal Hour Gate penalty**，只能：

```ts
activitySpecificRules = { travel: { xunKong: true, jieLuKong: true } };
```

會面、文書、求財、辦事等一般用途不因空亡自動降級。

## 6. 本輪刻意不做的時家神煞

九丑、暗金時、四大吉時、貴登天門、奇門三奇、神藏煞沒、黃黑道十二神、日貴人時、日驛馬時。

理由：《協紀》《造命宗鏡集》自陳時家吉凶神不必盡拘，核心是扶日、祿貴、沖破。加入會使產品變成完整通勝而非「紫白擇吉方向」。

## 7. Gate 不做算術抵消

```text
錯：時破 -5 + 祿時 +3 + 三合 +2 = 0 → 可用
對：時破 → reject；祿時／三合仍顯示，但不解除 reject
```

precedence（研究稿 §37）：

```text
1. hourBreak                        → reject
2. construction && (clashMonth || clashYear) → reject
3. fiveBuYu                         → caution
4. punishment || harm               → 至少 mixed
5. pass + 任一正面支持              → preferred
```

**positive support 不得把 reject 翻回 pass。**

### 7.1 實作補洞：daily 模式的時沖月令／歲君（2026-08-10 補記）

上表只規定 `construction` 的沖月令／歲君為 `reject`，**沒有說 `daily` 落哪一級**。

若照字面實作，`daily` ＋ 沖月令 ＋ 日祿會得到 `preferred`，與 §4 把它列為 `warning`
明顯矛盾。

`src/selection/hourGate.ts` 取**下限**而非新強度：§4 把時沖月令列為 B 層
（major context），而時刑／日害是 D 層（minor）且已對應 `mixed`；B 層不可能比 D 層輕，
故 `daily` 的沖月令／歲君同樣落在 `mixed`。

這是由本文件自身分層推出的地板值，不是自創 severity，但仍屬實作期判斷。
若日後補到原典對 daily 強度的直接說法，應以原典為準。

## 8. V1 程式契約（尚未實作）

```ts
export type HourGateStatus = 'preferred' | 'pass' | 'mixed' | 'caution' | 'reject';
export type SelectionMode = 'daily' | 'construction';
export type HourStemSupport =
  | 'same_element' | 'generates_day' | 'neutral'
  | 'drains_day' | 'controlled_by_day' | 'controls_day';

export interface HourGate {
  hourStem: Stem;
  hourBranch: Branch;
  conflicts: {
    hourBreak: boolean;
    clashMonth: { active: boolean; severity: 'ignore_for_small' | 'warning' | 'reject' };
    clashYear:  { active: boolean; severity: 'ignore_for_small' | 'warning' | 'reject' };
    fiveBuYu: boolean;
    punishment: boolean;
    harm: boolean;
  };
  support: {
    build: boolean;
    liuHe: boolean;
    sanHe: boolean;
    stemSupport: HourStemSupport;
    dayLu: boolean;
    rescuesWeakDay: boolean;
  };
  activitySpecific: { xunKong?: boolean; jieLuKong?: boolean };
  status: HourGateStatus;
  reasons: string[];
}
```

共用純函式（**新寫在 `src/selection/`，不得動 `src/engine/**`**）：

```ts
isClash(a: Branch, b: Branch): boolean;              // 六沖，見整合文件 §1
isSixHarmony(a: Branch, b: Branch): boolean;         // 六合
isSameSanHeGroup(a: Branch, b: Branch): boolean;     // 三合
isPunishment(dayBranch: Branch, hourBranch: Branch): boolean;  // 有向
isSixHarm(a: Branch, b: Branch): boolean;            // 六害
isFiveBuYu(dayStem: Stem, hourGanzhi: Ganzhi): boolean;
isDayLuHour(dayStem: Stem, hourBranch: Branch): boolean;
assessHourStemSupport(dayStem: Stem, hourStem: Stem): HourStemSupport;
```

### 8.1 與現有型別的銜接

現行 `TimeGateAssessment.hourStatus` 為 `'pass' | 'mixed' | 'not_evaluated'`，`rankingUse: 'disabled'`。實作 Hour Gate 時需擴充為 `HourGateStatus`，並**在使用者批准前維持 `rankingUse: 'disabled'`**（接手指南 §5 N3：Hour Gate 初期只作細選／tie-breaker）。

## 9. 排序後果（實作時才生效）

搜尋／擇吉掃未來 12 時辰應改為兩階段：**先按 Hour Gate 分組（preferred / pass / mixed / caution / reject），再在同組內比較紫白方向品質。** 不可所有時辰單純看哪個時白最好。

## 10. 證據狀態

> **2026-08-10 證據升級**：本文件多數條目已核到固定版本原文（《欽定協紀辨方書》四庫本、《御定星厯考原》四庫本），
> 逐條核對結果與仍未核到的項目見 `docs/primary-source-verification-2026-08.md`。
> **規則與 severity 一律未變**，升級的只是證據等級。


`primarySourceVerified = false`（全部條目）。

引用具**卷次級**定位，強於第十輪 Direction Gate：

- 《欽定協紀辨方書》卷三十四〈四柱法〉〈用時法〉
- 《欽定協紀辨方書》卷七〈日建日破日合日害日刑〉〈五不遇時〉
- 《造命宗鏡集》卷六
- 《選擇紀要》〈天干正祿〉
- 《遁甲演義》五不遇條

但仍**未提供版本、頁碼或原頁影像，亦無可核對連結**。依接手指南 §6，未保存固定版本原頁前不得設 `verified=true` / `primarySourceVerified=true`。

### 可封版

- [x] 時＝日之用／臣僕，Hour Gate 屬 refinement，時白不得推翻
- [x] 時破＝日支沖時支；「時破」為原典既有名詞
- [x] 時沖月令／歲君有明文小事豁免，不得全域 hard reject
- [x] 五不遇＝時干剋日干的指定十組，用定局表
- [x] 五不遇不混入時支剋日支
- [x] 五不遇為 strong caution，非絕對死刑
- [x] 時刑＝日支刑時支，有向關係
- [x] 日害列 mild caution
- [x] 時建、六合、三合、時干扶日、十干日祿時
- [x] 正負關係可同時存在，不做分數抵消
- [x] 祿時不凌駕時破／五不遇
- [x] 旬空／截路空亡只作 activity-specific
- [x] 時白排在 Hour Gate 之後

### 4.3 待決：時刑與五不遇在原文中同為「次凶」（2026-08-10 登記）

《協紀》四庫本卷三十四〈用時法〉的分級是：

```text
時破    大凶
時刑    次凶
五不遇  次凶
```

但 §4 的 severity 表把五不遇列 **C 層 strong caution**、時刑列 **D 層 minor**，
`src/selection/hourGate.ts` 的 precedence 因此讓五不遇（`caution`）重於時刑（`mixed`）。

**原文並列為次凶，沒有把五不遇排在時刑之上。**

兩者仍有不對稱之處：五不遇另引三元歌「五不遇兮損光明……切忌之」語氣較重，
但緊接著又說「用五不遇者亦少」並舉楊筠松實際犯之仍用的例。

**本輪不改 precedence**，登記為待決。要調整須使用者決定，並宜先補《協紀》卷七
〈五不遇時〉等條目再判。詳見 `docs/primary-source-verification-2026-08.md` §8.1。

### 不可封版（須先補證據或使用者決策）

- [ ] 「時破 = reject」正式接進 verdict／ranking 的授權
- [ ] `daily` / `construction` 模式由使用者如何選擇（UI 未定義）
- [ ] 日貴人時、日驛馬時
- [ ] 五不遇的「支生扶解除」細則
- [ ] 時家貴登天門、四大吉時、九丑、暗金時
- [ ] 奇門完整擇時、納音、完整神煞庫

## 11. Stop conditions

1. 要把 Hour Gate 結果接進 `verdictFor()` 或 `rankDirections()`。
2. 要把 `hourStatus` 由 `'not_evaluated'` 改為正式狀態而未經使用者批准。
3. 要引入 `daily` / `construction` 模式切換而 UI 規格未定義。
4. 需要改 `src/engine/**`、`src/data/**` 或 `tests/fixtures/chart-snapshot.json`。
5. 要加入納音、十神、旬空以外的神煞庫。
6. 六沖判定要新寫第二套實作（必須共用單一 primitive，見整合文件）。

## 12. 建議實作順序

1. 六沖／六合／六害／三合／刑的**單一共用 primitive** 與純函式測試（見 `docs/gates-v1-integration.md`）。
2. 五不遇十組表、日祿十干表、時干扶日五行關係與測試（含研究稿 §42 全部正反例）。
3. `HourGate` 組裝與 precedence 測試；`rankingUse` 維持 `'disabled'`，附 regression test 證明 `verdictFor()`／`rankDirections()` 輸出不變。
4. UI 最小顯示：主畫面只顯示最重要一條（`✓ 日祿` / `⚠ 五不遇` / `✕ 時破`），詳情頁再展開正負兩欄。**不得使用 platform-dependent glyph**（接手指南 §8），改用既有色彩與文字。
