# Direction Gate V1 authoritative rules

> 狀態：2026-08-10 規則封版，**尚未實作**。本輪只做 read-only 考源封版（接手指南 §5 Phase N0 的產物），不寫 production code、不改 `verdictFor()`、不改 `rankDirections()`。

## 輸入與研究邊界

- 原始研究：`紫白擇吉_DayHourDirection_Gates_V1_Claude實作整合稿.md`
- 原始檔 SHA-256：`181f2cef0d88a55d555836b8efa2f8b2d7a4d0faa7d4eee5a8b503c6a72975ac`
- 檔名與內容不符：檔名寫 `DayHourDirection Gates V1`，實際內容為「第十輪考源 · Direction Gate V1」，**不含 Day Gate 與 Hour Gate**。與 `紫白擇吉_第十輪考源_DirectionGate_歲破月破三煞.md` byte 相同。
- 接手指南 `docs/CLAUDE_NEXT_PHASE_GUIDELINE.md` §1 所引的 `紫白擇吉_下一階段研究規劃_DayGate優先.md`（SHA-256 `e45f1402…`）已不存在；`~/Downloads` 全樹 958 個 md／txt 掃描無任何檔案命中該 checksum。Day Gate V1 已依該檔封版並實作，本輪不回溯。
- 年支、月支、日支一律取既有 canonical `TemporalPillars`；月支為精確節氣月。**不另建第二套四柱或曆法**。
- 不採納音，不擴成完整通勝／造葬神煞庫，不做制煞判定。

## 0. 本輪最重要的架構決策

紫白飛星與方位神煞的空間精度不同，必須雙軌並存：

| 系統 | 空間解析度 | 單位 |
|---|---|---|
| 紫白飛星到方 | 八宮 | 45° |
| 歲破、月破、三煞 | 24 山 | 15° |

因此 **Direction Gate engine 必須先有 24 山幾何，即使主 UI 維持八方**。八方只能表達「本宮含受影響山」，不可把整宮等同犯煞。

## 1. 24 山 mapping（deterministic，可封版）

```text
坎：壬 子 癸        艮：丑 艮 寅
震：甲 卯 乙        巽：辰 巽 巳
離：丙 午 丁        坤：未 坤 申
兌：庚 酉 辛        乾：戌 乾 亥
```

角度以子中心 0° 起、每山 15°、各山中心 ±7.5°；`壬` 為 345°，跨 0° 邊界必須另行處理。角度僅供未來 compass 使用，V1 不做羅盤，也不區分磁北／真北。

## 2. 歲破 truth table（deterministic，可封版）

歲破 = 太歲支的六沖對山。

| 年支 | 子 | 丑 | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 歲破山 | 午 | 未 | 申 | 酉 | 戌 | 亥 | 子 | 丑 | 寅 | 卯 | 辰 | 巳 |

命中為**單一 15° 山**，非整宮。例：子年歲破午，午為離宮中山，丙、丁兩山不命中。

## 3. 月破方 truth table（deterministic，可封版）

月破方 = 節氣月建的六沖對山。表與歲破同構（月建寅→申，卯→酉，…，丑→未）。

### 3.1 必須與 Day Gate 的「破日」型別分離

兩者同源於六沖，但**是兩件事，不可共用欄位、不可重複扣分**：

| 概念 | 層 | 定義 | 建議欄位 |
|---|---|---|---|
| 破日 | Time Gate | 月支沖**日支** | `dayMonthBreak` |
| 月破方 | Direction Gate | 月支的對沖**山** | `monthBreakMountain` |

兩者都不得命名為 `yuePo`。

## 4. 三煞（deterministic，可封版）

三煞含劫煞、災煞、歲煞，落在三合局對面的三個連續 15° 山：

| 三合局 | 三煞方位 | 三煞山 |
|---|---|---|
| 申子辰 | 南 | 巳 午 未 |
| 亥卯未 | 西 | 申 酉 戌 |
| 寅午戌 | 北 | 亥 子 丑 |
| 巳酉丑 | 東 | 寅 卯 辰 |

同一張表以年支、月支、日支分別查表即得年／月／日三煞。

### 4.1 三煞橫跨三個八宮

例：寅午戌年三煞亥子丑 → 亥屬乾宮、子屬坎宮、丑屬艮宮。古書稱「三煞在北方」是「北方一帶三山」的四正概念，**不可在八宮 UI 理解成只有坎宮受影響**。

### 4.2 不建立時三煞

核心文本表述為「年月日之凶神」，未見同等傳統定義的時三煞。**不得為四柱對稱自造 `hourSanSha`。**

## 5. coverage：partial hit 是必要概念

一個 45° 宮的三山中可能只有一山受影響：

```ts
type DirectionHitCoverage = 'none' | 'partial' | 'full';
```

`matched.length === 0 → none`；`=== 3 → full`；其餘 `partial`。

例：子年三煞巳午未 → 巽宮（巳）、離宮（午）、坤宮（未）三宮**各為 partial**，不得標成「三煞全宮」。

## 6. severity：本輪不啟用，全部 reference_only

研究稿對修造／日常兩種用途給出如下建議層級：

| 規則 | construction／修造 | daily／日常 | burial／葬事 |
|---|---|---|---|
| 歲破 | `hard_avoid` | `context_warning` | — |
| 月破方 | `strong_avoid` | `context_warning` | — |
| 年三煞 | `strong_avoid` | `context_reference` | — |
| 月三煞 | `strong_warning` | `context_reference` | — |
| 日三煞 | `warning` | `reference_only` | `active` |

**但本專案 V1 一律不啟用上述任何強度。** 理由見 §9 證據狀態：這些強度目前只有轉述語句，沒有固定版本、卷次、頁碼或原頁影像。接手指南 §12 明列「權威來源不足，卻要決定 hard veto、ranking 權重或固定分數」必須停下來問使用者。

因此 V1 程式政策：

```ts
rankingUse: 'disabled'      // 不參與八方排序
gateUse:    'reference_only' // 不參與 verdict，只顯示
```

`verdictFor()` 與 `rankDirections()` **不得讀取任何 Direction Gate 欄位**；實作時必須加 regression test 證明未讀。

### 6.1 兩個必須保留的防錯

1. **太歲方 ≠ 歲破方。** 傳統對太歲方是「宜合不宜沖」、可修可補，不是一律凶。**不得新增 `if (direction === taiSuiDirection) reject()`。**
2. **三煞可制。** 「坐三煞不可制；三煞在方／在向可制但不易制」，《通書》另有「三煞止忌修方」。V1 不做制化判定，但顯示文字只能說「V1 不自動判定制化成功」，**不得聲稱「三煞永不可制」**。

## 7. precedence：不做線性扣分

overlap 必須允許（同一山可同時歲破＋月破＋年三煞），資料存成陣列而非單一 `warning?: string`。

但**不得**做 `歲破 -5 + 月破 -3 + 三煞 -4 = -12` 這類數值相抵。改用優先序，其餘 hit 照常並列顯示：

```text
修造：歲破 exact → 三煞 exact → 月破 exact → 大月建／月暗建 → 年月白中殺 → 紫白 quality（Gate 後才排序）
日常：以上全部僅作 contextual warning；主排序仍是 Day Gate → Hour Gate → 紫白到方 → 年月日時品質
```

## 8. V1 程式契約（尚未實作，命名須對齊 `src/selection/types.ts` 既有慣例）

```ts
export type Mountain24 =
  | '壬' | '子' | '癸' | '丑' | '艮' | '寅'
  | '甲' | '卯' | '乙' | '辰' | '巽' | '巳'
  | '丙' | '午' | '丁' | '未' | '坤' | '申'
  | '庚' | '酉' | '辛' | '戌' | '乾' | '亥';

export type SpatialResolution = 'palace8' | 'mountain24' | 'bearing';
export type DirectionHitCoverage = 'none' | 'partial' | 'full';

export interface SpatialTarget {
  palace: DirectionPalaceKey;   // V1 required
  mountain?: Mountain24;        // optional
  bearing?: number;             // optional，未來 compass
}

export interface MountainHit {
  rule: 'sui_po' | 'month_break' | 'year_san_sha' | 'month_san_sha' | 'day_san_sha';
  affectedMountains: Mountain24[];
  matched: Mountain24[];
  coverage: DirectionHitCoverage;
  evidenceLevel: TemporalEvidenceLevel;
  rankingUse: 'disabled';
  gateUse: 'reference_only';
}

export interface DirectionGateAssessment {
  palace: DirectionPalaceKey;
  mountains: Mountain24[];       // 本宮三山
  precision: SpatialResolution;  // V1 恆為 'palace8'
  hits: MountainHit[];
  coverage: DirectionHitCoverage;
  status: 'not_evaluated';       // V1 不產生 pass/mixed/caution/avoid
  note: string;                  // 實作收窄為穩定代碼，見下方
}
```

共用函式（**新寫在 `src/selection/`，不得動 `src/engine/**`**）：

```ts
oppositeBranch(branch: Branch): Branch;                    // 六沖，歲破與月破共用
getSanShaMountains(branch: Branch): Mountain24[];          // 三煞四組共用
getMountainHitsForPalace(palace, affected): { matched, coverage };
```

`status` 在證據補齊前恆為 `'not_evaluated'`，與 `TimeGateAssessment.hourStatus` 現行慣例一致。

### 8.1 實作偏離：`note` 為穩定代碼（2026-08-10 補記）

`src/selection/directionGate.ts` 把 `note` 收窄為 `DirectionGateNote = 'v1_reference_only_not_evaluated'`，不是中文句子。理由：

1. 接手指南 §7：「計算層回傳穩定、可測試的結構資料；UI 才翻譯成自然中文。」
2. 在 `src/**` 的字串常量新增中文會擴大自帶字體 subset，由 `tests/v21Assets.test.ts` 鎖定；本輪非 UI scope，不應觸發字體重建。

UI 層負責把此代碼翻成自然中文。

## 9. 證據狀態

`primarySourceVerified = false`（全部條目）。

研究稿引用《協紀辨方書》〈選擇要論〉〈三煞伏兵大禍〉、《造命宗鏡集》、《選擇紀要》、《通書》，但：

- **未提供卷次、頁碼、版本或原頁影像**，亦未附可核對連結（對比 `day-gate-v1-authoritative-rules.md` 已有 ctext 逐卷連結）。
- 「歲破最凶，例無制法」、「三煞亦大凶，不可輕犯」、「三煞止忌修方」等關鍵定強度語句目前僅為轉述。

依接手指南 §6，未保存固定版本原頁前不得設 `verified=true` / `primarySourceVerified=true`。

### 可封版 vs 不可封版

**可封版（曆法事實，四組公式古籍互相吻合，且可 deterministic 計算）**

- [x] 歲破 = 太歲支對沖山
- [x] 月破 = 節氣月建對沖山
- [x] 三煞四組公式（年／月／日共用同表）
- [x] 24 山 mapping 與角度
- [x] 三煞為三個連續 15° 山、橫跨三個八宮
- [x] 破日與月破方型別分離
- [x] 不自造時三煞
- [x] partial hit / coverage 模型
- [x] overlap 允許並列、不做數值相抵
- [x] 太歲方不等於凶方

**不可封版（強度／適用性，須先補證據）**

- [ ] 歲破 `hard_avoid`、月破 `strong_avoid`、三煞 `strong_avoid` 的固定版本原文
- [ ] 月三煞 severity 是否可低於年三煞
- [ ] 日三煞在非葬事修造中的實際權重
- [ ] 歲破／月破在日常出行是否有直接古例
- [ ] 三煞制法（暫緩，因不採納音）
- [ ] 劫煞、災煞、歲煞三山各自細分名稱
- [ ] 24 山羅盤／磁北／真北
- [ ] 太歲方、三德方等正面 Direction Gate
- [ ] 24 山刑宮／害宮、方位空亡

## 10. Stop conditions

實作前或實作中遇到下列情形，必須停止並詢問使用者：

1. 要把任何 Direction Gate 結果接進 `verdictFor()` 或 `rankDirections()`。
2. 要把 §6 表中任何 severity 由 `reference_only` 升級為 active／veto。
3. 要引入「修造 / 日常 / 葬事」模式切換而規格未定義使用者如何選擇。
4. 需要改 `src/engine/**`、`src/data/**` 或 `tests/fixtures/chart-snapshot.json`。
5. 要加入納音、十神、旬空、完整神煞庫或 24 山 UI 盤。
6. 研究稿與既有 repo 文件（尤其 Day Gate 的破日）出現定義衝突。

## 11. 建議實作順序（下一輪）

1. `Mountain24` 型別、24 山 mapping、`oppositeBranch()`、`getSanShaMountains()` 與純函式測試。
2. `getMountainHitsForPalace()` 與 coverage 測試（含 none／partial／full 與三煞跨三宮案例）。
3. `DirectionGateAssessment` 組裝，`status` 恆 `'not_evaluated'`，附 regression test 證明 `verdictFor()`／`rankDirections()` 輸出不變。
4. UI 最後才做，且只在 Direction Detail 深層顯示「本宮 3 山中，X 山受影響」，主九宮不得 overclaim 為「南方大凶」。
