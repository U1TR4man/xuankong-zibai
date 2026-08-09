# 專業 UI/UX refinement implementation record

本文件記錄 `xuankong_zibai_professional_uiux_refinement.md` 的可攜式實作邊界與驗收結果。

- 原始規格：783 行
- SHA-256：`e85e314d70b27f08194b5dab97c845502ef1e4f153cc416042161f3c5742f213`
- 性質：只做 UI/UX refinement，不增加功能
- 保護範圍：`src/engine/**`、`src/data/**`、UTC+8、節氣、飛星、擇吉 ranking、pair rule metadata、Search matching、九宮 orientation 及 PWA offline architecture

## Phase A — UI cleanup

- 一般 UI 與研究卡不再顯示 `TOOL_HEURISTIC`、`rankingWeight`、`reference_only`、`unknown`、`convention`、`context` 或 `tags` 等內部字串；底層欄位及測試護欄完整保留。
- 擇吉九宮移除低價值的紫白集中數；每宮只保留方向、年月日時、狀態與主要雙星組合。
- 320px 不再把年月日時 label 或 pair 摘要降至 8px；資訊字最小 10px，並由 `--ink-tertiary` 提升至 `--ink-secondary`。
- 時間範圍、宮位方向、疊盤層級、搜尋層級及 pair context 均使用較可讀的 secondary ink。
- 方向詳情首屏只顯示四星、狀態及主要參考；「為甚麼／全部六組／五行關係／研究說明」使用原生 `details`，預設全部收起。
- 研究說明以自然中文保留兩項邊界：雙星不參與方向排序，以及有氣、墓絕、白中殺尚未納入判定。

## Phase B — interaction polish

- 無指定 autofocus 的 Bottom Sheet 以 sheet surface 作初始焦點，不再自動聚焦關閉按鈕。
- 日期、年月日時刻 picker 的明確 `data-autofocus` 行為保持不變。
- 關閉按鈕改為 `currentColor`、1.5px、round cap/join 的 inline SVG；按鈕仍是 44×44px、圖示 20px。
- 關閉按鈕保留原生 keyboard tab stop、全域 `:focus-visible` 及關閉後焦點返回。

## Phase C — navigation hierarchy

- Workspace「排盤／尋星」使用 UI sans、600 active weight 與 32×3px 底線。
- Time axis「年／月／日／時／刻」使用 display serif、17–18px 與 22×2px 朱砂短線。
- Chart mode「原盤／疊盤／擇吉」使用 12px UI sans、較輕 local switch 語氣與 16×1px 底線。
- routing、state、ARIA role 及鍵盤操作均未改。

## Phase D — font / production verification

- `scripts/build-font-subset.py` 重新掃描目前 static UI strings；產物為 862 個 UI 字元／863 glyph。
- WOFF2 SHA-256：`659dcbc9acd25342239d144f5da494154c5585b6dcb8e8599c72fc6558e227a8`
- Vitest：24 files、172 tests 全數通過；TypeScript、production／PWA build、單檔 build 通過。
- PWA precache：11 entries、416.71 KiB；單檔 `玄空紫白.html` 約 482 KB。
- 真實 production browser：原盤、疊盤、擇吉、尋星在 320／375／390／430px 共 16 組均無 horizontal overflow。
- 擇吉九宮在四種寬度均維持正方；320px 為 296×296、每宮 98×98。
- 320px 方向詳情預設四個 disclosure 全部收起且首屏無需捲動；展開全部六組後才產生 sheet 內部捲動。
- Bottom Sheet 開啟後焦點位於 `.sheet__surface`，關閉按鈕沒有初始 focus ring；production console 無 warning／error。

## 明確未做

- 不把頂層「尋星」改名為「搜尋」。
- 不新增九宮式宮位 selector、最佳時窗、收藏、記錄、scoring 或 recommendation。
- 不做 desktop dashboard 或雙欄版面。
