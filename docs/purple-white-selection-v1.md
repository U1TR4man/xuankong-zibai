# 紫白擇吉方向 V1 implementation record

本文件記錄 `紫白擇吉方向_V1_規劃.md` 的可攜式實作邊界與驗收結果。

- 原始規格：1127 行
- SHA-256：`6bcd5d89fd761e20fa15a9b99281a0ba05b94e96a83f6013e637ac915296c156`
- V1 只處理時間紫白 × 八方；不加入宅盤、運星／山星／向星、坐向宅命或個人八字
- `src/engine/**`、`src/data/**`、UTC+8 規則及 snapshot fixture 維持唯讀

## 資料安全原則

- 新規則庫放在 `src/selection/`，不修改既有 `src/data/**`。
- 81 個 ordered pair 全部有穩定 schema、五行結構與 review 狀態。
- 研究版已為 81 組提供現代精簡摘要與 A／A/B／B／B/C／C 級別，但沒有古籍版本頁碼或逐字引文，所以全部保持 `needs-review`、`verified=false`。
- 81 組全部是 `temporalUse=reference_only`、`rankingWeight=0`、`polarity=neutral`；研究摘要不得被當成已驗證的年月日時擇吉加減分。
- 古訣規則、五行結構與 `TOOL_HEURISTIC` 分層保存；不顯示 0–100 分或星級評分。

## Phase 1 — Data / Engine

- [x] 11–99 共 81 條 ordered pair，`68 !== 86`、`37 !== 73`。
- [x] 八方 `DirectionSnapshot` 只組裝正式 `FullChart` 的年月日時值；中宮不納入。
- [x] 每方向建立 YM／YD／YH／MD／MH／DH 六個 pair。
- [x] 建立「優先／可用／普通／吉凶並見／慎用」可解釋 heuristic，不產生數值分數。
- [x] 用途 tag 只參與雙星參考高亮／搜尋，不重新計算飛星，也不改變方向排序。
- [x] 8 個 Phase 1 unit tests 及 TypeScript 通過。

## 後續 Phase

- [x] Phase 2：原盤／疊盤／擇吉三段模式、八方四星、文字 verdict、雙星參考、方向詳情、可解釋原因、用途與無分數排序。
- [x] Phase 3：尋星頁加入尋組合；支援指定／不分次序、六種 Pair Layer、日期 presets、分批結果、跳回擇吉與可 refresh 高亮 deep-link。
- [x] Phase 4：Pair 學習卡、來源／review／適用條件、reverse pair、用途 tags 與按用途反向搜尋。

### Phase 2 驗證

- 中宮保留顯示，但八方盤只有 8 個可選方向，排序也只有 8 個方向。
- 同一時間的擇吉年月日時星逐一等於正式 `FullChart`。
- 點方向可查看四星、狀態、雙星參考、判斷原因、全部六組、五行關係與 TOOL_HEURISTIC 聲明。
- 原盤／疊盤／擇吉互斥；`selection=1`、用途與選中方向可由 URL 還原。
- Vitest：21 files、149 tests 全數通過；TypeScript 通過。

### Phase 3 驗證

- `14` 指定次序只命中 `14`；不分次序可命中 `14／41`。
- Layer filter 只回傳所選 YM／YD／YH／MD／MH／DH；中宮不參與搜尋。
- 結果顯示日期、時段、方向、命中 layer／pair 與年月日時 context；每批 50 筆，總數不截斷。
- 點結果後以正式 Engine 重算，開啟擇吉並高亮方向、pair 與 layer；deep-link refresh 可還原。
- 搜尋範圍最多 366 日，超出時明確拒絕。
- Vitest：23 files、161 tests 全數通過；TypeScript 通過。

### Phase 4 驗證

- 方向詳情的六個 pair 均可開啟學習卡，查看核心、五行、來源等級、review 狀態、適用條件與用途 tags。
- 沒有可核對逐字引文時，卡片明示「尚未收錄」，不生成古訣文字。
- 有序組合明示 `68 ≠ 86`，反向按鈕會載入獨立規則與不同象義。
- 尋組合可切為「用途參考」，只匹配 rule tags；結果依 A／A/B／B／B/C／C 及紫白集中排列，不產生分數，也不反向改動八方 ranking。
- Vitest：24 files、165 tests 全數通過；TypeScript 通過。

## 考源研究版同步

- 可攜式紀錄：`docs/purple-white-pair-research-v1.md`
- 原始研究版：552 行；SHA-256 `c3974e22e6fbc4e7b811bfca2a53c64004d6671b46f2db2edf8a35f9cee6dd61`
- 來源級別分佈：A 20、A/B 3、B 53、B/C 3、C 2。
- 25／52、37／73、68／86 是研究版明確要保留次序差異的組合。
- 年 > 月 > 日 > 時的較慢層作第一碼、較快層作第二碼；這是工具 convention，不聲稱是古代山向雙星的原始定義。

## Final verification

```text
test files   24 passed
tests        165 passed
TypeScript   passed
production   passed（71 modules；CSS 34.82 kB；JS 136.11 kB）
PWA precache passed（11 entries；243.20 KiB）
single file  passed（玄空紫白.html 約 254 KB）
```

真實 production 瀏覽器驗收：

| viewport | 擇吉頁 overflow | 尋組合 overflow | 可選／排序方向 | 中宮 |
|---:|---:|---:|---:|---|
| 320 | 0 | 0 | 8 / 8 | 不參與 |
| 375 | 0 | 0 | 8 / 8 | 不參與 |
| 390 | 0 | 0 | 8 / 8 | 不參與 |
| 430 | 0 | 0 | 8 / 8 | 不參與 |

- 320px 方向詳情無水平 overflow，六個 pair 完整顯示，並明示 `TOOL_HEURISTIC`。
- 68 學習卡顯示來源 A、需要覆核、無逐字引文警示與 `68 ≠ 86`；反向按鈕正確開啟 86 的獨立象義。
- 以一日範圍搜尋有序 14，結果可跳至 `2026-08-07 07:00`、東方、MH，URL 還原擇吉模式及命中標記。
- 瀏覽器 console 無 warning / error。
- 320px 研究版 UI 無 horizontal overflow；方向詳情、學習卡及尋組合均明示雙星參考邊界。
- 用途從文書／考試切至喜慶後，八方排序完全不變；console 無 warning / error。

## 資料校對債

V1 的「完成」指功能、架構、研究摘要入庫、資料安全標記與驗收完成，不代表 81 組古訣全部已有來源佐證。後續補資料時必須逐條提供可追溯版本、頁碼或章節與逐字引文；在此之前，未核對條目不得將 `verified` 改為 `true`，也不得將 `rankingWeight` 改為非 0。
