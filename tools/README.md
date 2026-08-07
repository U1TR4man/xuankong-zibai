# tools/

離線資料產生器。**平常不需要執行**；只有在要重建 `src/data/*.data.ts` 時才用。
需要 Python 3 與 `pip install ephem sxtwl pymeeus`。

| 檔案 | 產出 | 說明 |
|---|---|---|
| `gen-solarterms.py` | `src/data/solarTerms.data.ts` | 以 PyEphem 太陽視黃經（定氣法）求解 1900–2100 共 4824 個節氣時刻，輸出為「距該年 1 月 1 日 00:00 UTC+8 的秒數」。 |
| `verify-solarterms.py` | — | 將產出的表與 寿星天文历 (sxtwl) 全表比對。目前結果：最大差 **28 秒**，平均 **8 秒**，無任何一筆超過 30 秒。 |
| `gen-vsop87.py` | `src/data/vsop87Earth.data.ts` | 由 PyMeeus 取 VSOP87D 地球級數並截斷（保留 369 項，約 13 KB），供 1900 年前 / 2100 年後的 fallback 演算法使用。 |

fallback 演算法與精確表的實測差距 < 1 分鐘（見 `tests/solarTermsAlgo.test.ts`）。
