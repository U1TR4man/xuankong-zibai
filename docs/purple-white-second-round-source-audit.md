# 紫白擇吉第二輪考源 implementation record

本文件記錄 `紫白擇吉_第二輪考源_古法規則與81組證據校正.md` 的保守落地方式。

- 原始研究：850 行
- SHA-256：`016cac3291e712b1ec3b631b7137b165fa5d8f9222af4cd0cc26db7708130997`
- Code checkpoint：`e389de3`
- 本輪只編碼使用者提供的第二輪研究結論；沒有把缺少版本頁碼或原頁影像的資料升格為已核原典
- `src/engine/**`、`src/data/**`、UTC+8、飛星算法與 snapshot fixture 均未修改

## 古法主幹的安全落地

- 每個方向建立 `DirectionTemporalProfile`，保存年月日時四層、紫白命中層、0–4 命中數、集中訊號、逐層狀態與白中殺評估。
- 0–4 顆紫白仍在判讀層分為「無紫白集中／紫白到方／二時紫白同加／三時紫白集中／四時紫白同到」。三時是 2 與 4 之間的工具分級，不冒稱古訣專名。
- Professional UI refinement 後，九宮 cell 不再顯示 `n/4`；數值與實際命中層保留在方向詳情的「為甚麼」展開區。
- 方向排序仍沿用既有保守 heuristic：2 顆以上為「可用」、其餘為「普通」，同 verdict 才按紫白數量排序；本輪沒有加入分數或把 4 顆自動升為「優先」。
- 原因是「有氣」究竟套年／月／日／時的哪一套干支、五行或節令尚未確定，白中殺原表亦未完成人工核圖。

## 有氣、墓絕與白中殺

- `STAR_QI_REFERENCE` 保存九星五行、有氣五行、墓、絕與一／六／八／九的支序研究摘要。
- 九紫保留轉錄衝突警示；沒有把網頁 OCR 的「辰入墓」寫成唯一真值。
- 每層 `qi`、`phase`、`tomb`、`absolute` 初始皆為 `unknown`。
- 白中殺 schema 保存入墓、暗建、受剋、穿心、交劍、鬥牛、刑宮、害宮、空亡；目前 assessment 固定為 `unknown`，而不是虛構的「無」。
- 以上資料不產生 ranking、verdict 或 pair 加減分。

## 81 組 source audit

每組新增：

```text
evidenceForm
useContexts
directionality
verificationStatus
primarySourceVerified
conditions
textWitnesses
variants
```

V1 的 A／A/B／B／B/C／C 只保留為「研究簡寫」與參考搜尋排序；考源真相來源改為 `sourceAudit`。

本輪逐句標記的核心包括：

- 14／41：直接同宮 pair；古句未證明反向有不同斷法。
- 25／52、37／73、68／86：直接有序 pair。
- 68／86：原證據 context 明示為宮星＋流年星，不偽稱年×月古法。
- 69／96、79／97、38／83：直接同宮 pair；未證反向異義。
- 84、89：保留原句方向；48、98 標 `reverse_inferred`。
- 23／32：古典卦象旁證與名目映射須分開。
- 67／76：交劍是較廣的金與金同位名目，不能說古文只限這兩組。
- 28／29：保存乾宮條件；31 保存庚方條件，不把三條偷換成 pure pair。
- 11／22／33／44／55／66／77／88／99：標為 `single_star_repeated`。
- 其他未逐條核實者保持 `derived`、`awaiting_scan`。

全部 81 組仍為：

```text
reviewStatus = needs-review
verified = false
primarySourceVerified = false
temporalUse = reference_only
rankingWeight = 0
polarity = neutral
```

## 異文與轉錄治理

- 方法層同時保存「死退雙臨始佳」與「死退雙臨不利」，標記 `variant`，不默選唯一原文。
- 37 保存《樓宇寶鑑》網頁轉錄「三六迭逢而遇盜」為 `suspected_transcription_error`，並明示不作 36 的直接證據。
- 清精鈔本「修方而設」只記作 bibliographic report 線索；`primarySourceVerified=false`。

## 驗收

- Vitest：24 files、171 tests 全數通過。
- TypeScript、production／PWA build、單檔 build 全數通過。
- Production build：72 modules；CSS 35.43 kB；JS 142.71 kB；PWA precache 11 entries（252.82 KiB）。
- 單檔 build：`app.js` 176.34 kB；`玄空紫白.html` 264 KB。
- Production browser：320、375、390、430、768px 均無 horizontal overflow，九宮內容全部留在 cell 內，八方集中訊號沒有截斷，四星值維持墨灰。
- 320px 方向詳情在「為甚麼」展開區正確顯示 3/4 與命中層；研究說明以自然中文交代氣／墓絕及白中殺尚未納入判定。
- 320px 的 68 學習卡以自然中文顯示直接有序、宮星加流年及原頁未核；底層 `rankingWeight=0`、`reference_only` 保持不變，37 卡仍顯示疑似 36 的轉錄異文。
- Browser console 無 warning／error。

## 明確暫緩

- 不把「有氣」轉成固定分數或直接套任一時間支。
- 不實作白中殺完整九宮公式。
- 不把一／六／八／九永久寫死為吉，亦不把二／五永久寫死為負分。
- 不讓 81 組、來源級別、用途 tags 或異文改變方向 ranking。
- 不把所有現代 81 表引文當成 pure pair，也不自動視 48＝84、98＝89。
- 未取得可重跑的版本、頁碼／章節與原文影像前，不得將任何條目改成 `verified=true` 或 `primarySourceVerified=true`。
