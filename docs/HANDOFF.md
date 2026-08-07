# 接手說明（給 Codex / 下一位 AI）

## 你要做什麼

繼續 `docs/uiux-redesign-v2.md` 的 **Phase 2**。
**Phase 0 與 Phase 1 已完成並已合併進 `main`（commit `ff20339`）。**

---

## 專案是什麼

`U1TR4man/xuankong-zibai` — 玄空紫白飛星排盤 PWA。
Vanilla TypeScript + Vite，無框架。完全離線可用。

- 線上：<https://u1tr4man.github.io/xuankong-zibai/>
- 推上 `main` 會自動跑測試 → 打包 → 發佈（`.github/workflows/deploy.yml`）

## 開始前先讀

1. `docs/uiux-redesign-v2.md` — **本輪唯一規格書，以它為準**
2. `README.md` — 玄學規則、資料來源、架構
3. `src/app.ts`、`src/styles.css`、`src/ui/*`、`src/state/*`

然後跑：

```bash
npm install
npm test          # 應為 80 passed
npm run build     # 應成功
```

---

## 絕對不能碰

```
src/engine/**
src/data/**
```

節氣、干支日、年月日時刻起星、`flyNineStars`、`KeStarStrategy`、UTC+8 規則，**一律不改**。

### 護欄：`tests/engineSnapshot.test.ts`

這支測試鎖死了 UI 重構開始前（commit `d86f724`）**1200 個時間點（1912–2104）** 的五層
`centerStar` / `direction` / 完整九宮飛布。

> **它失敗代表你動到了 engine。正確做法是把改動退掉，不是更新 fixture。**

其餘 79 個算法測試的 expected values 同樣不得修改。

---

## Phase 1 已完成的內容（不要重做）

改動檔案只有：`src/styles.css`、`src/ui/NinePalaceGrid.ts`（+ 測試與 tsconfig）。

- `styles.css` 全面改寫為**紙墨朱砂 light 主題**。Token 見檔頭 `:root`：
  `--paper / --paper-raised / --ink / --ink-secondary / --ink-tertiary /
   --line / --line-strong / --cinnabar / --cinnabar-soft / --bronze`，
  4pt 節奏 `--s1..--s8`，雙字體 `--font-display`(serif) / `--font-ui`(sans)
- 九宮由 9 張圓角卡 → **1 個共用細線的完整方盤**（`.grid` + `.cell` + `.is-lastcol/.is-lastrow`）
- 主顯示改星名（`一白`…），`①②③` 已移除；每宮三層：`.cell__palace` / `.cell__star` / `.cell__meta`
- 九星彩色收斂：`.star-1..9 { color: inherit }`，中宮是全 App 唯一朱砂位
- `今` 改小朱砂印章 `.badge--now`；已加 `prefers-reduced-motion`

**Checkpoint 1 已用真實瀏覽器驗過**，320 / 375 / 390 / 430 / 768 全部零橫向 overflow，
九宮格子分別為 98 / 114 / 119 / 132 / 189 px 且皆為正方。

---

## 下一步：Phase 2 — 移除 Landing Friction

規格書 §2.2、§4、§5、§6、§7、§22、§31、§40(P0)。

目標：**打開 App 直接顯示「現在的流時盤」，0 tap 看到結果，1 tap 進刻盤。**

要改：`src/app.ts`、`src/state/appState.ts`，新增 `TopBar.ts` / `DateTimeContext.ts` / `LevelSegment.ts`。

要移除常駐：首頁 date/time inputs、「立即排盤」、home level buttons、技術說明文字、Breadcrumb。

首次進入預設：

```ts
selectedDateTime = nowUtc8()
level = 'hour'
```

**舊 URL 相容（§31）**：URL 有明確 `t`/`level` 就尊重 URL；舊的 `home=true` 狀態 render 成 now hour view，先不要直接刪 `home` state。

### Checkpoint 2

```
新用戶 0 tap → 現在流時盤
        1 tap → 現在刻盤
```

---

## 之後的 Phase（做完 2 再往下，不要一次做完）

- **Phase 3** BottomSheet primitive（native `<dialog>`）+ TimePickerSheet + SettingsSheet
- **Phase 4** ChildPickerSheet / KePickerSheet，每層只留一個 contextual CTA
- **Phase 5** ExplainSheet、StudyPanel、`displayMode: 'simple' | 'study'`
- **Phase 6** motion、focus states、swipe zone 修正、copy polish、safe area

Dark Mode 明確留到 V3 之後，本輪不要開。

---

## 每個 Phase 完成後必做

```bash
npm test        # 必須全過，尤其 engineSnapshot
npm run build   # 必須成功
```

然後回報：

```
changed files
test result
build result
mobile layout risks
下一 Phase 計劃
```

### 版面驗證建議

沙箱通常裝不了 Chromium。可行的做法：把 app 放進**同源固定寬度 iframe** 量
`document.documentElement.scrollWidth > clientWidth`，逐一檢查 320 / 375 / 390 / 430 / 768。
或跑 `npm run build:single` 產生單檔 `玄空紫白.html`，在真實瀏覽器開來看。

---

## 已知待辦（規格書已涵蓋，但提醒）

- 首屏目前仍被 Breadcrumb + LevelTabs 佔掉約 190px → Phase 2 解決
- `showLuoshu` 目前預設 `true`，規格書 §21 要求簡潔模式預設 `false` → Phase 5
- `DetailPanel` 目前 `open: 'open'`，§19.2 要求預設關閉 → Phase 5
- swipe listener 目前綁整個 `#app`，§17 要求只綁 `[data-swipe-zone="chart"]` 並排除
  `button,input,select,dialog,a` → Phase 6
