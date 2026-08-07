# 玄空紫白 — 年月日時刻飛星 PWA

**線上版：<https://u1tr4man.github.io/xuankong-zibai/>** ｜ **離線單檔：<https://u1tr4man.github.io/xuankong-zibai/offline.html>**

離線可用的紫白飛星排盤工具：**流年 → 流月 → 流日 → 流時 → 流刻**，每一層皆可點擊下鑽。
手機優先、無框架（Vanilla TypeScript + Vite）、計算邏輯與 UI 完全分離。

```
npm install
npm run dev       # 開發
npm test          # 99 個測試（含 1200 點 engine snapshot）
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

## 架構

```
時間資料 → 規則 Engine → StarResult → 九宮 Rendering
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
├── ui/      TopBar / DateTimeContext / LevelSegment / ChartHeader /
│            NinePalaceGrid / TimeNavigator / ContextAction / BottomSheet /
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

- `npm test` — 99 個測試，涵蓋算法、1200 點 snapshot、V1 下鑽與 V2 Phase 2–6 UI state／interaction。
  亦含六段日紫白在每個節氣前後 ±1 分鐘的切換。
- `tools/verify-solarterms.py` — 節氣表對 寿星天文历 的全表比對。
- 另以完全獨立的 Python 實作（節氣與干支日都改用 sxtwl）對 1905–2094 之間
  **2996 個取樣時間點**重算年／月／日／時／刻五層入中星與順逆：**零筆不一致**。

## 尚未做的事

- 只有一種刻盤算法。找到其他流派後依上節新增即可。
- 已用真實瀏覽器驗證 320 / 375 / 390 / 430 / 768；正式發佈前仍建議在實體 iPhone spot-check native date/time 與 standalone safe area。
- 未做 IndexedDB（目前資料量小，設定用 localStorage 已足夠）。
