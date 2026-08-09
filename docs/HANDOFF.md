# 接手說明（給 Codex / 下一位 AI）

## 目前狀態

`docs/uiux-redesign-v2.md` 的 **Phase 0–6**、V2.1 視覺精修 **Phase A–D**、professional UI/UX refinement **Phase A–D**、疊盤／搜尋 implementation **Phase 0–6**、盤面／搜尋／URL cleanup、疊盤配色補丁、紫白擇吉方向 V1 **Phase 1–4**，以及干支加入與 UI/UX refinement V2 的 **P0／P1** 均已完成。雙星 81 組已與方向 ranking 解耦；第六輪已確認大月建等於月入中星本宮、與月暗建合流，並將日白升為正式主層、時白定為同級細選。現行 Direction status 使用 source-aware V6 政策。

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
- 干支加入與 UI/UX refinement V2 紀錄：`docs/ganzhi-uiux-refinement-v2.md`

P0 iPhone 實機使用已回報無問題。疊盤、搜尋 A/B、UI 與 URL cleanup、紫白擇吉 Phase 1–4、四星橫排、第六輪時間規則及 canonical 年月日時干支均已完成；大月建 36 個月型態已由月入中星本宮統一，不再另算。下一步是白中殺 authoritative 9×6 原表逐格核影、日白 killer 直接實例、月納音作用範圍與 deploy，不應擅自發明暫緩公式或 P2 最佳時窗。

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
- `followNow` 每 30 秒刷新；手動選時即停止，按「回到今」恢復
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
- 普通盤與疊盤中央大星均使用墨色，五層小值只有目前層級使用朱紅；Search 真正命中層仍使用朱砂＋✓
- Search → Chart 會暫存 `searchMatchedLevels`，只在 selected palace 的命中層顯示朱砂＋✓；改時間、導覽層級或宮位會清除，避免留下過期命中
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
- 日主／時課 Gate 與月納音轉化介面已建立，但目前明示 `not_evaluated` / `research` / `disabled`，不假裝日課已完成。
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
- 日主／時課 Gate 與月納音仍為 `not_evaluated`／`disabled`；V6 status 是工具分級，不冒充完整通書日課。
- 詳細 source map、測試、字體與 Browser 證據見 `docs/purple-white-sixth-round-dayuejian-daywhite.md`。

#### Reserved future capability — 最佳時窗

尋星模組的長期目標包含「最佳時窗」搜尋與排序。

當前版本只負責 deterministic matching，不加入吉凶評分與推薦邏輯。

未來 `RankingEngine` 應消費既有 `SearchMatch[]`，而不是重新計算年月日時刻飛星。

因此目前不得把 `SearchEngine` 寫死為只能處理單星單層，也不得讓搜尋結果資料模型只適用於 A 類單星搜尋。

後續 refactor 不得刪除此 extension point。

---

## 驗證結果

```text
test files  25 passed
tests       194 passed
build       production success
PWA font    preload + precache（單一 entry）success
PWA precache 11 entries（455.01 KiB）success
single file 玄空紫白.html（538,436 bytes；font data URI）success
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
- 品牌字體 `document.fonts.check()` 對「大月建／月暗建／詳情／舊／靠／翻」等新增字串命中；912 個 UI 字元／913 glyphs／243,128 bytes，production font 與 public font SHA-256 均為 `15d965d847acff86b6df05129923038bb383c66a49e076768da6fe56bc04fcac`
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
- 320px 進階條件可展開／收合並保留設定；結果整列可點，命中層以朱砂＋✓ 表示
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
- 本機 Browser 320／375／390／430／560px：擇吉干支 metadata、九宮及 Direction Sheet 均無 horizontal overflow；320–430px 顯示日時，560px 顯示完整四柱，44px touch target 保持不變
- 本機 Browser 五種寬度：Direction Detail 年月日時四欄均顯示 canonical 干支且無重疊；「時間干支」Sheet focus return 正常；搜尋 tabs 的完整鍵盤測試通過，Browser 另實測 ArrowRight／Home、focus 與 tabpanel 同步

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
- 雙星 81 組第二輪 source audit 及第三至六輪時間規則已入庫，但尚未完成可追溯版本、頁碼／章節與原頁影像校對；下一位 agent 不可擅自設 `verified=true`／`primarySourceVerified=true`、改 `rankingWeight`，或把摘要／網頁轉錄當成唯一原文。
- 第三輪「飛星回本宮＝暗建」、第四輪「暗建只套月層／五黃四隅是唯一答案」與 generic 宮剋星＝受剋殺均已廢止；不可從歷史文件回復。
- 大月建公式已由第六輪封版；仍暫緩的是五黃傳本 selector、日／時白中殺 active 化、時支有氣直接表、白中殺 9×6 原頁矩陣、月納音作用範圍、periodElement、完整日主／時課 Gate、修造／日常獨立模式與固定百分比。
