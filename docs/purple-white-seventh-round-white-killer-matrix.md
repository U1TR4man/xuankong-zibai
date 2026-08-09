# 紫白擇吉第七輪白中殺 9×6 矩陣 implementation record

本文件記錄 `紫白擇吉_第七輪考源_白中殺9x6矩陣封版.md` 的保守落地方式。「封版」只指程式規則級的 9 星×6 殺定局；因本專案仍未收入可重跑的固定版本原頁影像、頁碼與完整逐字引文，`primarySourceVerified` 仍為 `false`。

## 原始研究規格

- 檔名：`紫白擇吉_第七輪考源_白中殺9x6矩陣封版.md`
- 行數：1,388
- SHA-256：`55166693550a178bb64d855965cbf1445a3171466cb26ef13d06f29bc8443a39`
- code checkpoint：`175ee81`
- 研究稿對讀《儒門崇理折衷堪輿完孝錄》《佐玄直指圖解》《造命宗鏡集》《類編曆法通書大全》《五要奇書》等材料，但未附本專案可重跑的原頁證據包；不擅自把規則級封版改寫為原典已核。

## 9 星×6 殺唯一真相表

`src/selection/whiteKillerMatrix.ts` 現在是一般九宮暗建、受剋、穿心、交劍、鬥牛與六捷墓的單一程式真相源：

| 星 | 六捷墓 | 九宮暗建 | 受剋殺 | 穿心殺 | 交劍殺 | 鬥牛殺 |
|---:|---|---|---|---|---|---|
| 1 | 辰 | 坎 | 中 | 離 | — | — |
| 2 | 辰 | 坤 | 震、巽 | 艮 | — | 震、巽 |
| 3 | 未 | 震 | 乾、兌 | 兌 | — | — |
| 4 | 未 | 巽 | 乾、兌 | 乾 | — | — |
| 5 | 辰 | 中 | 震、巽 | — | — | 震、巽 |
| 6 | 丑 | 乾 | 離 | 巽 | 兌 | 震、巽 |
| 7 | 丑 | 兌 | 離 | 震 | 乾 | 震、巽 |
| 8 | 辰 | 艮 | 震、巽 | 坤 | — | 震、巽 |
| 9 | 戌 | 離 | 坎 | 坎 | — | — |

第七輪還原的原表欄序以 `9、1、2、3、4、5、6、7、8` 另存於 audit metadata。規則級信心分級為：六捷墓 A+、暗建 A+、穿心 A+，受剋、交劍、鬥牛 A。五黃預設繼續為中宮；乾坤艮巽四隅只是 `variant_only`，不疊加。

## 三種輸入契約

不同殺法不再共用一個模糊的「星落宮」入口：

- `assessAnJian(centerStar, palace)`：只讀各層入中星與目標宮。
- `assessArrivalWhiteKillers(star, palace)`：只讀目標方的到方星，回傳可同層重疊的受剋、穿心、交劍、鬥牛陣列。
- `assessLiuJie(star, periodBranch)`：只讀該層到方星與時間地支。

受剋殺完全依顯式古表，不再用一般五行生剋公式代替。因此一白到艮仍只能在「宮星五行」顯示宮土剋星水，不能冒稱古法受剋殺。

## 層級與 ranking 邊界不變

- 年、月白中殺繼續 active；日、時繼續 `reference_only`。
- 大月建仍等於月入中星本宮；與月暗建同位時合流顯示並只計一次警示。
- 單層可同時命中多殺，但 Direction status 仍使用第六輪粗粒度的 source-aware V6 判定，不把殺數線性換算為權重。
- 山頭五行衝突是未來的獨立 channel，不混入這張宮位定局。
- 雙星 81 組繼續 `rankingWeight=0`，不參與方向排序。

## UI 與驗收

- 擇吉宮格可顯示同層多殺，例如東方年八白同時「受剋、鬥牛」。
- Direction Detail 的大月建／月暗建及其他月殺可並列；實驗 `2026-08-09 14:18` 坤方同時顯示「大月建／月暗建」與「月八白到坤→穿心殺」，暗建仍只計一次。
- 研究說明以自然中文交代三種輸入與層級邊界，不暴露新的 internal token。
- TypeScript：通過。
- Vitest：25 files、194 tests 全數通過；1,200 點 engine snapshot fixture 未修改。
- production build：通過；PWA precache 11 entries／457.64 KiB，包含新版離線 WOFF2；主 bundle 為 `index-D0vKkmIb.js`，CSS 為 `index-TKfxGAsd.css`。
- single-file build：通過；`玄空紫白.html` 541,632 bytes。
- 離線字體：917 個 UI 字元／918 glyphs，244,620 bytes，SHA-256 `5db7f01b9af6f76e2c25aeb7fe3225b4cc1d09d4042030ed4b35e14f8b42acfc`；public 與 production 雜湊一致。
- production Browser：320／375／390／430px 的 `clientWidth` 與 `scrollWidth` 全部相等，日期列、九宮及擇吉方向無 horizontal overflow；320px Direction Detail 的 client／scroll width 均為 318px。
- Browser `document.fonts.check()` 為 `true`；console 為 0 warning／0 error。
- 重點實驗使用現行 production bundle；同 origin 如已有舊 PWA cache，service worker 正常安裝新版後再載入一次即切換到新 hash 資產。

## 明確暫緩

- 日、時白中殺的直接操作實例及是否升為 active。
- 第七輪所引各書的固定版本、頁碼、完整逐字引文與原頁影像證據包。
- 月建納音如何改變值月星及八方飛星。
- 完整日主／時課 Gate、旬空、刑害、二十四山、山頭五行、修造／日常獨立模式及固定百分比。
