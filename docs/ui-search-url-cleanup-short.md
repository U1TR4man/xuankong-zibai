# UI／Search URL cleanup implementation record

本文件記錄 `xuankong_zibai_ui_search_url_cleanup_short.md` 的可攜式實作邊界與驗收結果。

- 原始規格：664 行
- SHA-256：`febd56715a5c33b1962afcdb5a2d6f9d6ac938ceb57fc1f3d39075b2f55a2e39`
- Engine、UTC+8、節氣／干支、原生 date/time 與 snapshot fixture 均不在修改範圍

## Phase A — UI quick fixes

- 疊盤開啟後不再顯示第二套「主顯示 年／月／日／時／刻」。
- `overlayPrimaryLevel` 底層欄位保留，但目前跟隨 `level`；主畫面只有一套層級控制。
- 尋星 Navigation、頁標題與 primary CTA 統一為「尋星／開始尋星」。
- 簡易單選與進階多選共用洛書九宮順序：`4,9,2 / 3,5,7 / 8,1,6`。
- 普通盤與疊盤的主顯示星皆為朱紅、500 字重；中宮與 selected palace 以底色／框表達 focus。

## Phase B — URL／state responsibility

### Shared

- `t`
- `view`

### Chart-only

- `level`
- `overlay`
- `overlayPrimary`
- `selectedPalace`

### Search-only（第一輪簡易搜尋）

- `from`
- `to`
- `searchPalace`
- `precision`
- `star`

當 `view=search` 時不序列化 Chart-only state。Search Result → Chart 的 deep-link 則完整保存時間、層級、疊盤與 selected palace。舊 `primary`／`palace` 仍可讀取，載入後會正規化成明確的新 key。

## 驗收

- Vitest：19 files、133 tests 全數通過。
- TypeScript、production／PWA build、單檔 build 通過。
- 真實 production browser：320、375、390、430px 的排盤、疊盤、簡易／進階尋星均無水平 overflow。
- 320px 洛書選星 touch target 為 44px；疊盤五層註記維持單列。
- 簡易 Search URL refresh 與 Search Result → Chart deep-link refresh 均成功還原。
- 瀏覽器 console 無 warning／error。

## 明確未做

- 不序列化進階多層條件。
- 不重寫 router、AppState 或 Search Engine。
- 不新增 Ranking、Boolean builder、收藏、記錄或新九宮 geometry。
