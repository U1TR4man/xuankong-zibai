# 紫白擇吉第五輪考源 implementation record

本文件記錄 `紫白擇吉_第五輪考源_暗建分層與有氣模型定案.md` 的保守落地方式，並取代第四輪「一般暗建只套月層」及「五黃四隅是唯一答案」的暫定實作。

> 歷史狀態：第六輪已用直接考源完成大月建合流並升級日白／日支政策；現行規則請以 `docs/purple-white-sixth-round-dayuejian-daywhite.md` 為準。本文件的四層暗建、日時白中殺 reference-only、五黃異文分層及時支參考邊界仍有效。

## 原始研究規格

- 檔名：`紫白擇吉_第五輪考源_暗建分層與有氣模型定案.md`
- 行數：1,471
- SHA-256：`cd0b8625999406cf4f474ab9d178a0c23726bbd700ad0cbc6512bce035625018`
- code checkpoint：`b8980ae`
- 研究文件仍未附本專案可重跑的固定版本頁碼、完整逐字引文與原頁影像；方法層 `primarySourceVerified` 繼續為 `false`。

## 一般九宮暗建與大月建分開

`DirectionSnapshot` 現在同時保存年、月、日、時四層入中星。一般九宮暗建按每層的入中星獲得禁方，再由白中殺層級政策決定用途：

| 層級 | 一般九宮暗建 |
|---|---|
| 年 | 正式參與方向判定 |
| 月 | 正式參與方向判定 |
| 日 | 類比參考，不因此降級 |
| 時 | 類比參考，不因此降級 |

預設 `generic_jiugong` 採九星本位，五黃為中宮。`san_yuan_bao_hai` 保存五黃為乾、坤、艮、巽四隅的異文；`jiyao_native_and_center` 只保存文件直接列出的 1、6、8、9 本宮加中宮讀法。三套不會疊加成一條「超級規則」，UI 在有不同讀法時顯示「⚑ 此條有傳本異法」。

`computeDaYueJian()` 另立月干支飛宮介面，不接受月紫白入中星作為結果。由於多年逐月比對尚未完成，現階段固定回傳 `not_evaluated` / `disabled`，不會虛構大月建方，亦不會與一般暗建重複扣減。

## 白中殺與支序有氣層級

`WHITE_KILLER_LAYER_POLICY` 固定為：

| 層級 | 證據 | 判定用途 |
|---|---:|---|
| 年 | A | `active` |
| 月 | A | `active` |
| 日 | B | `reference_only` |
| 時 | B | `reference_only` |

穿心、交劍、鬥牛與現有 classical 受剋定局仍然計算四層，但 verdict 與主盤警示只消費年、月 `activeHits`。日、時命中只在詳情顯示「白中殺類比：研究參考」。一般宮星五行關係繼續是獨立 channel，不冒名為古典白中殺。

`BRANCH_QI_POLICY` 固定為：

| 層級 | 證據 | 判定用途 |
|---|---:|---|
| 年 | A | `active` |
| 月 | A | `active` |
| 日 | B | `warning_only` |
| 時 | C | `reference_only` |

方向詳情將時層寫成「支序有氣（類推參考）」，不與月層等權。`ELEMENT_SUPPORT_QI_POLICY` 另存為 `disabled`，不以地支五行代替 period element，也不以同一月納音套用全盤飛星。

## 月令、日主 Gate 與月納音邊界

- layer role 改為年 `background_or_large_scale`、月 `seasonal_command`、日 `day_gate`、時 `fine_tuning`，沒有百分比或固定數值權重。
- `timeGate.dayStatus` 及 `hourStatus` 現階段是 `not_evaluated`；未建立完整通書日課前，工具不宣稱日期本身已通過古法篩選。
- `MonthlyCenterStarState` 保留月干支、月納音及轉化五行介面；後兩者現為 `null` / `research` / `disabled`，不進 verdict 或 ranking。
- co-arrival 仍保留單一紫白可成立，不恢復 `>=2` 硬門檻。雙星 81 組仍為 `rankingWeight=0`。

## UI 與驗收

- 主盤只顯示年、月正式白中殺，一般暗建標明層級，例如「⚠ 年九宮暗建」。
- Direction Detail 分開正式年月條件與日時類比；研究說明以自然中文保留大月建、五黃異文、日主 Gate 及月納音邊界，不暴露 internal tokens。
- TypeScript：通過。
- Vitest：25 files、191 tests 全數通過；1,200 點 engine snapshot fixture 未修改。
- production build：通過；PWA precache 11 entries／451.87 KiB，包含離線 WOFF2。
- single-file build：通過；`玄空紫白.html` 534,970 bytes，字體只內嵌一份 data URI。
- 離線字體：910 個 UI 字元／911 glyphs，242,356 bytes，SHA-256 `08a3edaf5ed88b1747a7fd130c30b7852eab76a7cac9ebf20f3b5ea9c7735fd8`；public 與 production 產物雜湊一致。
- production Browser：320／375／390／430px 頁面、九宮與宮格無 horizontal overflow；最窄 320px 最終 build 為 296px 九宮、8 個可選方向、8 個排序方向、0 個宮格溢出。
- production Browser 以全新 PWA scope 確認最終 script `index-CbAV7O3j.js`；主盤同時出現「月九宮暗建」及「年九宮暗建」，日時參考不會出現在主盤警示。
- 新增「大月建／九宮暗建／白中殺類比／日主／時課」字串通過 `document.fonts.check()`；user-facing UI 沒有 `TOOL_HEURISTIC`、`rankingWeight`、`reference_only`、`not_evaluated` 或 variant id。

## 明確暫緩

- 大月建的多年逐月公式對照；在完成前不 alias 月紫白入中星。
- 五黃暗建的使用者傳本 selector；V1 固定使用 `generic_jiugong`。
- 白中殺 9 星 × 6 殺 authoritative matrix 的原頁逐格覆核；現有 classical 表不擅自擴寫或縮減。
- 五行生扶型有氣的 period element、月納音作用範圍及轉化飛星公式。
- 完整通書日課、日主／時課 Gate、旬空、刑害與二十四山。
- 日、時白中殺的正式 ranking；未找到同等操作證據前不從參考升級。
