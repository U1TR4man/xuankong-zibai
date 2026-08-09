# 變更紀錄

本檔記錄每個可交付批次的使用者可見變更；細部程式差異仍以 Git commit 為準。

## [Unreleased]

### Added

- 新增可重跑的 `scripts/build-font-subset.py`：掃描專案實際靜態 UI 中文、驗證既有 Noto Serif CJK TC Medium 來源 checksum，並重建／檢查離線 WOFF2 子集。
- 新增第二輪考源資料層：方向的四時紫白 profile、九星有氣／墓絕研究參考、白中殺 schema、方法層證據與異文，以及 81 組的 `sourceAudit`、條件與次序可信度。
- 收錄雙星 81 組研究版的現代精簡摘要與 A／A/B／B／B/C／C 級別；每條均保留 `needs-review`、`verified=false`、`temporalUse=reference_only` 與 `rankingWeight=0`。
- 新增可逐組開啟的 Pair 學習卡，分開顯示古訣來源、五行結構、review 狀態、適用條件、用途 tags 與 reverse pair；尋組合亦可按「文書／考試、求財、商談、求名、喜慶、出行」反向搜尋。
- 尋星頁新增「尋組合」：可指定 `14` 或不分次序 `14／41`、篩選 YM／YD／YH／MD／MH／DH、使用日期 presets、查看分批結果，並跳回擇吉盤高亮方向及命中 pair。
- 主盤新增互斥的「原盤／疊盤／擇吉」模式；擇吉盤保留中宮但只排名八方，顯示年月日時四星、文字狀態、主要 pair、用途與無分數方向排序，點方向可查看完整原因。
- 新增紫白擇吉方向 V1 的 Phase 1 純資料／判讀層：81 個有序雙星規則、八方年月日時快照、每方六組 pair、用途 tag 與無分數的可解釋 heuristic；未校對研究摘要維持 neutral／needs-review／rankingWeight 0。
- 盤頭加入輕量「疊盤」switch；疊盤主星直接跟隨既有年／月／日／時／刻層級列。
- 尋星改為漸進式進階條件：預設只顯示簡易搜尋，按「＋ 進階條件」才展開多層／多星設定；收起再展開仍保留設定。
- Search → Chart 會把既有命中層帶到命中宮的五層註記，以朱砂＋✓ 輕量標示；切換時間、導覽層級或宮位後即清除過期標示。
- 簡易尋星條件可由 `from/to/searchPalace/precision/star` URL 還原，支援 refresh、bookmark 與分享；進階條件暫不序列化。
- 新增疊盤純資料模型，直接組裝現有 `computeFullChart()` 的年月日時刻結果，並鎖定宮位、飛星值與上層顯示規則。
- 新增可開關的九宮疊盤、主顯示層同步、選宮高亮與宮位詳情 Bottom Sheet；詳情只列 deterministic 組合，不判吉凶。
- 新增「尋星 · 簡易」：可按 UTC+8 日期範圍、宮位、日／時／刻及單星搜尋，結果顯示上層疊盤並可跳回正式盤面、自動開啟疊盤及高亮命中宮。
- 新增「尋星 · 進階」：每層可複選飛星（同層 OR）、不同層固定 AND，結果逐層標示命中並顯示 deterministic 日時／時刻組合摘要。
- 尋星加入可見的本機計算狀態、日期分組、空結果、長範圍／大量結果提示與一年上限；結果不會靜默截斷，320px controls 維持至少 44px touch target。
- 大量搜尋結果改為保留完整總數並每次明示載入 50 筆，避免一次建立過多 mobile DOM nodes。

### Fixed

- 重建 `Zibai Serif` 離線子集，將實際 UI 中文覆蓋由 374 擴至 860 個字元；「雙星參考」「回到今」「全部六組」等後加文字不再於 iOS 逐字 fallback，preload、PWA 快取與單檔內嵌路徑保持不變。
- 日期時間列改用 baseline 對齊；「今／回到今」共用固定 64px 右欄並靠右顯示，320／375／390／430px 不溢出且切換文案不會推動左側日期。
- 28／29／31 不再被考源資料結構誤作無條件 pure pair；48／98 明示為反向推建，68／86 明示古證據是宮星＋流年，37 的疑似 36 轉錄只存為異文而不覆寫規則。
- 擇吉九宮的年／月／日／時四星由 2×2 改為由左至右的四欄橫排；八方與中宮共用同一版式，維持墨灰且不加入流刻或目前層朱紅高亮。
- 非疊盤九宮的九個中央大星名改回墨色，中宮亦不再將大星轉為朱紅；中宮背景／輔助標示及疊盤目前層小值配色保持不變。
- 將雙星 81 組從擇吉方向 verdict 與 ranking 完全解耦；切換雙星用途參考不再改變八方排序，古賦與年月日時實驗性 pair 不會被當成已證實的加減分規則。
- 移除疊盤開啟後重複的第二套「主顯示」五欄控制；主畫面永遠只保留一套層級列。
- 尋星導覽與 CTA 維持「尋星／開始尋星」，移除內容區重複的 `h1`，讓 helper paragraph 成為首個內容元素；簡易與進階選星繼續共用洛書九宮順序。
- 疊盤中央大星使用墨色，只有目前層級的小值使用朱紅，中宮與 selected palace 繼續以底色／框表達 focus。
- Search URL 不再夾帶隱藏的 `level/overlay/overlayPrimary/selectedPalace`；Chart deep-link 則完整保留時間、層級、疊盤與選宮。
- Chart URL 將模糊的 `primary/palace` 正規化為 `overlayPrimary/selectedPalace`，同時保留舊 key 的讀取相容。
- 修正盤頭精修時的一個多餘 CSS 結尾括號；production／PWA build 再次通過。
- 搜尋 UI 回歸測試改為等待搜尋狀態真正結束，不再以固定 10ms 猜測完成時間，避免完整套件並行時誤判。
- 壓縮日期／時間、節氣、層級列與盤頭的垂直距離；盤名與時段改為同列，並讓疊盤在選宮後只有命中宮維持強焦點。
- 疊盤九宮五層資料維持單列、標籤與非當前數值使用墨灰；目前層級小值使用朱紅，Search 真正命中層仍以朱砂＋✓ 表示。
- 搜尋結果改為整列可點的精簡列表，移除大型「查看此盤」按鈕；保留時段、宮位、各層、命中勾號、組合摘要及方向箭頭。
- 補齊層級 tabs 的 roving `tabindex`、方向鍵、Home／End、automatic activation 與 `tabpanel` 關聯，改善外接鍵盤及輔助科技操作。
- 將「返回時盤」的左箭頭移到文案前方，讓視覺順序、閱讀順序與返回方向一致。
- iPhone 實機使用回報原生日期／時間 picker、field border／focus 與版面皆無問題；P0 acceptance 通過。

### Documentation

- 收錄紫白擇吉第二輪考源 implementation record、原始研究 checksum、171 tests、production／PWA／單檔 build 與五種寬度驗收，並鎖定有氣／白中殺／81 組仍不可評分的邊界。
- 收錄擇吉盤四星橫排 UI 修正的原始規格 checksum、166 tests、production／PWA／單檔 build，以及 320／375／390／430／768px responsive 驗收結果。
- 新增雙星 81 組考源 implementation record，記錄原始研究版 checksum、級別分佈、有序 convention、ranking 解耦與 320px production 驗收。
- 完成紫白擇吉方向 V1 Phase 1–4 封版文件：記錄 165 tests、production／PWA／單檔 build、四種 iPhone 寬度與實際有序 14 deep-link 驗收，並明示 81 組古訣的來源校對債。
- 收錄紫白擇吉方向 V1 的原始規格 checksum、資料安全邊界與逐 Phase implementation status。
- 收錄疊盤配色／尋星重複標題修正的可攜式 implementation record、原始規格 checksum、133 tests 與四種手機寬度驗收結果。
- 收錄 UI／Search URL cleanup 的可攜式 implementation record、URL 責任表、原始規格 checksum、133 tests 與四種手機寬度驗收結果。
- 收錄最新盤面／尋星精修的可攜式 implementation record、原始規格 checksum、四種手機寬度與 131 tests 驗收結果。
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
