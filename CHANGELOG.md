# 變更紀錄

本檔記錄每個可交付批次的使用者可見變更；細部程式差異仍以 Git commit 為準。

## [Unreleased]

### Added

- 新增 `src/selection/branchRelations.ts`：六沖、六合、六害、三合、刑的單一共用純函式 primitive。三個 Gate 之後一律消費同一份實作，不再各自重建地支關係表；本輪只交付 primitive 與測試，沒有組裝 Hour Gate／Direction Gate，也沒有任何 UI 或使用者可見行為變更。
- 三合局定為單一資料源並保存各局仲支，Direction Gate 的三煞可由「本局仲支對沖支及其左右鄰支」導出（申子辰→巳午未、寅午戌→亥子丑、亥卯未→申酉戌、巳酉丑→寅卯辰），不得另建第二張三煞表。
- 新增 28 個 primitive 測試：以全部 144 組地支組合鎖定 `isClash(a, b) === (oppositeBranch(a) === b)`；刑以有向反例鎖定（申日寅時為刑、巳日寅時不是），並覆蓋辰午酉亥自刑、巳日申時同時為六合與刑，以及沖／合／害／三合／刑互不取代。

- 新增 Hour Gate V1 權威規則紀錄：封版時破、時沖月令／歲君、五不遇十組定局、時刑有向表、日害、時建、六合、三合、時干扶日與十干日祿時；保留正負關係並存與「祿時不解時破」原則，severity 依日常／修造分歧但一律不進 ranking。
- 新增 Day／Hour／Direction 三 Gate 整合契約：把六沖收斂成單一 primitive 並登記六個具名消費者（破日、時破、時沖月令、時沖歲君、歲破方、月破方），定明不重複計算、Gate 間不做數值相加與執行順序。
- 新增 Direction Gate V1 權威規則紀錄：封版歲破、月破方、年月日三煞的 24 山 truth table 與 partial hit 模型，明確分離「破日」與「月破方」，並把所有 severity 保留為 reference_only；原始研究 SHA-256、檔名與內容不符及缺頁碼證據狀態一併保存。本輪不含程式實作。
- 新增 Day Gate V1 權威規則紀錄：逐項定案旺相休囚死算法、節氣月、四立前十八日土旺、弱日 veto 邊界、時辰生扶與四柱沖合優先順序；原始規劃 SHA-256 一併保存。
- 新增日干五行、月令司令五行、旺相休囚死與 `pass / mixed / caution` 評估；只顯示時間 Gate，不換算分數、不 hard reject、不改八方 verdict／ranking。
- 擇吉方向詳情新增「日課」區塊，依序顯示日主、月令、狀態與自然中文理由，並明示四柱沖合、時辰扶日尚未納入。
- 新增第七輪白中殺 9 星×6 殺單一真相表：六捷墓、九宮暗建、受剋、穿心、交劍、鬥牛全部逐星鎖定，並保存還原欄序、規則級信心與原典未核 metadata。
- 新增暗建、到方四殺與六捷墓的獨立 API 及完整矩陣測試；鎖定同層多殺、五黃中宮預設、九紫戌墓及一白艮宮不誤報受剋殺。
- 新增第六輪四層到方政策：月／日為正式主層、年為背景、時白為同級細選；日支有氣升為 B+ 次級有效，日時白中殺仍只作參考。
- 新增大月建 36 個月型態回歸測試、舊年干起例停用 metadata，以及大月建疊加二黑／五黃、墓絕或其他 active killer 的 caution boundary tests。
- 新增第五輪 source-aware 規則政策：白中殺為年月正式、日時參考；支序有氣為年月正式、日層警示、時層類推。
- 新增大月建獨立月干支飛宮介面、日主／時課 Gate 介面與月納音研究狀態；未封版前明確為尚未評估、不參與排序。
- 一般九宮暗建新增 `generic_jiugong`、`san_yuan_bao_hai` 及 `jiyao_native_and_center` 異文資料，不合併成單一超級規則。
- 新增擇吉時間層唯一的 `TemporalPillars`：年月日時完整干支共用既有年界、節氣月、換日及中國時辰 boundary；selection 判讀與 UI 顯示由同一 context 取值。
- 擇吉 ChartHeader 新增單行干支 metadata；mobile 顯示日時、wide 顯示四柱，點擊可開「時間干支」Bottom Sheet。
- 新增年界、節氣月、兩種換日、子午時及 UTC+8 跨日／跨年的四柱 boundary tests。
- 新增第四輪 co-arrival 與 Direction status V4：raw 紫白到方與合格紫白分開記錄，月／日為主要層，年為背景／大型修作參考，時為細選。
- 新增月暗建 `centerStar -> forbiddenPalaces` 表、classical 受剋殺表及獨立的宮星五行關係；只月層套用暗建，五黃入中禁乾坤艮巽。
- 新增第三輪白中殺／時間狀態引擎：暗建、受剋、穿心、交劍、鬥牛以星乘固定宮位判定；六捷墓、臨絕及 1／6／8／9 支序有氣以年月日時各層地支判定。
- 新增節氣月令的得令、得生、休、囚、受制資料，以及年／月 A 級、日／時 B 級的時層套用標記；未有直接支序表的星保持未知，不自行推演。
- 新增可重跑的 `scripts/build-font-subset.py`：掃描專案實際靜態 UI 中文、驗證既有 Noto Serif CJK TC Medium 來源 checksum，並重建／檢查離線 WOFF2 子集。
- 新增第二輪考源資料層：方向的四時紫白 profile、九星有氣／墓絕研究參考、白中殺 schema、方法層證據與異文，以及 81 組的 `sourceAudit`、條件與次序可信度。
- 收錄雙星 81 組研究版的現代精簡摘要與 A／A/B／B／B/C／C 級別；每條均保留 `needs-review`、`verified=false`、`temporalUse=reference_only` 與 `rankingWeight=0`。
- 新增可逐組開啟的 Pair 學習卡，分開顯示古訣來源、五行結構、review 狀態、適用條件、用途 tags 與 reverse pair；尋組合亦可按「文書／考試、求財、商談、求名、喜慶、出行」反向搜尋。
- 尋星頁新增「尋組合」：可指定 `14` 或不分次序 `14／41`、篩選 YM／YD／YH／MD／MH／DH、使用日期 presets、查看分批結果，並跳回擇吉盤高亮方向及命中 pair。
- 主盤新增互斥的「原盤／疊盤／擇吉」模式；擇吉盤保留中宮但只排名八方，顯示年月日時四星、文字狀態、主要 pair、用途與無分數方向排序，點方向可查看完整原因。
- 新增紫白擇吉方向 V1 的 Phase 1 純資料／判讀層：81 個有序雙星規則、八方年月日時快照、每方六組 pair、用途 tag 與無分數的可解釋 heuristic；未校對研究摘要維持 neutral／needs-review／rankingWeight 0。
- 盤頭加入輕量「疊盤」switch；疊盤主星直接跟隨既有年／月／日／時／刻層級列。
- 尋星改為漸進式進階條件：預設只顯示簡易搜尋，按「＋ 進階條件」才展開多層／多星設定；收起再展開仍保留設定。
- Search → Chart 會把既有命中層帶到命中宮的五層註記，以朱砂色與底線輕量標示；切換時間、導覽層級或宮位後即清除過期標示。
- 簡易尋星條件可由 `from/to/searchPalace/precision/star` URL 還原，支援 refresh、bookmark 與分享；進階條件暫不序列化。
- 新增疊盤純資料模型，直接組裝現有 `computeFullChart()` 的年月日時刻結果，並鎖定宮位、飛星值與上層顯示規則。
- 新增可開關的九宮疊盤、主顯示層同步、選宮高亮與宮位詳情 Bottom Sheet；詳情只列 deterministic 組合，不判吉凶。
- 新增「尋星 · 簡易」：可按 UTC+8 日期範圍、宮位、日／時／刻及單星搜尋，結果顯示上層疊盤並可跳回正式盤面、自動開啟疊盤及高亮命中宮。
- 新增「尋星 · 進階」：每層可複選飛星（同層 OR）、不同層固定 AND，結果逐層標示命中並顯示 deterministic 日時／時刻組合摘要。
- 尋星加入可見的本機計算狀態、日期分組、空結果、長範圍／大量結果提示與一年上限；結果不會靜默截斷，320px controls 維持至少 44px touch target。
- 大量搜尋結果改為保留完整總數並每次明示載入 50 筆，避免一次建立過多 mobile DOM nodes。

### Changed

- Search 停留時不再被 `followNow` 的 30 秒 timer 重建；保留 follow 狀態，返回排盤時立即同步 `nowUtc8()`。
- 「雙星用途參考」移到擇吉九宮與方向排序之後，明示只篩選斷語、不改 ranking；宮格以「參考 · …」及「警示 · …」區分參考 pair 與正式判定條件。
- 尋星的進階條件控制移到 primary CTA 前；原盤／疊盤／擇吉改為完整 keyboard tabs，加入左右鍵、Home／End、roving tabindex 與 tabpanel 關聯。
- 「時間干支」Sheet 新增實際年界、節氣月、午夜／子初換日及中國時辰設定，主畫面與四柱計算不變。
- 一般九宮本位、受剋古表、對宮公式與鬥牛條件由分散常數改為共用第七輪矩陣；暗建讀入中星、四種宮位殺讀到方星、六捷讀時間地支，年月 active／日時 reference-only 邊界不變。
- 大月建改由正式月紫白入中星的後天本宮直接推得；與月暗建同位時合流為一條「大月建／月暗建」警示，只計一次，五黃預設回中宮。
- 日白到方不再被「當日地支未列直接有氣」整層取消；日支直接有氣改作次級加強。時白不單獨提升 verdict，只在同級方向間作 tie-breaker。
- Direction status 更新為 V6：月／日建立主層結果，大月建單獨只落 mixed，與二黑／五黃、其他年月白中殺或非參考墓絕疊加才升 caution。
- 一般九宮暗建改為分別使用年、月、日、時的入中星；主盤只顯示「年九宮暗建／月九宮暗建」正式警示，日時只在詳情作類比參考。
- 五黃暗建預設從第四輪的「四隅唯一解」改為一般九宮本位的中宮；乾坤艮巽四隅保留為《三元寶海鈎玄》異文，不疊加參與 ranking。
- 時層支序有氣改為 C 級類推參考，UI 明示「支序有氣（類推參考）」；月層 role 改為月令核心，日層保留 Gate 定位。
- Direction Detail 四欄加入干支；首屏改為 verdict、紫白主幹及「雙星參考」，「為甚麼」依紫白主幹、時序條件、白中殺、其他理由的因果順序顯示。
- 頂層「尋星」改名「搜尋」；內層尋星／尋組合移到 helper 前並改為完整 keyboard tabs，支援左右鍵、Home／End、roving tabindex 及 tabpanel 關聯。
- 新增 4.5:1 以上的 `--ink-muted`，提升日期節氣、干支、picker hint、來源與研究 metadata 等小字可讀性；裝飾箭頭仍使用 tertiary。
- 紫白擇吉移除「至少兩層才成立」的硬門檻；一個主要層合格紫白已可成為正面訊號，多層同到再增強。「紫白一時加／二時加」同時保存為異文。
- Direction status 依合格主要層、墓絕、classical killers 及黃黑疊到重算；81 組 pair 仍為 `reference_only`、`rankingWeight=0`，不影響 status 或方向排序。
- 擇吉方向判定依序納入紫白集中、白中殺、墓絕、支序有氣與黃黑值令；維持純文字分級及可解釋條件，不建立 0–100 或固定權重。
- 擇吉宮格優先顯示白中殺／墓絕提醒；方向詳情將時序與白中殺移入「為甚麼」，逐層顯示干支、月令及可重疊條件。
- 81 組雙星仍是獨立參考知識庫，`rankingWeight=0`、用途選擇與 pair 摘要不參與方向判定或排序。

### Fixed

- 重建 `Zibai Serif` 離線字體子集至 914 個 UI 字元／915 glyphs；Day Gate 新增中文字已進 preload、PWA precache 與單檔 data URI。
- 移除 user-facing UI 的 `⚠`、`✦`、`✓`、`⚑` 平台字形；警示、參考、命中與異文改由正常中文及既有 design tokens 表達。
- 重建 `Zibai Serif` 離線字體子集至 917 個 UI 字元／918 glyphs；第七輪研究說明新增中文已進 preload、PWA precache 與單檔 data URI。
- 移除大月建「獨立月干支飛宮尚待核對」的過期 user-facing 說法；主盤與詳情不再將大月建、月暗建重複顯示或重複計入警示。
- 重建 `Zibai Serif` 離線字體子集至 912 個 UI 字元／913 glyphs；第六輪新增文字已進 preload、PWA precache 與單檔 data URI。
- 修正日、時白中殺類比過度影響 verdict：底層仍完整計算與顯示，但不再直接將方向從優先降為吉凶並見或慎用。
- 重建 `Zibai Serif` 離線字體子集至 910 個 UI 字元／911 glyphs；第五輪新增研究文字已進 preload、PWA precache 與單檔 data URI。
- 重建 `Zibai Serif` 離線字體子集至 895 個 UI 字元／896 glyphs；新增干支與搜尋 UI 字元已進 preload、PWA precache 與單檔 data URI。
- 雙星來源級別在一般 UI 改用「古法規則／研究整理／研究中」等自然中文，不再顯示 `研究簡寫 A／A/B` schema token；底層 source grade 保持不變。
- 修正第三輪暗建過度簡化：不再把飛星回本宮視為暗建，改依月白入中星反推禁修方。
- 修正受剋殺命名：古表定局與一般「宮五行剋星五行」分開，一白落艮只顯示五行相剋，不冒稱古法受剋殺。
- 重建 `Zibai Serif` 離線字體子集至 892 個 UI 字元；新增第四輪說明字元已進 preload、PWA precache 與單檔 data URI。
- 擇吉九宮不再以 8px 顯示年月日時與 pair 摘要，也不再把紫白集中數塞入宮格；重要資訊改用 secondary ink，320px 九宮維持 296×296 正方。
- 方向詳情改為 progressive disclosure：首屏只留四星、狀態與主要參考，「為甚麼／全部六組／五行關係／研究說明」預設收起。
- Bottom Sheet 初始焦點改到 sheet surface，避免開啟即在 X 顯示朱紅焦點框；關閉圖示統一為 1.5px inline SVG，keyboard focus 與焦點返回保持不變。
- Workspace、時間軸、盤面模式以字體、字重與 32×3／22×2／16×1px 底線分級，不再呈現三組同等重量的文字 tabs。
- Pair 學習卡與尋組合說明改用「原始使用情境／用途標籤／次序規則」等自然中文，不再把 `rankingWeight`、`reference_only`、`convention` 等內部欄位顯示給使用者。
- 移除擇吉主盤「TOOL_HEURISTIC · 紫白集中 · 雙星不入排序」內部術語列；方向詳情只以自然中文保留「雙星組合僅供參考，不參與方向排序」，底層 provenance 與 ranking 邏輯不變。
- 較早字體修正將 `Zibai Serif` 實際 UI 字元覆蓋由 374 擴至 864 個；「雙星參考」「回到今」「全部六組」等後加文字不再於 iOS 逐字 fallback，preload、PWA 快取與單檔內嵌路徑保持不變；第四輪已再擴至 892 個。
- 日期時間列改用 baseline 對齊；「今／回到今」共用固定 64px 右欄並靠右顯示，320／375／390／430px 不溢出且切換文案不會推動左側日期。
- 28／29／31 不再被考源資料結構誤作無條件 pure pair；48／98 明示為反向推建，68／86 明示古證據是宮星＋流年，37 的疑似 36 轉錄只存為異文而不覆寫規則。
- 擇吉九宮的年／月／日／時四星由 2×2 改為由左至右的四欄橫排；八方與中宮共用同一版式，維持墨灰且不加入流刻或目前層朱紅高亮。
- 非疊盤九宮的九個中央大星名改回墨色，中宮亦不再將大星轉為朱紅；中宮背景／輔助標示及疊盤目前層小值配色保持不變。
- 將雙星 81 組從擇吉方向 verdict 與 ranking 完全解耦；切換雙星用途參考不再改變八方排序，古賦與年月日時實驗性 pair 不會被當成已證實的加減分規則。
- 移除疊盤開啟後重複的第二套「主顯示」五欄控制；主畫面永遠只保留一套層級列。
- 搜尋內容區維持內層「尋星／開始尋星」並移除重複 `h1`；頂層 workspace 為「搜尋」，tool tabs 位於 helper 前，簡易與進階選星繼續共用洛書九宮順序。
- 疊盤中央大星使用墨色，只有目前層級的小值使用朱紅，中宮與 selected palace 繼續以底色／框表達 focus。
- Search URL 不再夾帶隱藏的 `level/overlay/overlayPrimary/selectedPalace`；Chart deep-link 則完整保留時間、層級、疊盤與選宮。
- Chart URL 將模糊的 `primary/palace` 正規化為 `overlayPrimary/selectedPalace`，同時保留舊 key 的讀取相容。
- 修正盤頭精修時的一個多餘 CSS 結尾括號；production／PWA build 再次通過。
- 搜尋 UI 回歸測試改為等待搜尋狀態真正結束，不再以固定 10ms 猜測完成時間，避免完整套件並行時誤判。
- 壓縮日期／時間、節氣、層級列與盤頭的垂直距離；盤名與時段改為同列，並讓疊盤在選宮後只有命中宮維持強焦點。
- 疊盤九宮五層資料維持單列、標籤與非當前數值使用墨灰；目前層級小值使用朱紅，Search 真正命中層仍以朱砂色表示。
- 搜尋結果改為整列可點的精簡列表，移除大型「查看此盤」按鈕；保留時段、宮位、各層、命中層色彩、組合摘要及方向箭頭。
- 補齊層級 tabs 的 roving `tabindex`、方向鍵、Home／End、automatic activation 與 `tabpanel` 關聯，改善外接鍵盤及輔助科技操作。
- 將「返回時盤」的左箭頭移到文案前方，讓視覺順序、閱讀順序與返回方向一致。
- iPhone 實機使用回報原生日期／時間 picker、field border／focus 與版面皆無問題；P0 acceptance 通過。

### Documentation

- 收錄 Day Gate V1 implementation record、code checkpoint `8ce7010`、198 tests、PWA／單檔 build、字體 coverage 及 320／375／390／430px Browser 驗收；四柱沖合與 Hour Gate 明確留待下一階段。
- 收錄 V2 Final UI/UX refinement 的原始規格 checksum、P0／P1 implementation record、195 tests、PWA／單檔 build、字體 coverage、30 秒 follow-now 與四種 iPhone 寬度 Browser 驗收；兩項 P2 明確暫緩。
- 收錄紫白擇吉第七輪實作紀錄、原始研究 checksum、9×6 矩陣、三種輸入契約、194 tests、PWA／單檔 build、離線字體與四種手機寬度 Browser 驗收；原典影像未入專案故仍保留 `primarySourceVerified=false`。
- 收錄紫白擇吉第六輪實作紀錄、原始研究 checksum、大月建 36 月合流、日白／時白層級、194 tests、PWA／單檔 build、離線字體與四種手機寬度 Browser 驗收。
- 收錄紫白擇吉第五輪實作紀錄、原始研究 checksum、暗建傳本分層、年月／日時證據政策、大月建／日主 Gate／月納音暫緩邊界、191 tests、PWA／單檔 build 與四種手機寬度驗收。
- 收錄干支加入與 UI/UX refinement V2 implementation record、原始規格 checksum、188 tests、PWA／單檔 build、五種寬度及 keyboard／focus／font 驗收證據。
- 更新 `docs/HANDOFF.md` 的第四輪 checkpoint、現行 truth source、字體雜湊、179 tests、PWA／單檔 build 及四種 iPhone 寬度 Browser 驗收證據。
- 收錄紫白擇吉第四輪實作紀錄、原始研究 checksum、被修正的第三輪規則、179 tests、PWA／單檔 build 與四種 iPhone 寬度 Browser 驗收。
- 收錄紫白擇吉第三輪考源 implementation record、原始研究 checksum、白中殺／墓絕／支序有氣／月令的實際公式、178 tests、build 及四種手機寬度驗收；未有原頁的來源狀態仍保持待覆核。
- 收錄 professional UI/UX refinement 的原始規格 checksum、Phase A–D implementation record、172 tests、production／PWA／單檔 build 與四種手機寬度驗收。
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
