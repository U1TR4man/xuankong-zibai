# 盤面與尋星精修 implementation record

本文件記錄 `xuankong_zibai_next_ui_search_polish_short.md` 的可攜式實作邊界與驗收結果。

- 原始規格：469 行
- SHA-256：`c812c8667727f0f87f7dfef9d6942ce1a97f6c9d301731d3279874f9d1fda2dd`
- Engine、data 與 snapshot fixture 均不在修改範圍

## 已完成

- 日期／時間、節氣與「今／回到今」維持同列；層級列及盤頭向上收緊。
- 盤名與時段同列，入中星與順逆結果留在下一列。
- 原本獨立的大型疊盤區塊移除，改為盤頭右側的輕量 switch。
- 疊盤開啟時預設主顯示層等於目前導覽層級；開啟後兩個狀態獨立。
- 疊盤五層資料維持單列；標籤與非當前數值較淡，後續補丁讓目前層級的小值使用朱紅；Search 跳盤後命中宮的命中層仍顯示朱砂＋✓。
- 沒有選宮時中心宮只作淡焦點；選宮後只有該宮保留強焦點。
- 尋星預設只顯示簡易條件，以「＋ 進階條件」漸進展開多層／多星設定。
- 收起進階條件不會清除已設定內容；搜尋語義仍是同層 OR、跨層 AND。
- 搜尋結果改為整列可點，保留時段、宮位、各層、命中、組合摘要與箭頭。
- 大量結果保留完整總數，首批及每次增量均為 50 筆。

## 驗收

- Vitest：19 files、131 tests 全數通過。
- TypeScript、production／PWA build、單檔 build 通過。
- 真實 production browser：320、375、390、430px 均無水平 overflow。
- 320px 疊盤為 9 宮 × 5 層且每宮五層不換行；搜尋簡易／進階及結果列均無 overflow。
- 瀏覽器 console 無 warning／error。

## 明確未做

- 不修改 Engine、UTC+8、候選枚舉、搜尋排序或 Boolean builder。
- 不加入吉凶評分、最佳時窗、收藏、Worker、IndexedDB 或新宮位幾何。
