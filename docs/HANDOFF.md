# 接手說明（給 Codex / 下一位 AI）

## 目前狀態

`docs/uiux-redesign-v2.md` 的 **Phase 0–6**、V2.1 視覺精修 **Phase A–D**、professional UI/UX refinement **Phase A–D**、疊盤／搜尋 implementation **Phase 0–6**、盤面／搜尋／URL cleanup、疊盤配色補丁、紫白擇吉方向 V1 **Phase 1–4**、干支加入與 UI/UX refinement V2 的 **P0／P1**、V2 Final UI/UX refinement 的 **P0／P1**，以及 **Day Gate V1** 均已完成。雙星 81 組已與方向 ranking 解耦；第六輪已確認大月建等於月入中星本宮、與月暗建合流，並將日白升為正式主層、時白定為同級細選；第七輪已將六捷墓、九宮暗建、受剋、穿心、交劍與鬥牛整合為唯一 9 星×6 殺矩陣。現行 Direction status 繼續使用 source-aware V6 政策，Day Gate V1 只顯示時間狀態，不改八方 verdict／ranking。

- 專案：`U1TR4man/xuankong-zibai`
- branch：`main`
- V2.1 基線 commit：`e5e2d33`
- V2.1 implementation checkpoint：`fdee2e7`
- read-only review 修正後 code checkpoint：`333f7e1`（P1：`14fdc40`）
- 疊盤／尋星 code checkpoint：`609e941`
- 盤面工具列／疊盤精修 checkpoint：`0e99b49`
- 尋星漸進展開／結果列精修 checkpoint：`0429c4f`
- 四寬度 QA／文件 checkpoint：`8b4189e`（CSS production fix：`c651ef9`）
- Search 命中層帶回疊盤 closeout：`9ae61d9`
- 唯一層級列／洛書選星 cleanup checkpoint：`3bcd1d0`
- Chart／Search URL state cleanup checkpoint：`d2e74cf`
- 本輪文件／QA closeout：`7a10d83`
- 疊盤配色／尋星標題修正 checkpoint：`a1bbb00`
- 擇吉 Phase 1 data / engine checkpoint：`cb9759a`
- 擇吉 Phase 2 主盤 checkpoint：`9fb4eb0`
- 擇吉 Phase 3 有序雙星搜尋 checkpoint：`bed1d46`
- 擇吉 Phase 4 學習／用途搜尋 checkpoint：`abffa42`
- 擇吉 V1 四寬度 QA／文件 closeout：`79bbe64`
- 雙星 81 組研究版／ranking 解耦 code checkpoint：`1f7510b`
- 雙星 81 組研究邊界／QA 文件 checkpoint：`66a8d69`
- 擇吉盤四星橫排 UI checkpoint：`a515ddc`
- 紫白擇吉第二輪考源／source audit code checkpoint：`e389de3`
- 紫白擇吉第三輪白中殺／時間狀態 code checkpoint：`d3d6374`
- 紫白擇吉第四輪 co-arrival／月暗建修正 checkpoint：`a20587f`
- 干支加入／擇吉與搜尋 refinement code checkpoint：`927a9fd`
- 紫白擇吉第五輪暗建／白中殺／有氣分層 code checkpoint：`b8980ae`
- 紫白擇吉第六輪大月建合流／日白升級 code checkpoint：`9674f28`
- 紫白擇吉第七輪白中殺 9×6 矩陣 code checkpoint：`175ee81`
- V2 Final UI/UX refinement code checkpoint：`2c4228e`
- Day Gate V1 code checkpoint：`8ce7010`
- 三 Gate 共用地支關係 primitive checkpoint：`b1c7d71`（`src/selection/branchRelations.ts`）
- 24 山幾何 checkpoint：`493ac1c`（`src/selection/mountains24.ts`）
- Direction Gate V1 組裝 checkpoint：`ffcadac`（`src/selection/directionGate.ts`）
- 六德／三德叢聚 checkpoint：`e68ff09`（`src/selection/directionVirtues.ts`）
- Direction Selection V2 組裝 checkpoint：`3c9e9df`（`src/selection/directionSelection.ts`）
- Hour Gate 三張表 checkpoint：`eb0cc59`（`src/selection/hourGateTables.ts`）
- Hour Gate 組裝 checkpoint：見本輪 commit（`src/selection/hourGate.ts`）
- V2 規格真相來源：`docs/uiux-redesign-v2.md`
- V2.1 規格：`docs/v2.1-visual-refinement-ios-datetime.md`
- `fdee2e7` review 原文：`docs/reviews/fdee2e7-readonly-review.md`
- 疊盤／尋星規格：`docs/xuankong_zibai_overlay_star_search_feature_plan.md`
- 最新盤面／尋星精修紀錄：`docs/ui-search-polish-short.md`
- UI／Search URL cleanup 紀錄：`docs/ui-search-url-cleanup-short.md`
- 疊盤配色／尋星標題修正紀錄：`docs/overlay-color-search-heading-patch.md`
- 紫白擇吉方向 V1 實作紀錄：`docs/purple-white-selection-v1.md`
- 雙星 81 組考源研究版實作紀錄：`docs/purple-white-pair-research-v1.md`
- 擇吉盤四星橫排修正紀錄：`docs/selection-four-stars-horizontal.md`
- 紫白擇吉第二輪考源紀錄：`docs/purple-white-second-round-source-audit.md`
- 紫白擇吉第三輪考源紀錄：`docs/purple-white-third-round-temporal-rules.md`
- 紫白擇吉第四輪考源紀錄：`docs/purple-white-fourth-round-coarrival-anjian.md`
- 紫白擇吉第五輪考源紀錄：`docs/purple-white-fifth-round-layered-anjian-qi.md`
- 紫白擇吉第六輪考源紀錄：`docs/purple-white-sixth-round-dayuejian-daywhite.md`
- 紫白擇吉第七輪考源紀錄：`docs/purple-white-seventh-round-white-killer-matrix.md`
- 干支加入與 UI/UX refinement V2 紀錄：`docs/ganzhi-uiux-refinement-v2.md`
- V2 Final UI/UX refinement 紀錄：`docs/v2-final-uiux-refinement.md`
- Day Gate V1 權威規則：`docs/day-gate-v1-authoritative-rules.md`
- Direction Positive Evidence V1 權威規則（第十一至十三輪）：`docs/direction-positive-v1-authoritative-rules.md`

P0 iPhone 實機使用已回報無問題。疊盤、搜尋 A/B、UI 與 URL cleanup、紫白擇吉 Phase 1–4、四星橫排、第六輪時間規則、第七輪白中殺 9×6 矩陣、canonical 年月日時干支、V2 Final P0／P1 及 Day Gate V1 均已完成；大月建 36 個月型態已由月入中星本宮統一，不再另算。V2 UI/UX 進入 freeze；Day Gate 下一步是四柱沖、月破、日時沖、時扶日與日干祿時。另需收入第七輪所引固定版本原頁證據包、日／時白 killer 直接實例、月納音作用範圍與 deploy，不應擅自發明暫緩公式、九宮式 Search selector、九宮 keyboard cleanup 或 P2 最佳時窗。

---

## 絕對不能碰

```text
src/engine/**
src/data/**
tests/fixtures/chart-snapshot.json
```

節氣、干支日、年月日時刻起星、`flyNineStars`、`KeStarStrategy`、UTC+8 規則均未修改。
`tests/engineSnapshot.test.ts` 持續鎖定 1912–2104 的 1200 個時間點；失敗時不可更新 fixture。

---

## 已完成內容

### Phase 1 — Visual system + 九宮

- 紙／墨／朱砂 light tokens
- 九宮改為共用細線的一體方盤
- 中宮為唯一強朱砂位
- 九星不再用九種高彩色

### Phase 2 — 移除 landing friction

- 空 URL：`nowUtc8() + level='hour'`
- 0 tap 看現在流時盤，1 tap 進現在刻盤
- 移除 landing、Breadcrumb、舊 Header／LevelTabs
- 舊 `t`／`level` URL 與 `home=true` 相容
- 新增 `TopBar`、`DateTimeContext`、`LevelSegment`

### Phase 3 — Bottom Sheet primitive

- native `<dialog>`；單一 sheet、backdrop、Esc、swipe down、focus return
- body scroll lock、80dvh、safe-area bottom、sheet 內捲動
- `TimePickerSheet` 採 draft →「查看此時」才 apply
- `SettingsSheet` 已移出 normal document flow

### Phase 4 — Child／Ke picker sheets

- 年／月／日／時各只保留一個 contextual CTA
- 子月／日／時選單與八刻清單改為 Sheet
- 完整年→月→日→時→刻流程不觸發 page navigation
- selector 計算抽到 `src/ui/selectors/childItems.ts`

### Phase 5 — Explain + Study

- default `displayMode='simple'`
- default `showLuoshu=false`
- 解說改為 `ExplainSheet`
- 研習模式才顯示預設收合的 `StudyPanel`
- 模式以 localStorage 持久化

### Phase 6 — Polish

- swipe 只綁 `[data-swipe-zone="chart"]`，並排除 interactive elements
- `followNow` 每 30 秒只在 Chart 刷新；Search 不 emit／重建，返回 Chart 時若仍跟隨現在會立即同步；手動選時即停止，按「回到今」恢復
- Chart Header hierarchy、兩欄 Prev／Next、functional motion
- focus、44px touch target、safe area、PWA light theme、no-JS 文案
- Dark Mode 沒有開 scope，留待 V3

### V2.1 Phase A–D — Visual refinement + iOS date/time

- 原生 date/time input 改為 `sheet-input-shell` 負責 border／focus，input 本身保持 `appearance:auto`、零 border／outline；320–430px 無 clipping 或雙框
- 自帶 `public/fonts/zibai-serif-medium.woff2`（Noto Serif CJK TC Medium 2.003；910 個 UI 字元／911 glyph，242,356 bytes）與 OFL；preload、PWA precache、單檔 data URI 均完成
- `scripts/build-font-subset.py` 掃描 `src/**/*.ts(x)`、`index.html` 與其他直接顯示的靜態文字後重建子集；來源 OTF checksum、產物 coverage 與 glyph inventory 均可重跑檢查
- TopBar 兩個 emoji 改成 `currentColor`、1.5px stroke inline SVG
- LevelSegment 保留 tablist／tab／aria-selected，只移除外框、divider 與 active 色塊，改為 22×2px 朱砂底線
- 主畫面只留 DateTimeContext 的一個「今」；主頁不常駐顯示 UTC+8，TimePicker／Settings 仍明示 UTC+8
- Chart Header 改為「流年／流月／流日／流時／流刻」；Prev／Next 與 contextual CTA 改為無卡片感 content row
- 九宮 geometry、飛星算法、URL state、follow-now 均未改

#### iOS 問題 root cause

舊版由 WebKit 原生 date/time input 同時負責內容、border 與 focus outline；iOS 的 native appearance 在開關 picker 前後可能採用不同的內部尺寸，造成 border 走位或雙框。V2.1 把可控視覺責任移到固定尺寸的外層 shell，以 `:focus-within` 畫唯一 focus；原生 input 只保留值與系統 picker 行為。

### Professional UI/UX refinement Phase A–D

- 擇吉九宮移除紫白集中數，保留方向、四星、狀態及主要組合；320px 的年月日時及 pair 摘要維持 10px，不再降到 8px
- 重要 label、時間範圍、宮位方向與 pair context 使用 `--ink-secondary`；`--ink-tertiary` 只留給可忽略 metadata
- 方向詳情首屏只顯示四星、狀態與主要參考；理由、六組、五行及研究說明使用預設收合的 native `details`
- 無指定 autofocus 的 Bottom Sheet 初始焦點落在 `.sheet__surface`；close button 使用 20px、1.5px stroke inline SVG，仍保留 44px touch target、keyboard focus 與 focus return
- Workspace／time axis／chart mode 分別使用 32×3、22×2、16×1px active underline，並以 UI sans／display serif、字重及尺寸分級
- Pair 學習卡及尋組合不再顯示 `rankingWeight`、`reference_only`、`convention`、`context`、`tags` 等內部字串；研究 metadata 與 ranking 邏輯未改
- 可攜式紀錄及原始規格 checksum 見 `docs/professional-uiux-refinement.md`

### 干支加入與 UI/UX refinement V2 — P0／P1

- `src/selection/temporalPillars.ts` 是擇吉時間層唯一的年月日時干支來源；年柱沿用 `yearBoundary`、月柱沿用節氣月、日柱沿用 `dayChangeMode`、時支沿用 `getChineseHour()`，月干／時干分別按五虎遁／五鼠遁組成。
- `TemporalBranchContext` 保存完整四柱；selection 的 `periodBranch`、月令、墓絕／支序判讀及 UI 干支顯示都由同一柱取值，不另存可分歧的 branch record。
- 干支只在擇吉 ChartHeader 與 Direction Detail 出現；原盤、疊盤、九宮宮格及 Search result 均沒有增加干支。mobile metadata 顯示日時，520px 起顯示完整四柱，點擊可開「時間干支」Bottom Sheet。
- Direction Detail 首屏只留 verdict、紫白主幹及「雙星參考」；「為甚麼」依紫白擇方主幹 → 時序條件（星 × 時間地支）→ 白中殺（星 × 固定宮位）→ 其他理由排列。
- 頂層 workspace 已改名「搜尋」；內層尋星／尋組合改為正式 `tablist/tab/tabpanel`，tool switch 位於 helper 前並支援左右鍵、Home／End 及 roving tabindex。
- `--ink-muted: #746c61` 在 paper／raised paper 對比分別為 4.55:1／4.88:1；可讀小字使用 muted，純裝飾箭頭與 footer 才保留 tertiary。
- Search result 加干支、九宮式選宮與最佳時窗仍屬 P2；天干不參與 verdict／ranking，亦未加入藏干、十神、納音、旬空或二十四山。
- 可攜式紀錄、原始規格 checksum、boundary tests、font 及 Browser QA 見 `docs/ganzhi-uiux-refinement-v2.md`。

### V2 Final UI/UX refinement — P0／P1

- Search 保留 `followNow` 狀態，但 30 秒 timer 只在 Chart 更新；Search 的 input focus、native date picker、內容與 scroll 不再因 timer 重建。返回 Chart 時若仍 follow，立即同步 `nowUtc8()`。
- 擇吉的「雙星用途參考」移到九宮與方向排序後，helper 明示只篩選斷語、不改 ranking；宮格的 pair 改為次級墨色「參考 · …」，正式條件改為 caution 色「警示 · …」。
- 尋星進階控制移到 CTA 前，收合不清除設定；原盤／疊盤／擇吉已改為完整 `tablist/tab/tabpanel`，支援左右鍵、Home／End、roving tabindex 及 automatic activation。
- user-facing UI 已移除四種 platform glyph；Search 命中使用既有色彩／底線，異文使用自然中文。
- 「時間干支」Sheet 顯示 current 年界、節氣月、午夜／子初換日及中國時辰；四柱 truth source 與主畫面 hierarchy 未改。
- code checkpoint：`2c4228e`；完整規格 checksum、195 tests、字體及 Browser 證據見 `docs/v2-final-uiux-refinement.md`。
- 原規格 P2 的 Search 九宮式選宮與九宮方向鍵 semantic cleanup 仍暫緩，不得順手擴做。

### `fdee2e7` read-only review 收尾

- P0：0 個 code bug；使用者完成 iPhone 實機使用並回報無問題，日期／時間 code 不再調整
- P1：`14fdc40` 補齊 LevelSegment roving `tabindex`、ArrowLeft／ArrowRight、Home／End、automatic activation 與 tabpanel 關聯
- P2：`333f7e1` 將「‹ 返回時盤」改為方向、視覺與閱讀順序一致
- 文件：V2.1 規格及 review 原文均已收進 repo，不再依賴 `/Users/...` 本機路徑
- `CHANGELOG.md` 自本輪起記錄每個可交付修改批次

### 疊盤／尋星 Phase 0–6

- Phase 0／規格：`61999e5` 收錄原始規格並完成 Engine、state、九宮、Sheet 與 URL 唯讀審查
- Phase 1：`a13dbaa` 建立 `OverlayResult`／`PalaceOverlayViewModel`，只組裝 `computeFullChart()`
- Phase 2：`672333a` 完成疊盤開關、五層九宮、主顯示層、選宮高亮與宮位詳情 Sheet
- Phase 3：`fd3303f` 完成尋星 A、UTC+8 日／時／刻枚舉、結果列表與 Search → Chart → Overlay
- Phase 4：`387dd2a` 完成尋星 B；同層 stars＝OR、跨層 conditions＝AND，沒有任意 Boolean
- Phase 5：`662de72` 完成日期分組、loading／empty state、長範圍／大量結果提示與一年上限
- Phase 5 safeguard：`609e941` 原先每次顯示 200 筆；本輪精修改為首批及每次增量 50 筆，完整總數仍保留
- 搜尋正式語義固定為「指定層級、指定宮位格內的飛星值」；不把入中星、洛書數或其他宮誤作命中
- 日候選以 UTC+8 正午代表；時與刻使用正式時窗起點，全部呼叫現有 Engine
- 搜尋結果只保存命中與上層 context；點入後仍由正式 Engine 依時間重算盤面
- 320px／390px production 驗證無水平 overflow；疊盤小值有文字 layer label，controls 最低 44px

### 盤面／尋星 UI 精修

- 日期／時間、節氣與 now action 同列；層級列和盤頭的垂直間距縮短
- 盤名與時段同列；疊盤改為盤頭右側 switch，不再有獨立大型控制區
- `overlayPrimaryLevel` 底層欄位保留，但目前跟隨 `level`；主畫面永遠只有一套層級列
- 疊盤未選宮時中心只作淡焦點；選宮後只有命中宮使用強朱砂框
- 普通盤與疊盤中央大星均使用墨色，五層小值只有目前層級使用朱紅；Search 真正命中層使用朱砂色及底線
- Search → Chart 會暫存 `searchMatchedLevels`，只在 selected palace 的命中層使用朱砂色；改時間、導覽層級或宮位會清除，避免留下過期命中
- 尋星取消等權重的簡易／進階 tabs，改由「＋ 進階條件」漸進展開，收合不丟條件
- 結果改為精簡整列可點，移除大型「查看此盤」按鈕；每批顯示 50 筆

### UI／Search URL cleanup

- 尋星導覽與 primary CTA 維持「尋星／開始尋星」；內容區不再重複 `h1`，helper paragraph 為首個內容元素
- 簡易單選與進階多選共用洛書九宮順序 `4,9,2 / 3,5,7 / 8,1,6`
- Shared URL state：`t`、`view`
- Chart-only：`level`、`overlay`、`overlayPrimary`、`selectedPalace`
- Search-only（簡易）：`from`、`to`、`searchPalace`、`precision`、`star`
- `view=search` 不序列化 Chart-only state；簡易條件 refresh／bookmark／share 可還原
- Search Result → Chart deep-link refresh 可還原時間、層級、疊盤及 selected palace
- 舊 `primary`／`palace` 仍可讀取，載入後會正規化成 `overlayPrimary`／`selectedPalace`

### 紫白擇吉方向 V1 Phase 1–4

- 新功能全部位於 `src/selection/` 及對應 UI，只消費正式 `FullChart`；沒有修改 `src/engine/**`、`src/data/**` 或 snapshot fixture
- 11–99 共 81 個 ordered pair 均有穩定 schema；`68 !== 86`、`37 !== 73`，不得將 reverse pair 合併
- 擇吉盤組裝年／月／日／時四星，每方向建立 YM／YD／YH／MD／MH／DH 六個 pair；中宮保留顯示但不搜尋、不排序
- 原盤／疊盤／擇吉為互斥模式；擇吉用途、方向、pair 與 layer 可由 URL 還原
- 方向判讀只顯示可解釋的「優先／可用／普通／吉凶並見／慎用」，不顯示數值分數或 `TOOL_HEURISTIC` 內部術語；雙星不入排序的邊界只在方向詳情以自然中文說明
- 尋組合支援有序／不分次序、六種 layer、日期 preset、一年上限、50 筆分批、deep-link 高亮，以及按用途 tags 反向搜尋
- Pair 學習卡分開來源 A／B／C、review、五行結構、適用條件與 reverse pair；無逐字引文時必須明示「尚未收錄可核對的逐字引文」
- 81 組是「結構與現代研究摘要完整」，不是「古訣全部已驗證」；未取得可追溯版本、頁碼／章節與逐字引文前，必須保持 `needs-review`、`verified=false`、`rankingWeight=0`
- 研究版已補齊 81 組現代摘要：A 20、A/B 3、B 53、B/C 3、C 2；但全部仍是 `needs-review`、`verified=false`
- 25／52、37／73、68／86 為明確 `orderSensitive`；時間 pair 的慢層第一碼／快層第二碼只是工具 convention
- 全部 81 組 `temporalUse=reference_only`、`rankingWeight=0`、`polarity=neutral`；pair 斷語、來源與用途 tags 不參與方向 verdict／ranking
- 擇吉九宮的年／月／日／時已改為由左至右的四欄橫排；八方與中宮共用版式，全部維持墨灰，不加入流刻或目前層高亮
- 每方已建立四時紫白 profile；professional UI 後主盤不顯示 `n/4`，實際命中層及集中程度保留在方向詳情
- 81 組底層新增 `evidenceForm`、`useContexts`、`directionality`、`verificationStatus`、條件、witnesses 與 variants；V1 A／B／C 只保留為研究簡寫
- 28／29 保存乾宮條件、31 保存庚方條件；48／98 是 reverse inferred；68／86 的直接解讀證據是宮星＋流年，不是年月日時古法
- 「死退雙臨始佳／不利」與 37 的疑似 36 轉錄均保留異文，不自動修文；全部 81 組仍 `primarySourceVerified=false`、`reference_only`、`rankingWeight=0`

### 紫白擇吉第三輪白中殺與時間狀態

- 本節的暗建、白中殺層級、支序有氣層級及 status 公式已被第四至六輪取代；墓絕、1／6／8／9 支序表及月令矩陣繼續使用
- `src/selection/temporalRules.ts` 集中保存星本宮、星宮五行、對宮、白中殺、墓絕、支序有氣及月令矩陣；只讀正式時間 API，不修改 Engine
- 穿心、六／七交劍、鬥牛及 classical 受剋的星宮定局繼續使用；一般宮星五行關係仍另列
- 墓、絕及支序有氣仍使用四層地支，但現行證據／用途是年 A active、月 A active、日 B+ active-secondary、時 C reference only
- 月令保存得令、得生、休、囚、受制，不換算固定分數；現行 status 見下方第六輪
- 宮格優先顯示白中殺／墓絕提示；方向詳情首屏顯示紫白主幹與雙星參考，時序條件及白中殺移到「為甚麼」，尋組合 deep-link 仍優先顯示命中 pair
- 刑宮、害宮、四空亡、24 山、納音、統臨／專臨、未有直接表的 active branches、81 pair 評分及固定權重均未實作
- 第三輪研究文件仍未附精確頁碼、逐字引文與原頁影像；`primarySourceVerified`／`verified` 不得因此提升

### 紫白擇吉第四輪 co-arrival 與月暗建修正

- 本節是歷史記錄。co-arrival、raw／qualified 及 classical 受剋分離繼續有效；暗建、layer role、白中殺層級及 status 已由第五／六輪修正。
- 移除 `purpleWhiteCount >= 2` 硬門檻；一個合格紫白已可成為正面訊號，多層同到再增強，一時／二時只保存為異文
- raw 到方與 qualified arrival 分開；合格條件為 1／6／8／9、支序有氣、無墓絕且無 classical killer
- classical 受剋殺與 generic 宮星五行關係分開；穿心、六七交劍、鬥牛定局保留
- 81 組仍是 `reference_only`、`rankingWeight=0`，用途及 pair 文字不參與方向 status／ranking

### 紫白擇吉第五輪暗建、白中殺與有氣分層

- 本節是歷史記錄。四層暗建、日時白中殺 reference-only、時支 C 級參考及傳本分層繼續有效；大月建、日白到方、日支有氣及 status 已由第六輪修正。
- `DirectionSnapshot` 保存年月日時各自的入中星；一般九宮暗建四層都計算，年月正式、日時類比參考。
- 暗建預設 `generic_jiugong`：1–9 分別為坎坤震巽中乾兌艮離。五黃四隅及 1／6／8／9 本宮加中宮另存異文，不與預設疊加，現階段沒有 UI selector。
- `computeDaYueJian()` 是獨立月干支飛宮介面；多年逐月比對未完成，固定為尚未評估、不 alias 月紫白入中星、不參與 ranking。
- 白中殺：年 A active、月 A active、日 B reference only、時 B reference only。主盤只消費年月 `activeHits`；日時在詳情顯示「白中殺類比：研究參考」。
- 支序有氣：年 A active、月 A active、日 B warning only、時 C reference only。五行生扶型有氣獨立保存且 `disabled`。
- layer role 為年作長期背景、月為 `seasonal_command`、日為 `day_gate`、時為細選／扶日；不建立百分比權重。
- 本段記錄當時狀態；日主 Gate 的 `not_evaluated` 已由 Day Gate V1 取代。時課仍為 `not_evaluated`，月納音仍為 `research`／`disabled`。
- status V5 只讓年、月白中殺與 active／warning temporal state 影響 verdict；日、時白中殺類比不直接降級。`ordinary` 繼續是無正面訊號且無警示的中性 fallback。
- 詳細 source map、測試、字體與 Browser 證據見 `docs/purple-white-fifth-round-layered-anjian-qi.md`。

### 紫白擇吉第六輪大月建合流與日白升級

- `computeDaYueJian()` 不再另算月干支序列，直接使用正式 `monthCenterStar` 的 `NATIVE_PALACE`；三組十二月共 36 / 36 型態由測試鎖定，五黃固定落中宮。
- 舊按年干起大月建法保留為 `enabled:false`／`deprecated_by_xieji` metadata，不提供錯盤 selector。
- 月暗建與大月建在方位結果上同位；底層術語來源分開保存，但只建立一個 `an_jian` active warning，主盤及詳情合流顯示「大月建／月暗建」，禁止 double count。
- 紫白到方與支序有氣分開：月、日是主層，年是背景，時白是 `active_light` tie-breaker；日白不再因當日地支未列直接有氣而整層失效。
- 支序有氣為年 A active、月 A active、日 B+ active-secondary、時 C reference-only；日支直接有氣可在無警示時將主層由可用細分為優先，時支只作同級細選參考。
- 白中殺維持年／月 active、日／時 reference-only；日、時 killer 不因本輪升級而變成 veto。
- 大月建單一 warning 不直落慎用；與二黑／五黃、其他年月 active killer 或非參考層墓絕疊加才升 caution。二黑五黃多層 safeguard 保留。
- 本段記錄當時狀態；日主 Gate 已由 Day Gate V1 評估，時課與月納音仍為 `not_evaluated`／`disabled`；V6 direction status 仍是工具分級。
- 詳細 source map、測試、字體與 Browser 證據見 `docs/purple-white-sixth-round-dayuejian-daywhite.md`。

### 紫白擇吉第七輪白中殺 9×6 矩陣封版

- `src/selection/whiteKillerMatrix.ts` 是六捷墓、一般九宮暗建、受剋、穿心、交劍與鬥牛的單一程式真相源；不得在 `temporalRules.ts` 另建重複表或用 generic 五行公式覆寫。
- 暗建輸入是各層入中星與目標宮；受剋／穿心／交劍／鬥牛輸入是目標宮的到方星；六捷墓輸入是到方星與該層時間地支。
- 矩陣鎖定：1 辰／坎／中／離；2 辰／坤／震巽／艮／鬥牛震巽；3 未／震／乾兌／兌；4 未／巽／乾兌／乾；5 辰／中／震巽／無穿心／鬥牛震巽；6 丑／乾／離／巽／交劍兌／鬥牛震巽；7 丑／兌／離／震／交劍乾／鬥牛震巽；8 辰／艮／震巽／坤／鬥牛震巽；9 戌／離／坎／坎。完整逐欄表見第七輪紀錄。
- 單層可有多殺陣列；例如八白到震／巽同時受剋、鬥牛，九紫到坎同時受剋、穿心。不得只保留第一個命中。
- 五黃暗建預設是中宮；四隅只是傳本異法。大月建／月暗建繼續合流且只計一次。
- 年月白中殺 active、日時 reference-only、日白主層、時白 tie-breaker 全部繼承第六輪；第七輪不改 status 權重、不依殺數線性加減。
- 第七輪「封版」只是程式規則級；原典固定版本、頁碼、完整逐字引文與原頁影像尚未入專案，`primarySourceVerified=false` 不得擅改。
- 詳細 source map、完整矩陣、測試、字體與 Browser 證據見 `docs/purple-white-seventh-round-white-killer-matrix.md`。

### Day Gate V1

- `src/selection/temporalRules.ts` 以十干固定五行及月令司氣判定日主旺、相、休、囚、死；旺相為 `pass`、休為 `mixed`、囚死為 `caution`。
- 月柱繼續取正式節氣月；Day Gate 另存司令五行。四立前十八個整日取土旺，其餘取春木、夏火、秋金、冬水；不改既有九星月令矩陣。
- `TimeGateAssessment.dayStatus` 已正式評估；`hourStatus` 仍為 `not_evaluated`。`rankingUse` 維持 `disabled`，表示 V1 顯示時間 Gate，但方向 `verdictFor()`／`rankDirections()` 不讀取它。
- Direction Detail 的年月日時四星下方先顯示「日課」，再顯示方向 verdict；UI 明示四柱沖合、時辰扶日尚未納入。
- 考源定案、原始規劃 checksum、六個研究問題及來源狀態見 `docs/day-gate-v1-authoritative-rules.md`。固定版本《造命宗鏡集》原頁尚未入 repo，`primarySourceVerified` 維持 `false`。

#### Reserved future capability — 最佳時窗

尋星模組的長期目標包含「最佳時窗」搜尋與排序。

當前版本只負責 deterministic matching，不加入吉凶評分與推薦邏輯。

未來 `RankingEngine` 應消費既有 `SearchMatch[]`，而不是重新計算年月日時刻飛星。

因此目前不得把 `SearchEngine` 寫死為只能處理單星單層，也不得讓搜尋結果資料模型只適用於 A 類單星搜尋。

後續 refactor 不得刪除此 extension point。

---

### Direction Gate V1 規則封版（尚未實作）

- 產出 `docs/direction-gate-v1-authoritative-rules.md`；本輪為接手指南 §5 Phase N0 的 read-only 考源封版，**沒有任何 production code 變更**
- 原始研究 `紫白擇吉_DayHourDirection_Gates_V1_Claude實作整合稿.md`，SHA-256 `181f2cef0d88a55d555836b8efa2f8b2d7a4d0faa7d4eee5a8b503c6a72975ac`；檔名寫三個 Gate，實際只有第十輪 Direction Gate，與 `紫白擇吉_第十輪考源_DirectionGate_歲破月破三煞.md` byte 相同
- 接手指南 §1 所引 `紫白擇吉_下一階段研究規劃_DayGate優先.md`（`e45f1402…`）已不存在；`~/Downloads` 全樹 958 個 md／txt 無任何檔案命中該 checksum。Day Gate V1 已依該檔封版實作，本輪不回溯
- 可封版：歲破＝太歲支對沖山、月破＝節氣月建對沖山、三煞四組公式（年月日共用同表）、24 山 mapping 與角度、三煞為三個連續 15° 山跨三個八宮、partial hit／coverage 模型、overlap 並列不做數值相抵、不自造時三煞、太歲方不等於凶方
- 型別分離已定案：Time Gate 的「破日」用 `dayMonthBreak`（月支沖日支），Direction Gate 的「月破方」用 `monthBreakMountain`（月支對沖山），兩者都不得叫 `yuePo`，且不可重複扣分
- **所有 severity 一律保留 `reference_only`／`rankingUse: 'disabled'`**：研究稿引《協紀辨方書》〈選擇要論〉〈三煞伏兵大禍〉、《造命宗鏡集》、《選擇紀要》、《通書》，但未給卷次、頁碼、版本或原頁影像，因此 `primarySourceVerified` 全部維持 `false`；依指南 §12，未補證據前不得把歲破設成 hard veto
- 架構決策：紫白飛星用八宮 45°、方位神煞用 24 山 15°，兩套 spatial resolution 共存；八方 UI 只能顯示「本宮含受影響山」，不得把整宮等同犯煞
- `src/` 目前完全沒有六沖、24 山或三煞程式碼，Direction Gate 為全新實作；下一輪順序見規則文件 §11

### Hour Gate V1 規則封版 + 三 Gate 整合契約（尚未實作）

- 產出 `docs/hour-gate-v1-authoritative-rules.md` 與 `docs/gates-v1-integration.md`；同為 read-only 考源封版，**沒有任何 production code 變更**
- 原始研究 `紫白擇吉_第九輪考源_HourGate_V1封版.md`，SHA-256 `176c41c2b5fc721b6c70d6e9d95f8ab262eae512564aeb3e7170b9c50f5d9468`
- 使用者原以為已交付「Day／Hour／Direction 三 Gate 整合稿」；經比對該檔（`181f2cef…`）與第十輪 Direction Gate byte 相同、Gate 標題出現次數一致（Day 5／Hour 3／Direction 16），內容只有 Direction Gate。第九輪 Hour Gate 由磁碟原檔補齊，三 Gate 至此齊備
- Hour Gate 可封版：時＝日之用（時白不得推翻不合格時辰）、時破＝日支沖時支且為 structural veto、時沖月令／歲君有明文「小事可勿論」豁免故不得全域 reject、五不遇＝時干剋日干十組定局且不混入時支剋日支、時刑為有向關係、日害列 mild caution、時建／六合／三合／時干扶日／十干日祿時、正負關係可並存不做分數抵消、祿時不凌駕時破與五不遇、旬空與截路空亡只作 activity-specific
- **整合契約最重要的成果**：同一組六沖被六個名目消費（破日 `dayMonthBreak`、時破 `hourBreak`、時沖月令 `clashMonth`、時沖歲君 `clashYear`、歲破方 `suiPoMountain`、月破方 `monthBreakMountain`）。全部共用單一 `isClash()` primitive，同一 clash fact 只登記一次，Gate 間不做數值相加，且禁用 `yuePo` 這個曾指涉兩種不同概念的名字
- 三 Gate 一律 `rankingUse: 'disabled'`；`verdictFor()`／`rankDirections()` 不得讀取任何 Gate 欄位，實作時須附 regression test
- 證據狀態：第八輪有卷次且附 ctext 連結、第九輪有卷次但無連結、第十輪僅有篇名。三輪皆 `primarySourceVerified = false`，第十輪最弱故 severity 全部 `reference_only`
- `daily`／`construction` 模式的使用者選擇方式尚未定義；規格確定前一律以 daily 為預設語義

### Hour Gate V1 組裝 `hourGate.ts`（已實作）

- `src/selection/hourGate.ts` 完成 `docs/hour-gate-v1-authoritative-rules.md` §12 第 3 步。四柱一律取 canonical `TemporalPillars`，不另建第二套四柱。
- 匯出：`HourGateStatus`、`SelectionMode`、`ClashSeverity`、`HourGateReason`、`HourGateConflicts`、`HourGateSupport`、`HourGate`、`HourGateOptions`、`buildHourGate`。全部純函式。
- **`TimeGateAssessment.hourStatus` 仍為 `not_evaluated`**，本檔不寫回。依 §11 stop condition 2，改為正式狀態需使用者明確批准；regression test 已鎖定。
- precedence 依 §7：時破 → reject；construction 且沖月令／歲君 → reject；五不遇 → caution；時刑或日害 → 至少 mixed；無衝突且有支持 → preferred；否則 pass。**positive support 不得把 reject 翻回 pass**。
- **實作補洞（已補記為規則文件 §7.1）**：§7 未規定 daily 模式的沖月令／歲君落哪一級，照字面實作會讓「daily ＋ 沖月令 ＋ 日祿」得到 `preferred`，與 §4 列為 `warning` 矛盾。實作取**下限**：§4 把沖月令列 B 層、時刑／日害列 D 層且已對應 `mixed`，B 層不可能比 D 層輕，故 daily 同落 `mixed`。這是由文件自身分層推出的地板值，不是自創 severity；日後若補到原典對 daily 強度的直接說法，應以原典為準。
- 關鍵 fixture：**辛日酉時（丁酉）同時是日祿與五不遇 → 必須 caution，不得 preferred**；申日寅時同時是時破與時刑（寅申六沖）→ reject 且日祿仍完整列出；巳日申時同時是六合與刑；自刑支日時相同時同時是時建與時刑。測試選案例時須注意六沖與刑的重疊，例如未日丑時同時是沖與刑，不能用來單測時刑。
- `rescuesWeakDay` 只是標記：V1 不讓它改變 `status`、不寫回 Day Gate，且在有 structural veto 或五不遇時恆為 false（§4.2「不能救破日、時破這類 structural veto」）。
- 旬中空亡與截路空亡未實作（原典明文「忌出行，不忌葬事」，不可作 universal penalty），`activitySpecific` 恆為空物件。
- `reasons` 為穩定代碼 union，非中文句子，延續前幾輪的做法。
- 本輪仍無 UI import 端；production bundle 仍為 `index-ByhQ1c1Q.js` 164.33 kB、single file 545,356 bytes。
- 下一步：Hour Gate §12 第 4 步是 UI 最小顯示，與 Direction 層 UI 同樣卡在來源字型；兩者可合併為同一個 UI 輪。

### Hour Gate 三張表 `hourGateTables.ts`（已實作）

- `src/selection/hourGateTables.ts` 完成 `docs/hour-gate-v1-authoritative-rules.md` §12 第 2 步：五不遇十組定局表、十干日祿時表、時干扶日五行關係。
- 匯出：`isFiveBuYu`、`fiveBuYuGanzhiFor`、`isDayLuHour`、`dayLuBranchFor`、`HourStemSupport`、`assessHourStemSupport`、`isSupportiveHourStem`。全部純函式。
- 五不遇採**十組定局表**，不用「時干剋日干且同陰陽」的 generic 推導（§1.3），且**不把時支剋日支混入**——《協紀》卷七專門校正過此點。表與五鼠遁的一致性由測試驗證，但一致性是驗證手段、不是取值來源。
- 日祿時：甲寅、乙卯、丙巳、丁午、戊巳、己午、庚申、辛酉、壬亥、癸子。戊祿在巳、己祿在午與丙丁同位，是定局不是筆誤，測試明文鎖定。
- `temporalRules.ts` 新增 `elementRelationBetween()`（複用既有 `GENERATES`／`CONTROLS`），時干扶日由此導出，**不另建第二套五行表**。`HourStemSupport` 的 `neutral` 經 100 組全枚舉確認 V1 永不回傳，型別保留只為對齊規則文件 §8。
- **本輪新發現，下一輪必用**：日祿時與五不遇時**恰有一組重疊**——`辛日酉時 = 丁酉`，既是辛祿也是辛的五不遇；其餘九干各自落在不同時辰。規則文件 §3.2 因此有唯一具體案例，已補記為 §3.2.1。**組裝層 precedence 測試必須以辛日酉時為 fixture，不可假設祿時與五不遇互斥。**
- V1 只把 `same_element` 與 `generates_day` 當正面訊號；洩、耗、剋在 V1 不作負面扣分，因研究稿未給強度且 Gate 不做數值抵消。
- 本輪仍無 UI import 端；`elementRelationBetween()` 未被 UI 消費故被 tree-shake，production bundle 仍為 `index-ByhQ1c1Q.js` 164.33 kB、single file 545,356 bytes（僅 sourcemap 因原始檔變長而由 492.46 kB 增為 493.00 kB）。
- 下一步：`HourGate` 組裝與 precedence（§12 第 3 步），`rankingUse` 維持 `disabled`，須附 regression test。

### Direction Selection V2 組裝 `directionSelection.ts`（已實作）

- `src/selection/directionSelection.ts` 完成 `docs/direction-positive-v1-authoritative-rules.md` §11 第 7 步。Direction 層的 constraints 與 positives 至此併成單一結果，但**不產生綜合判定**。
- 匯出：`PositiveHitCoverage`、`DirectionAssessmentReason`、`DirectionSelectionContext`、`DirectionSelectionSource`、`DirectionPositives`、`DirectionSelectionAssessmentV2`、`buildDirectionSelectionContext`、`buildDirectionSelectionAssessment`、`buildDirectionSelectionAssessments`。全部純函式。
- 六德、三德叢聚、月金匱只依年干與月支，抽為全盤層 `DirectionSelectionContext` 算一次，八宮共用；宮位相關的只有「該山是否落在本宮」。
- **architecture invariant 已落實且測試鎖定**：本檔沒有任何抵銷路徑。關鍵案例為己酉年未月震宮——甲山得三德叢聚（己年歲德甲、未月天德甲、未月月德甲），卯山同時犯歲破與年三煞——測試確認兩者完整並存、各自 `matched` 正確、`reasons` 為 `[constraint_sui_po, constraint_year_san_sha, positive_virtue, positive_san_de_cong_ju, reference_month_jin_kui]`，並掃描序列化輸出不得出現 `cancel`／`suppress`／`resolved`／`score`／`total`。
- `reasons` 收窄為穩定代碼 union（規則文件 §7 原作 `reasons: string[]`），理由同 `DirectionGateNote`：接手指南 §7 要求計算層回傳結構資料、UI 才翻譯中文。`PositiveHitCoverage` 與 negative 的 `DirectionHitCoverage` 刻意分開命名，避免把「本宮受煞幾山」與「本宮得吉幾山」誤用成同一欄位。
- `positives.virtues` 只含落在本宮者；六項全貌（含 `outside_24_mountains` 與 `none`）留在 context，因為那是全盤層資訊，不屬於任何一宮。
- regression 已附：計算 V2 前後八方 verdict 與排序完全相同；`DirectionEvaluation` 序列化後不含任何 V2 token；十天干×十二月支枚舉下 `status` 恆為 `not_evaluated`、`rankingUse` 恆為 `disabled`。
- 本輪仍無 UI import 端，production bundle 仍為 `index-ByhQ1c1Q.js` 164.33 kB、single file 545,356 bytes，與前四輪 byte 相同。
- **下一步是 UI（§11 第 8 步），必須獨立成輪**：會新增「歲德：戊，此值不在二十四山」「本月官方曆例無合」這類中文，依接手指南 §9 須重建自帶字體 subset 並記錄字元數、glyph 數、bytes 與 WOFF2／source SHA-256，另須驗 PWA precache、single-file data URI 與 320／375／390／430px 無 overflow。主九宮只能顯示「本宮含受影響／得吉山」，不得 overclaim 為「南方大凶」。

#### UI 輪目前被來源字型卡住（2026-08-10）

實測 Direction 層 UI 所需新增字元，僅 5 個不在現有 subset：

```text
匱 叢 德 歲 響
```

但 `德`、`歲` 是六德的核心詞彙，無法迴避；而 `scripts/build-font-subset.py` 要求
`NotoSerifCJKtc-Medium.otf`，SHA-256 `da0a79ee44322329dd9ff87d2cc878dc897c5180195e3f9b6cd4c8569781e887`
（以 `--source` 參數或 `ZIBAI_FONT_SOURCE` 提供）。

現況：repo 內只有 OFL、glyph inventory 與產物 WOFF2，沒有來源 OTF；執行環境亦只有
Noto Serif CJK **Regular／Bold 的 .ttc**，沒有 Medium `.otf`。

**不得用 Regular 或 Bold 頂替**：那會靜默更換品牌字體並使已記錄的 source checksum 失效，
違反接手指南 §9「取得相同官方 Noto Serif CJK TC Medium source 後，先核對 source checksum，
再重建 subset」。

因此 UI 輪需使用者先提供該 OTF，才能開始。取得後的步驟：核對 source checksum → 重建 subset →
記錄新的字元數／glyph 數／bytes／WOFF2 SHA-256 → 驗 preload、PWA precache 與 single-file data URI
→ 四寬度 overflow 實測。

### Direction Positive Evidence `directionVirtues.ts`（已實作）

- `src/selection/directionVirtues.ts` 完成 `docs/direction-positive-v1-authoritative-rules.md` §11 第 4–6 步。與 `directionGate.ts` 是**分離的兩個 channel**：constraints（歲破／月破方／三煞）與 positives（六德／三德叢聚），不得混為一鍋。
- 匯出：`DirectionVirtueCode`、`CentralStem`、`VirtueRawValue`、`VirtueSpatialPosition`、`DirectionVirtueEvidence`、`DirectionVirtueOptions`、`resolveVirtueSpatialPosition`、`getDirectionVirtues`、`SanDeCongJuResult`、`detectSanDeCongJu`、`getMonthJinKuiBranch`、`MONTH_JIN_KUI_POLICY`、`listMonthJinKuiByGroup`、`TIAN_DE_HE_CORNER_VARIANT_ID`。全部純函式。
- `getDirectionVirtues()` 恆回傳六項、不預先過濾，讓呼叫端能區分三種情況：落在某山、值為戊己故無外方、本月官方曆例無合。`resolveVirtueSpatialPosition()` 明確不做 `as Mountain24`。
- 空間狀態命名為 `outside_24_mountains` 而非 `central_stem`：可確認的只有「二十四山無戊己」，「因而屬中宮、因而無方」是應用推論。行為不變，但不冒充古法定例。全枚舉 9 例由測試鎖定。
- **層級**：天德／月德 `primary_virtue`、天德合／月德合 `combined_virtue`；**歲德與歲德合同為 `primary_virtue`**（《協紀》「並屬上吉」）。不得對三家統一二分。
- **`primarySourceVerified` 分層**：天德、天德合、月德、月德合為 `true`（已逐字核對《御定星厯考原》四庫本卷三）；歲德、歲德合為 `false`（只有篇名與連結，未親自讀取）。這是本專案首批達到固定版本原文標準的規則，其餘全部規則仍為 `false`。
- 天德合四維互合異文 `defaultEnabled: false`，啟用後標 `sourceMode: 'variant'` 且仍不參排序；非四仲月不受影響。四仲月 default 維持官方「無合」，不自動補。
- 三德叢聚由三張表計算而非寫死四組；120 組全枚舉恰 8 組、對應甲庚丙壬四山，與古籍〈三德格〉一致，戊癸年恆 false。識別碼正名 `detectSanDeCongJu`。月金匱複用 `SAN_HE_GROUPS[].center`，`evidenceStatus: 'source_tension'`。
- 測試自備天干五合表驗證推導不變式，**不從 production 匯入**，避免循環論證。另有一條測試鎖定計算層輸出不得內嵌中文句子（延續上一輪 `note` 被字體測試擋下的教訓）。
- 本輪**沒有** UI，`directionVirtues.ts` 仍無 import 端；production bundle 仍為 `index-ByhQ1c1Q.js` 164.33 kB、single file 545,356 bytes，與前三輪 byte 相同。`rankingUse` 全部 `disabled`，severity 依使用者決定維持 `reference_only`。
- 下一步：`DirectionSelectionAssessmentV2` 組裝（§11 第 7 步），把 constraints 與 positives 併成單一結果並附 regression test；UI 屬第 8 步且需重建字體 subset，應獨立成輪。

### Direction Gate V1 組裝 `directionGate.ts`（已實作）

- `src/selection/directionGate.ts` 完成 `docs/direction-gate-v1-authoritative-rules.md` §11 第 3 步。第十輪的負面 constraints 至此可運作，但**不產生吉凶**。
- 匯出：`DirectionShaRule`、`SpatialResolution`、`SpatialTarget`、`MountainHit`、`DirectionGateNote`、`DirectionGateAssessment`、`DirectionShaSource`、`DirectionShaAffected`、`getDirectionShaAffected`、`buildDirectionGateAssessment`、`buildDirectionGateAssessments`。全部純函式，只消費 `mountains24.ts` 與 `branchRelations.ts`。
- V1 政策欄位固定：`status: 'not_evaluated'`、`precision: 'palace8'`、每個 hit 的 `rankingUse: 'disabled'`／`gateUse: 'reference_only'`／`evidenceLevel: 'C'`。第十輪只有篇名級引用，是三輪 Gate 中最弱，**不得因算法 deterministic 就調高強度**。
- 五條規則：`sui_po`、`month_break`、`year_san_sha`、`month_san_sha`、`day_san_sha`。**未建立 `hour_san_sha`**（核心文本作「年月日之凶神」），測試鎖定。`sui_po`／`month_break` 是方位層對沖山，與 Time Gate 的 `dayMonthBreak`（破日）語義不同，不得共用欄位；`yuePo` 仍為禁用名。
- `hits` 只保留實際命中本宮者，未命中的規則不入列；整體 `coverage` 取命中山的**聯集**，同一山被多條規則命中不重複計入。但五條 hit 各自登記、並列保存：年支＝月支時歲破與月破方必然同山，測試鎖定兩者仍分別出現，不合併、不相抵。
- **偏離規則文件一處**：§8 寫 `note: string`，實作收窄為 `DirectionGateNote = 'v1_reference_only_not_evaluated'`。理由是接手指南 §7「計算層回傳穩定、可測試的結構資料；UI 才翻譯成自然中文」，且在 `src/**` 字串常量新增中文會擴大自帶字體 subset（由 `tests/v21Assets.test.ts` 鎖定）。初版曾誤放中文句子，被字體測試擋下後改正。UI 層負責翻譯此代碼。
- **regression 已附**（規則文件 §6、整合契約 §6 要求）：計算 Direction Gate 前後八方 verdict 與排序完全相同；`DirectionEvaluation` 序列化後不含任何 Gate 專屬 token；被歲破或三煞命中的方向不因此被推到排序末端；四個不同時間點的 Gate 命中宮數確實變動，證明不變性不是因為 Gate 恆空。注意 `not_evaluated` **不可**用作洩漏判準——既有 `TimeGateAssessment.hourStatus` 本來就是這個值。
- `directionGate.ts` 目前仍無 UI import 端，production bundle 仍為 `index-ByhQ1c1Q.js` 164.33 kB、single file 545,356 bytes，與前兩輪 byte 相同。
- 下一步：六德正面 evidence（`getDirectionVirtues()`／`detectSanDeCongJu()`），與本層分成 constraints／positives 兩個 channel，見 `docs/direction-positive-v1-authoritative-rules.md` §11 第 4–6 步。

### Direction Positive Evidence V1 獨立考源覆核（文件修訂，無程式變更）

- 以**不含本專案任何結論、表值或推導**的中性提問清單，交由另一模型獨立查證後逐項對比。覆核稿 `紫白擇吉_六德三德月金匱_獨立考源覆核.md`，SHA-256 `f65311d3e46298c9de775e45b3fa470e4bd759560f7f626779a5d0249367aeac`，依使用者決定只記 checksum，原檔不收進 repo。
- **資料層零差異**：六德六張表 80 格、9 個中宮干例、8 組三德聚方全部相同。兩邊分別由古籍查表與 120 組全枚舉得出同一結果。**六張表的值不改。**
- **已核對固定版本原文**：《御定星厯考原》四庫全書本卷三（維基文庫公有領域全文）已實際讀取，天德十二月表、天德合十二月表與「四仲之月天德居四維故無合也」、月德十二月表、兩條合德按語、天德月德方日兩用，全部逐字對上。天德表是六張表中唯一無法由五合推導者，故最需要核對。這些條目升為 `primarySourceVerified = true`，是本專案首批達到此標準的規則。
- **新發現一（異文）**：卷三月德合條作「二六十月在**巳**」，但同條按語作「各以月德所合之**干**為之」，甲之五合為己，故正字應為己，此本屬形近訛。表值取己，異文照錄不修文，比照 81 雙星「37 疑似 36 轉錄」的處理。
- **新發現二（寄宮歸屬）**：卷三〈隂陽不將〉確有「戊為陽將寄於艮，己為隂將寄於坤」。該映射**是原典而非杜撰**，但綁定在陰陽不將這條擇日規則，屬其專屬。禁止六德套用的結論不變，理由改為「有明確歸屬，適用範圍不含六德方位」。不同規則須依各自原典決定戊己處理，不可全局套一張寄宮表。
- **修訂一**：戊己欄位由 `central_stem` 改為 `outside_24_mountains`。可確認的只有「二十四山無戊己」；「因而屬中宮、因而無方」是對六德的應用推論，未查得原典明文。行為不變，理由降級為工具保守策略。
- **修訂二（最重要）**：月金匱的撤回理由是**片面摘引**。《協紀》〈火星〉另有「月家金匱方，今通書不載，然亦有理」並保留完整起例與條件（諸吉同到則吉、四仲月會月建須避），與〈附論〉的「金匱星今亦不用」並存。V1 結論不變，改記為 `evidenceStatus: 'source_tension'`；UI 不得寫成「《協紀》認為金匱無用」。
- **修訂三**：六德層級不可三家統一二分。天德／月德 primary、天德合／月德合 secondary 有〈月吉神總論〉依據；但歲德與歲德合《協紀》作「並屬上吉」，同級，不得把歲德合降一級。「歲德偏剛、歲德合偏柔」屬編者意通且自陳「選擇家未論及此」，不得轉成 ranking 權重。
- **修訂四**：「三德叢聚」是古籍既有名詞，《新刊類編陰陽選擇合併通書大全》卷十二〈三德格〉列出的四組年月與全枚舉完全吻合，8 組不再只是本專案推導。程式識別碼正名 `sanDeCongJu`；原研究稿的 `sanDeCongJi` 屬誤植。
- **修訂五**：新增精度原則——空間解析度不是全域常數，須看原典是「占一字」（六德、歲破、月破方、三煞，15°）或「飛一宮」（飛宮神煞，整宮 45°，《協紀》「震宮統甲卯乙三位」）。**既有大月建／月暗建與白中殺屬飛宮型，本就是整宮語義**，不得因新增 24 山而回頭改成單山。
- **severity 未升級**：覆核稿建議 construction 模式可進 ranking，但依使用者決定維持 `reference_only`／`rankingUse: 'disabled'`。理由：已核對的原文是曆例與用途語而非強度定量；建議所依據的〈月吉神總論〉等條目本輪未親自讀取；construction／daily 模式的選擇 UI 規格仍未定。升級 severity 仍是 stop condition。
- **尚未親自核對**：《協紀辨方書》〈月吉神總論〉〈火星〉〈制煞要法〉〈諸家年月日吉凶神附論〉、《造命宗鏡集》卷五、《通書大全》卷十二、《三命通會》〈論天月德〉。這些已有篇名與連結，下一輪可逐條核對後再升級 `primarySourceVerified`。
- 本輪**只改文件**：`src/` 與 `tests/` 零 diff，測試數與 build 產物不變。

### 24 山幾何 `mountains24.ts`（已實作）

- `src/selection/mountains24.ts` 是方位神煞層的唯一空間真相源，對應 `docs/direction-gate-v1-authoritative-rules.md` §11 的第 1、2 步。紫白飛星到方繼續用八宮 45°，方位神煞用 24 山 15°，兩套解析度並存。
- 匯出：`Mountain24`、`MOUNTAINS_24`、`MOUNTAIN_ARC_DEGREES`、`isMountain24`、`mountainBearing`、`palaceOfMountain`、`mountainsOfPalace`、`getSuiPoMountain`、`getMonthBreakMountain`、`getSanShaMountains`、`listSanShaByGroup`、`DirectionHitCoverage`、`MountainHitResult`、`getMountainHitsForPalace`。全部純函式，不讀 DOM／localStorage／URL state。
- 24 山以**單一有序表**保存（起於壬，順時針）；方位角與八宮歸屬皆由索引導出，不另建第二張映射表。子 0°、卯 90°、午 180°、酉 270°，壬跨 0° 邊界為 345°。角度僅供未來 compass 使用，V1 不做羅盤、不分磁北／真北。
- 歲破山與月破方共用 `branchRelations.ts` 的 `oppositeBranch()`；三煞完全由 `SAN_HE_GROUPS` 經 `opposingTrineBranches()` 導出，**沒有第二張三煞表**。年、月、日三煞共用同一函式，未建立時三煞。
- `isMountain24()` 已備，供下一輪六德判斷戊、己是否有外方使用；24 山不含戊己，測試已鎖定。
- partial hit 是必要概念：`getMountainHitsForPalace()` 回傳 `matched` 與 `none / partial / full`。測試鎖定十二支的三煞在任一八宮皆不產生 `full`，且 `matched` 依羅盤次序回傳、重複輸入不重複計算。同一山可同時被歲破、月破方、三煞命中，三條 hit 並列保存、不做數值相抵。
- **術語校正（資料未改）**：規則文件 §4 稱三煞為「三個連續 15° 山」。實際上三煞三支在**十二地支環**上相鄰，但在 **24 山環**上相隔 30°，中間夾天干山——例如三煞亥子丑之間夾壬、癸，而壬、癸並不命中。原文措辭應理解為四正「一帶三山」的傳統說法。程式註解與測試已明確鎖定此行為；依「不自行修文」原則，`docs/direction-gate-v1-authoritative-rules.md` 原句未改，是否補註由使用者決定。
- 本輪**只有**幾何 primitive 與測試：沒有組裝 `DirectionGateAssessment`、沒有改 `src/selection/types.ts`（`DirectionHitCoverage` 暫定義於本檔）、沒有 UI 變更。`mountains24.ts` 目前無任何 import 端，production bundle 仍為 `index-ByhQ1c1Q.js` 164.33 kB、single file 545,356 bytes，與上一輪 byte 相同，可證明零 runtime 影響。
- 下一步：`DirectionGateAssessment` 組裝（`status` 恆 `'not_evaluated'`，須附 regression test 證明 `verdictFor()`／`rankDirections()` 輸出不變），之後才是六德正面 evidence。

### Direction Positive Evidence V1 規則封版（第十一至十三輪，尚未實作）

- 產出 `docs/direction-positive-v1-authoritative-rules.md`；本輪為接手指南 §5 Phase N0 的 read-only 考源封版，**沒有任何 production code 變更**，`src/` 零 diff。
- 原始研究 `紫白擇吉_第十一至十三輪_正面DirectionGate與三德金匱總結.md`，SHA-256 `c429963ad14e2b337b0efd35c150e4ba5bc7eeb0b100297db2220732eb53f46e`（1,864 行）。依使用者本輪決定只記 checksum，原檔不收進 repo。
- 補足 Direction Gate 的**正面**條件：第十輪回答「哪些方向要避」，本三輪回答「在沒有犯重大 Gate 的前提下，哪些方向有古法上的正面依據」。
- 可封版：六德六張表（歲德、歲德合、天德、天德合、月德、月德合）、合德＝本德五合干、月德／月德合依三合局、三德＝歲德＋天德＋月德（不含合德）、三德聚方全枚舉恰 8 組年干×月支對應甲庚丙壬四山、六德精度為 24 山而非整宮、正面 evidence 必須是陣列且 overlap 並列。
- **兩個空間例外必須保留**：戊、己為中宮干本無 24 山外方（全枚舉共 9 例，含歲德戊癸年、歲德合甲己年、天德合未申月、月德合卯未亥月），一律回傳 `central_stem` 不產生方位 boost；天德合在子、卯、午、酉四仲月官方曆例作「無合」，不得自動補四維互合。乾↔艮、巽↔坤互合只保存為 `tian_de_he_corner_directional_variant`，`defaultEnabled = false`。**禁止自造戊己寄宮。**
- **第十三輪是刪規則**：月金匱撤回為 `reference_only`／`rankingUse: 'disabled'`。《協紀辨方書》指出同一帝旺既稱金匱吉又稱大煞／打頭火凶，固定吉論自相矛盾，故「金匱星今亦不用」。可計算、只在詳情顯示、不進排名，但比照 81 雙星不刪資料。
- **architecture invariant**：正面 evidence 不得翻轉 structural veto。禁止 `if (sanDeCongJi) { suiPo = false; sanSha = false; }`，禁止數值化總分與正負抵消，禁止「命中 2 個六德＝priority」這類古法未明載的硬閾值。`virtueCancelsKiller = false`，但 UI 文字不得寫成「六德不能制煞」——V1 只是不具備判定制化成功的條件。
- 六張表的八組推導關係已用全枚舉程式核對自洽；實作時應以推導不變式加測試鎖定，但六張表仍須明列（天德十二項無法由五合推出）。月德與月金匱一律複用 `src/selection/branchRelations.ts` 的 `SAN_HE_GROUPS`（月金匱＝`.center`），**不得新建第三張三合表**。
- 研究稿 §七 名為 Migration Checklist，但本專案 Direction Gate V1 至今仍是 0 行 production code，因此沒有既有結構需要遷移；§37 的 `DirectionSelectionAssessmentV2` 是第一版就要直接採用的結構，negative constraints 與 positive evidence 應一次做成分離 channel。
- 證據狀態：本三輪引《協紀辨方書》《星曆考原》《造命宗鏡集》《選擇紀要》，但**只有書名，無卷次、頁碼、版本或原頁影像**，定位精度同第十輪或更弱。因此曆法算法可封版，強度與適用性不可封版，全部 severity 保留 `reference_only`／`rankingUse: 'disabled'`，`primarySourceVerified = false`。
- 實作順序見規則文件 §11：正面 evidence 依賴 24 山幾何，**必須排在第十輪負面規則之後**。

### 地支關係 primitive `branchRelations.ts`（已實作）

- `src/selection/branchRelations.ts` 是全專案六沖、六合、六害、三合、刑的**唯一**實作；`docs/gates-v1-integration.md` §1／§8 的契約至此落地。三個 Gate 之後只能消費本檔，不得另建第二套地支關係表。
- 匯出：`isClash`、`oppositeBranch`、`isSixHarmony`／`sixHarmonyBranch`、`isSixHarm`／`sixHarmBranch`、`isSameSanHeGroup`／`getSanHeGroup`／`SAN_HE_GROUPS`／`opposingTrineBranches`、`isPunishment`／`isSelfPunishment`。全部純函式，不讀 DOM／localStorage／URL state，只 import `src/engine/time/ganzhi` 的 `BRANCHES`／`Branch` 型別。
- 六沖以原典 truth table 明列，不靠隱式索引運算；測試以全部 144 組地支組合鎖定 `isClash(a, b) === (oppositeBranch(a) === b)`，並另鎖 `oppositeBranch` 等同「相隔六位」且為對合。
- 三合為單一資料源，每組另存仲支 `center`。Direction Gate 的三煞由 `opposingTrineBranches()` 導出「對面三支」（申子辰→巳午未、寅午戌→亥子丑、亥卯未→申酉戌、巳酉丑→寅卯辰），測試鎖定三支恆連續、中心為仲支對沖支、與本局三支不重疊，並涵蓋寅午戌跨 0° 邊界。24 山映射與 coverage 仍屬 Direction Gate 範圍，本檔不做。
- 刑是**有向**關係，參數次序固定為 `(dayBranch, hourBranch)`：申日寅時為刑、巳日寅時不是。測試涵蓋寅→巳→申→寅與丑→戌→未→丑兩個單向循環的正反例、子卯雙向、辰午酉亥自刑，並證明整體並非對稱關係，避免退化成「同組即成立」。
- 正負關係可並存已由測試鎖定：巳日申時同時是六合與刑；自刑支日時相同時同時成立時建與時刑。primitive 不做任何抵消或評分。
- 本輪**只有** primitive 與測試：沒有組裝 `HourGate`／`DirectionGate`，沒有改 `src/selection/types.ts`，沒有動 `TimeGateAssessment.hourStatus`，沒有 UI 變更。`branchRelations.ts` 目前無任何 import 端，production bundle 與 single-file 產物 byte 數皆與上一輪相同，可證明零 runtime 影響。
- 下一步依 `docs/hour-gate-v1-authoritative-rules.md` §12：五不遇十組定局表、日祿十干表、時干扶日五行關係與測試。

## 驗證結果

```text
test files  32 passed
tests       340 passed（198 基線 + 28 branchRelations + 21 mountains24 + 15 directionGate
            + 23 directionVirtues + 15 directionSelection + 16 hourGateTables + 24 hourGate）
build       production success
PWA font    preload + precache（單一 entry）success
PWA precache 11 entries（461.53 KiB）success
single file 玄空紫白.html（545,356 bytes；font data URI）success
```

真實 production 瀏覽器已驗證：

| viewport | overflow | 九宮 | 最小主頁按鈕 |
|---|---:|---:|---:|
| 320 | 無 | 296×296；cell 98×98 | 44px |
| 375 | 無 | 343×343；cell 113.7×113.7 | 44px |
| 390 | 無 | 358×358；cell 118.7×118.7 | 44px |
| 430 | 無 | 398×398；cell 132×132 | 44px |
| 560 | 無 | 528×528；cell 176×176 | 44px |
| 768 | 無 | 568×568；cell 188.7×188.7 | 44px |

另驗證：

- 日期 Sheet apply、Esc、focus return
- 320 / 375 / 390 / 430 native date/time shell 無 clipping；兩個 input 都維持 `appearance:auto`
- date/time focus：shell 1px border + 2px outline；input 0 border + no outline
- 品牌字體 `document.fonts.check()` 命中；914 個目前必要 UI 字元均已覆蓋，WOFF2 cmap 914／915 glyphs／243,864 bytes，production font 與 public font SHA-256 均為 `961d5494cfda720af1965b478ac10cb6d066fb87003953aed50669650a37b790`
- 日期時間列在 320／375／390／430px 均無 overflow；右側「今／回到今」維持 64px 並以 baseline 對齊，左側日期位置不因文案長度跳動
- TopBar 兩個 SVG 均為 1.5px stroke
- 主頁一個「今」、無常駐 UTC+8；TimePicker／Settings 仍顯示 UTC+8
- LevelSegment tab 語意、完整鍵盤操作、八刻 8-item Sheet 與 contextual CTA 流程正常
- Settings Sheet 80dvh + 內部 scroll
- simple／study 持久化
- Explain chain／source
- 完整 child／ke 流程
- 明確 URL 與舊 `home=true`
- browser console 無 error／warning
- 疊盤 OFF 保留原 NinePalaceGrid；ON 顯示 9 宮 × 5 層，選宮與詳情 Sheet 正常
- 尋星 A/B、同層 OR／跨層 AND、上層顯示、日期分組、loading／empty state 與跳盤正常
- production 320／390px 疊盤及尋星無 horizontal overflow；主要 touch target ≥ 44px
- production 320／375／390／430px 的排盤、疊盤、簡易搜尋均無 horizontal overflow
- 320px 疊盤 9 宮 × 5 層維持單列；主顯示跟隨唯一層級列，選宮後只有一個強焦點
- 320px 進階條件可展開／收合並保留設定；結果整列可點，命中層以朱砂色表示
- 320px 洛書單選／三組進階多選皆為 44px touch target；四種手機寬度均無 overflow
- 簡易 Search URL 與 Chart deep-link 均實測 reload 後完整還原；Search URL 無 Chart-only params
- production 320／375／390／430px：疊盤大星為墨色、目前層小值為朱紅、其他層小值為墨灰，排盤與尋星均無 horizontal overflow
- 簡易／進階搜尋內容區均沒有重複 `h1`；頂層導覽為「搜尋」，內層尋星／尋組合 tabs 位於 helper 前，CTA「開始尋星」正常
- production 320／375／390／430px：擇吉盤與尋組合皆無 horizontal overflow，每個寬度均有 8 個可選及 8 個排序方向，中宮不參與
- production 320／375／390／430／768px：擇吉九宮 9 組年／月／日／時均保持四欄橫排；八方與中宮全部 value 維持墨灰，長 pair title 無 horizontal overflow，點擊方向詳情正常
- production 320／375／390／430px：擇吉 cell 不再顯示紫白集中數，九宮在四種寬度均保持正方；320px 為 296×296、每宮 98×98
- production 320px：方向詳情四個 disclosure 預設收起，首屏無需捲動；展開全部六組後才產生 sheet 內部捲動，研究內容仍完整
- production 320px：Bottom Sheet 初始焦點位於 surface，close button 無初始 focus ring；SVG 為 20px／1.5px stroke，Pair 學習卡無 internal terminology
- production 原盤／疊盤／擇吉／尋星在 320／375／390／430px 共 16 組均無 horizontal overflow；console 無 warning／error
- 320px 方向詳情完整顯示 6 個 pair；68／86 有序學習卡、無引文警示及 reverse 切換正常
- 實搜有序 14 可命中 `2026-08-07 07:00`東方 MH，點結果後 selection／purpose／palace／pair／layer URL 均正確；console 無 warning／error
- 320px 考源研究版 UI 無 horizontal overflow；68 學習卡以自然中文顯示 A 級、待逐條覆核、無引文警示及 `68 ≠ 86`，底層 `rankingWeight=0` 仍由 engine test 鎖定
- 雙星用途從文書／考試切到喜慶後，八方排序完全不變；尋組合快慢層次序規則可見，console 無 warning／error
- production 320／375／390／430px：第三輪擇吉九宮分別為 296／343／358／398px 正方，9 格及 8 個排序方向完整，宮格條件摘要無文字容器 overflow
- production 320px：方向詳情四個 disclosure 預設收起，首屏只有紫白主幹與雙星參考；展開後按時序條件、白中殺及其他理由顯示完整因果鏈
- production 320／375／390／430px：第五輪擇吉盤頁面、九宮與各宮均無 horizontal overflow；最窄 320px 為 296px 九宮、8 個可選及 8 個排序方向、0 宮格溢出
- production 以全新 PWA scope 確認最終 `index-CbAV7O3j.js`；主盤只顯示「年九宮暗建／月九宮暗建」與其他年月 active killers，日時類比不出現在主盤警示
- production 320px：Direction Detail 顯示日時「白中殺類比／研究參考」、時支「類推參考」、五黃異文、大月建、日主 Gate 及月納音邊界；無 internal terminology
- production 320／375／390／430px：第六輪主盤頁面、九宮與 9 個宮格均無 horizontal overflow；九宮分別為 294／341／356／396px，各寬度均有 8 個可選及 8 個排序方向、0 宮格溢出
- production 最終 bundle `index-BewAo_Zn.js`；月暗建所在只顯示一條「大月建／月暗建」，年暗建仍獨立顯示，日時白中殺不出現在主盤警示
- production 320px：Direction Detail client／scroll width 均為 318px；合流推導、只計一次、日支次級有效、時白同級細選及日主 Gate 邊界均可讀，無 internal terminology
- 第六輪 Browser `document.fonts.check()` 命中新增字串；console 為 0 warning／0 error
- production 320／375／390／430px：第七輪成品的 `clientWidth` 與 `scrollWidth` 全部相等，日期列、九宮、擇吉宮格及方向詳情無 horizontal overflow
- production 最終 bundle `index-D0vKkmIb.js`／`index-TKfxGAsd.css`；PWA precache 11 entries／457.64 KiB，新 WOFF2 已進 cache
- production `2026-08-09 14:18` 坤方：「大月建／月暗建」及「月八白→穿心殺」並列；東方年八白同時顯示受剋、鬥牛，證明同層多殺未被截斷
- production 320px Direction Detail client／scroll width 均為 318px；九星×六殺研究說明完整，`document.fonts.check()` 為 true，console 為 0 warning／0 error
- 本機 Browser 320／375／390／430／560px：擇吉干支 metadata、九宮及 Direction Sheet 均無 horizontal overflow；320–430px 顯示日時，560px 顯示完整四柱，44px touch target 保持不變
- 本機 Browser 五種寬度：Direction Detail 年月日時四欄均顯示 canonical 干支且無重疊；「時間干支」Sheet focus return 正常；搜尋 tabs 的完整鍵盤測試通過，Browser 另實測 ArrowRight／Home、focus 與 tabpanel 同步
- V2 Final production Browser 320／375／390／430px：原盤、疊盤、擇吉、簡易／進階 Search 與時間干支 Sheet 均無 horizontal overflow；九宮高度沒有因 refinement 額外增加
- Search 日期欄在完整 31.2 秒 follow-now timer 週期後仍保留焦點、值及展開狀態；返回 Chart 立即由 `10:40` 同步到 `10:42`
- 擇吉 production DOM 順序為九宮 → 方向排序 → 雙星用途參考；pair 與 warning 分別使用 secondary ink／caution 色，四種 platform glyph 均未出現
- 原盤九星大字全為墨色；疊盤大星為墨色、目前層小值為朱紅、其他層為墨灰；`document.fonts.check()` 命中新增字串，console 0 warning／0 error
- Day Gate production 320／375／390／430px：頁面、Direction Sheet 與日課三欄的 client／scroll width 全部相等；320px Sheet 為 318px，順序為「日課 → 方向」，顯示癸水／未土／死・慎看，字體命中且 console 0 warning／0 error

---

## 接手重驗建議

```bash
git status --short
npm test
npm run build
npm run build:single
```

本 Codex shell 若找不到 `npm`，可使用 bundled Node：

```bash
PATH=/Users/chungyingwa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/vitest run
```

若後續仍有修改，只 stage 該次明確檔案；不要修改或重生 engine snapshot fixture。

---

## 尚餘風險／未來工作

- iPhone 一般實機使用已回報無問題；若發佈流程需要可稽核證據，仍可補 Safari／PWA standalone／iOS Chrome 的分項紀錄。
- 刻盤目前仍只有「八刻十五分鐘制」一種策略。
- Dark Mode 明確留待 V3。
- IndexedDB 目前沒有必要，設定繼續使用 localStorage。
- 跨時段最佳時窗、個人化吉凶評分與 Future filters 尚未實作；現有擇吉方向 status 雖已加入第六輪分層條件，仍是可解釋工具分級，不得冒充古法原有等級。
- 進階搜尋 URL serialization、recent search、多宮／任一宮與入中星搜尋均未實作；簡易搜尋 URL restore 已完成。
- 頂層「搜尋」及內層 keyboard tabs 已完成；九宮式宮位 selector 仍只記錄為 P2 構想，本輪未實作。
- Search result 干支與最佳時窗仍為 P2；不得讓天干、旬空、納音或其他新條件在沒有獨立研究與規格前進入 verdict／ranking。
- 雙星 81 組第二輪 source audit 及第三至七輪時間／白中殺規則已入庫，但尚未完成可追溯版本、頁碼／章節與原頁影像校對；下一位 agent 不可擅自設 `verified=true`／`primarySourceVerified=true`、改 `rankingWeight`，或把摘要／網頁轉錄當成唯一原文。
- 第三輪「飛星回本宮＝暗建」、第四輪「暗建只套月層／五黃四隅是唯一答案」與 generic 宮剋星＝受剋殺均已廢止；不可從歷史文件回復。
- 六德、三德聚方、月金匱已封版但未實作；24 山幾何已於本輪備妥（含 `isMountain24()` 供戊己判斷），但 `DirectionGateAssessment` 組裝仍未做，不得跳過它直接做正面 evidence。六德 severity 全部 `reference_only`，不得因為表可 deterministic 計算就升為 active。
- 地支關係 primitive 已實作，但尚無任何消費者；六沖／六合／六害／三合／刑目前不影響 verdict、ranking 或 UI，`hourStatus` 仍為 `not_evaluated`。加入消費者時必須沿用 `docs/gates-v1-integration.md` §1 的六個具名欄位（`dayMonthBreak`／`hourBreak`／`clashMonth`／`clashYear`／`suiPoMountain`／`monthBreakMountain`），禁用 `yuePo`，且同一 clash fact 只登記一次。
- 大月建公式已由第六輪封版，白中殺 9×6 程式矩陣已由第七輪封版，日干×月令 Day Gate V1 亦已封版，地支關係 primitive 已於本輪落地；仍暫緩的是四柱沖、月破、日時沖、時扶日、日干祿時、五黃傳本 selector、日／時白中殺 active 化與直接實例、時支有氣直接表、第七輪各書固定版本原頁證據包、月納音作用範圍、periodElement、修造／日常獨立模式與固定百分比。
