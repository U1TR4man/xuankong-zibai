# 紫白品牌宋體

- 檔案：`zibai-serif-medium.woff2`
- 來源：Noto Serif CJK TC Medium 2.003
- 授權：SIL Open Font License 1.1，全文見 `OFL.txt`
- 官方來源：<https://github.com/notofonts/noto-cjk/tree/Serif2.003/Serif>
- 原始 OTF SHA-256：`da0a79ee44322329dd9ff87d2cc878dc897c5180195e3f9b6cd4c8569781e887`
- WOFF2 SHA-256：`ae32ca6c89e7a62acdb7a325cfe52c23487235c5ea84207f087854524ffd3c8f`

此檔是針對本專案 TypeScript／TSX 靜態字串、`index.html`、PWA manifest 名稱及
常用標點製作的 500 字重子集，保留 860 個 UI 字元、861 個 glyph，檔案約 221 KB。
產物使用自訂 CSS family 名稱 `Zibai Serif`，避免把修改後的子集誤認為官方完整字體。

## 重建與檢查

可重跑工具：`scripts/build-font-subset.py`；固定依賴見
`scripts/requirements-font-subset.txt`。腳本會先核對原始 OTF SHA-256，掃描目前 UI
靜態字串，生成 `zibai-serif-glyphs.txt`，再驗證 WOFF2 cmap 沒有漏字。

```bash
python3 -m pip install --target /tmp/zibai-fonttools -r scripts/requirements-font-subset.txt
PYTHONPATH=/tmp/zibai-fonttools python3 scripts/build-font-subset.py \
  --source /path/to/NotoSerifCJKtc-Medium.otf
PYTHONPATH=/tmp/zibai-fonttools python3 scripts/build-font-subset.py --check
```

水平繁中 UI 不保留未使用的 vertical／locale GSUB 變體；Noto 原始 OTF 本身沒有
裝飾符號 `✦`／`⚑`，兩者維持 symbol fallback，不影響中文字形一致性。
