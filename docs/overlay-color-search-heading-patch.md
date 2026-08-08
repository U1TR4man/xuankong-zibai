# 疊盤配色／尋星標題修正 implementation record

本文件記錄 `xuankong_zibai_overlay_color_search_heading_patch.md` 的可攜式實作邊界與驗收結果。

- 原始規格：350 行
- SHA-256：`1c6523ad08155578d6178e6010136413fa6482d243c2bbe93773efe164f048e1`
- Engine、UTC+8、節氣／干支、Search matching logic、九宮 geometry 與 URL state 均不在修改範圍

## 已完成

- 疊盤九宮中央大星固定使用墨色；普通單盤原有主星樣式不變。
- 疊盤五層小值中，只有目前 `level` 的九個數值使用朱紅；其他層數值維持墨灰，層級標籤維持灰色。
- 切換日／時／刻時，`is-primary` 及朱紅小值會同步移到新層級。
- Search → Chart 原有的真正命中層仍保留朱紅＋✓，沒有改動搜尋語義。
- 尋星主導覽仍顯示「尋星」，primary CTA 仍為「開始尋星」。
- 移除尋星內容區重複的 `h1`；簡易／進階 helper paragraph 成為 `.search-view` 第一個內容元素。

## 驗收

- Vitest：19 files、133 tests 全數通過。
- TypeScript、production／PWA build、單檔 build 通過。
- PWA precache：11 entries（199.58 KiB）；單檔 `玄空紫白.html` 約 211 KB。
- 真實 production browser：320、375、390、430px 的疊盤與尋星均無水平 overflow。
- 320px／流時：九個中央大星均為 `rgb(40, 36, 31)`；九個流時小值均為 `rgb(166, 64, 53)`；其餘小值均為 `rgb(111, 103, 92)`。
- 中宮大星「九紫」為墨色，當前流時小值 `9` 為朱紅；中宮淡焦點底色仍保留。
- 日／時／刻切換後，朱紅只跟隨新的 `is-primary` 層；中央大星持續為墨色。
- 簡易與進階尋星的內容區皆沒有 `h1`，helper 為第一個內容元素；導覽「尋星」與 CTA「開始尋星」維持不變。
- 瀏覽器 console 無 warning／error。

## 明確未做

- 不改疊盤五值列、主顯示計算、選宮焦點或詳情 Sheet。
- 不改 Search Engine、matching、結果、URL 或 Search → Chart 行為。
- 不改 `src/engine/**`、`src/data/**` 或 `tests/fixtures/chart-snapshot.json`。
- 不新增新功能、Dark Mode、Ranking 或其他飛星算法。
