# 紫白擇吉第六輪考源 implementation record

本文件記錄 `紫白擇吉_第六輪考源_大月建合流與日白升級.md` 的保守落地方式，並取代第五輪「大月建另算且尚未評估」及「日支有氣只作警示」的暫定政策。

> 歷史狀態：第七輪已完成白中殺 9 星×6 殺的規則級封版，現行矩陣請以 `docs/purple-white-seventh-round-white-killer-matrix.md` 為準。第六輪的大月建合流、日白主層、日支 B+ 與日時白中殺 reference-only 政策仍有效。

## 原始研究規格

- 檔名：`紫白擇吉_第六輪考源_大月建合流與日白升級.md`
- 行數：1,067
- SHA-256：`490e81f5e19bd69f65e3878daa089e59d57c65d4007e144ce00c3d5a9140b727`
- code checkpoint：`9674f28`
- 研究稿整理了《欽定協紀辨方書》《選擇紀要》《選擇要略》等材料，但仍未附本專案可重跑的固定版本頁碼、完整逐字引文及原頁影像；既有 `primarySourceVerified=false` 邊界不提升。

## 大月建與月暗建合流

第六輪正式採用：

```text
大月建方 = 本月紫白入中星的後天本宮
```

`computeDaYueJian()` 現在直接接收正式 `FullChart` 已算出的 `monthCenterStar`，再查既有 `NATIVE_PALACE`。沒有新增第二套月干支飛宮算法，也沒有修改 `src/engine/**`。測試逐項鎖定三組十二月序列，共 36 / 36 個月型態；五黃的本宮固定為中宮。

舊按年干起大月建法只保留為停用 metadata：

```ts
legacyYearStemRule = {
  enabled: false,
  status: 'deprecated_by_xieji'
}
```

月暗建與大月建的術語來源仍分開保存，但在同一方向只產生一個 `an_jian` active warning，不建立第二筆 killer hit、不重複扣減。主盤及 Direction Detail 合流顯示「大月建／月暗建」。五黃四隅仍只是 `san_yuan_bao_hai` 傳本異法，不進預設 ranking。

## 四層紫白及有氣政策

紫白到方與支序有氣現在明確分成兩個 channel：

| 層級 | 紫白到方角色 | 支序有氣 | 白中殺 |
|---|---|---|---|
| 年 | 正式背景 | A／active | A／active |
| 月 | 正式主層 | A／active | A／active |
| 日 | 正式主層 | B+／active-secondary | B／reference-only |
| 時 | 正式輕量細選 | C／reference-only | B／reference-only |

因此日白到方不再因「當日地支未列直接有氣」而整層失效；無 active killer、入墓或臨絕時可成為主層訊號。日支直接有氣只作次級加強：同樣無警示時，有直接有氣的月／日主層可列「優先」，沒有直接有氣但到方有效的主層列「可用」。

時白不會單獨把普通方向翻成可用或優先；它只在 verdict 相同、年月日條件接近時作最後細選。日、時白中殺仍完整計算並顯示研究參考，但不參與 verdict，沒有趁本輪升為 hard veto。

## Direction status V6

- 大月建／月暗建單一 warning 不會直接產生 `caution`；原有正面主層遇到它時落 `mixed`。
- 大月建再疊二黑／五黃、其他年月 active killer、或非參考層墓絕時，升為 `caution`。
- 二黑、五黃多層同到的既有 `caution` safeguard 保留。
- 月／日是能建立 `priority`／`usable` 的主層；年只作背景，時只作 tie-breaker。
- 完整日主／時課 Gate 尚未封版，工具仍不宣稱日期本身已通過通書日課；現有狀態名稱繼續只是可解釋的工具分級。
- 雙星 81 組仍為 `reference_only`、`rankingWeight=0`，不參與 status 或方向排序。

## UI 與驗收

- 主盤月暗建改為單一「⚠ 大月建／月暗建」；年暗建仍顯示「年九宮暗建」，日時類比不出現在主盤警示。
- Direction Detail 說明本月入中星、本宮定位、同位及只計一次；不再顯示「大月建月干支飛宮尚待核對」的過期說法。
- 紫白到方按「主層／背景／細選」顯示；日支有氣寫成「次級有效」，時支維持「類推參考」。
- TypeScript：通過。
- Vitest：25 files、194 tests 全數通過；1,200 點 engine snapshot fixture 未修改。
- production build：通過；PWA precache 11 entries／455.01 KiB，包含離線 WOFF2；主 bundle 為 `index-BewAo_Zn.js`。
- single-file build：通過；`玄空紫白.html` 538,436 bytes，字體只內嵌一份 data URI。
- 離線字體：912 個 UI 字元／913 glyphs，243,128 bytes，SHA-256 `15d965d847acff86b6df05129923038bb383c66a49e076768da6fe56bc04fcac`；public 與 production 產物雜湊一致。
- production Browser：320／375／390／430px 的頁面、九宮及 9 個宮格均無 horizontal overflow；各寬度都有 8 個方向按鈕、8 個排序方向、0 個宮格溢出。
- 320px Direction Detail 為 318px client／scroll width，合流說明、日支次級有效、時白細選及研究邊界均可讀；user-facing UI 沒有 internal tokens。
- `document.fonts.check()` 對「大月建／月暗建／詳情／舊／靠／翻」命中；Browser console 為 0 warning／0 error。

## 明確暫緩

- 日白、時白 white killers 是否升為 active；本輪繼續 `reference_only`。
- 時支 branch-lifecycle qi 的直接操作表；本輪繼續 reference／tie-break。
- 白中殺 9 星×6 殺的固定版本、頁碼、逐字引文與原頁影像證據包。
- 月建納音如何改變值月星及八方飛星。
- 完整日主／時課 Gate、旬空、刑害、二十四山、修造／日常模式及固定百分比。
- 第六輪研究來源的固定版本、頁碼、逐字引文與原頁影像校對。
