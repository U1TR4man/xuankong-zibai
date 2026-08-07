# 玄空紫白 PWA — Mobile-First 新中式 UI/UX 重構規劃 v2

> 專案：`U1TR4man/xuankong-zibai`  
> 現況：年月日時刻 Engine、PWA、URL 狀態、Explain Mode、79 個單元測試均已存在。  
> 本輪目標：**只重構 UI / UX / Visual System；不要改玄空算法。**

---

## 0. 這次重構的產品定義

不要再把它設計成「一個把所有功能都攤在畫面上的排盤器」。

應重新定義為：

> **打開就看到現在的盤；不懂術語也能用；想研究時再逐層展開。**

一句 UX 原則：

> **先給結果，再給選擇，最後才給理據。**

這個 App 同時服務兩類人，但不要做兩套 App：

1. **一般／初學使用者**：只想知道「現在是甚麼盤」、「下一個時辰／刻是甚麼」。
2. **研究使用者**：需要節氣、日柱、陰陽遁、起星、算法、來源與驗算資料。

因此採用 **Progressive Disclosure（漸進揭露）**：

- 預設 = `簡潔模式`
- 可切換 = `研習模式`

不是把功能刪掉，而是**控制何時顯示**。

---

# 1. 先保留甚麼：不要碰核心

目前 repo 的 Engine 分層是正確的：

```text
時間資料
  ↓
規則 Engine
  ↓
StarResult
  ↓
九宮 Rendering
```

本輪不要重寫：

```text
src/engine/**
src/data/**
節氣算法
干支日算法
年月日時刻起星算法
KeStarStrategy
flyNineStars
UTC+8 規則
```

也不要因為 UI 重構而更改既有 79 個算法測試的 expected values。

### 必須保留

- `nowUtc8()` 為全 App 唯一「現在」來源
- `computeFullChart()`
- URL 可分享狀態
- PWA / Service Worker / Offline
- `KeStarStrategy`
- 既有 settings 中的算法設定
- 既有 Explain data (`StarResult.explain`)

### 本輪主要修改

```text
src/app.ts
src/styles.css
src/ui/**
src/state/settings.ts   # 只新增 UI mode 時可改
```

---

# 2. 現有 UI 的真正問題

目前功能正確，但手機上資訊架構重複。

同一個排盤頁同時出現：

```text
Header
Breadcrumb
年/月/日/時/刻 Tabs
盤面 Card
上一個 / 目前 / 下一個
八刻 selector 或 child picker
Explain
時間資訊
設定
```

對研究者來說資訊完整；對第一次使用的人來說，問題是：

> **不知道第一步該按哪裡。**

## 2.1 重複導航

目前同時存在：

- Breadcrumb
- 五層 Tabs
- ChildSelector
- TimeNavigator

四種不同導航語言。

應縮成兩種：

1. **層級**：年 / 月 / 日 / 時 / 刻
2. **時間**：上一個 / 下一個 / 選擇指定時間

Child drill-down 只作為 contextual action，不再永久佔據頁面。

---

## 2.2 首頁是多餘的一層

目前：

```text
首頁
→ 看時間
→ 選日期時間
→ 立即排盤
→ 再選 年/月/日/時/刻
```

工具型 PWA 不需要 landing page 才能開始。

改為：

```text
打開 App
→ 直接顯示「現在的流時盤」
```

因為「現在」本來已有 `nowUtc8()`，根本不需要使用者先填任何東西。

### V2 首次開啟預設

```ts
selectedDateTime = nowUtc8()
level = 'hour'
mode = 'simple'
```

這樣：

- 0 次操作即可看到結果
- 1 tap 可進「刻」
- 1 tap 可切年/月/日

---

## 2.3 技術說明放錯位置

目前首頁直接顯示：

```text
節氣採定氣法……寿星天文历……VSOP87……
```

這對可信度有價值，但不是第一屏資訊。

移到：

```text
設定 → 算法與資料
```

或：

```text
研習模式 → 時間資訊
```

第一屏不出現 VSOP87、最大差 28 秒等字眼。

---

## 2.4 九宮盤視覺太「科技工具」，不像新中式

目前 CSS：

```css
--bg: #0e0f14;
--surface: #171922;
--accent: #d4a95a;
```

再配 9 種高彩度星色，整體更接近：

> dark dashboard / gaming utility

而不是：

> 新中式、宋式、文人器物、紙墨朱砂

V2 應完全換 visual language，但**不要改資料內容**。

---

# 3. 核心 UX 指標

這次不是主觀說「簡潔」，要有可驗收標準。

## Beginner UX

第一次開 App：

- **0 tap**：看到現在流時盤
- **1 tap**：看到現在刻盤
- **≤2 tap**：選其他日期時間
- **1 tap**：回到現在
- **1 tap**：知道「為甚麼是這顆星」

## 畫面複雜度

簡潔模式第一屏：

- 不超過 1 個主要 CTA
- 不同時出現 Breadcrumb + Tabs + Picker
- 不顯示完整 debug 資料
- 不顯示算法長說明
- 不出現超過 2 層 Card nesting

## 手機

- 320px 不橫向 overflow
- 375 / 390 / 430 為主要調校尺寸
- touch target ≥ 44px
- iPhone safe-area 正確
- 核心操作集中在螢幕中下段

---

# 4. V2 資訊架構

整個主 App 只保留一個主要畫面。

```text
┌─────────────────────────┐
│ Top Bar                 │
├─────────────────────────┤
│ Date / Time Context     │
├─────────────────────────┤
│ 年 月 日 時 刻           │
├─────────────────────────┤
│ Current Level Summary   │
├─────────────────────────┤
│ Nine Palace Grid        │
├─────────────────────────┤
│ Prev / Next             │
├─────────────────────────┤
│ One Contextual CTA      │
├─────────────────────────┤
│ Optional Study Details  │
└─────────────────────────┘
```

### 不再預設 inline 顯示

```text
Breadcrumb
ChildSelector 大網格
KeSelector 八刻列表
Settings details
完整 DetailPanel
```

以上全部變成：

> 按需要才開啟的 Bottom Sheet / Accordion。

---

# 5. 主畫面 Wireframe

手機約 390px：

```text
┌──────────────────────────────┐
│ 玄空紫白              ○   ⚙ │
│                              │
│ 2026.08.07 · 21:38        今 │ ← tap 可選日期時間
│ 立秋後 · UTC+8              │
│                              │
│ ┌──────────────────────────┐ │
│ │  年   月   日  [時]  刻  │ │
│ └──────────────────────────┘ │
│                              │
│ 流時盤                    今 │
│ 亥時 · 21:00–22:59          │
│ 三碧入中 · 逆飛             │
│                              │
│ ┌────────┬────────┬────────┐ │
│ │ 巽     │ 離     │ 坤     │ │
│ │  六白  │  二黑  │  四綠  │ │
│ │ 東南   │ 南     │ 西南   │ │
│ ├────────┼────────┼────────┤ │
│ │ 震     │ 中     │ 兌     │ │
│ │  五黃  │【三碧】│  一白  │ │
│ │ 東     │ 入中   │ 西     │ │
│ ├────────┼────────┼────────┤ │
│ │ 艮     │ 坎     │ 乾     │ │
│ │  七赤  │  九紫  │  八白  │ │
│ │ 東北   │ 北     │ 西北   │ │
│ └────────┴────────┴────────┘ │
│                              │
│    ‹ 上一時        下一時 ›  │
│                              │
│ ┌──────────────────────────┐ │
│ │       查看此時八刻       │ │ ← 唯一主 CTA
│ └──────────────────────────┘ │
│                              │
│ 為何是三碧？                 │
└──────────────────────────────┘
```

重要：

**不要讓任何 technical panel 把這個首屏推到很下面。**

---

# 6. 導航：只留一套清楚的 mental model

## 6.1 Level Segment

固定為：

```text
年　月　日　時　刻
```

不是五個重 Card Button。

視覺像原生 segmented control：

```text
 年   月   日  [時]  刻
             ────
```

Active 使用朱砂底或朱砂底線，但只選一種。

推薦：

- default：透明
- active：淡朱砂底 + 深朱砂字
- border：整個 segment 一條外框，不要每個都一個卡片

### 行為

按「刻」：

```text
直接顯示 selectedDateTime 所在的刻盤
```

不需要先經過八刻 selector。

這是新手最快的路。

---

## 6.2 移除 Breadcrumb 的常駐位置

目前 Breadcrumb 和 LevelTabs 表達同一件事：層級。

手機 V2 不常駐 breadcrumb。

完整 hierarchy 改放在：

```text
研習模式 / 詳細時間資訊
```

例如：

```text
2026年 → 申月 → 丁酉日 → 亥時 → 第四刻
```

---

# 7. 日期時間選擇：不要把 input 永久放首頁

主畫面只顯示：

```text
2026.08.07 · 21:38    今
立秋後 · UTC+8
```

整行是一個 button。

Tap → 開 `TimePickerSheet`。

## TimePickerSheet

```text
╭────────────────────────────╮
│ ───                        │
│ 選擇時間                   │
│                            │
│ 日期                       │
│ [ 2026-08-07             ] │
│                            │
│ 時間                       │
│ [ 21:38                  ] │
│                            │
│ UTC+8                      │
│                            │
│ [ 現在 ]       [ 查看此時 ]│
╰────────────────────────────╯
```

### 規則

- 使用 native `date` / `time`
- 不要自製 calendar
- `現在` 使用 `nowUtc8()`
- 按 `查看此時` 才 apply，避免滑 input 時主畫面不停重算
- Esc / backdrop / swipe down 可關閉
- 打開時 focus 正確
- 關閉後 focus 回原按鈕

---

# 8. 年 → 月 → 日 → 時 → 刻的「傻瓜式」下鑽

不要永久把 12 月、30 日、12 時辰、8 刻全部放在主畫面。

在不同 level 只顯示一個 contextual CTA：

| 當前 | CTA |
|---|---|
| 年 | `查看十二月` |
| 月 | `查看本月各日` |
| 日 | `查看十二時辰` |
| 時 | `查看此時八刻` |
| 刻 | 無；顯示 `返回時盤` 小 secondary action |

Tap CTA → `ChildPickerSheet`。

這樣保留原本完整 drill-down 能力，但主畫面不再被 picker 淹沒。

---

# 9. 八刻 UX

目前 `KeSelector` 在頁面內直接顯示 8 個 item。

V2 改成 bottom sheet。

```text
╭────────────────────────────╮
│ ───                        │
│ 亥時 · 八刻                │
│ 21:00–22:59                │
│                            │
│ 第一刻   21:00–21:14  三碧 │
│ 第二刻   21:15–21:29  二黑 │
│ 第三刻   21:30–21:44  一白 │
│ 第四刻   21:45–21:59  九紫 │ ← 今
│ 第五刻   22:00–22:14  八白 │
│ 第六刻   22:15–22:29  七赤 │
│ 第七刻   22:30–22:44  六白 │
│ 第八刻   22:45–22:59  五黃 │
│                            │
│ 八刻十五分鐘制       ⓘ    │
╰────────────────────────────╯
```

### 點一刻

1. sheet 關閉
2. `selectedDateTime = k.start`
3. `level = 'ke'`
4. 主盤原地更新
5. 短 transition，不跳新頁

### 「刻盤算法不是唯一古法」

不要每次在主畫面出長免責。

只顯示：

```text
八刻十五分鐘制 ⓘ
```

Tap `ⓘ` 才顯示：

> 刻紫白各派規則不一，目前採八刻十五分鐘策略；此規則可在設定切換。

---

# 10. 新中式 Visual Direction

## 10.1 定位

不是：

```text
古董
玄學網頁
廟宇
黃金龍
木紋
八卦背景
```

而是：

```text
宋式留白
紙
墨
朱砂
銅／淡金
細線
現代排版
```

可以理解成：

> **古典文化的骨架 + 現代手機產品的操作。**

---

# 11. Color Tokens

V2 主題先只做 Light。

不要同時開 Dark Mode scope。

```css
:root {
  /* 紙 */
  --paper: #F4F0E7;
  --paper-raised: #FBF8F1;
  --paper-muted: #ECE6DA;

  /* 墨 */
  --ink: #28241F;
  --ink-secondary: #6F675C;
  --ink-tertiary: #978E81;

  /* 線 */
  --line: #D8D0C1;
  --line-strong: #BEB3A2;

  /* 朱砂 */
  --cinnabar: #A64035;
  --cinnabar-soft: #F0E1DC;

  /* 銅金：只作細節，不作大色塊 */
  --bronze: #A78A59;

  /* 狀態 */
  --focus: #7D342D;

  --radius-sm: 8px;
  --radius-md: 12px;
  --tap: 44px;
}
```

### 禁止

- `linear-gradient()` 當主背景
- 大面積金色
- 發光 glow
- 玻璃擬態
- 9 種 neon 星色
- 仿宣紙 JPG texture

背景只用純色 `--paper`。

這樣 PWA 離線也不依賴圖片。

---

# 12. Typography

新中式不代表所有文字都用宋體。

如果全 App 都用宋體，input、數字、小字會變得難讀。

## 建議雙字體語言

### Display / Chinese titles

```css
font-family:
  'Songti TC',
  'STSong',
  'Noto Serif TC',
  'PMingLiU',
  serif;
```

用於：

- 玄空紫白
- 流時盤
- 九宮中的星名（可選）
- section heading

### UI / Body

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  'PingFang TC',
  'Noto Sans TC',
  'Microsoft JhengHei',
  sans-serif;
```

用於：

- Button
- input
- 時間
- 小字
- 設定
- Explain

### 不要為了字體破壞 Offline

本輪不新增 Google Fonts CDN。

若未來要自帶字體，另開獨立任務。

---

# 13. 九宮盤：整個 App 最重要的 visual

現有九宮是「9 張 rounded card」。

V2 改成**一個完整方盤**。

## 13.1 Geometry

```text
┌────────┬────────┬────────┐
│        │        │        │
├────────┼────────┼────────┤
│        │        │        │
├────────┼────────┼────────┤
│        │        │        │
└────────┴────────┴────────┘
```

### CSS 思路

```css
.palace-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

.palace-cell {
  aspect-ratio: 1;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
```

不要每格：

```text
border-radius
shadow
獨立 background card
```

外框最多 `6–8px` 極小圓角，甚至可完全直角。

這會比 rounded dashboard 更像「盤」。

---

## 13.2 Cell hierarchy

每宮三層足夠：

```text
離 · 南

二黑

洛書 9
```

推薦：

```text
宮位／方位：11–12px muted
星名：20–24px medium
洛書：10–11px muted
```

### 不再用 `①②③...` 作主星

Unicode circled number 很搶眼，而且偏工具／彩票感。

主顯示改為：

```text
一白
二黑
三碧
四綠
五黃
六白
七赤
八白
九紫
```

如要數字：

```text
一白 · 1
```

或只在 `研習模式` 顯示。

---

## 13.3 中宮

中宮是唯一可以有明顯特殊處理的位置。

不要用紫黑色底。

推薦：

```css
.palace-cell--center {
  background: var(--cinnabar-soft);
  box-shadow: inset 0 0 0 1px var(--cinnabar);
}
```

內容：

```text
中

三碧

入中
```

朱砂只用在這裡和「今／active」。

---

# 14. 九星顏色：大幅收斂

目前 `star-1 ... star-9` 各自不同彩色。

V2 不以顏色作主要辨識。

理由：

- 名稱本身已有「白黑碧綠黃赤紫」
- 九宮同時九色會搶走層級
- 新中式需要克制
- accessibility 不能只依靠顏色

### V2 建議

```css
.star-1,
.star-2,
...
.star-9 {
  color: var(--ink);
}
```

可選：研習模式才顯示一個很小的 semantic dot。

但 V2 第一版可以完全不做九星彩色。

---

# 15. Current / Active 語義

整個 App 只有一個「強 accent」：朱砂。

用於：

- `今`
- active level
- active child
- active ke
- 中宮 outline
- primary CTA

### `今`

不要做大 badge。

可以做小朱砂印章感：

```text
┌──┐
│今│
└──┘
```

尺寸約：

```text
20–22px
```

圓角 3–4px，不要 pill。

這是一個很低成本但很「新中式」的品牌細節。

---

# 16. Chart Header

目前：

```text
result.title
三碧入中 · 逆飛
subtitle
```

保留資料，但 hierarchy 重排。

```text
流時盤                 今
亥時
21:00–22:59
三碧入中 · 逆飛
```

其中：

- `流時盤` = section label，較小
- `亥時` = 最大
- 時間 = muted
- `三碧入中 · 逆飛` = secondary result

不要所有資訊都同一字級。

---

# 17. Prev / Next 導航

目前三欄：

```text
← 巳時 | 午時 | 未時 →
```

中間「目前」與上方 title 重複。

V2 改：

```text
‹ 上一時                    下一時 ›
```

或顯示實際值：

```text
‹ 戌時                      子時 ›
```

中間留白。

讓 thumb target 大：

```text
height: 48px
```

### Swipe

可以保留，但修改目前 global root swipe。

目前 swipe listener 綁整個 `#app`，容易在：

- bottom sheet
- input
- horizontal control
- long detail

出現誤觸。

V2：

只綁：

```text
[data-swipe-zone="chart"]
```

且：

```ts
if ((e.target as HTMLElement).closest('button,input,select,dialog,a')) return;
```

不要讓整個 App 都能左右換盤。

---

# 18. Bottom Sheet Component

建立通用 primitive：

```text
src/ui/BottomSheet.ts
```

建議使用 native `<dialog>` 實作。

用途：

```text
TimePickerSheet
ChildPickerSheet
KePickerSheet
ExplainSheet
SettingsSheet
AboutAlgorithmSheet
```

### 規則

- 同時間只允許一個 sheet
- 不要 sheet 疊 sheet
- 有 backdrop
- 有 grabber
- 可 swipe down / backdrop / close button
- focus trap / focus return
- safe-area bottom
- max-height 約 80dvh
- sheet 內才可以 scroll
- 主畫面不要 scroll lock bug

### Mobile

```css
.sheet {
  width: 100%;
  max-width: 560px;
  margin: auto 0 0;
  border-radius: 18px 18px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}
```

Desktop / tablet 可仍保持 bottom-centered，不需要做完全不同 UI。

---

# 19. 簡潔模式 vs 研習模式

## 19.1 簡潔模式（Default）

顯示：

```text
日期時間 context
Level segment
當前盤 summary
九宮盤
prev/next
contextual CTA
為何是此星？
```

不顯示：

```text
節氣精確秒數
六段 day-star debug
日支第幾位
算法 source string
完整年月日時刻 summary
```

---

## 19.2 研習模式

增加一個：

```text
研習資料
```

accordion。

展開才顯示：

```text
公曆
節氣
下一節氣
月建
日柱
時支
日類
陰陽
日盤段
流年
流月
流日
流時
刻
刻星
刻盤算法
```

現有 `DetailPanel.ts` 大部分資料可以直接 reuse。

### 不要 default `open`

目前 `DetailPanel` 是：

```ts
{ class: 'panel', open: 'open' }
```

V2 必須預設關閉。

---

# 20. Explain Mode 重做

現有 `StarResult.explain` 很有價值，不要刪。

但 `details` 形式改成 `ExplainSheet`。

主畫面只顯示：

```text
為何是三碧？  ›
```

Tap：

```text
╭────────────────────────────╮
│ 為何是三碧？               │
│                            │
│ 午日                       │
│ ↓                          │
│ 仲日                       │
│ ↓                          │
│ 夏至後                     │
│ ↓                          │
│ 陰遁                       │
│ ↓                          │
│ 仲日子時九紫起             │
│ ↓                          │
│ 推至亥時                   │
│ ↓                          │
│ 三碧入中                   │
│                            │
│ 規則來源                   │
│ ……                         │
╰────────────────────────────╯
```

### Visual

不是 numbered list 大段文字。

每 step：

```text
小 label
大 value
細 vertical line
```

最後 result 用淡朱砂 panel。

---

# 21. Settings 不再放頁尾

現在 `SettingsSheet()` 是頁面中的 `<details>`。

V2 top bar 右上只有：

```text
⚙
```

Tap 才開 sheet。

分三 group：

## 顯示

```text
模式            簡潔 / 研習
顯示星名        ON
顯示宮名        ON
顯示洛書        OFF（simple default）
```

## 排盤

```text
日柱換日
年界
刻盤算法
```

## 關於

```text
時間制：UTC+8
節氣資料與精度
版本
離線狀態
```

### 預設設定

```ts
mode: 'simple'
showStarName: true
showPalaceName: true
showLuoshu: false
```

`showLuoshu` 在新手模式預設 false，因為宮位本身已足夠。

---

# 22. Top Bar

極簡：

```text
玄空紫白                 ⓘ  ⚙
```

不要把：

```text
完整 timestamp
回到現在 button
```

塞在 top bar。

`回到現在` 改成日期 context 右側的 `今` action。

當 selectedDateTime 不在 now：

```text
2025.12.03 · 14:20     回到今
```

當本來就在 now：

```text
2026.08.07 · 21:38        今
```

---

# 23. 「現在」不是一個靜態文字

當 App 開著跨過：

- 下一分鐘
- 下一刻
- 下一時辰
- 午夜
- 節氣點

需要有明確策略。

V2 不一定要 background live refresh，但當使用者仍在 `now tracking` 狀態時：

```text
每 30–60 秒 refresh now display
```

只有當：

```ts
state.followNow === true
```

才自動更新 selectedDateTime。

一旦使用者手動選其他時間：

```ts
followNow = false
```

按「回到今」：

```ts
followNow = true
selectedDateTime = nowUtc8()
```

如果本輪不想新增 timer，至少不要在 UI 暗示 clock 是 live 而實際不更新。

---

# 24. Child Picker 規格

## Year → Month

不是四欄超密格子。

390px 建議：

```text
2 columns
```

每個：

```text
申月
立秋 08/07
二黑
```

## Month → Day

可以 3 columns，但簡化：

```text
丁酉
08/07
```

星名放右下小字。

## Day → Hour

2 columns：

```text
亥時
21:00–22:59
三碧
```

不要 3 欄把每個時辰壓太小。

## Hour → Ke

1 column list 最易讀。

八刻只有 8 筆，不需要 2 欄。

時間區間和星名同一行可掃視。

---

# 25. Visual Rhythm / Spacing

使用固定 4pt system：

```text
4
8
12
16
24
32
```

主頁：

```text
左右 padding: 16px
section gap: 20–24px
小群組 gap: 8–12px
```

不要目前每個東西都包一個 bordered rounded rectangle。

## Surface 原則

只有三種層級：

1. `paper` — page
2. `paper-raised` — 主盤 / sheet
3. `cinnabar-soft` — active / important

Card 數量越少越高級。

---

# 26. Motion

只做 functional motion。

## 切前後時辰／刻

盤：

```text
opacity 0.65 → 1
translateX 4–6px → 0
180–220ms
```

不要真的把 9 顆星畫「飛行軌跡」。

那會：

- 造成視覺噪音
- 妨礙快速查盤
- 增加 coding scope

## Sheet

```text
translateY(12px) → 0
opacity
180–240ms
```

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 27. Copywriting

術語保留，但對新手提供自然語言。

## 不要

```text
選擇月份（節氣月）
```

## 改

```text
選月份
按節氣分月
```

---

## 不要

```text
刻盤算法：八刻十五分鐘制
此為可替換……
```

永久佔據主畫面。

## 改

```text
八刻十五分鐘制  ⓘ
```

---

## 不要

```text
流時 = 三碧入中 · 逆飛
```

作唯一 title。

## 改成 hierarchy

```text
流時盤
亥時
三碧入中 · 逆飛
```

---

# 28. Component 重構建議

目前：

```text
Home.ts
Breadcrumb.ts
ChildSelector.ts
DetailPanel.ts
ExplainPanel.ts
KeSelector.ts
NinePalaceGrid.ts
SettingsSheet.ts
TimeNavigator.ts
```

V2 建議：

```text
src/ui/
├── TopBar.ts
├── DateTimeContext.ts
├── LevelSegment.ts
├── ChartHeader.ts
├── NinePalaceGrid.ts
├── TimeNavigator.ts
├── ContextAction.ts
│
├── BottomSheet.ts
├── TimePickerSheet.ts
├── ChildPickerSheet.ts
├── KePickerSheet.ts
├── ExplainSheet.ts
├── SettingsSheet.ts
├── StudyPanel.ts
│
└── dom.ts
```

### 舊 component 對應

```text
Home.ts
→ 不再作 landing page；邏輯拆入 DateTimeContext + TimePickerSheet

Breadcrumb.ts
→ mobile main view 移除

ChildSelector.ts
→ 保留 data generation，render 改 ChildPickerSheet

DetailPanel.ts
→ StudyPanel，預設 collapse

ExplainPanel.ts
→ ExplainSheet

KeSelector.ts
→ KePickerSheet

NinePalaceGrid.ts
→ 保留 interface，只改 markup / visual

SettingsSheet.ts
→ 改真正 dialog sheet

TimeNavigator.ts
→ 保留 shiftByLevel，簡化 render
```

重要：

不要把 `monthItems/dayItems/hourItems` 的計算重新搬進 `app.ts`。

可以將 data provider 抽出：

```text
src/ui/selectors/childItems.ts
```

UI 和 item calculation 分開。

---

# 29. `app.ts` V2 組裝

目標結構：

```ts
root.append(
  TopBar(state),
  DateTimeContext(state),
  LevelSegment(state.level),
  ChartHeader(result, ...),
  SwipeZone(
    NinePalaceGrid(result, state.settings)
  ),
  TimeNavigator(...),
  ContextAction(...),
  ExplainTrigger(result),
  state.settings.mode === 'study'
    ? StudyPanel(chart)
    : null,
  Footer()
)
```

Sheet 不應作為長內容 append 在正常 flow 中。

使用 portal-ish host：

```html
<div id="sheet-root"></div>
```

或直接 `document.body.append(dialog)`。

---

# 30. State

只新增必要 UI state。

```ts
export type DisplayMode = 'simple' | 'study'
```

settings：

```ts
interface Settings {
  ...existing
  displayMode: DisplayMode
}
```

### 不需要放 URL

```text
displayMode
sheet open state
```

### 保留 URL

```text
selectedDateTime
level
ke
```

這樣分享 link 仍然指向同一盤，而不是分享某個 modal 狀態。

---

# 31. App 首次進入 / 舊 URL compatibility

目前 `home` state 存在。

不要直接大刀刪除，先做 migration。

推薦：

```text
如果 URL 有明確 level/date
→ 尊重 URL

否則第一次打開
→ nowUtc8 + hour
```

舊 `home=true`：

```text
redirect/render 成 now hour view
```

確認沒有舊 bookmark break 後，下一個版本再刪 `home` state。

---

# 32. PWA 手機細節

## Safe area

```css
padding-bottom: max(16px, env(safe-area-inset-bottom));
```

Bottom Sheet footer 尤其重要。

## `100vh`

避免使用固定 `100vh`。

如需要：

```css
min-height: 100dvh;
```

但主頁最好自然 document flow。

## Standalone

`display: standalone` 下：

- top padding 不可貼 status bar
- sheet 不可被 home indicator 擋住
- date/time native input 要實機測 iOS

---

# 33. Accessibility

必做：

- touch target ≥ 44px
- body base ≥ 16px
- secondary ≥ 13px
- 不用顏色作唯一狀態
- active tab 有 `aria-selected`
- `今` 有文字，不只是紅點
- dialog 有 accessible name
- close button 有 `aria-label="關閉"`
- keyboard Tab order 合理
- Esc 可關 sheet
- focus ring 不移除
- `prefers-reduced-motion`
- 九宮保留 `role="table"` / 合理 aria label

---

# 34. 不要做的事

本輪不要：

1. 重寫 Engine
2. 改年月日時刻算法
3. 換 React/Vue
4. 引入大型 UI framework
5. 引入 icon package
6. 引入遠端 font CDN
7. 加八卦背景
8. 加山水 PNG/JPG 背景
9. 做假宣紙 texture
10. 做 9 色 neon 星盤
11. 做大量 shadow
12. 做 glassmorphism
13. 同時開 dark mode scope
14. 自製 calendar/date picker
15. 用 gesture 取代 button
16. 在主頁顯示 VSOP87 技術段落
17. 把所有 selector 永久展開
18. Sheet 疊 Sheet
19. 為了「新中式」犧牲可讀性
20. 在本輪改 calculation output

---

# 35. Implementation Plan

## Phase 0 — Freeze baseline

先：

```bash
npm test
npm run build
```

記錄：

- tests count
- build success
- current Git commit

本輪建立 branch：

```text
feature/mobile-new-chinese-ui-v2
```

---

## Phase 1 — Design Tokens + 九宮

只改：

```text
styles.css
NinePalaceGrid.ts
```

完成：

- 紙墨朱砂 token
- 移除 dark dashboard visual
- 九宮從 9 cards → 1 方盤
- 中宮新樣式
- 星色收斂

先不要改 navigation。

### Checkpoint 1

必須確保：

```text
375px 無 overflow
390px 九宮方正
430px 九宮不過大
768px max-width 合理
```

---

## Phase 2 — 移除 Landing Friction

改：

```text
app.ts
Home.ts / state migration
TopBar.ts
DateTimeContext.ts
LevelSegment.ts
```

目標：

```text
打開 → 直接 current hour chart
```

並移除常駐：

```text
首頁 date/time inputs
立即排盤
home level buttons
技術 note
breadcrumb
```

### Checkpoint 2

新用戶：

```text
0 tap → current hour
1 tap → current ke
```

---

## Phase 3 — Bottom Sheet Primitive

建立：

```text
BottomSheet.ts
TimePickerSheet.ts
SettingsSheet.ts
```

先不要做 child selector。

驗證：

- open/close
- backdrop
- Esc
- focus return
- safe area
- iOS scrolling

---

## Phase 4 — Child / Ke Sheet

把：

```text
ChildSelector
KeSelector
```

從 inline UI 改為：

```text
ChildPickerSheet
KePickerSheet
```

每個 level 只剩一個 contextual CTA。

### Checkpoint 4

流程：

```text
年
→ 查看十二月
→ 選申月
→ 月盤
→ 查看本月各日
→ 選日
→ 日盤
→ 查看十二時辰
→ 選亥時
→ 時盤
→ 查看此時八刻
→ 第四刻
→ 刻盤
```

全流程不需要瀏覽器 page navigation。

---

## Phase 5 — Explain + Study Mode

重做：

```text
ExplainPanel → ExplainSheet
DetailPanel → StudyPanel
```

新增：

```text
displayMode = simple | study
```

Default：

```text
simple
```

---

## Phase 6 — Polish

加入：

- motion
- reduced motion
- focus states
- swipe zone 修正
- copy polish
- safe area
- loading / no-JS fallback 文案

不要新增新功能。

---

# 36. Tests

算法 tests 全部保留。

另加 UI state / interaction tests。

## 必測

### Default

```text
沒有 URL → level=hour
selectedDateTime≈nowUtc8
```

### Level

```text
hour → ke
ke → hour
任意 level 切換不改 selectedDateTime
```

### Time sheet

```text
選日期時間
confirm
state 正確
URL 正確
```

### Return now

```text
手動時間
→ 回到今
→ nowUtc8
```

### Child sheet

```text
year → month
month → day
day → hour
hour → ke
```

### Sheet

```text
open
close
Esc
backdrop
focus return
```

### Mode

```text
simple 不顯示 StudyPanel
study 顯示 StudyPanel
localStorage 持久化
```

### Layout

至少人工／browser screenshot check：

```text
320
375
390
430
768
```

確認：

```text
no horizontal scrollbar
nine palace square
no clipped native date input
sheet footer above safe area
```

---

# 37. 最終 V2 Acceptance Criteria

只有全部符合才算完成。

## A. 新手

打開 App：

```text
直接看到現在流時盤
```

不用先理解：

```text
UTC+8
節氣月
陰遁
VSOP87
```

也能使用。

---

## B. 刻盤

從預設畫面：

```text
Tap「刻」
```

立即得到現在刻盤。

或：

```text
Tap「查看此時八刻」
→ Tap 某一刻
```

得到指定刻盤。

---

## C. 視覺

第一眼必須是：

```text
紙
墨
細線
朱砂
大量留白
```

而不是：

```text
dark dashboard
彩色九星
很多 rounded cards
```

---

## D. 層級

主畫面同時只存在：

```text
1 個 level control
1 個 time navigation
1 個 contextual CTA
```

不能再同時出現：

```text
Breadcrumb + Tabs + Picker + Navigator
```

---

## E. 研究功能

原本所有研究資料仍然可取得：

```text
Explain
節氣
月建
日柱
日類
陰陽遁
流年月日時刻
算法名稱
```

只是移入：

```text
研習模式 / sheet
```

而不是刪除。

---

## F. Algorithm regression

```bash
npm test
```

原有算法 tests 必須全部 pass。

任何 UI 重構都不可以改變同一 datetime 的：

```text
centerStar
direction
palaceStars
```

---

# 38. Codex / Claude 執行指令

開始前先做：

```text
1. 閱讀 README.md
2. 閱讀 src/app.ts
3. 閱讀 src/styles.css
4. 閱讀 src/ui/*
5. 閱讀 state/settings
6. 跑 npm test
7. 跑 npm run build
```

然後輸出：

```text
A. 你理解的現有 UI flow
B. 本輪會改哪些檔
C. 哪些 Engine 檔保證不碰
D. Phase 1 implementation plan
```

**先完成 Phase 1，不要一次做完 Phase 1–6。**

每個 Phase 完成後：

```text
npm test
npm run build
```

並回報：

```text
changed files
test result
build result
mobile layout risks
下一 Phase 計劃
```

---

# 39. 一句設計北極星

> **它應該像一件現代文人工具：第一次打開不用學，深入使用又不會嫌它淺。**

第二句是 UX 驗收原則：

> **使用者不是先「設定一張盤」，而是先「看到現在」，再決定要不要探索時間。**

---

# 40. 本輪優先度

如果時間有限，依這個順序：

```text
P0  直接進 current hour，不要 landing page
P0  九宮盤新中式重做
P0  年/月/日/時/刻 level control 簡化
P0  刻一 tap 可達
P1  TimePicker bottom sheet
P1  Child / Ke bottom sheet
P1  Settings sheet
P1  Simple / Study mode
P2  Explain visual polish
P2  Motion
P3  Dark mode
```

**Dark Mode 明確放到 V3 之後。**

先把 Light 新中式版本做到真正成熟。
