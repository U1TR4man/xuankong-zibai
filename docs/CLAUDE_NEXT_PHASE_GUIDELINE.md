# Claude 後續接手指南｜Day Gate 之後

> 建立日期：2026-08-10
>
> 專案：`U1TR4man/xuankong-zibai`
>
> 工作目錄：`/Users/chungyingwa/Downloads/玄空紫白/xuankong-zibai`
>
> 本文件用途：讓 Claude 從已完成的 Day Gate V1 接續研究與實作；不是新規格，也不授權擴大 scope。

## 0. 接手結論

- branch：`main`
- 建立本文件前，`main` 與 `origin/main` 同步，worktree clean。
- Day Gate V1 已完成，不要重做：
  - code checkpoint：`8ce7010 implement Day Gate V1`
  - docs checkpoint：`dcd566b document Day Gate V1 closeout`
- Day Gate V1 現在只評估「日干 × 月令司氣」，結果為 `pass / mixed / caution`。
- Day Gate V1 **不改**任何方向的 `verdictFor()`、`rankDirections()` 或排序。
- 下一階段必須先做研究封版，再逐項落地；不要一次把四柱沖、月破、日時沖、Hour Gate、方向 Gate 全部混在一起。
- 本文件建立時的完整驗證基線：25 個 test files、198 tests、production build 及 single-file build 均通過。

> Git 狀態會隨後續工作改變。接手時仍須重新執行下方 preflight，不可只相信本文件的日期快照。

## 1. 接手後先讀這些檔案

依序完整閱讀：

1. `docs/HANDOFF.md`：目前功能、保護邊界、歷史 checkpoint 與尚未完成事項。
2. `docs/day-gate-v1-authoritative-rules.md`：Day Gate V1 的研究定案與程式契約。
3. `src/selection/temporalRules.ts`：現行時間規則 truth source。
4. `src/selection/types.ts`：`DayGate`、`TimeGateAssessment`、方向資料結構。
5. `src/selection/selectionEngine.ts`：只讀確認方向判定與排序邊界。
6. `src/ui/DirectionDetailSheet.ts`：Day Gate 現行 user-facing 呈現。
7. `CHANGELOG.md`、`README.md`：對外說明與每輪紀錄。

另以使用者提供的原研究規劃作研究方向參考：

- `/Users/chungyingwa/Downloads/紫白擇吉_下一階段研究規劃_DayGate優先.md`
- 已記錄 SHA-256：`e45f14022585a4f3fececde176ab178532aba28829492fda99cbb8aecfac6c3e`

若原檔內容或 checksum 不一致，停止並先向使用者確認，不要自行合併版本。

## 2. 每次開始工作的 preflight

在專案根目錄執行：

```bash
pwd
git status --short --branch
git log -5 --oneline
```

預期 `pwd` 是：

```text
/Users/chungyingwa/Downloads/玄空紫白/xuankong-zibai
```

規則：

- 若 worktree 有不是本輪造成的修改，視為使用者或其他 agent 的檔案；不要覆蓋、還原或順手整理。
- 修改前先確認現有 diff，遇到重疊檔案就停下來說明。
- 不用 `git add -A`；只 stage 本輪明確、已驗證的檔案。
- 不執行 `git reset --hard`、`git checkout -- <file>` 或任何不可逆清理。
- 未經使用者明確要求，不 push、不 deploy、不改 GitHub 設定。

## 3. 絕對保護邊界

後續 selection 研究／UI 工作不得修改：

```text
src/engine/**
src/data/**
tests/fixtures/chart-snapshot.json
```

也不得改變：

- UTC+8 規則。
- 節氣交接時刻與 `getSolarMonthByJieqi()`。
- 年、月、日、時、刻飛星算法。
- `flyNineStars`、`KeStarStrategy`。
- 九宮 geometry。
- 原盤、疊盤、Search 的既有語義。
- 81 組雙星的 `reference_only`、`rankingWeight=0`、`polarity=neutral`。
- 日／時白中殺目前的研究分層。

`tests/engineSnapshot.test.ts` 鎖定 1912–2104 的 1200 個時間點。若失敗，先找 regression，**不可更新 fixture 讓測試變綠**。

## 4. Day Gate V1 現行真相

### 4.1 輸入

- 日干、月支來自 `src/selection/temporalPillars.ts` 的 canonical 四柱。
- 月支仍採精確節氣月，不採公曆月或農曆朔望月。
- Day Gate 另外計算 `monthCommand`：
  - 下一個立春、立夏、立秋或立冬前最後 18 個整日：土。
  - 其餘：春木、夏火、秋金、冬水。
- 這個 Day Gate 司令五行不得反向修改既有九星月令矩陣。

### 4.2 結果

```text
旺、相 → pass
休     → mixed
囚、死 → caution
```

- `caution` 不是 hard reject。
- `TimeGateAssessment.dayStatus` 已評估。
- `TimeGateAssessment.hourStatus` 仍為 `not_evaluated`。
- `rankingUse` 維持 `disabled`。
- Direction `verdictFor()` 與 `rankDirections()` 不得讀取 Day Gate。

### 4.3 UI

- Day Gate 只出現在較深層的方向詳情，不搶九宮主盤 hierarchy。
- UI 明示四柱沖合與時辰扶日尚未納入。
- 不顯示內部 token、provenance code 或數值分數。
- 不使用 `⚠`、`✦`、`✓`、`⚑` 等 platform-dependent glyph。

## 5. 建議的下一階段順序

每一階段都是獨立交付。前一階段未完成研究文件、tests、build、文件與 clean checkpoint，不進下一階段。

### Phase N0 — read-only 考源與規則封版

先研究，不寫 production code。必須回答：

1. 哪些沖破屬可 deterministic 計算的曆法事實？
2. 哪些只影響日課狀態，哪些可能是 hard veto？
3. 同一沖象若同時被稱為月破、日時沖，如何避免重複計算？
4. 時辰扶日與日干祿時能否改善弱日，改善上限是甚麼？
5. 各規則的來源版本、卷次、頁碼、原文與證據等級是甚麼？

輸出一份新的 `docs/*-authoritative-rules.md`，至少包含：

- 輸入、輸出、明確 truth table。
- `active / warning / reference_only / disabled` 層級。
- 是否參與日課 Gate、方向 verdict、方向 ranking。
- 衝突優先序與不重複計算原則。
- 未解問題與 stop conditions。
- 原始規格檔 checksum。

沒有封版規則文件，不進 production code。

### Phase N1 — 四柱六組沖 V1

建議先只處理地支六沖的客觀命中，不先宣告吉凶分數：

```text
子午、丑未、寅申、卯酉、辰戌、巳亥
```

四柱的六個有序／具名組合：

```text
年－月、年－日、年－時、月－日、月－時、日－時
```

實作要求：

- 使用 canonical `TemporalPillars`，不另算另一套四柱。
- 回傳結構化命中資料，例如 pair、兩柱、兩支、證據層級；不要只回傳中文字串。
- 先保存「命中事實」與「術語／效果」的分離，避免一個命中被月破和一般六沖重複降級。
- 若研究尚不能支持 veto 強度，就只顯示／reference，不 hard reject、不加入 ranking。
- 第一版只放 Direction Detail 的深層說明；不要加進九宮宮格。

最低測試：

- 六組沖及反向順序全部命中。
- 非沖 pair 不命中。
- 四柱六組 pair 全覆蓋。
- 同一底層 clash 不因多個 label 重複計算。
- Day Gate 結果、方向 verdict 與 ranking 在未授權前保持不變。

### Phase N2 — 月破與日時沖語義

- 月破應由「月支 × 日支六沖」的底層命中衍生，不建立第二套互相分歧的算法。
- 日時沖應由「日支 × 時支六沖」衍生。
- 月破／日時沖是對同一 clash fact 的語義標籤，不可雙重扣分。
- hard veto、caution 或 reference-only 的強度，必須由 Phase N0 證據先封版。
- 「日課的月破」與日後「方向 Gate 的月破方」必須使用不同型別／欄位命名，不可混為一事。

### Phase N3 — Hour Gate V1

依序研究並實作：

1. 時柱對日干的生扶／洩耗／剋制。
2. 日干祿時的固定表與權威來源。
3. 時辰對弱日的改善上限。

保守原則：

- 不把每個地支粗暴簡化為單一五行後直接評分，除非規格已明定本氣、藏干與採用層級。
- 不順手加入十神、納音、旬空或完整神煞庫。
- Hour Gate 初期只作細選／tie-breaker；不能把已確認的高優先沖破自動翻成吉。
- Hour Gate 完成後才把 `hourStatus` 從 `not_evaluated` 改為正式狀態。

### Phase N4 — Direction Gate（更後階段）

歲破、月破方、三煞等屬方向層規則，必須另立研究文件與 schema。

- 不把「月支 × 日支的日課月破」當作「月破方」。
- 不把 Day Gate 狀態複製成八個方向的 verdict。
- 未取得方向規則、24 山／八宮映射及強度證據前，維持未實作。

## 6. 研究紀律

- 以可核對的固定版本、卷次、頁碼／影像為優先。
- 數位轉錄可作定位與對讀，但未保存固定版本原頁時，`primarySourceVerified` 維持 `false`。
- 不用現代部落格、搜尋摘要或 AI 推論冒充古籍證據。
- 原文、現代解讀、工具 convention 與程式政策分欄保存。
- 有異文就保存異文；不可為了讓公式完整而自行修文。
- 證據不足時採 `reference_only` 或 `disabled`，寧缺毋濫。
- 不因「看起來合理」新增固定分數、百分比權重或 hard veto。
- 若原始研究檔與 repo 文件不一致，先報告差異，請使用者決定 truth source。

## 7. 實作邊界與結構

- 新規則優先放在 `src/selection/`，只消費正式 Engine 輸出。
- 既有 `src/selection/temporalRules.ts` 是時間規則集中位置；若檔案變得過大，可在本輪規格明確授權後拆分，但不要為重構而重構。
- 計算層回傳穩定、可測試的結構資料；UI 才翻譯成自然中文。
- 計算函式不得讀 DOM、localStorage 或 URL state。
- UI 不得重新推算曆法規則。
- 未授權加入 ranking 前，增加 regression test 證明 `verdictFor()`、`rankDirections()` 不讀新資料。
- 保留現行 ordered pair、selection URL、overlay、Search 與 selected palace 行為。

## 8. UI／UX 原則

- 介面用繁體中文與自然術語，不顯示 `TOOL_HEURISTIC`、`reference_only`、`rankingWeight` 等內部字串。
- 九宮主盤只保留決策必要資訊；研究邊界與詳細理由放 Direction Detail／Study。
- 不使用 emoji 或平台字形作狀態語義，改用既有色彩、線條與文字。
- 保持現行紙、墨、朱砂系統，不新增高彩色分類。
- 320／375／390／430px 不得水平 overflow。
- touch target、keyboard focus、dialog focus return、safe area 不得 regression。
- 若新增任何 user-facing 中文，必須同步重建並驗證自帶字體 subset，避免 iPhone 逐字 fallback。

## 9. 字體與 PWA 注意事項

自帶字體：

```text
public/fonts/zibai-serif-medium.woff2
```

subset 工具：

```text
scripts/build-font-subset.py
```

現行 Day Gate closeout 基線：

- UI 字元：914
- cmap：914
- glyphs：915
- WOFF2：243,864 bytes
- WOFF2 SHA-256：`961d5494cfda720af1965b478ac10cb6d066fb87003953aed50669650a37b790`
- font source SHA-256：`da0a79ee44322329dd9ff87d2cc878dc897c5180195e3f9b6cd4c8569781e887`

規則：

- 不改成 runtime Google Fonts。
- 不依賴 `/private/tmp` 內可能已消失的暫存 source font。
- 取得相同官方 Noto Serif CJK TC Medium source 後，先核對 source checksum，再重建 subset。
- 確認 preload、production asset、service worker precache、offline PWA 及 single-file data URI 都包含新字體。
- 新產物的字元數、glyph 數、bytes 與 checksum 必須寫進本輪 closeout 文件。

## 10. 驗證命令

專案 scripts：

```bash
npm run typecheck
npm test
npm run build
npm run build:single
```

若 Codex／Claude 的 non-login shell 找不到 `node` 或 `npm`：

1. 先定位該環境提供的 bundled Node runtime。
2. 不要為了跑測試而改 package manager、lockfile 或重新安裝整個 dependency tree。
3. 可用 bundled `node` 直接執行既有本機套件入口：

```bash
<NODE> node_modules/typescript/bin/tsc --noEmit
<NODE> node_modules/vitest/vitest.mjs run
<NODE> node_modules/vite/bin/vite.js build
SINGLE_FILE=1 <NODE> node_modules/vite/bin/vite.js build
<NODE> tools/make-single-file.mjs
```

不要在已有 npm `node_modules` 上直接改用 pnpm install；過往曾出現套件被搬進 `node_modules/.ignored` 的副作用。

每輪最低驗證：

- typecheck。
- 全量 tests；test 數不可無理由少於 198。
- production build。
- single-file build。
- 若 UI／中文字有變：font subset coverage、PWA precache、single-file font。
- 若 UI 有變：320／375／390／430px、console 0 error、無水平 overflow、keyboard／dialog 行為。
- 若 selection 規則有變：明確證明 Engine snapshot、Direction verdict、ranking 是否保持或依已批准規格改變。

## 11. Changelog、文件與 Git closeout

每個可交付修改批次都要寫 changelog，不能只靠 commit message。

至少更新：

- `CHANGELOG.md`：使用者可理解的實際行為、保護邊界與驗證結果。
- `docs/HANDOFF.md`：完成 phase、checkpoint、測試數、下一步與尚未解問題。
- 對應 `docs/*-authoritative-rules.md` 或 implementation closeout。
- `README.md`：只有 user-facing 功能或開發／驗證方式真的改變時才更新。

closeout 順序：

```text
git status
→ 檢查 diff
→ 執行完整驗證
→ 只 stage 明確檔案
→ git diff --cached --check
→ commit
→ git status / git log
```

建議把 code 與 docs closeout 分成可理解的 checkpoint；不要把無關修改混進同一 commit。未經使用者要求，不 push。

## 12. 必須停止並詢問使用者的情況

- 權威來源不足，卻要決定 hard veto、ranking 權重或固定分數。
- 原始規格、repo 文件與現行程式互相矛盾。
- 需要修改 `src/engine/**`、`src/data/**` 或 snapshot fixture 才能前進。
- worktree 有其他人未提交且與本輪重疊的修改。
- 新需求會順手帶入納音、十神、旬空、神煞庫、24 山或 P2 Search cleanup。
- 需要 push、deploy、刪檔、重寫歷史或改遠端設定。

不要用推測跨過以上邊界；整理清楚證據、影響與最小選項後交由使用者決定。

## 13. 每一 phase 的完成定義

一個 phase 只有在以下全部完成後才算完成：

- 有封版規則與來源狀態文件。
- 程式只在批准 scope 內修改。
- 正反例、boundary、regression tests 齊全。
- typecheck、全量 tests、build、single-file build 通過。
- UI／font／PWA（如受影響）完成實測。
- `CHANGELOG.md`、`docs/HANDOFF.md` 及本輪 closeout 同步。
- 精準 staging 與清晰 commit 完成。
- 最後 `git status --short --branch` 沒有遺漏的本輪檔案。

最後回報時要用繁體中文，先說完成結果，再列實際修改檔案、行為、沒有修改的保護區、測試／build 數據、commit 及仍待研究事項。
