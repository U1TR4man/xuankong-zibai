# 接手說明（給 Codex / 下一位 AI）

## 目前狀態

`docs/uiux-redesign-v2.md` 的 **Phase 0–6**、V2.1 視覺精修 **Phase A–D**，以及疊盤／尋星 implementation **Phase 0–6 均已完成**。

- 專案：`U1TR4man/xuankong-zibai`
- branch：`main`
- V2.1 基線 commit：`e5e2d33`
- V2.1 implementation checkpoint：`fdee2e7`
- read-only review 修正後 code checkpoint：`333f7e1`（P1：`14fdc40`）
- 疊盤／尋星 code checkpoint：`609e941`
- V2 規格真相來源：`docs/uiux-redesign-v2.md`
- V2.1 規格：`docs/v2.1-visual-refinement-ios-datetime.md`
- `fdee2e7` review 原文：`docs/reviews/fdee2e7-readonly-review.md`
- 疊盤／尋星規格：`docs/xuankong_zibai_overlay_star_search_feature_plan.md`

P0 iPhone 實機使用已回報無問題。疊盤與尋星 A/B 已完成；下一步不是再擴功能，而是 review 本輪 checkpoint 後才決定 push／deploy。

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
- 自帶 `public/fonts/zibai-serif-medium.woff2`（Noto Serif CJK TC Medium 2.003 的 374-glyph 子集，59 KB）與 OFL；preload、PWA precache、單檔 data URI 均完成
- TopBar 兩個 emoji 改成 `currentColor`、1.5px stroke inline SVG
- LevelSegment 保留 tablist／tab／aria-selected，只移除外框、divider 與 active 色塊，改為 22×2px 朱砂底線
- 主畫面只留 DateTimeContext 的一個「今」；主頁不常駐顯示 UTC+8，TimePicker／Settings 仍明示 UTC+8
- Chart Header 改為「流年／流月／流日／流時／流刻」；Prev／Next 與 contextual CTA 改為無卡片感 content row
- 九宮 geometry、飛星算法、URL state、follow-now 均未改

#### iOS 問題 root cause

舊版由 WebKit 原生 date/time input 同時負責內容、border 與 focus outline；iOS 的 native appearance 在開關 picker 前後可能採用不同的內部尺寸，造成 border 走位或雙框。V2.1 把可控視覺責任移到固定尺寸的外層 shell，以 `:focus-within` 畫唯一 focus；原生 input 只保留值與系統 picker 行為。

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
- Phase 5 safeguard：`609e941` 保留完整總數並每次顯示 200 筆，避免一次建立數萬個 mobile DOM nodes
- 搜尋正式語義固定為「指定層級、指定宮位格內的飛星值」；不把入中星、洛書數或其他宮誤作命中
- 日候選以 UTC+8 正午代表；時與刻使用正式時窗起點，全部呼叫現有 Engine
- 搜尋結果只保存命中與上層 context；點入後仍由正式 Engine 依時間重算盤面
- 320px／390px production 驗證無水平 overflow；疊盤小值有文字 layer label，controls 最低 44px

#### Reserved future capability — 最佳時窗

尋星模組的長期目標包含「最佳時窗」搜尋與排序。

當前版本只負責 deterministic matching，不加入吉凶評分與推薦邏輯。

未來 `RankingEngine` 應消費既有 `SearchMatch[]`，而不是重新計算年月日時刻飛星。

因此目前不得把 `SearchEngine` 寫死為只能處理單星單層，也不得讓搜尋結果資料模型只適用於 A 類單星搜尋。

後續 refactor 不得刪除此 extension point。

---

## 驗證結果

```text
test files  19 passed
tests       131 passed
build       production success
PWA font    preload + precache（單一 entry）success
PWA precache 11 entries（196.63 KiB）success
single file 玄空紫白.html（約 208 KB；font data URI）success
```

真實 production 瀏覽器已驗證：

| viewport | overflow | 九宮 | 最小主頁按鈕 |
|---|---:|---:|---:|
| 320 | 無 | 296×296；cell 98×98 | 44px |
| 375 | 無 | 343×343；cell 113.7×113.7 | 44px |
| 390 | 無 | 358×358；cell 118.7×118.7 | 44px |
| 430 | 無 | 398×398；cell 132×132 | 44px |
| 768 | 無 | 568×568；cell 188.7×188.7 | 44px |

另驗證：

- 日期 Sheet apply、Esc、focus return
- 320 / 375 / 390 / 430 native date/time shell 無 clipping；兩個 input 都維持 `appearance:auto`
- date/time focus：shell 1px border + 2px outline；input 0 border + no outline
- 品牌字體 `document.fonts.check()` 命中；TopBar 兩個 SVG 均為 1.5px stroke
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
- D 類最佳時窗 Ranking、吉凶評分與 Future filters 尚未實作；只能消費 `SearchMatch[]`，不得污染 deterministic SearchEngine。
- 搜尋 query URL serialization、recent search、多宮／任一宮與入中星搜尋均未實作。
