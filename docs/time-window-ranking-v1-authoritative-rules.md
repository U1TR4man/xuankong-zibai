# 最佳時窗 Ranking V1 authoritative rules

> 狀態：2026-08-11 規格封版；同日完成計算層 `src/selection/timeWindowRanking.ts` 與尋星結果 UI。`verdictFor()`、`rankDirections()` 與三個 Gate 的 `rankingUse` 一律未改。
>
> 這是本專案第一個**會排序**的判定層。前四份規則文件（Day / Hour / Direction Gate / Direction Positive）全部以 `rankingUse: 'disabled'` 收尾；本文件是使用者於 2026-08-11 明確授權後才開的。授權範圍**僅限時間軸**，方向軸的 `rankingUse` 一律不變。

## 輸入與研究邊界

- 承接：`day-gate-v1`、`hour-gate-v1`、`gates-v1-integration`、`primary-source-verification-2026-08`。
- **消費既有 `SearchMatch[]`，不重算飛星。** 這是 `docs/HANDOFF.md`「Reserved future capability — 最佳時窗」明文保留的 extension point：「未來 `RankingEngine` 應消費既有 `SearchMatch[]`，而不是重新計算年月日時刻飛星」「後續 refactor 不得刪除此 extension point」。
- 四柱一律取 canonical `buildTemporalPillars()`，**不另建第二套四柱**。
- 不採納音、不建完整神煞庫、不做數值抵消。
- 本文件不新增任何古籍主張。所有判定材料都來自已封版的 Day Gate 與 Hour Gate；本文件只規定**如何排序**。

## 0. 核心定位

排的是**時間**，不是方向。

```ts
axis = 'temporal';        // 不是 'spatial'
```

這不是保守，是算術：**Day Gate 與 Hour Gate 不依賴宮位**。同一時刻，八個方向拿到的日課與時課完全相同。把它們加進 `rankDirections()` 等於對八方同加一個常數，排序輸出一格不會變。因此 Gate 的正確去處是時間軸，不是方位軸。

反過來，本層**不得**排序方向。一個時窗的輸出是「這個時段適不適合」，不是「這個時段該朝哪」。

## 1. 唯一的排序依據：時者日之用也

《欽定協紀辨方書》四庫本卷三十四〈用時法〉：

> 「時者，日之用也。」

《造命宗鏡集》傳文作「時者，日之臣僕也」（見 `hour-gate-v1` §0）。同書〈用日法〉列於〈用時法〉之前，〈四柱法〉以日為主。

因此排序的主從關係**有原文依據，不是實作偏好**：

```text
日為體，時為用
→ 先比日課，再比時課
```

**但 structural veto 不受此序約束。** 時破是《協紀》卷三十四明列的「大凶」，不能因為當日日課旺相就被排到前面。veto 是入場資格，不是比較項。

## 2. 排序契約：lexicographic 分層，不是分數

```ts
rankingShape = 'lexicographic_tiers';   // 不是 'weighted_sum'
```

**禁止**：

- 任何 0–100 分、星級、百分比。專案既有規則：「方向狀態屬可解釋的工具分級，不顯示虛構的 0–100 分或星級」，時間軸同樣適用。
- 把 Day Gate 與 Hour Gate 的等級換算成數字再相加。這會直接違反 `hour-gate-v1` §7「Gate 不做算術抵消」——兩個 Gate 是不同柱的不同 fact，並列保存，不合併。

**排序鍵，由高到低：**

| # | 鍵 | 值域 | 依據 |
|---|---|---|---|
| 0 | `admissible` | `true` / `false` | Hour Gate `reject` 即不可用。時破為卷三十四「大凶」；construction 模式另含沖月令／歲君 |
| 1 | `dayStatus` | `pass` > `mixed` > `caution` | 日為體。Day Gate V1 的旺相／休／囚死三分 |
| 2 | `hourStatus` | `preferred` > `pass` > `mixed` > `caution` | 時為用。`reject` 已在鍵 0 濾除 |
| 3 | `startDateTime` | 由早到晚 | **deterministic tie-break，不是判定**。見 §3 |

只有這四個鍵。任何第五個鍵都需要新的授權與新的證據。

### 2.1 為什麼日課在時課之前

這個次序有一個看似違直覺的後果，必須明講：

> 囚日的 `preferred` 時辰，排在旺日的 `caution` 時辰**之後**。

這正是「時者日之用也」的意思——先擇日，再於日內擇時。若把 `hourStatus` 提到前面，等於承認時辰可以脫離日柱獨立成吉，而 `hour-gate-v1` §0 已封版否定了這一點（`hourRole = 'support_and_refinement'`，不是 `'equal_to_day'`）。

## 3. 平手時用時間，不用發明第五個判準

同一天內多個時段拿到相同的 `(dayStatus, hourStatus)` 是常態。此時**只按時間由早到晚**。

不得用來打破平手的東西（每一項都有各自的封版理由）：

| 不可用 | 理由 |
|---|---|
| 紫白雙星 81 組 | `rankingUse: 'reference_only'`、`verified=false`。且尚無古法直接證據說四層任取兩層形成六 pair 可用於排序 |
| 六德、三德方、月金匱 | Direction Positive V1 全部 `rankingUse: 'disabled'`；月金匱另為 `source_tension` |
| 白中殺 9×6 矩陣 | **方位軸**，不是時間軸。且 `completeness: 'example_set_not_exhaustive'` |
| 歲破、月破方、三煞 | 同上，方位軸，且 `gateUse: 'reference_only'` |
| 五不遇的「支相生解除」 | 原文有理論、無 deterministic 判準（見 `primary-source-verification-2026-08` §6.1.2.1） |
| 旬空、截路空亡 | Hour Gate 已定為 activity-specific，不作 universal penalty |

「時間由早到晚」不是判定，是**讓輸出可重現**的手段。UI 必須明示這一點，不得讓使用者以為越早越吉。

## 4. 方位資料不進排序，但必須並列顯示

`SearchMatch` 帶 `palace`，因此該宮的 Direction Gate（歲破／月破方／三煞）與 Direction Positive（六德／三德方）**算得出來**。V1 一律**只顯示、不排序**。

理由不是懶：

- 三個方位規則的 `gateUse` 全為 `'reference_only'`，解除屬各自文件的 stop condition。
- 方位是 24 山精度，時窗是時間精度，兩者混進同一個排序鍵等於把 15° 的資料當成時間訊號。
- **正面 evidence 不得翻轉 structural veto**（`direction-positive-v1` 既有邊界）；若讓六德參與時窗排序，等於開了一條抵銷路徑。

## 5. 程式契約（已實作）

```ts
export type TimeWindowAdmissibility = 'admissible' | 'rejected';

export interface RankedTimeWindow {
  /** 直接引用來源 match，不複製飛星資料，也不重算。 */
  match: SearchMatch;
  /** canonical 四柱，由 buildTemporalPillars(match.startDateTime) 取得。 */
  pillars: TemporalPillars;
  admissibility: TimeWindowAdmissibility;
  /** 唯一的排除理由來源；admissible 時為空陣列。 */
  rejectedBy: readonly TimeWindowRejection[];
  dayStatus: DayGateStatus;
  hourStatus: HourGateStatus;
  /** 1 起算，同 (dayStatus, hourStatus) 的時窗共用同一個 tier。 */
  tier: number;
  /** 本層專用，**不得**命名為 rankingUse。見 §6。 */
  timeRankingUse: 'active';
}

export type TimeWindowRejection = 'hour_gate_reject';

export interface TimeWindowRankingOptions {
  mode?: SelectionMode;          // 沿用 settings.selectionMode
  dayChangeMode?: DayChangeMode;
  yearBoundary?: YearBoundary;
  /** 預設 false：被排除的時窗仍回傳，只是排在最後並標明原因。 */
  dropRejected?: boolean;
}

export function rankTimeWindows(
  matches: readonly SearchMatch[],
  options?: TimeWindowRankingOptions,
): readonly RankedTimeWindow[];
```

放 `src/selection/timeWindowRanking.ts`。`src/selection/searchPairOccurrences.ts` 已有 selection → search 的相依，方向一致，不另開目錄。

**純函式**：不讀 DOM、localStorage 或 URL；`mode` 由呼叫端從 settings 取好再傳入。

### 5.1 日精度時窗的 hourStatus

`SearchMatch.precision === 'day'` 沒有唯一時辰（同 `SearchResults` 的干支處理）。此時：

```ts
hourStatus = 'not_applicable';   // 不是 'pass'，也不是挑一個時辰代表
```

並且**鍵 2 跳過**，只用 `dayStatus` 與時間排序。把日精度硬塞一個時辰是捏造，把它當 `pass` 則會讓它無故排在真正 `mixed` 的時辰之前。

`TimeWindowRankingOptions` 因此需要 `HourGateStatus | 'not_applicable'` 的聯集型別，不得重用 `not_evaluated`——後者已被 `TimeGateAssessment.hourStatus` 佔用，語義是「本版本尚未評估」，與「此精度無此概念」不同。

**2026-08-11 實作期補洞**：上面「鍵 2 跳過」這條，只有在**整批同精度**時才是良定義的。
若把日精度與時精度混在同一批，比較會失去遞移性——設 A 為日精度、B 為 `preferred`、C 為
`caution`，則 A 與 B 平手、A 與 C 平手，但 B 勝 C，排序結果會隨輸入次序而變。

`searchStars()` 的 `precision` 每次查詢只算一次，同一批 `SearchMatch` 必然同精度，
因此混精度代表呼叫端把不同查詢的結果併在一起，屬程式錯誤。`rankTimeWindows()`
**擲出 `RangeError`**，而不是產出一個沒有意義的順序。

## 6. 兩個軸永不共用欄位名

這是本文件最重要的架構約束。

| 軸 | 欄位 | V1 值 |
|---|---|---|
| 方位 | `rankingUse` | `'disabled'`（三個 Gate 一律） |
| 時間 | `timeRankingUse` | `'active'` |

`rankingUse` 在本層是**禁用名**，地位同 `yuePo`（見 `gates-v1-integration` §1）。理由：日後若有人看到 `rankingUse: 'active'` 出現在任何地方，必須能立刻判定那是錯的，而不必先追它屬於哪個軸。

同理，`RankedTimeWindow` **不得**含 `verdict` 欄位——那是方向層的字。

## 7. Regression 要求（實作時必須同時交付）

1. `verdictFor()` 與 `rankDirections()` 的輸出，在計算時窗排序前後完全相同。
2. `DirectionEvaluation` 序列化後不含任何本層欄位（`tier`、`timeRankingUse`、`admissibility`、`rejectedBy`）。
3. `RankedTimeWindow` 序列化後不含 `rankingUse`、`verdict`。
4. 三個方位 Gate 的 `rankingUse` 仍為 `'disabled'`；`TimeGateAssessment.hourStatus` 仍為 `'not_evaluated'`。
5. 排序穩定：同一輸入兩次呼叫結果逐項相同；平手時按 `startDateTime` 遞增。
6. `mode: 'construction'` 只改變 `admissibility` 與 `hourStatus`，不改變 `dayStatus`。

## 8. 證據狀態

```ts
primarySourceVerified: false;
```

排序**主從關係**（日為體、時為用）有卷三十四〈用時法〉原文；但「用 lexicographic 分層排序候選時段」這個工程形式，古籍沒有、也不會有。本層是**工具分級**，UI 必須照既有規矩明示，不得冒充古法原有等級。

`admissible = false` 的唯一來源是 Hour Gate `reject`，其依據（時破為大凶）已於 `primary-source-verification-2026-08` §6 核到卷三十四原文。

## 9. 刻意不做

- **不做「推薦一個最佳時段」**。輸出是排序後的候選清單，選擇權在使用者。
- **不做跨日比較的加權**。範圍內每個 match 各自獨立評級，不因為「這一天整體較好」而調整個別時窗。
- **不做個人化**（本命、行年、生肖）。需要另一套四柱與另一份考源。
- **不做方向推薦**。時窗排序不回答「該朝哪個方向」。

## 10. Stop conditions

以下每一項都需要**新的使用者授權**，不得由實作者自行開啟：

- [ ] 把 `timeRankingUse` 的結果回寫進 `TimeGateAssessment.hourStatus`
- [ ] 讓任何方位資料（白中殺、歲破三煞、六德、雙星）進入排序鍵
- [ ] 新增第五個排序鍵
- [ ] 改變鍵 1 與鍵 2 的先後（等於推翻「時者日之用也」）
- [ ] 輸出任何數值分數或星級
- [ ] 讓本層影響 `verdictFor()` 或 `rankDirections()`

## 11. 建議實作順序

1. ~~`rankTimeWindows()` 純函式 ＋ 單元測試（含 §7 的六項 regression）~~ —— **2026-08-11 完成**，
   `src/selection/timeWindowRanking.ts`、`tests/timeWindowRanking.test.ts`（17 個測試）。
2. ~~搜尋結果 UI 加入排序切換，預設維持時間順~~ —— **2026-08-11 完成**。
   控制為「依時間 / 依日課時課」，**預設仍是依時間**。
3. ~~顯示每個時窗的日課／時課與被排除原因；平手按時間的事實必須明示~~ —— **2026-08-11 完成**。
4. ~~四寬度 QA ＋ 字體 subset 重建~~ —— **2026-08-11 完成**，四寬度零溢出，字體未新增字元。

### 11.1 實作期的兩個 UI 決策

**評級只在「依日課時課」時顯示。** 依時間排序時列表沒有用到這個判定，若照樣顯示，
使用者會把清單讀成「已按吉凶排好」——那正是本文件 §3 要避免的誤導。
（若日後決定在依時間模式也顯示，屬另一個 UX 決策。）

**依日課時課時改用 tier 分組，取代日期分組。** 日期分組在這個次序下會被打散成
無意義的碎片；tier 正好是「可用性／日課／時課」三者相同的一群，即使用者要比較的單位。

排序方式**不進 URL**：URL 目前只帶查詢條件，排序是呈現偏好，不是查詢的一部分。
