# 變更紀錄

本檔記錄每個可交付批次的使用者可見變更；細部程式差異仍以 Git commit 為準。

## [Unreleased]

### Added

- 新增疊盤純資料模型，直接組裝現有 `computeFullChart()` 的年月日時刻結果，並鎖定宮位、飛星值與上層顯示規則。
- 新增可開關的九宮疊盤、主顯示層同步、選宮高亮與宮位詳情 Bottom Sheet；詳情只列 deterministic 組合，不判吉凶。
- 新增「尋星 · 簡易」：可按 UTC+8 日期範圍、宮位、日／時／刻及單星搜尋，結果顯示上層疊盤並可跳回正式盤面、自動開啟疊盤及高亮命中宮。
- 新增「尋星 · 進階」：每層可複選飛星（同層 OR）、不同層固定 AND，結果逐層標示命中並顯示 deterministic 日時／時刻組合摘要。
- 尋星加入可見的本機計算狀態、日期分組、空結果、長範圍／大量結果提示與一年上限；結果不會靜默截斷，320px controls 維持至少 44px touch target。
- 大量搜尋結果改為保留完整總數並每次明示載入 200 筆，避免一次建立數萬個 mobile DOM nodes。

### Fixed

- 補齊層級 tabs 的 roving `tabindex`、方向鍵、Home／End、automatic activation 與 `tabpanel` 關聯，改善外接鍵盤及輔助科技操作。
- 將「返回時盤」的左箭頭移到文案前方，讓視覺順序、閱讀順序與返回方向一致。
- iPhone 實機使用回報原生日期／時間 picker、field border／focus 與版面皆無問題；P0 acceptance 通過。

### Documentation

- 將 V2.1 規格與 `fdee2e7` read-only review 原文收進 `docs/`，並更新 HANDOFF 的實際 code checkpoint，移除不可攜的本機 truth-source 路徑。
- 收錄「疊盤模式＋尋星 A/B」功能規格；最佳時窗 Ranking 明確保留為未來 D 類能力，本輪不實作。
- 更新 README、使用說明、HANDOFF 與功能規格的 implementation status，記錄 Phase 0–6 checkpoint、131 tests 與 production／PWA／單檔驗證結果。

## [0.3.0] — 2026-08-08

### Added

- 完成年、月、日、時、刻飛星 PWA，以及 V2 Mobile-First UI Phase 0–6。
- 加入 V2.1 iOS 原生日期／時間 field shell、離線品牌宋體與 SVG 頂欄圖示。

### Changed

- 主畫面簡化為單一「今」、無外框層級列、輕量 Previous／Next 與 contextual action。

### Fixed

- 修正 iOS date/time border、focus 雙框及窄螢幕 overflow 風險；保留原生系統 picker。
