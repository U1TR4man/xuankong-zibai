# V2 Final UI/UX refinement implementation record

本文件記錄 `xuankong_zibai_v2_final_uiux_refinement.md` 的 P0／P1 實作邊界與驗收證據。

- 原始規格：895 行
- SHA-256：`2db1ba55f99604d7e1f2d5e0d01676fadbf44dd11caca91ee5a338a42b92b16d`
- code checkpoint：`2c4228e`
- 未修改：`src/engine/**`、`src/data/**`、`tests/fixtures/chart-snapshot.json`

## P0 — Search 與 follow-now

- `refreshFollowedNow()` 只在 `view === 'chart'` 時更新及 emit；停留 Search 時不會每 30 秒重建 DOM。
- `followNow` 本身不會因切到 Search 而關閉；返回 Chart 時若仍為 `true`，會立即以 `nowUtc8()` 同步目前時間。
- UI test 鎖定 Search 表單節點、日期欄焦點及輸入值不被背景 refresh 改變。
- production Browser 實測跨過 31.2 秒更新週期後，`startDate` 仍保持焦點及 `2026-08-11`；返回排盤時 URL／畫面由 `10:40` 立即同步至 `10:42`。

## P1 — 擇吉語義與資訊架構

- 「雙星用途參考」移到九宮與方向排序之後，並加入「僅篩選相關雙星斷語，不改變方向排序。」
- 宮格 pair 改為 `參考 · 32 鬥牛煞` 等次級墨色；真正判定條件改為 `警示 · 日八白：入墓` 等 caution 色。
- pair 搜尋命中的方向仍保留 selected border，但 pair 文字不再轉為朱紅，避免誤作 ranking 因素。
- `purposeHits`、pair data、`rankingWeight=0`、verdict 與方向排序均未修改。

## P1 — Search、keyboard 與文字圖形

- 「＋ 進階條件／收起進階條件」移到「開始尋星」之前；收合仍保留已設定內容。
- 原盤／疊盤／擇吉改為 `tablist/tab/tabpanel`，支援 ArrowLeft／ArrowRight、Home／End、roving tabindex、automatic activation、`aria-selected` 及 panel 關聯。
- user-facing UI 不再使用 `⚠`、`✦`、`✓`、`⚑`；Search 命中沿用既有朱砂色／底線，異文改用正常中文。

## P1 — 時間干支可核查設定

「時間干支」Bottom Sheet 除四柱外，新增實際 current settings：

- 年界：`立春` 或 `公曆元旦`
- 月柱：`節氣月`
- 換日：`午夜 00:00` 或 `子初 23:00`
- 時辰：`中國時辰`

這些資訊只在 Sheet 顯示；主盤 hierarchy、四柱計算及設定來源不變。

## 驗收

- TypeScript：通過。
- Vitest：25 files、195 tests 全數通過；1,200 點 engine snapshot fixture 未修改。
- production／PWA build：通過；precache 11 entries、459.20 KiB，包含自帶 WOFF2。
- single-file build：通過；`玄空紫白.html` 543,221 bytes，字體以 data URI 內嵌。
- 字體 coverage：915 個目前必要 UI 字元全部命中；現有 WOFF2 cmap 917、918 glyphs、244,620 bytes，SHA-256 `5db7f01b9af6f76e2c25aeb7fe3225b4cc1d09d4042030ed4b35e14f8b42acfc`，無需重建。
- production Browser 320／375／390／430px：原盤、疊盤、擇吉、簡易／進階 Search 與時間干支 Sheet 均無 horizontal overflow。
- 四種寬度的 `document.fonts.check()` 均為 true；全頁無四種 platform glyph，console 0 warning／0 error。
- 原盤九個中央大星保持墨色；疊盤大星保持墨色，目前層小值保持朱紅，其他層小值保持墨灰。

## 明確暫緩

依原規格保留 P2，不在本輪擴做：

- Search 九宮式宮位 selector。
- 九宮 grid 的完整方向鍵 roving-focus semantic cleanup。

同時未新增最佳時窗、ranking、Search matching、URL state、UTC+8、節氣／干支或任何擇吉規則。
