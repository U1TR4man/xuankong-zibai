# 擇吉盤四星橫排 UI 修正 implementation record

本文件記錄 `xuankong_zibai_selection_four_stars_horizontal.md` 的可攜式實作邊界與驗收結果。

- 原始規格：337 行
- SHA-256：`4f570da76c6597075ff190f9a01badbe21438abab989dbd59bfb153f0b5df2ce`
- 性質：純 UI consistency polish
- Engine、pair 規則、ranking、UTC+8、飛星算法、九宮 geometry、方向詳情與 Search 均不在修改範圍

## 已完成

- 擇吉九宮每宮的年／月／日／時由 2×2 改為單行四欄，閱讀方向與疊盤及方向詳情一致。
- 八方與中宮沿用同一 `.selection-cell__stars`／`.selection-cell__star` 結構，沒有建立中宮特例。
- 每欄維持小型淡墨 label 與墨灰 value；沒有卡片、圓角 pill、背景色或目前 `level` 朱紅高亮。
- 沒有加入流刻，也沒有實作未來的命中 pair 層級高亮。

## 驗收

- Vitest：24 files、166 tests 全數通過。
- TypeScript、production／PWA build、單檔 build 全數通過。
- Production build：71 modules；CSS 34.78 kB；JS 136.11 kB；PWA precache 11 entries（243.16 KiB）。
- 單檔 build：`app.js` 169.09 kB；`玄空紫白.html` 254 KB。
- Production browser 的 320、375、390、430、768px 均為 9 組四欄，年／月／日／時保持同列；九宮寬度分別為 296、343、358、398、568px，頁面沒有 horizontal overflow。
- 八方與中宮 label 均為「年月日時」；全部四星 value 在未選及選中方向後皆為墨灰 `rgb(111, 103, 92)`，沒有因目前 `level=hour` 轉為朱紅。
- 長 pair title 沒有 horizontal overflow；點東南方向可正常選宮並開啟「巽 · 東南」詳情，詳情仍為四星。
- 五種寬度均完成 responsive screenshot；browser console 無 warning／error。

## 明確未做

- 不修改 `src/engine/**`、`src/data/**` 或 `tests/fixtures/chart-snapshot.json`。
- 不修改擇吉 ranking、pair rule／title、用途判斷、Search Engine 或方向詳情邏輯。
- 不新增流刻、pair、scoring、recommendation 或命中 pair 高亮。
