# Day / Hour / Direction Gate V1 整合契約

> 狀態：2026-08-10 封版，**尚未實作**。本檔是三個 Gate 之間的介面契約與防重複計算規則，不重述各 Gate 內部規則。
>
> 各 Gate 規則文件：
> - `docs/day-gate-v1-authoritative-rules.md`（第八輪，**已實作**）
> - `docs/hour-gate-v1-authoritative-rules.md`（第九輪，未實作）
> - `docs/direction-gate-v1-authoritative-rules.md`（第十輪，未實作）

## 0. 為什麼需要這份文件

接手指南 §5 Phase N0 問題 3：「同一沖象若同時被稱為月破、日時沖，如何避免重複計算？」

三輪研究合起來，**同一個「六沖」關係被六個不同名目消費**。若各自實作，必然出現定義分歧與重複扣分。

## 1. 六沖：單一 primitive，六個具名消費者

六沖關係只有一組：**子午、丑未、寅申、卯酉、辰戌、巳亥**。

```ts
// 全專案唯一實作，放 src/selection/branchRelations.ts
export function isClash(a: Branch, b: Branch): boolean;
```

**六個消費者，各有獨立名稱與所屬層，不得互相取代、不得共用欄位名：**

| # | 名目 | 所屬 Gate | 判定 | 建議欄位 |
|---|---|---|---|---|
| 1 | 破日 | Time / Day | 月支 沖 日支 | `dayMonthBreak` |
| 2 | 時破 | Time / Hour | 日支 沖 時支 | `hourBreak` |
| 3 | 時沖月令 | Time / Hour | 時支 沖 月支 | `clashMonth` |
| 4 | 時沖歲君 | Time / Hour | 時支 沖 年支 | `clashYear` |
| 5 | 歲破方 | Direction | 年支 的對沖**山** | `suiPoMountain` |
| 6 | 月破方 | Direction | 月支 的對沖**山** | `monthBreakMountain` |

**禁止使用 `yuePo` 這個名字**，因為它在不同輪次分別指過 #1 與 #6。

### 1.1 時間層 vs 方位層的本質差異

- #1–#4 比較的是**兩個柱的地支**，結果是「這個時段能不能用」。
- #5–#6 由單一柱的地支導出一個**24 山方位**，結果是「哪個 15° 山受影響」，與哪一天／哪一時辰無關。

因此 #6 月破方在整個節氣月內恆定；#1 破日只在特定日成立。**兩者同源但不同語義，不可合併。**

## 2. 不重複計算原則

1. **同一底層 clash fact 只登記一次**，語義標籤（破日／時破／月破方…）是對同一 fact 的不同命名，不得各自扣一次分。
2. **Gate 之間不做數值相加**。三個 Gate 各自輸出離散 status，不換算成分數再相加。
3. **overlap 允許並列顯示**。例：某山同時歲破＋月破＋年三煞，三條 hit 都要保留在陣列中，但只按 precedence 決定最終 status。
4. 若未來加入四柱其他 clash 組合（年－日、月－時），**必須先在本檔登記名目與所屬層**，否則不得實作。

## 3. 三個 Gate 的執行順序

```text
DAY GATE          這一天本身能不能用
    ↓
HOUR GATE         這個時辰值不值得進入候選
    ↓
DIRECTION GATE    哪個方位受神煞影響
    ↓
PURPLE-WHITE      年／月／日／時紫白到方品質（僅在前三關合格後排序）
```

三條不可違反的架構原則：

- **時白吉不得推翻 Hour Gate 不合格的時辰。**
- **紫白到方品質只在 Gate 之後排序，不能反向解除 Gate。**
- **Direction Gate 是方位層，不得把 Day Gate 狀態複製成八個方向的 verdict。**

## 4. status 詞彙對齊

| Gate | 型別 | 值域 | 現況 |
|---|---|---|---|
| Day | `DayGateStatus` | `pass` / `mixed` / `caution` | **已實作** |
| Hour | `HourGateStatus` | `preferred` / `pass` / `mixed` / `caution` / `reject` | 未實作，現為 `'not_evaluated'` |
| Direction | — | V1 恆 `'not_evaluated'` | 未實作 |

注意 Day Gate **沒有** `reject`（囚死只到 `caution`），Hour Gate **有** `reject`（時破）。這是刻意的：Day Gate 的弱可由時辰救，Hour Gate 的時破是 structural veto，不可救。

## 5. daily / construction 模式

Hour Gate 與 Direction Gate 的 severity 都依用途分歧：

| 規則 | daily | construction |
|---|---|---|
| 時沖月令／歲君 | warning | reject |
| 歲破方 | context_warning | hard_avoid |
| 月破方 | context_warning | strong_avoid |
| 三煞 | context_reference | strong_avoid |

**但 V1 尚未定義使用者如何選擇模式。** 在 UI 規格確定前：

- 一律以 `daily` 為預設語義；
- 所有 construction 級 severity 只作文字說明，不進 verdict；
- 不得因為 construction 模式未實作就把 daily 也升級成 hard gate。

## 6. V1 統一的 ranking 政策

```ts
rankingUse: 'disabled'      // 三個 Gate 一律不參與八方排序
```

`verdictFor()` 與 `rankDirections()` **不得讀取任何 Gate 欄位**。實作每個 Gate 時都必須附 regression test 證明兩者輸出不變（接手指南 §7）。

解除此限制屬使用者決策，見各 Gate 文件的 Stop conditions。

**2026-08-11 更新**：使用者已授權 Gate 參與**時間軸**排序，見
`docs/time-window-ranking-v1-authoritative-rules.md`。**方位軸不在授權範圍內**：
上面那行 `rankingUse: 'disabled'` 與 `verdictFor()`／`rankDirections()` 不得讀取 Gate 欄位
的規定，一字未改。

兩個軸**不得共用欄位名**：時間層用 `timeRankingUse`，`rankingUse` 在時間層是禁用名，
地位同 §1 的 `yuePo`。理由是日後看到 `rankingUse: 'active'` 必須能立刻判定為錯，
而不必先追它屬於哪個軸。

## 7. 證據狀態總表

| 輪次 | Gate | 卷次級引用 | 頁碼／版本／原頁 | `primarySourceVerified` |
|---|---|---|---|---|
| 第八輪 | Day | 有，且附 ctext 連結 | 《造命宗鏡集》缺 | `false` |
| 第九輪 | Hour | 有（協紀卷七、卷三十四等） | 全缺 | `false` |
| 第十輪 | Direction | **無**（僅篇名） | 全缺 | `false` |

三輪皆未達可設 `verified=true` 的標準。Direction Gate 證據最弱，其 severity 表因此全部保留 `reference_only`。

## 8. 共用 primitive 清單（實作第一步）

全部放 `src/selection/branchRelations.ts`，純函式、不讀 DOM／localStorage／URL：

```ts
isClash(a, b)                       // 六沖：子午 丑未 寅申 卯酉 辰戌 巳亥
oppositeBranch(branch)              // 六沖的對支，歲破／月破方共用
isSixHarmony(a, b)                  // 六合：子丑 寅亥 卯戌 辰酉 巳申 午未
isSixHarm(a, b)                     // 六害：子未 丑午 寅巳 卯辰 申亥 酉戌
isSameSanHeGroup(a, b)              // 三合：申子辰 寅午戌 亥卯未 巳酉丑
isPunishment(dayBranch, hourBranch) // 刑，有向
```

`isClash(a, b)` 與 `oppositeBranch(b)` 必須互相一致：`isClash(a, b) === (oppositeBranch(a) === b)`，並以測試鎖定。

三合表同時被 Hour Gate（日時三合）與 Direction Gate（三煞四組）使用，**必須共用同一份資料**：三煞山即三合局對面三支。

## 9. 尚未整合的部分

- 第九輪 §45 建議的 Direction Gate 研究次序中，大月建與年／月白中殺已在第五至七輪完成，本整合契約未重述。
- 三個 Gate 的合併輸出型別（例如 `SelectionGates`）尚未定義；各 Gate 實作完成後再視需要新增，不先預造。
- 兩階段排序（先 Hour Gate 分組、組內再比紫白）**已於 2026-08-11 授權，但形式與此處設想不同**：
  時窗排序的鍵是「日課 → 時課 → 時間」，**紫白不進排序鍵**（雙星仍 `reference_only`）。
  見最佳時窗規則文件 §2、§3。
