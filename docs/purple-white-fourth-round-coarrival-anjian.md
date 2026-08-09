# 紫白擇吉第四輪考源 implementation record

> 歷史記錄：co-arrival、raw／qualified arrival 及 classical 受剋分離繼續有效；本文的「暗建只套月層」、「五黃四隅為唯一解」、四層 role 及 status V4 已被 [第五輪實作紀錄](purple-white-fifth-round-layered-anjian-qi.md) 修正。

本文件記錄 `紫白擇吉_第四輪考源_四課同到與暗建修正.md` 的保守落地方式，並取代第三輪中「暗建＝飛星回本宮」及「所有宮剋星都叫受剋殺」的暫定實作。

## 原始研究規格

- 檔名：`紫白擇吉_第四輪考源_四課同到與暗建修正.md`
- 行數：991
- SHA-256：`ad68b75acd003b6e8bdd642b8976624329190bad18d8c5c27be84a36601bb454`
- 文件仍未附可重跑的固定版本頁碼、逐字引文與原頁影像；方法層資料繼續保持 `primarySourceVerified=false`。

## 第四輪觀念修正

### 紫白同到

- `紫白一時加` 與 `紫白二時加` 兩種讀法都保存為 variant，不把 `purpleWhiteCount >= 2` 當成古法硬門檻。
- Raw arrival 與 qualified arrival 分開記錄。合格紫白必須為 1／6／8／9，該層支序有氣，且無入墓、臨絕或 classical killer。
- 一個合格紫白即可成為正面訊號；多層同到再增強，四層標示「年月日時紫白同到」。
- UI 使用「無紫白到方／紫白到方／雙層／三層／年月日時同到」，不再顯示「二時紫白同加」為唯一原文。

### 時間層角色

- 年：`background_or_large_scale`，作背景或大型修作參考。
- 月、日：`primary`。
- 時：`fine_tuning`。
- 只表達相對層級，沒有發明固定百分比或數值權重。
- 現有用途 selector 繼續是「雙星參考」的 context，不會影響方向排序。本輪未新增另一套「修造／日常」state；UI 明示日常擇吉方是對傳統修方邏輯的延伸應用。

## 月暗建及白中殺

### 月暗建

`DirectionSnapshot` 另存 `monthCenterStar`，暗建依「月白入中星 → 禁修宮」判定：

| 月白入中 | 禁修宮 |
|---|---|
| 1 | 坎 |
| 2 | 坤 |
| 3 | 震 |
| 4 | 巽 |
| 5 | 乾、坤、艮、巽 |
| 6 | 乾 |
| 7 | 兌 |
| 8 | 艮 |
| 9 | 離 |

只有 month layer 正式套用 `月暗建`。年／日／時暗建仍是 `research_pending`，不由程式類推。

### Classical 受剋殺與一般五行關係

古表受剋殺使用獨立定局：

```text
1→中；2→震巽；3→乾兌；4→乾兌；5→震巽
6→離；7→離；8→震巽；9→坎
```

一般 `宮五行 × 星五行` 另列為同行、宮生星、星生宮、宮剋星或星剋宮。例如一白落艮可顯示「艮土剋一白水」，但不會因此冒稱古表「受剋殺」。

穿心、六七交劍及鬥牛定局保留。鬥牛程式採金土入震巽木宮；「水」字 OCR／轉錄只保存為 variant，不進公式。

## Direction status V4

程式順序固定為 arrival → 支序有氣／墓絕 → 月暗建 → classical killers 與一般五行 → layer role → 81 pair reference。

- `priority`：月／日至少一個合格紫白，且無重大警示。
- `usable`：有合格紫白、無重大警示，但主要層未合格。
- `mixed`：有 raw 紫白，同時有墓絕、白殺或黃黑疊到警示。
- `caution`：主要層無合格紫白，且黃黑疊到或命中多個 classical killer。
- 保留既有 `ordinary` 作為「無合格紫白，亦無上述警示」的中性 fallback，避免把沒有正面訊號但也無警示的方向硬寫成「慎用」。

上述名稱均是可解釋的 tool heuristic，不是古籍原有等級。81 組時間 pair 仍為 `reference_only`、`rankingWeight=0`，不參與 status 或排序。

## UI 與驗收

- 擇吉九宮在命中時顯示「⚠ 月暗建」；方向詳情同時顯示 raw 與合格紫白層數。
- 「為甚麼」逐層顯示年／月／日／時角色、支序有氣、墓絕、月令、classical killer 及一般宮星五行關係。
- TypeScript：通過。
- Vitest：24 files、179 tests 全數通過；1200 點 engine snapshot fixture 未修改。
- production build：通過；PWA precache 11 entries／437.48 KiB，包含離線 WOFF2。
- single-file build：通過；`玄空紫白.html` 518,104 bytes，字體以 data URI 內嵌。
- 離線字體：掃描 77 個靜態 UI 來源檔，892 個 UI 字元／893 glyphs，WOFF2 235,964 bytes，SHA-256 `f58ec3e8d08cbc9bd48eff366b21d261183d7b7bd2c936110c158bb28a429a42`。
- production Browser：320／375／390／430px 頁面與宮格均無 horizontal overflow；九宮分別為 296／343／358／398px，保持 9 格、8 個可選方向及最小 44px 按鈕。
- 實例月白 3 入中時，震方正確顯示「月暗建」；巽方仍只顯示本宮的受剋／鬥牛等條件。
- 320px 方向詳情無水平溢出，四個 disclosure 保持預設收起；一般五行關係、一時／二時異文與研究邊界都可見。
- Browser console：0 error／warning。

## 明確暫緩

- 年／日／時暗建。
- 「修造／日常」模式 state 與獨立 ranking；現有 V1 只用無數值的 layer role。
- 四層固定百分比或數值權重。
- 五行支持型有氣的 `periodElement` 模型。
- 81 pair 對年月日時擇吉的自動加減分。
- 68 在時間 pair 的固定「武科」斷義。
- 白殺原表及一白受剋、五黃暗建、鬥牛異文在固定版本原頁的逐格覆核。
