# 紫白擇吉考源與雙星 81 組 V1 implementation record

本文件記錄《紫白擇吉_考源與雙星81組_V1研究版.md》的保守落地方式。

- 原始研究版：552 行
- SHA-256：`c3974e22e6fbc4e7b811bfca2a53c64004d6671b46f2db2edf8a35f9cee6dd61`
- code checkpoint：`1f7510b`
- 本輪未修改 `src/engine/**`、`src/data/**`、UTC+8、飛星算法或 snapshot fixture

## 考源結論的產品邊界

1. 年、月、日、時紫白到方可作為擇方的正式骨架。
2. 11–99 完整 81 組是後世將《紫白訣》、玄空古賦、宅盤山向雙星與後世彙整組成的學習框架，不能標成「《紫白訣》81 條原文」。
3. 目前沒有足夠直接證據，可將同一方的年月日時六個 pair 直接轉成吉凶加減分。
4. 因此 81 組在 V1 只是「雙星參考／學習層」，不參與方向 verdict 或 ranking。

## 81 組入庫狀態

`src/selection/pairRules.ts` 已收錄研究版的 81 條現代精簡摘要：

| 研究級別 | 條數 | 入庫原則 |
|---|---:|---|
| A | 20 | 研究版判定為直接或非常接近的組合判語 |
| A/B | 3 | 同時具直接與旁證性；排序時保守正規化為 B |
| B | 53 | 其他玄空古賦或雙星旁證 |
| B/C | 3 | 旁證與後世推演間；排序時保守正規化為 C |
| C | 2 | 後世彙整、五行或卦象推演 |

所有 81 條均固定：

```text
reviewStatus = needs-review
verified = false
temporalUse = reference_only
rankingWeight = 0
context = temporal_experimental
polarity = neutral
```

研究版沒有附古籍版本、頁碼與逐字引文，所以學習卡會明示「尚未收錄可核對的逐字引文」，不將研究摘要假裝成原文。

## 有序組合

研究版明確有次序差異的六條保持 `orderSensitive=true`：

```text
25 / 52
37 / 73
68 / 86
```

其他非同星 pair 仍可依時間層搜尋「有序／不分次序」，但 UI 不會聲稱古法已證明其反向必然有不同斷語。

時間 pair convention 為：

```text
較慢層 = 第一碼
較快層 = 第二碼
```

這只是工具為年 > 月 > 日 > 時建立的穩定 convention，不聲稱古代山向雙星原本使用相同定義。

## Ranking 解耦

- `evaluateDirection()` 仍只使用正式 `FullChart` 與既有紫白集中 heuristic。
- `favorableHits`、`cautionHits`、`mixedHits` 不再由雙星 81 組產生。
- `rankDirections()` 不再使用 pair 來源、pair 用途 tags 或 pair 斷語。
- 切換「文書／考試」「喜慶」等用途只會更新雙星參考 context，不會改變八方排序。
- 尋組合繼續是 deterministic matching；用途搜尋依研究摘要的明確關鍵詞建立參考 index，不是時間推薦分數。

## UI 語義

- 主盤與方向詳情統一使用「雙星參考」。
- 用途模式改為「用途參考」，不使用「雙星吉凶」。
- 學習卡顯示研究級別、review、context、`rankingWeight=0`、五行關係及無引文警示。
- 明確次序的 pair 可切換獨立 reverse rule。

## 本輪驗證

```text
test files   24 passed
tests        165 passed
TypeScript   passed
production   passed（71 modules；CSS 34.82 kB；JS 136.11 kB）
PWA precache passed（11 entries；243.20 KiB）
single file  passed（玄空紫白.html 約 254 KB）
```

320px production 瀏覽器實測：

- 擇吉盤、方向詳情、學習卡與尋組合表單皆無 horizontal overflow。
- 方向詳情完整顯示 6 個 pair。
- 68 顯示「六八：武科、韜略、權位、尊榮」、A 級、待逐條覆核、無引文警示、`rankingWeight=0` 與 `68 ≠ 86`。
- 用途從文書／考試切到喜慶後，八方排序順序完全不變。
- 有序搜尋的快慢層 convention 可見，主按鈕高度 45px，console 無 warning / error。

## 後續考據

下一階段不是擴大吉凶算法，而是逐條建立：

```text
originalText
edition
sourceTitle
sourceDate
page / chapter
context
verified
```

只有當來源版本、上下文與適用 context 可重跑核對後，才可將單條 `verified` 改為 `true`。在更直接的選擇古籍證據出現前，`rankingWeight` 仍必須是 0。
