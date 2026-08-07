# 接手說明（給 Codex / 下一位 AI）

## 目前狀態

`docs/uiux-redesign-v2.md` 的 **Phase 0–6**，以及 V2.1 視覺精修 **Phase A–D 已全部完成**。

- 專案：`U1TR4man/xuankong-zibai`
- branch：`main`
- V2.1 基線 commit：`e5e2d33`
- 本文件所在 checkpoint 已包含 V2.1；**尚未 push**
- V2 規格真相來源：`docs/uiux-redesign-v2.md`
- V2.1 規格：`/Users/chungyingwa/Downloads/xuankong_zibai_v2_1_visual_refinement_ios_datetime_fix.md`

下一步不是再擴功能，而是先做實體 iPhone spot-check；確認後才 push／deploy。

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

---

## 驗證結果

```text
test files  14 passed
tests       103 passed
build       production success
PWA font    preload + precache（單一 entry）success
single file 玄空紫白.html（約 182 KB；font data URI）success
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
- LevelSegment tab 語意、八刻 8-item Sheet 與 contextual CTA 流程正常
- Settings Sheet 80dvh + 內部 scroll
- simple／study 持久化
- Explain chain／source
- 完整 child／ke 流程
- 明確 URL 與舊 `home=true`
- browser console 無 error／warning

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

- 桌面自動化無法替代 iOS 系統 calendar／time picker；需確認 picker 實際開啟、關閉後 layout 不跳，以及 standalone safe area。
- 刻盤目前仍只有「八刻十五分鐘制」一種策略。
- Dark Mode 明確留待 V3。
- IndexedDB 目前沒有必要，設定繼續使用 localStorage。
