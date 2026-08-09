# 干支加入與 UI/UX refinement V2 implementation record

本文件記錄 `xuankong_zibai_ganzhi_uiux_refinement_v2.md` 的實際落地範圍與可重跑驗收。

- 原始規格：1,251 行
- SHA-256：`199e81138bbedbee098c2ff91987f4391d34a97d7749672dcfa2a5e1c3773711`
- code checkpoint：`927a9fd`
- 保護範圍：`src/engine/**`、`src/data/**`、UTC+8、節氣／飛星公式、白中殺、雙星 81 組、方向 verdict／ranking、Search matching、九宮 geometry 及 snapshot fixture 均未修改

## P0 — canonical 年月日時干支

- 新增 `src/selection/temporalPillars.ts`，一次建立 `year/month/day/hour` 四個正式 `Ganzhi`；UI 不自行組干支或判規則。
- 年柱沿用目前 `yearBoundary`；月柱沿用節氣月並以五虎遁取月干；日柱沿用 `dayChangeMode`；時支沿用 `getChineseHour()`，時干以五鼠遁組成。
- `TemporalBranchContext` 只保存完整 `pillars`，不再另存一份可能分歧的 branch record。支序有氣、墓絕、月令及 UI 顯示都由同一柱取地支。
- `TemporalStarAssessment` 直接帶入該層完整 `ganzhi`；`ChartCard` 只建立一次 context，再交給方向評估與 ChartHeader 共用。
- 新增 8 項 boundary tests：已知四柱、立春／公曆年界、立秋精確交接、00:00／23:00 換日、子／午時、UTC+8 跨日／跨年，以及 selection 與 display 同源。

## P1 — 擇吉畫面與 evidence chain

- 干支只出現在擇吉模式；原盤、疊盤與擇吉九宮宮格均沒有增加干支。
- ChartHeader mobile 顯示「日柱 · 時柱」，560px 顯示完整年月日時；整列維持 44px、單行、墨灰、無 chip／外框／朱紅。
- 點 metadata 會開「時間干支」Bottom Sheet，直列年／月／日／時四柱，沿用既有 modal、Esc、scroll lock 及 focus return。
- Direction Detail 四欄改為「層級／干支／星數」；首屏移除「時氣與白中殺」，改為 verdict、紫白主幹及「雙星參考」。
- 「為甚麼」依因果順序顯示：紫白擇方主幹 → 時序條件 → 白中殺 → 其他判定理由。時序條件明示「層級 · 干支 · 星」與「地支 → 結果」；白中殺只顯示「星 × 固定宮位」，避免誤解為由干支計算。
- `研究簡寫 A／A/B` 等 schema 呈現改為「古法規則／研究整理／研究中」等自然中文；底層 source grade 不變。

## P1 — 搜尋與全站 refinement

- 頂層 workspace 由「尋星」改為「搜尋」，內層仍是「尋星／尋組合」。
- Search tool switch 移到 helper 前，改用完整 `tablist/tab/tabpanel`；支援 ArrowLeft／ArrowRight、Home／End、roving tabindex、automatic activation、`aria-selected` 與互相關聯的 ID。
- 新增 `--ink-muted: #746c61`；在 `#f4f0e7` 紙色上的對比為 4.55:1，在 `#fbf8f1` raised paper 上為 4.88:1。可讀的小型 metadata 改用 muted，純裝飾箭頭與 footer 仍保留 tertiary。
- 字體 subset 重新掃描 80 個 UI source，產出 895 個 UI 字元／896 glyphs；WOFF2 236,704 bytes，SHA-256 `5f44b778ab6c52995f2aba77bc088301e86341a1159560817d7c16755ec00b2c`。preload path、font-family、PWA precache 與單檔內嵌架構不變。

## 驗收

- TypeScript：通過。
- Vitest：25 files、188 tests 全數通過；1200 點 engine snapshot fixture 未修改。
- production／PWA build：通過；precache 11 entries、441.82 KiB，包含自帶 WOFF2。
- single-file build：通過；`玄空紫白.html` 522,797 bytes，字體以 data URI 內嵌。
- Browser 320／375／390／430／560px：主頁、metadata、九宮及 Direction Sheet 均無 horizontal overflow；320–430px 顯示日時，560px 顯示四柱。
- Direction Detail 四欄在五種寬度均無文字重疊；320px 首屏只見「紫白主幹／雙星參考」，四個 disclosure 預設收起。
- 「為甚麼」順序、時序地支鏈與「到巽宮 → 白中殺」因果均已實際展開核對；沒有 `TOOL_HEURISTIC`、`rankingWeight`、`reference_only` 或 `研究簡寫`。
- Search tabs 的 ArrowRight 與 Home 已在本機 Browser 實測；完整左右鍵／Home／End 由 UI tests 鎖定。兩個 tab 均為 44px，focus、selected tab 與 tabpanel 同步。
- 「時間干支」Sheet 關閉後焦點返回 metadata；`document.fonts.check()` 對新增干支／研究字串命中；browser console 0 error／warning。

## 明確暫緩

- Search result 顯示日時干支。
- 九宮式 spatial palace selector。
- 最佳時窗與任何新 ranking／recommendation。
- 藏干、十神、納音、旬空、二十四山或天干參與 verdict。
