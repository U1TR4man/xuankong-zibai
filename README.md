# 玄空紫白 — 年月日時刻飛星 PWA

**線上版：<https://u1tr4man.github.io/xuankong-zibai/>** ｜ **離線單檔：<https://u1tr4man.github.io/xuankong-zibai/offline.html>**

離線可用的紫白飛星排盤工具：**流年 → 流月 → 流日 → 流時 → 流刻**，每一層皆可點擊下鑽；亦支援五層疊盤、日／時／刻尋星及「紫白擇吉方向 V1」。
手機優先、無框架（Vanilla TypeScript + Vite）、計算邏輯與 UI 完全分離。

```
npm install
npm run dev       # 開發
npm test          # 198 個測試（含 1200 點 engine snapshot）
npm run build     # 產生 dist/（含 service worker、manifest）
npm run preview
```

## 排盤功能進度

Phase 1–3（規劃書 §38）已完成並通過測試，另含 Phase 4–6 的主要內容：

| Phase | 內容 | 狀態 |
|---|---|---|
| 1 | `flyNineStars` / DayStarEngine / HourStarEngine + unit test | ✅ |
| 2 | NinePalaceGrid、流日、流時、點日→時 | ✅ |
| 3 | KeStarStrategy、EightKe15MinuteStrategy、點時→八刻→刻盤 | ✅ |
| 4 | 流年、流月、Breadcrumb、上一個/下一個導航、Swipe | ✅ |
| 5 | Explain Mode（為何是此星？） | ✅ |
| 6 | PWA / Service Worker / Offline / Install | ✅ |

## V2 Mobile-First UI/UX

`docs/uiux-redesign-v2.md` 的 Phase 0–6 已完成：

| Phase | 內容 | 狀態 |
|---|---|---|
| 0 | 算法 baseline + 1200 點 snapshot 護欄 | ✅ |
| 1 | 紙墨朱砂 tokens + 一體九宮方盤 | ✅ |
| 2 | 打開即見現在流時盤；一 tap 進刻盤 | ✅ |
| 3 | native `<dialog>` BottomSheet、日期時間、設定 | ✅ |
| 4 | Child／Ke picker sheets + 每層單一 CTA | ✅ |
| 5 | ExplainSheet、簡潔／研習模式、StudyPanel | ✅ |
| 6 | follow-now、盤面 swipe zone、motion、safe area、PWA polish | ✅ |

### V2.1 視覺精修與 iOS 日期時間修正

- 日期／時間仍使用原生 `<input type="date">`、`<input type="time">`；外層 shell 統一繪製 border 與 focus，避免 iOS WebKit 原生控件內外框尺寸不同步。
- 自帶約 238 KB `Zibai Serif`（Noto Serif CJK TC Medium 2.003、914 個 cmap 字元／915 glyphs，SIL OFL 1.1），PWA 預載／離線快取，單檔版改為 data URI 內嵌；可用 `scripts/build-font-subset.py` 從專案靜態 UI 文字重建。
- 頂欄 info／settings 改為同一套 1.5px inline SVG，不再依賴平台 emoji。
- 層級列改為無外框 tab + 朱砂短底線；主畫面只保留一個「今」，UTC+8 說明留在選時與設定 Sheet。
- 層級 tabs 支援方向鍵、Home／End 與 automatic activation，並與盤面 `tabpanel` 正確關聯。
- Chart Header、前後導覽與 contextual CTA 減少外框及大色塊；九宮 geometry 與算法完全不變。
- 日期時間與節氣改為同列，盤名與時段同列；疊盤 switch 移入盤頭，疊盤主星跟隨唯一的排盤層級列。

### Professional UI/UX refinement

- 擇吉九宮移除低價值的紫白集中數，保留方向、四星、狀態及主要條件；320px 資訊字不再縮至 8px。
- 方向詳情首屏顯示結果、時氣／白中殺摘要與主要參考；理由、六組、五行及研究說明預設收起，按需展開。
- Bottom Sheet 初始焦點改到 sheet surface，關閉按鈕統一為 1.5px inline SVG 並保留 keyboard focus。
- Workspace、時間軸及盤面模式以 sans／serif、字重及不同底線尺寸拉開三層 hierarchy；routing／state 不變。
- 詳見 [專業 UI/UX refinement 紀錄](docs/professional-uiux-refinement.md)。

### V2 Final UI/UX refinement

- Search 不再被 follow-now timer 週期性重建；若仍跟隨現在，返回排盤時立即同步。
- 擇吉九宮以「參考 · …／警示 · …」分清 pair 與正式條件；雙星用途控制移到方向排序後，明示不改 ranking。
- 尋星先完成進階條件再按 CTA；原盤／疊盤／擇吉使用完整 keyboard tabs。
- UI 不再依賴警告、星號、勾號或旗幟等平台字形；時間干支 Sheet 可直接核查年界、節氣月、換日與時辰設定。
- 詳見 [V2 Final UI/UX refinement 紀錄](docs/v2-final-uiux-refinement.md)。

## 疊盤與尋星

`docs/xuankong_zibai_overlay_star_search_feature_plan.md` 的 implementation Phase 0–6 已完成：

| Phase | 內容 | 狀態 |
|---|---|---|
| 0 | 唯讀審查 Engine、AppState、九宮、Bottom Sheet 與 URL state | ✅ |
| 1 | 疊盤 view model，直接組裝現有 `computeFullChart()` | ✅ |
| 2 | 疊盤開關、五層九宮、主顯示層、選宮與詳情 Sheet | ✅ |
| 3 | 尋星 A：日期、宮位、日／時／刻、單星、結果與跳盤 | ✅ |
| 4 | 尋星 B：同層多星 OR、跨層 AND、組合摘要 | ✅ |
| 5 | 日期分組、loading／empty state、範圍提示及大量結果分批顯示 | ✅ |
| 6 | production／PWA／單檔驗證與文件 checkpoint | ✅ |

正式語義：例如「離宮 · 流時 · 九紫」只比對流時盤的離宮格內飛星值 `9`，不是九紫入中、洛書數或任一宮出現九紫。搜尋結果只顯示截至精度為止的上層：日＝年月日、時＝年月日時、刻＝年月日時刻。

搜尋仍完全消費正式 Engine；預設顯示簡易條件，按「＋ 進階條件」才展開多層／多星設定，兩者都以洛書九宮順序選星。搜尋結果整列可點；點入後盤面會依結果時間重新計算，再開啟疊盤及高亮命中宮。大量結果每次明示載入 50 筆，總數不會被截斷。簡易條件可由 URL refresh／bookmark／share 還原；進階條件暫不序列化。V1 不含吉凶評分或最佳時窗 Ranking。

## 紫白擇吉方向 V1

`docs/purple-white-selection-v1.md` 的 Phase 1–4 已完成：

| Phase | 內容 | 狀態 |
|---|---|---|
| 1 | 81 個有序 pair、八方快照、六種 Pair Layer 與無分數 heuristic | ✅ |
| 2 | 原盤／疊盤／擇吉、八方排序、方向詳情與用途 | ✅ |
| 3 | 尋組合、有序／不分次序、Layer filter、分批結果與 deep-link | ✅ |
| 4 | Pair 學習卡、來源／review、reverse pair 與按用途參考搜尋 | ✅ |

擇吉盤顯示每個方向的年／月／日／時四星，並建立 YM、YD、YH、MD、MH、DH 六個有序組合；中宮只保留參考，不參與八方搜尋或排序。方向狀態屬可解釋的工具分級，不顯示虛構的 0–100 分或星級。

`docs/purple-white-pair-research-v1.md` 已將研究版 81 組現代摘要收入資料庫，並保留 A、A/B、B、B/C、C 來源級別。25／52、37／73、68／86 明確保留次序差異。

這 81 組全部是「雙星參考」：`needs-review`、`verified=false`、`rankingWeight=0`。研究版沒有附古籍版本頁碼與逐字引文，工具不會把摘要假裝成原文，也不會讓 pair 斷語或用途 tags 直接改變八方排序。

第二輪考源加入 `sourceAudit`，分開記錄證據形式、原始使用情境、次序可信度、宮位／方位條件、異文與原頁核對狀態。第三輪建立墓絕、1／6／8／9 支序有氣及月令狀態；第四輪修正 co-arrival 與 classical 受剋表；第五輪再將一般九宮暗建、白中殺層級及支序有氣分開；第六輪確認大月建等於月入中星本宮，並把日白升為正式主層、時白定為同級細選；第七輪再將六捷墓、九宮暗建、受剋、穿心、交劍與鬥牛整合為唯一 9 星×6 殺矩陣，並分開入中星、到方星與時間地支三種輸入。現行年、月白中殺正式參與方向判定，日、時仍只作類比參考。月暗建與大月建合流顯示且只計一次，五黃預設為中宮；四隅版本只作異文。

Day Gate V1 已加入日干五行、節氣月司令、四立前十八日土旺、旺相休囚死、`pass / mixed / caution` 與自然中文理由；方向詳情先顯示「日課」，再顯示方向結果。V1 只作時間 Gate 提示，不換算固定分數、不 hard reject，也不改八方 verdict／ranking；四柱沖合、月破、日時沖、時扶日與日干祿時仍待下一階段。詳見 [Day Gate V1 authoritative rules](docs/day-gate-v1-authoritative-rules.md)，並參考 [第二輪](docs/purple-white-second-round-source-audit.md)、[第三輪](docs/purple-white-third-round-temporal-rules.md)、[第四輪](docs/purple-white-fourth-round-coarrival-anjian.md)、[第五輪](docs/purple-white-fifth-round-layered-anjian-qi.md)、[第六輪](docs/purple-white-sixth-round-dayuejian-daywhite.md) 及 [第七輪考源紀錄](docs/purple-white-seventh-round-white-killer-matrix.md)。月納音仍未封版，不參與 ranking。

## 架構

```
時間資料 → 規則 Engine → StarResult → 九宮 Rendering／Overlay
                         └→ SearchEngine → SearchMatch[] → 正式盤面重算
```

UI 只消費 `StarResult`，**不得自行計算飛星**。

```
src/
├── engine/
│   ├── time/
│   │   ├── utc8.ts            全 App 唯一時間來源（nowUtc8）
│   │   ├── solarTerms.ts      SolarTermEngine：24 節氣、六段、陰陽遁、節氣月
│   │   ├── solarTermsAlgo.ts  表外年份 fallback（截斷 VSOP87 + 章動 + 光行差 + ΔT）
│   │   ├── ganzhi.ts          干支表、孟仲季
│   │   ├── ganzhiDay.ts       GanzhiDayEngine（換日規則可設定）
│   │   └── chineseHour.ts     時辰判定（與換日規則完全分離）
│   └── flyingStar/
│       ├── flyNineStars.ts    全 App 唯一飛宮定義
│       ├── yearStar.ts  monthStar.ts  dayStar.ts  hourStar.ts  keStar.ts
│       └── ke/
│           ├── KeStarStrategy.ts          刻盤策略介面
│           ├── EightKe15MinuteStrategy.ts 第一版算法
│           └── registry.ts                策略註冊表
├── data/    solarTerms.data.ts（45 KB）、vsop87Earth.data.ts（13 KB）
├── overlay/ buildPalaceOverlay.ts、types.ts（只組裝 FullChart）
├── search/  StarSearchEngine.ts、candidateIterator.ts、matchQuery.ts、types.ts
├── selection/ 81 組 pair rule、八方快照、判讀、組合／用途搜尋
├── ui/      TopBar / DateTimeContext / LevelSegment / ChartHeader /
│            NinePalaceGrid / NinePalaceOverlayGrid / NinePalaceSelectionGrid /
│            SearchView / SearchResults / PairSearchView / PairSearchResults /
│            TimeNavigator / ContextAction / BottomSheet /
│            TimePickerSheet / ChildPickerSheet / KePickerSheet /
│            ExplainSheet / SettingsSheet / StudyPanel
├── state/   appState.ts（URL 同步、follow-now）、settings.ts（簡潔／研習）
└── pwa/     registerSW.ts
```

## 規則與出處

| 層 | 規則 |
|---|---|
| **流年** | 三元年紫白：上元甲子(1864) 一白、中元甲子(1924) 四綠、下元甲子(1984) 七赤入中，逐年逆行，180 年一循環。年界預設立春（可切換公曆元旦）。 |
| **流月** | 三元月紫白：子午卯酉年正月八白、辰戌丑未年正月五黃、寅申巳亥年正月二黑入中，逐月逆行。月份一律以**節氣月（月建）**為準。 |
| **流日** | 三元日紫白六段。冬至→雨水 甲子一白順、雨水→穀雨 甲子七赤順、穀雨→夏至 甲子四綠順、夏至→處暑 甲子九紫逆、處暑→霜降 甲子三碧逆、霜降→冬至 甲子六白逆。 |
| **流時** | 陰陽遁 × 日支三分。陽遁（冬至→夏至）孟七赤／仲一白／季四綠，子時起順推；陰遁（夏至→冬至）孟三碧／仲九紫／季六白，子時起逆推。 |
| **流刻** | ⚠️ **無統一古法**。目前僅實作「八刻十五分鐘制」：一時辰 120 分鐘均分八刻，第一刻承接流時入中星，之後沿流時方向逐刻推一星。UI 一律標示算法名稱與免責說明。 |
| **Day Gate V1** | 日干五行 × 節氣月司令；四立前十八日改取土旺。旺／相＝pass、休＝mixed、囚／死＝caution；不 hard reject，不改方向排序。 |

九宮飛行順序（唯一定義於 `flyNineStars.ts`）：中 → 乾 → 兌 → 艮 → 離 → 坎 → 坤 → 震 → 巽。

## 新增刻盤流派

只需實作 `KeStarStrategy` 並在 `ke/registry.ts` 登記：

```ts
export const TraditionalKeStrategy: KeStarStrategy = {
  id: 'ke-traditional', name: '……', description: '……', disclaimer: '……', keCount: 8,
  getKeIndex(dt) { … }, listKe(dt) { … },
  getCenterStar(hourResult, dt) { … }, getDirection(hourResult, dt) { … },
};
```

流年／流月／流日／流時／九宮 UI 一律不需修改。

## 時間與節氣

- 全 App 只有 `nowUtc8()` 一個「現在」來源，**不使用裝置時區**。任何 `new Date().getHours()` 之類的呼叫都是 bug。
- 節氣採**定氣法**，判斷一律比較精確時間點，不可只比日期。
- 1900–2100：預先產生的精確表（`tools/gen-solarterms.py`，PyEphem 太陽視黃經求解）。
  與 寿星天文历 (sxtwl) 全 4824 筆比對：**最大差 28 秒、平均 8 秒**，無一筆超過 30 秒。
- 表外年份：截斷 VSOP87D 演算法自動接手，`SolarTerm.source` 標為 `'algorithm'`。
  與精確表實測差距 **< 1 分鐘**（`tests/solarTermsAlgo.test.ts`）。
- 日柱換日（預設 00:00，可改 23:00 子初）與時辰判定（子時 23:00 起）是**兩套獨立設定**。

## 驗證

- `npm test` — 198 個測試，涵蓋算法、1,200 點 snapshot、V1 下鑽、V2 Phase 2–6、V2.1／Final UI、資產與鍵盤操作，以及疊盤、尋星 A/B、紫白擇吉四欄橫排、第六輪大月建合流／日白升級、第七輪 9×6 白中殺矩陣、Day Gate V1、Pair 搜尋／學習、URL restore、Search → Chart、字體 glyph 覆蓋與結果 UX 回歸。
  亦含六段日紫白在每個節氣前後 ±1 分鐘的切換。
- `tools/verify-solarterms.py` — 節氣表對 寿星天文历 的全表比對。
- 另以完全獨立的 Python 實作（節氣與干支日都改用 sxtwl）對 1905–2094 之間
  **2996 個取樣時間點**重算年／月／日／時／刻五層入中星與順逆：**零筆不一致**。

## 尚未做的事

- 只有一種刻盤算法。找到其他流派後依上節新增即可。
- 四柱沖合、月破、日時沖、時扶日與日干祿時仍是 Day／Hour Gate 的下一階段；目前 Day Gate V1 只顯示日干月令狀態，不否決時段。
- 跨時段最佳時窗、個人化吉凶評分、節氣前後排除、多宮／任一宮及入中星搜尋均保留為未來能力；目前方向 status 即使已加入第六輪分層條件，仍只是工具分級。
- 雙星古訣及第三至七輪時間／白中殺規則仍需以可追溯版本、頁碼／章節與原頁影像逐條校對；第七輪「封版」只指程式規則級，未核對條目必須繼續保持 `needs-review`、`verified=false`、`primarySourceVerified=false`、`rankingWeight=0`。
- 進階搜尋條件尚未序列化到 URL，也未加入 recent search；簡易搜尋已支援 URL restore，切回尋星仍會保留本次頁面生命週期內的上一輪結果。
- 已用真實 production 瀏覽器驗證 320 / 375 / 390 / 430 / 768，iPhone 實機使用亦回報無問題；如需 release-grade 證據，可再補 Safari／PWA standalone／iOS Chrome 分項紀錄。
- 未做 IndexedDB（目前資料量小，設定用 localStorage 已足夠）。
