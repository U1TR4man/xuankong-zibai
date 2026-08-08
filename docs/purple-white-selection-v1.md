# 紫白擇吉方向 V1 implementation record

本文件記錄 `紫白擇吉方向_V1_規劃.md` 的可攜式實作邊界與驗收結果。

- 原始規格：1127 行
- SHA-256：`6bcd5d89fd761e20fa15a9b99281a0ba05b94e96a83f6013e637ac915296c156`
- V1 只處理時間紫白 × 八方；不加入宅盤、運星／山星／向星、坐向宅命或個人八字
- `src/engine/**`、`src/data/**`、UTC+8 規則及 snapshot fixture 維持唯讀

## 資料安全原則

- 新規則庫放在 `src/selection/`，不修改既有 `src/data/**`。
- 81 個 ordered pair 全部有穩定 schema、五行結構與 review 狀態。
- 規格未提供古訣判語、極性或適用條件的條目，一律為 `neutral`／`pending`／「資料待校對」。
- 規格直接列出的組合可以保存名稱與用途，但沒有古籍版本或逐字引文時仍標 `needs-review`。
- 古訣規則、五行結構與 `TOOL_HEURISTIC` 分層保存；不顯示 0–100 分或星級評分。

## Phase 1 — Data / Engine

- [x] 11–99 共 81 條 ordered pair，`68 !== 86`、`37 !== 73`。
- [x] 八方 `DirectionSnapshot` 只組裝正式 `FullChart` 的年月日時值；中宮不納入。
- [x] 每方向建立 YM／YD／YH／MD／MH／DH 六個 pair。
- [x] 建立「優先／可用／普通／吉凶並見／慎用」可解釋 heuristic，不產生數值分數。
- [x] 用途 tag 只參與高亮／同級排序，不重新計算飛星。
- [x] 8 個 Phase 1 unit tests 及 TypeScript 通過。

## 後續 Phase

- [x] Phase 2：原盤／疊盤／擇吉三段模式、八方四星、文字 verdict、主要 pair、方向詳情、可解釋原因、用途與無分數排序。
- [x] Phase 3：尋星頁加入尋組合；支援指定／不分次序、六種 Pair Layer、日期 presets、分批結果、跳回擇吉與可 refresh 高亮 deep-link。
- [ ] Phase 4：Pair 學習卡、來源、reverse pair 與用途 tags。

### Phase 2 驗證

- 中宮保留顯示，但八方盤只有 8 個可選方向，排序也只有 8 個方向。
- 同一時間的擇吉年月日時星逐一等於正式 `FullChart`。
- 點方向可查看四星、狀態、主要組合、判斷原因、全部六組、五行關係與 TOOL_HEURISTIC 聲明。
- 原盤／疊盤／擇吉互斥；`selection=1`、用途與選中方向可由 URL 還原。
- Vitest：21 files、149 tests 全數通過；TypeScript 通過。

### Phase 3 驗證

- `14` 指定次序只命中 `14`；不分次序可命中 `14／41`。
- Layer filter 只回傳所選 YM／YD／YH／MD／MH／DH；中宮不參與搜尋。
- 結果顯示日期、時段、方向、命中 layer／pair 與年月日時 context；每批 50 筆，總數不截斷。
- 點結果後以正式 Engine 重算，開啟擇吉並高亮方向、pair 與 layer；deep-link refresh 可還原。
- 搜尋範圍最多 366 日，超出時明確拒絕。
- Vitest：23 files、161 tests 全數通過；TypeScript 通過。
