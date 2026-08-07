# 玄空紫白 PWA — Read-only Code / UI Review

**Review target:** `commit fdee2e7`  
**Review scope:** V2.1 visual refinement + iOS date/time fix  
**Truth sources:** `README.md`、`docs/HANDOFF.md`、V2.1 規格文件  

## Review constraints

本 review 僅做 **read-only code / UI review**，不直接重寫專案。

禁止建議修改：

- `src/engine/**`
- `src/data/**`
- `tests/fixtures/chart-snapshot.json`
- UTC+8 計算規則
- 原生 `input[type="date"]`
- 原生 `input[type="time"]`

---

# Executive Summary

本次 review 結論：

| Priority | 結果 |
|---|---|
| **P0** | **0 個已確認 code bug**；iOS date/time 修法本身符合規格，只剩實體 iPhone acceptance test |
| **P1** | **1 個**：`LevelSegment` 宣告為 ARIA tabs，但 keyboard tabs pattern 未完成 |
| **P2** | **2 個**：返回時盤箭頭方向位置不理想；`docs/HANDOFF.md` checkpoint / 路徑已過期 |

整體判斷：

> `fdee2e7` 沒有需要先阻擋 iPhone spot-check 的 P0 問題，可以繼續做實機驗收。

---

# P0

## P0-1 — iOS date/time border fix

### 1. 檔案及行號

- `src/ui/TimePickerSheet.ts:7–14, 33–39`
- `src/styles.css:643–671`
- `docs/HANDOFF.md:72–82, 105–108, 137–139`

### 2. 問題證據或重現步驟

**靜態 code review：無問題。**

V2.1 規格要求：

```text
label
└─ visual shell
   └─ native date/time input
```

目前實作已符合：

- 保留原生 `input[type="date"]`
- 保留原生 `input[type="time"]`
- native input 使用 `.sheet-native-input`
- 外層新增 `.sheet-input-shell`
- border / padding / background 移到 shell
- shell 使用 `:focus-within` 提供 focus state
- native input 本身 `border: 0`
- native input 本身 `outline: 0`
- 未加入 `appearance: none`
- 未修改 UTC+8 計算規則

這正是針對 iOS native date/time control 避免「雙框／focus ring 走位」的正確最小修法。

目前尚未能從 desktop / jsdom 靜態 review 完整證明：

- iOS Safari native calendar 開啟時無 layout shift
- PWA standalone 下無 overflow
- calendar 關閉後 field shell 不跳位
- time picker 與 date picker 表現一致

### 3. 風險

風險主要屬於 **iOS native control rendering 未實機驗證**，不是已確認的程式錯誤。

可能風險：

- system picker 開啟後 intrinsic width 改變
- Bottom Sheet 出現水平 overflow
- focus ring 關閉 picker 後未正常恢復
- Safari 與 PWA standalone 表現不一致

### 4. 最小修正建議

**目前不建議修改 code。**

不要再預先調整：

```css
outline-offset
-webkit-appearance
appearance
native input padding
```

先做實體 iPhone 驗收。

只有在實機仍可重現 border 走位時，才根據實際 DOM / computed style 做單一最小 CSS diff。

### 5. 建議測試

至少：

```text
iPhone Safari
iPhone PWA standalone
iOS Chrome
```

建議 viewport：

```text
375px
390px
430px
```

測試流程：

1. 開啟日期時間 Bottom Sheet
2. 點日期 field
3. 開啟 iOS native calendar
4. 更換日期
5. 按系統確認
6. 檢查 field border / focus ring
7. 再次開啟 calendar
8. 關閉 picker
9. 檢查 Bottom Sheet width 是否改變
10. 對 time input 重複相同流程

建議用 Safari Remote Inspector 檢查：

```js
document.documentElement.scrollWidth
document.documentElement.clientWidth
```

期望：

```text
scrollWidth <= clientWidth
```

### 結論

**無問題。**

目前只欠實體 iPhone acceptance test，不建議再主動修改。

---

# P1

## P1-1 — `LevelSegment` 的 ARIA tabs keyboard semantics 不完整

### 1. 檔案及行號

- `src/ui/LevelSegment.ts:4–16`
- `src/app.ts:32–38`
- `tests/phase6.test.ts:39–43`

### 2. 問題證據或重現步驟

目前：

```html
role="tablist"
role="tab"
aria-selected="..."
aria-controls="current-chart"
```

即 UI 已向 assistive technology 宣告為一組 tabs。

但目前沒有完整 tabs keyboard model：

- active tab 沒有明確 `tabindex="0"`
- inactive tabs 沒有 `tabindex="-1"`
- 沒有 `ArrowLeft`
- 沒有 `ArrowRight`
- 沒有 `Home`
- 沒有 `End`
- `#current-chart` 目前不是 `role="tabpanel"`

目前測試只確認：

```text
存在 tablist
存在 5 個 role=tab
只有 1 個 aria-selected=true
```

因此測試會把「語義不完整的 tabs pattern」判定為成功。

### 3. 風險

對純 touch 手機使用者影響很低。

但以下情況會有 semantic contract 不一致：

- 外接鍵盤
- VoiceOver + keyboard
- Switch Control
- desktop keyboard navigation

Assistive technology 被告知：

> 這是一組 tabs

但實際操作仍然只是五個一般 button。

因此列為 **P1 accessibility issue**。

### 4. 最小修正建議

不要重寫 `LevelSegment`。

補齊最小 tabs keyboard behavior：

```text
active tab    → tabindex="0"
其他 tab      → tabindex="-1"

ArrowLeft     → 前一層
ArrowRight    → 下一層
Home          → 年
End           → 刻
```

因為切換是即時本地 UI，不存在 loading，可採 automatic activation：

```text
focus tab
→ setLevel()
```

並把：

```html
<section id="current-chart">
```

改為：

```html
<section
  id="current-chart"
  role="tabpanel"
>
```

如現有結構容易補，可進一步建立：

```text
tab id
aria-labelledby
```

但不要因此重構 state。

### 5. 建議測試

新增 UI test：

```text
初始 active = 時
→ 時 tabindex=0
→ 其他 tabindex=-1
```

再測：

```text
focus 時
→ ArrowRight
→ focus 刻
→ aria-selected 更新
→ level=ke
```

另外：

```text
Home → 年
End → 刻
```

並確認：

```text
#current-chart role=tabpanel
```

---

# P2

## P2-1 — 「返回時盤」左箭頭顯示在 row 右側

### 1. 檔案及行號

- `src/ui/ContextAction.ts:13–19, 21–27`
- `src/styles.css:337–359`

### 2. 問題證據或重現步驟

目前 `actionContent()` 結構固定為：

```text
copy
arrow
```

下鑽 action：

```text
查看八刻                         ›
```

這沒有問題。

但在 `ke` level：

```ts
actionContent('返回時盤', undefined, '‹')
```

因此畫面結果會是：

```text
返回時盤                         ‹
```

而不是比較自然的：

```text
‹ 返回時盤
```

這與箭頭本身的方向語義不一致。

### 3. 風險

功能不受影響。

風險屬於：

- navigation direction 語義弱
- minimalist layout 下更容易被看成 decorative glyph
- 與 forward action 的視覺 grammar 不一致

### 4. 最小修正建議

不要重寫 `ContextAction`。

只讓 helper 支援：

```text
direction = forward | back
```

例如：

```text
forward:
copy → arrow

back:
arrow → copy
```

最後：

```text
‹ 返回時盤
```

建議直接修 DOM order，而不是單純用 CSS `order`，因為 visual order 與 reading order 一致會更乾淨。

### 5. 建議測試

在 `ke` level：

- 第一個 visual child 為 arrow
- 第二個為 `返回時盤`
- arrow 維持 `aria-hidden="true"`
- accessible name 仍為：

```text
返回時盤
```

---

## P2-2 — `docs/HANDOFF.md` checkpoint / 路徑已過期

### 1. 檔案及行號

- `docs/HANDOFF.md:4–13`

目前仍有類似：

```text
V2.1 基線 commit：e5e2d33
本文件所在 checkpoint 已包含 V2.1；尚未 push
```

以及 local path：

```text
/Users/.../Downloads/...
```

### 2. 問題證據或重現步驟

本次 review target 已經是：

```text
fdee2e7
```

而且此 commit 已存在於公開 repository。

因此 HANDOFF 仍寫：

```text
尚未 push
```

已與實際 repo 狀態不一致。

同時 V2.1 spec 如果只指向：

```text
/Users/.../Downloads/...
```

下一個 agent 從 repository 無法取得該 truth source。

### 3. 風險

不影響 runtime。

但會直接影響後續 AI / developer handoff：

- 誤認目前 checkpoint
- 誤認 code 尚未 push
- 無法取得 V2.1 spec
- 可能基於錯誤 baseline 做 diff

這與 `HANDOFF.md` 作為 truth source 的目的相衝突。

### 4. 最小修正建議

只修改 docs。

更新類似：

```text
目前 review checkpoint：fdee2e7
V2.1 已 commit / push
下一步：iPhone spot-check + review findings
```

V2.1 spec 建議放入 repo：

```text
docs/v2.1-visual-refinement-ios-datetime.md
```

然後 HANDOFF 使用 repo-relative path。

若暫時不想 commit spec，至少不要再把 local `/Users/...` path 當作 repository truth source。

### 5. 建議測試

不需要 runtime test。

文件 consistency check：

```bash
git rev-parse --short HEAD
```

應與 HANDOFF checkpoint 一致。

如果 HANDOFF 引用了 repo file：

```bash
test -f <path>
```

應成功。

---

# P2 — 其餘 V2.1 項目

## 自帶 Serif 字體

**無問題。**

檢查點：

- 本地 WOFF2
- preload
- offline / Workbox 涵蓋字體資源
- 未依賴 runtime Google Fonts
- UI system sans 與 display serif 分工合理

不建議擴大 scope。

---

## TopBar icons

**無問題。**

目前：

- 已移除 emoji gear
- info / settings 均使用 inline SVG
- `currentColor`
- stroke grammar 一致
- button hit target 保留

不建議再改 icon system。

---

## 兩個「今」

**無問題。**

ChartHeader 已移除第二個「今」。

目前主畫面只由 DateTimeContext 表達 selected time 是否為現在，符合 V2.1 規格。

---

## 主畫面 UTC+8

**無問題。**

主畫面已不永久顯示 `UTC+8`。

TimePicker / Settings 仍保留時間基準說明。

UTC+8 計算規則未被修改。

---

## Previous / Next 去卡片化

**無問題。**

已由 bordered cards 改為較輕量的 navigation。

不建議再做 layout refactor。

---

## 九宮 geometry

**無問題。**

本 commit 沒有重做九宮 layout / engine。

符合 V2.1：

> 九宮只 polish，不重做 geometry。

---

# Final Priority List

## P0

```text
無已確認 code bug
```

Action：

```text
只做實體 iPhone acceptance test
```

---

## P1

### 1. ARIA tabs keyboard model

最小處理：

```text
tabindex
ArrowLeft / ArrowRight
Home / End
tabpanel
```

---

## P2

### 1. 返回時盤箭頭位置

由：

```text
返回時盤                         ‹
```

改：

```text
‹ 返回時盤
```

### 2. HANDOFF 過期

更新：

```text
checkpoint
push 狀態
V2.1 spec path
```

---

# 建議執行順序

```text
1. 不改 code，先做 iPhone date/time spot-check
2. 確認 P0 pass
3. 獨立小 commit 修 P1 accessibility
4. 獨立小 commit 修 P2 ContextAction + HANDOFF
```

不要把上述三件事重新混在一個大 UI refactor commit。

---

# 最終判斷

`fdee2e7` 可以繼續進入實機驗收。

目前沒有需要阻擋驗收的 P0 問題。

最重要的是：

> **不要因為這次 review 再次擴大 scope。V2.1 的核心 UI 修正已基本成立，下一步應是驗證與小修，而不是再設計一次。**
