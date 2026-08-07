# 玄空紫白 PWA — 新功能拓展規劃
## 疊盤模式 + 尋星 A/B + 最佳時窗 D Reserved

> 建議存放：`docs/feature-overlay-star-search-plan.md`  
> 交付對象：Claude Code / Codex / 後續 Agent  
> 性質：**功能規劃文件，先定義產品語義、UX、資料模型與 implementation boundary；不要一開始大改既有 Engine。**

---

# 0. 文件目的

目前玄空紫白 PWA 已具備：

```text
流年
流月
流日
流時
流刻
```

以及：

```text
九宮盤
PWA
UTC+8 統一時間基準
日期時間跳轉
Explain / Study Mode
Mobile-first UI
```

下一階段功能拓展包含兩個主要方向：

```text
A. 疊盤模式
B. 尋星
```

其中「尋星」長期需支援：

```text
A 類：單星搜尋
B 類：多層／多星組合搜尋
D 類：最佳時窗 Ranking【Reserved Future】
```

本文件的首要目的不是要求一次把所有功能做完，而是：

> **先建立不會阻塞未來擴充的產品與資料架構。**

---

# 1. 核心產品原則

## 1.1 簡單模式優先

App 原則：

> 第一次使用的人，不需要先懂玄空，也能完成一次搜尋。

因此不要一進「尋星」就展示複雜條件 builder。

搜尋分：

```text
簡易
進階
```

簡易 = A 類單星搜尋。

進階 = B 類多層／多星組合。

---

## 1.2 搜尋與疊盤必須是同一條 workflow

不要把：

```text
尋星
```

和：

```text
疊盤
```

做成完全獨立的兩個工具。

理想流程：

```text
尋星
↓
得到命中時間
↓
點擊結果
↓
跳到對應日期時間
↓
開啟疊盤
↓
高亮命中的宮
↓
查看該宮年月日時刻資料
```

即：

```text
Search
→ Result
→ Chart
→ Overlay
→ Palace Detail
```

---

# 2. 宮位語義

UI 不使用：

```text
第1宮
第9宮
...
```

避免與：

```text
洛書數
九宮位置
飛星數字
```

產生混淆。

統一使用：

```text
坎
坤
震
巽
中
乾
兌
艮
離
```

可加 secondary label：

```text
坎 · 北
坤 · 西南
震 · 東
巽 · 東南
中
乾 · 西北
兌 · 西
艮 · 東北
離 · 南
```

內部建議使用穩定 enum：

```ts
type Palace =
  | 'kan'
  | 'kun'
  | 'zhen'
  | 'xun'
  | 'center'
  | 'qian'
  | 'dui'
  | 'gen'
  | 'li';
```

不要把 UI 名稱直接作為計算 key。

---

# 3. 「尋找離宮的 9紫」正式語義

這個定義必須寫死在文件、code comment、unit test。

當使用者輸入：

```text
宮位：離
飛星：9紫
層級：時
```

其意思是：

> **在指定時間範圍內，尋找「流時盤的離宮格內，飛星值 = 9」的所有時間。**

不是：

```text
9紫入中
中宮 = 9紫
離宮本身洛書數 = 9
任何一宮出現 9紫
該時辰起星 = 9
```

搜尋目標是：

```text
指定宮位格內的飛星值
```

---

# 4. 搜尋層級

第一階段搜尋支援：

```text
日
時
刻
```

不必先做：

```text
年
月
```

作為 Search precision。

原因：

尋星的主要使用情景是：

```text
在某日期範圍內
找到合適日／時／刻
```

---

# 5. 上層疊盤顯示規則

這條定義應成為共通規則：

> **搜尋結果必須顯示「截至搜尋層級為止」的所有上層飛星。**

因此：

## 搜尋層級 = 日

顯示：

```text
年
月
日
```

## 搜尋層級 = 時

顯示：

```text
年
月
日
時
```

## 搜尋層級 = 刻

顯示：

```text
年
月
日
時
刻
```

這樣搜尋「刻」時，不會只看到一個孤立刻星。

---

# 6. 疊盤模式

---

## 6.1 目的

目前九宮盤通常只顯示：

```text
目前 level 的飛星
```

疊盤模式則允許在同一個宮位查看：

```text
流年
流月
流日
流時
流刻
```

的飛星。

用途：

```text
研究年月日時刻組合
搜尋結果驗證
出行擇時
組合搜尋
未來最佳時窗 Ranking
```

---

# 7. 疊盤 UI 原則

不要照抄傳統高資訊密度玄空 App。

現有 Web App 的主要 UI 語言仍應維持：

```text
紙
墨
朱砂
宋體
留白
一體式九宮
Mobile-first
```

不要因為加入疊盤而重新變成：

```text
密集表格
大量彩色方塊
小字堆疊
desktop-oriented layout
```

---

# 8. 疊盤九宮呈現

推薦模式：

## 主顯示層 + 輔助小值

例如主顯示層為：

```text
時
```

某宮：

```text
離 · 南

年     月
1      5

    九紫

日     時     刻
4      9      8
```

其中：

```text
九紫
```

是目前主顯示層的大字。

其他年月日時刻：

```text
小字
```

---

# 9. 主顯示層

疊盤提供：

```text
年
月
日
時
刻
```

作為：

```text
主顯示層
```

例如：

```text
主顯示：時
```

則九宮中央大字展示：

```text
流時星
```

其餘：

```text
年／月／日／刻
```

作小型疊盤資料。

如果切：

```text
主顯示：刻
```

則中央大字改為：

```text
流刻星
```

其他層不消失。

---

# 10. 疊盤顏色

顏色只能用作「layer cue」。

不要讓九顆星各有一套 neon 色。

建議：

```text
年：中性灰／土色
月：淡金
日：低飽和綠
時：朱砂
刻：灰藍
```

但：

```text
主盤主要文字仍以墨色為主
```

顏色是 secondary encoding，不得成為唯一辨識方法。

每個 layer 必須仍有文字：

```text
年
月
日
時
刻
```

以符合 accessibility。

---

# 11. 點宮詳細資料

點任一宮：

```text
Bottom Sheet
```

顯示完整該宮疊盤。

例如：

```text
離 · 南

流年    1白
流月    5黃
流日    4綠
流時    9紫
流刻    8白

組合摘要
日時 49
時刻 98
```

主顯示層：

```text
時
```

則：

```text
流時 9紫
```

可用淡朱砂強調。

---

# 12. 組合摘要

第一版只做 deterministic summary。

例如：

```text
日 = 4
時 = 9
刻 = 8
```

可以顯示：

```text
日時 49
時刻 98
```

不要在這個階段自動判：

```text
吉
凶
最佳
推薦
```

這類 ranking 留給 D。

---

# 13. 尋星功能總覽

功能：

```text
尋星
```

分：

```text
簡易
進階
```

---

# 14. A 類 — 單星搜尋

## 14.1 條件

使用者輸入：

```text
日期開始
日期結束
宮位
層級
飛星
```

例如：

```text
2026-09-01
至
2026-09-30

宮位：離
層級：刻
飛星：9紫
```

其 query：

```text
在指定日期範圍內，
找所有「流刻盤離宮 = 9」的刻。
```

---

# 15. A 類 UX

簡易搜尋畫面：

```text
尋星

日期
[ 2026.09.01 ] — [ 2026.09.30 ]

宮位
[ 離 · 南                         ]

層級
日        時        刻
                    ●

飛星
1  2  3  4  5  6  7  8  9
                        ●

[ 尋找 ]
```

---

# 16. 星名 UI

UI 可顯示：

```text
1白
2黑
3碧
4綠
5黃
6白
7赤
8白
9紫
```

或者 compact：

```text
一白
二黑
三碧
四綠
五黃
六白
七赤
八白
九紫
```

內部只保存：

```ts
type StarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```

不要保存：

```text
"九紫"
```

作為核心比對資料。

---

# 17. A 類搜尋結果

例如：

```text
搜尋
離 · 刻 · 九紫

2026.09.01 – 2026.09.30

共 18 個結果
```

按日期分組：

```text
9月8日                         3 個

23:45–23:59
離 · 南

年   月   日   時   刻
1    5    4    8    9
                    ↑

流刻 九紫
[ 查看此盤 ]


9月12日                        2 個
...
```

---

# 18. 搜尋結果跳盤

點：

```text
查看此盤
```

必須：

```text
selectedDateTime = result time
level = searched level
selectedPalace = searched palace
overlayMode = on
```

例如：

```text
搜尋離 · 刻 · 9紫
```

結果點入後：

```text
流刻盤
疊盤 ON
離宮高亮
刻星 9紫命中
```

---

# 19. 命中標示

搜尋結果／疊盤必須明確顯示：

```text
哪一層命中
```

例如搜尋：

```text
時 = 9
刻 = 8
```

結果：

```text
流年   1白
流月   5黃
流日   4綠

流時   9紫   ✓
流刻   8白   ✓
```

不要要求使用者自己再對數字。

---

# 20. B 類 — 多層／組合搜尋

進階搜尋允許：

```text
同一宮位
+
多個層級條件
+
每個層級可選一顆或多顆星
```

---

# 21. B 類最重要的資料語義

不要在 engine 內將：

```text
98
89
989
```

作為 query。

例如：

```text
時刻 98
```

只是 UI shorthand。

內部應該：

```ts
conditions: [
  {
    level: 'hour',
    stars: [9]
  },
  {
    level: 'ke',
    stars: [8]
  }
]
```

---

# 22. B 類條件關係

第一版：

> **不同 layer 之間固定 AND。**

例如：

```text
流日 = 9
流時 = 8
流刻 = 9
```

代表：

```text
day == 9
AND
hour == 8
AND
ke == 9
```

---

# 23. 每一層可以多選星

例如：

```text
流時：8白、9紫
流刻：8白、9紫
```

代表：

```text
hour ∈ {8,9}
AND
ke ∈ {8,9}
```

因此會命中：

```text
88
89
98
99
```

這個設計可涵蓋：

```text
尋找 8 / 9 的良好組合
```

而不用建立複雜 Boolean Builder。

---

# 24. 暫時禁止任意 Boolean Builder

第一版不要做：

```text
(時=8 OR 時=9)
AND
((刻=8 AND 日!=5) OR 月=1)
```

不要讓使用者建立：

```text
nested AND / OR
NOT
括號
任意 expression
```

這會令手機 UI 和測試複雜度急升。

目前規則：

```text
同層 stars = OR
跨層 levels = AND
```

已足夠。

---

# 25. B 類 UX

點：

```text
進階條件
```

畫面：

```text
尋星 · 進階

日期
9月1日 — 9月30日

宮位
離 · 南

────────────

流日
不限
[1][2][3][4][5][6][7][8][9]

流時
[8白] [9紫]

流刻
[8白] [9紫]

────────────

符合方式
所有已設定層級均須成立

[ 尋找 ]
```

---

# 26. B 類結果

例如 query：

```text
離

流時 ∈ {8,9}
流刻 ∈ {8,9}
```

結果：

```text
9月8日

14:45–14:59
離 · 南

年  1白
月  5黃
日  4綠
時  9紫 ✓
刻  8白 ✓

時刻 98

[ 查看此盤 ]
```

---

# 27. 搜尋資料模型

不要只做：

```ts
findStar(
  palace,
  level,
  star
)
```

核心應建立：

```ts
interface StarSearchQuery {
  startDate: string;
  endDate: string;
  palace: Palace;
  conditions: SearchCondition[];
}

interface SearchCondition {
  level: SearchLevel;
  stars: StarNumber[];
}

type SearchLevel =
  | 'day'
  | 'hour'
  | 'ke';
```

---

# 28. SearchMatch

建議：

```ts
interface SearchMatch {
  startDateTime: string;
  endDateTime?: string;

  palace: Palace;
  precision: SearchLevel;

  palaceStars: {
    year: StarNumber;
    month: StarNumber;
    day: StarNumber;
    hour?: StarNumber;
    ke?: StarNumber;
  };

  matchedConditions: SearchCondition[];

  chartContext: {
    yearCenterStar: StarNumber;
    monthCenterStar: StarNumber;
    dayCenterStar: StarNumber;
    hourCenterStar?: StarNumber;
    keCenterStar?: StarNumber;
  };
}
```

注意：

這是示意 interface。

實作時應先 review 現有 `StarResult` / `AppState`，能 reuse 就 reuse，不要 duplicate domain model。

---

# 29. Search Engine architecture

建議：

```text
StarSearchEngine
```

只負責：

```text
enumerate candidate times
↓
呼叫現有飛星 Engine
↓
取得宮內飛星
↓
evaluate query
↓
建立 SearchMatch
```

不要：

```text
複製年/月/日/時/刻算法
重寫九宮 fly logic
自己建立第二套節氣邏輯
自己算 UTC+8
```

Search Engine 必須消費既有 Engine。

---

# 30. 搜尋掃描策略

第一版可直接 deterministic brute-force。

---

## 日搜尋

每天：

```text
1 candidate
```

30 天：

```text
30
```

365 天：

```text
365
```

---

## 時搜尋

每天：

```text
12 時辰
```

30 天：

```text
360 candidates
```

365 天：

```text
4380 candidates
```

---

## 刻搜尋

目前一時辰：

```text
8 刻
```

每天：

```text
12 × 8 = 96
```

30 天：

```text
2880 candidates
```

365 天：

```text
35040 candidates
```

這個量對純本地 JavaScript 計算通常可接受。

V1 不需要預先建立 database。

---

# 31. 搜尋效能原則

搜尋期間：

不要每掃一個 candidate 就：

```text
render DOM
update progress text
setState
```

應：

```text
pure calculation
↓
collect matches
↓
一次／分批 render
```

若將來日期範圍大到影響 UI：

再考慮：

```text
chunking
Web Worker
incremental rendering
```

不要 V1 一開始就過度工程。

---

# 32. 搜尋日期範圍限制

V1 建議 UI 預設：

```text
30 日
```

但 architecture 不要寫死只能 30 日。

可考慮：

```text
最大 1 年
```

作為 UX safeguard。

若之後 performance 測試證明可接受，再放寬。

---

# 33. 搜尋中的 UTC+8

Search 必須完全沿用 App 現有：

```text
UTC+8
```

時間基準。

不可：

```text
用 device timezone 掃描
用 new Date local date 判日界
建立 Search 專用 timezone 規則
```

所有：

```text
節氣
日界
時辰
刻
```

皆使用既有 Engine 的時間語義。

---

# 34. 搜尋中的節氣

Search 不額外創造：

```text
節氣日特例
```

V1：

```text
完全照 Engine 結果
```

未來可以提供 UI filter：

```text
排除節氣交接日
排除節氣交接前後 X 小時
```

但這屬未來 extension。

不要現在寫死。

---

# 35. Result grouping

結果預設：

```text
按時間 ascending
```

UI：

```text
按日期 group
```

不要 V1 先做：

```text
吉凶排序
分數排序
最佳優先
```

這是 D 的責任。

---

# 36. 搜尋結果 + 疊盤整合

Result 點入後：

```text
SearchMatch
↓
selectedDateTime
↓
existing chart engine
↓
Overlay Mode
↓
selected palace
```

不要直接把：

```text
SearchMatch.palaceStars
```

當成新的盤面 truth source。

盤面仍然應由正式 Engine 根據時間重新產生。

SearchMatch 是：

```text
搜尋結果
```

不是：

```text
第二份盤面資料庫
```

---

# 37. 疊盤狀態建議

可擴充 `AppState`：

```ts
overlayMode?: boolean;
selectedPalace?: Palace;
overlayPrimaryLevel?: 'year' | 'month' | 'day' | 'hour' | 'ke';
```

不要將：

```text
search mode
```

和：

```text
chart level
```

混成同一 state。

---

# 38. Navigation 建議

主 App 可增加一個明確入口：

```text
排盤
尋星
```

不要把「尋星」塞進：

```text
設定
info
Study Mode
```

它是一個核心工具。

但 mobile navigation 要保持簡單。

V1 可採：

```text
Top action / toolbar entry
```

或：

```text
Bottom navigation 兩項：
排盤｜尋星
```

實作前先根據目前 V2.1 畫面做 UX review。

---

# 39. 疊盤入口

疊盤可以：

```text
在排盤畫面加「疊」/「疊盤」
```

但不要一進 App 預設開啟。

預設：

```text
single-layer chart
```

使用者主動啟用：

```text
疊盤
```

後才顯示五層。

---

# 40. 疊盤與目前 Level 的關係

例如目前：

```text
level = hour
```

打開疊盤：

```text
overlayPrimaryLevel = hour
```

如果切：

```text
level = ke
```

可同步：

```text
overlayPrimaryLevel = ke
```

但最好將：

```text
主 level
```

和：

```text
overlayPrimaryLevel
```

概念分開。

這樣未來可以：

```text
在刻盤裡主顯示時星
```

而不必改 route / chart level。

---

# 41. D 類 — 最佳時窗【Reserved Future Capability】

**這一節必須長期保留在文件。**

目前：

```text
不實作 Ranking
不實作吉凶評分
不實作最佳推薦
```

但 architecture 必須確保日後能加入。

---

# 42. D 的未來目標

使用者未來可輸入：

```text
日期範圍
方位／宮位
偏好飛星
組合條件
權重
排除條件
```

例如：

```text
宮位：乾 · 西北

喜星：
8白
9紫

權重：
刻 > 時 > 日

日期：
9月1日 – 9月30日
```

系統：

```text
產生 SearchMatch[]
↓
RankingEngine
↓
RankedSearchMatch[]
↓
最佳時窗列表
```

---

# 43. D 的 architectural rule

Search Engine：

```text
負責「有沒有符合」
```

Ranking Engine：

```text
負責「哪個較好」
```

必須分離。

即：

```text
                SearchQuery
                    │
                    ▼
              SearchEngine
                    │
                    ▼
               SearchMatch[]
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
  Exact Result UI         RankingEngine
                                │
                                ▼
                       RankedSearchMatch[]
```

---

# 44. D 不得反向污染 SearchEngine

禁止未來把：

```text
吉凶
score
權重
ranking
```

直接塞入最底層：

```text
match()
```

SearchMatch 應該先保持：

```text
deterministic
可驗證
無主觀評分
```

Ranking 是下一層。

---

# 45. 必須保留的 Future Note

以下內容建議原文保留在 `docs/HANDOFF.md` 或本文件：

> ## Reserved future capability — 最佳時窗
>
> 尋星模組的長期目標包含「最佳時窗」搜尋與排序。
>
> 當前版本只負責 deterministic matching，不加入吉凶評分與推薦邏輯。
>
> 未來 `RankingEngine` 應消費既有 `SearchMatch[]`，而不是重新計算年月日時刻飛星。
>
> 因此目前不得把 `SearchEngine` 寫死為只能處理單星單層，也不得讓搜尋結果資料模型只適用於 A 類單星搜尋。
>
> 後續 refactor 不得刪除此 extension point。

---

# 46. Future filters【Reserved】

之後可以加入：

```text
排除節氣交接日
排除節氣前後 X 小時
只看白天
只看夜晚
指定星期
指定時辰
排除某些星
只保留某些上層組合
```

本階段不做。

但 `StarSearchQuery` 要有未來可擴充空間。

---

# 47. Future 任一宮搜尋【Reserved】

V1 搜尋固定：

```text
指定一個 Palace
```

未來可支援：

```text
任一宮
多宮
方向群
```

例如：

```text
東方群
西方群
```

目前不做。

---

# 48. Future 入中星搜尋【Reserved】

目前：

```text
搜尋宮內飛星
```

未來如需要可另增：

```text
搜尋入中星
```

但不要混入目前「尋找離宮 9紫」語義。

UI 必須是不同條件：

```text
宮內飛星
```

vs

```text
入中星
```

目前只做前者。

---

# 49. Unit Tests — A 類

至少測：

```text
固定日期範圍
固定 Palace
固定 level
固定 star
```

使用已知 Engine output 建 expectation。

例如：

```text
搜尋離
level=hour
star=9
```

驗證：

```text
所有 returned match：
result.palaceStars.hour === 9
```

並驗證：

```text
非離宮的 9 不應命中
中宮 9 不應命中
入中 9 不等於離宮 9
```

---

# 50. Unit Tests — B 類

例如：

```text
hour stars = [8,9]
ke stars = [8,9]
```

每一個 match 必須：

```ts
[8, 9].includes(match.palaceStars.hour)
&&
[8, 9].includes(match.palaceStars.ke)
```

---

# 51. Upper-layer display tests

搜尋：

```text
day
```

結果 view model 必須只有：

```text
year
month
day
```

搜尋：

```text
hour
```

顯示：

```text
year
month
day
hour
```

搜尋：

```text
ke
```

顯示：

```text
year
month
day
hour
ke
```

---

# 52. Search → Chart integration test

點擊 SearchMatch：

應確認：

```text
selectedDateTime = match.startDateTime
selectedPalace = query palace
level = query precision
overlayMode = true
```

並確認：

```text
正式 chart Engine 重新算出的 target palace star
=
SearchMatch 命中 star
```

---

# 53. Overlay UI tests

至少：

```text
overlay OFF
→ 現有九宮畫面保持不變
```

```text
overlay ON
→ 每宮顯示多層值
```

```text
selected palace
→ 有明確 focus state
```

```text
點 selected palace
→ Bottom Sheet
```

---

# 54. Accessibility

疊盤不能只靠：

```text
顏色
```

表示：

```text
年/月/日/時/刻
```

必須有文字 layer label。

Search controls：

```text
宮位
層級
星
日期
```

都要有明確 label。

多選星：

優先使用：

```text
native button / checkbox semantics
```

不要只有彩色圓點。

---

# 55. Mobile UX

最低 width：

```text
320px
```

重點：

- 九宮不得 horizontal overflow
- 小型 layer values 仍需 readable
- Search filter 不橫向爆版
- Result card 不做 dense spreadsheet
- Bottom Sheet safe-area 正常
- Touch target >= 44px

---

# 56. 不允許的實作

不要：

```text
1. 複製一套年月日時刻 Engine 到 Search

2. 用 SearchMatch 取代正式 chart Engine

3. 將 98 / 89 當成核心 query string

4. 第一版就做 arbitrary boolean expression

5. 第一版就做吉凶評分

6. 第一版就做 Ranking

7. 為了疊盤重寫九宮 geometry

8. 為了 Search 改 UTC+8 規則

9. 為 Search 使用 device timezone

10. 將 D 最佳時窗從文檔刪掉

11. 把 Search UI 與 exact engine implementation 強耦合

12. 一次把 A/B/D 全部 coding
```

---

# 57. 建議 implementation phases

## Phase 0 — Read-only review

Agent 先讀：

```text
README.md
docs/HANDOFF.md
本文件
現有 AppState
現有 StarResult
Year/Month/Day/Hour/Ke public API
NinePalaceGrid
BottomSheet
router / URL state
```

輸出：

```text
implementation plan
reuse points
risk list
```

未經確認不要先大改。

---

# 58. Phase 1 — Overlay data model

先完成：

```text
OverlayResult / PalaceOverlayViewModel
```

從現有 Engine 組裝：

```text
year
month
day
hour
ke
```

不要先做搜尋。

測試通過後 checkpoint。

---

# 59. Phase 2 — 疊盤 UI

完成：

```text
Overlay toggle
主顯示層
九宮 multi-layer display
selected palace
Palace Detail Bottom Sheet
```

要求：

```text
overlay OFF = 現有 UI 無 regression
```

---

# 60. Phase 3 — Search A

完成：

```text
SearchQuery
SearchEngine
日／時／刻掃描
宮位單選
飛星單選
結果列表
Search → Chart jump
```

先不要做 B。

---

# 61. Phase 4 — Search B

在 A 穩定後增加：

```text
多 layer conditions
每 layer multi-star
同層 OR
跨層 AND
```

不要 arbitrary Boolean。

---

# 62. Phase 5 — UX refinement

再處理：

```text
Result grouping
Result count
Search empty state
loading state
long-range warning
recent search【optional】
```

---

# 63. Phase 6 — Documentation checkpoint

更新：

```text
README.md
docs/HANDOFF.md
本文件 implementation status
```

明確保留：

```text
D — Best Window Ranking
```

不得因 A/B 完成就刪除此 Future section。

---

# 64. 建議檔案結構

實際建立前先 review 現有專案。

概念上：

```text
src/
├── search/
│   ├── types.ts
│   ├── StarSearchEngine.ts
│   ├── candidateIterator.ts
│   └── matchQuery.ts
│
├── overlay/
│   ├── types.ts
│   └── buildPalaceOverlay.ts
│
└── ui/
    ├── SearchView.ts
    ├── SearchFilters.ts
    ├── SearchResults.ts
    ├── OverlayControls.ts
    └── PalaceOverlaySheet.ts
```

如果現有 architecture 有更合理位置：

```text
follow existing structure
```

不要為了這份規格硬建新 hierarchy。

---

# 65. SearchQuery 版本化建議

可以預留：

```ts
interface StarSearchQuery {
  version: 1;
  ...
}
```

未來 D / filters 增加時：

避免 URL / saved query compatibility 失控。

不是 V1 必須，但值得評估。

---

# 66. URL state【建議】

搜尋結果頁可以考慮：

```text
/search?palace=li&from=2026-09-01&to=2026-09-30&hour=8,9&ke=8,9
```

但不要第一階段因 URL serialization 阻塞 Search Engine。

先：

```text
engine
→ UI
```

再：

```text
URL persistence
```

---

# 67. 搜尋 Empty State

例如：

```text
這段時間沒有找到符合條件的時段
```

提供：

```text
修改條件
```

不要自行：

```text
放寬條件
推薦別的星
```

因為這會開始踏入 D 的 recommendation domain。

---

# 68. 搜尋 Result Count

例如：

```text
共找到 18 個時段
```

若非常多：

```text
共找到 426 個時段
```

應提醒：

```text
可縮短日期或增加條件
```

不要偷偷 truncate 而不告知。

---

# 69. 預設值

尋星第一次打開可預設：

```text
日期起：今天
日期止：今天 + 30 日
宮位：未選
層級：時
飛星：未選
```

是否預設：

```text
離
9紫
```

不建議。

避免讓產品暗示特定星一定是使用者想找的。

---

# 70. 名詞

UI 統一：

```text
尋星
疊盤
宮位
流日
流時
流刻
飛星
命中
查看此盤
主顯示層
組合摘要
```

不要同時混：

```text
搜尋星
找星
查星
尋星
```

產品用詞統一採：

```text
尋星
```

---

# 71. 尋星簡易模式一句話

可放 UI helper：

> 選擇宮位、層級與飛星，找出指定日期內所有符合的時間。

---

# 72. 尋星進階模式一句話

> 可同時指定多個層級；同層選多星代表任一符合，跨層條件必須同時成立。

這句很重要，直接解釋：

```text
同層 OR
跨層 AND
```

---

# 73. 疊盤一句話

> 在同一宮位查看流年、流月、流日、流時與流刻的飛星組合。

---

# 74. Product flow

完整：

```text
首頁／排盤
│
├── 單層九宮
│   └── 開啟疊盤
│       └── 點宮
│           └── 宮位疊盤詳情
│
└── 尋星
    │
    ├── 簡易
    │   └── A 單星
    │
    └── 進階
        └── B 多層多星
             │
             ▼
        Search Results
             │
             ▼
         查看此盤
             │
             ▼
        疊盤 + 宮位高亮
```

Future：

```text
SearchMatch[]
    │
    ▼
RankingEngine
    │
    ▼
D 最佳時窗
```

---

# 75. V1 Definition of Done

第一個可用版本至少做到：

### 疊盤

- [ ] 可以 ON / OFF
- [ ] 九宮可同時查看年月日時刻
- [ ] 可切主顯示層
- [ ] 可選宮
- [ ] 點宮可看完整疊盤
- [ ] Overlay OFF 不影響目前單層盤

### 尋星 A

- [ ] 日期範圍
- [ ] 宮位
- [ ] 日／時／刻
- [ ] 單星
- [ ] 正確掃描
- [ ] 結果按日期／時間排列
- [ ] 顯示上層疊盤
- [ ] 點結果跳盤
- [ ] 自動開疊盤
- [ ] 命中宮高亮

### 基礎

- [ ] 不修改 UTC+8 規則
- [ ] 不 duplicate Engine
- [ ] 現有 tests pass
- [ ] build pass
- [ ] PWA offline 不 regression
- [ ] 320px mobile 無 overflow

---

# 76. B Definition of Done

進階搜尋完成時：

- [ ] 可選多個 layer
- [ ] 每 layer 可選多星
- [ ] 同層 OR
- [ ] 跨層 AND
- [ ] SearchMatch 顯示每個命中條件
- [ ] 組合摘要可顯示如 `日時 49` / `時刻 98`
- [ ] Search A 不 regression
- [ ] 不加入 Ranking

---

# 77. Agent 開工前要求

請 Agent：

1. 先做 read-only code review。
2. 確認現有 Engine API 可否支援 Search。
3. 確認 Overlay 如何 reuse `StarResult`。
4. 列出需要修改／新增的檔案。
5. 指出可能造成 regression 的位置。
6. 先提出 Phase 1 implementation plan。
7. 不要一開始直接實作全部功能。
8. 每個 Phase 做小 commit / checkpoint。
9. 每次改動後跑現有 test + 新 test。
10. 保持 `docs/HANDOFF.md` 更新。

---

# 78. Agent 必須特別確認的語義

在 coding 前回覆確認以下四點：

```text
A.
宮位 UI 使用「離」「坎」等名稱，
不是「第9宮」。

B.
「尋找離宮的 9紫」
=
尋找指定層級中，
離宮格內飛星值為 9 的時間。

C.
搜尋結果顯示截至搜尋精度為止的上層疊盤：
日 → 年月日
時 → 年月日時
刻 → 年月日時刻

D.
最佳時窗 Ranking 是 Reserved Future Capability；
這一輪不實作，但 architecture 不得阻塞，
文件不得刪除。
```

如 Agent 對其中任何一點理解不同：

> **先停止 coding，提出差異。**

---

# 79. Final architecture principle

整個功能應維持：

```text
Existing Time / Flying Star Engine
              │
              ├──────────────┐
              │              │
              ▼              ▼
          Chart UI       SearchEngine
              │              │
              ▼              ▼
          Overlay UI     SearchMatch[]
              │              │
              └──────┬───────┘
                     ▼
               Result → Chart
```

Future：

```text
SearchMatch[]
     │
     ▼
RankingEngine
     │
     ▼
最佳時窗
```

最重要：

> **Search 是現有飛星 Engine 的消費者，不是第二套飛星 Engine。**

以及：

> **疊盤是現有盤面的 information layer，不是另一套盤。**

以及：

> **D 最佳時窗必須保留為明確 extension point，後續 refactor 不得遺失。**

---

# 80. Implementation status — 2026-08-08

本文件定義的 implementation Phase 0–6 已完成：

```text
Phase 0  規格與唯讀架構審查                  61999e5
Phase 1  Overlay data model                  a13dbaa
Phase 2  疊盤 UI、選宮與詳情 Sheet            672333a
Phase 3  Search A 與 Search → Chart           fd3303f
Phase 4  Search B：同層 OR／跨層 AND           387dd2a
Phase 5  結果 UX、loading、日期分組與範圍防護   662de72
Phase 5  大量結果分批顯示 safeguard            609e941
Phase 6  完整驗證與文件 checkpoint             本節所在文件提交
```

## 80.1 V1 Definition of Done 對帳

### 疊盤

- [x] 可以 ON / OFF
- [x] 九宮可同時查看年月日時刻
- [x] 層級列可切主顯示層，state 仍獨立保存 `overlayPrimaryLevel`
- [x] 可選宮並有明確高亮
- [x] 點宮可看完整疊盤與 deterministic 日時／時刻摘要
- [x] Overlay OFF 繼續使用原 `NinePalaceGrid`

### 尋星 A

- [x] UTC+8 日期範圍、宮位、日／時／刻、單星
- [x] `SearchEngine` 只枚舉候選時間並呼叫現有 `computeFullChart()`
- [x] 結果按日期與時間 ascending 分組
- [x] 日顯示年月日；時顯示年月日時；刻顯示年月日時刻
- [x] 點結果跳到正式盤面、開啟疊盤並高亮命中宮
- [x] 明確測試「宮內飛星」不等於入中星或洛書數

### 尋星 B

- [x] 可設定多個 layer
- [x] 每 layer 可選多星
- [x] 同層 OR、跨層 AND
- [x] 結果逐層顯示命中及組合摘要
- [x] Search A regression tests 通過
- [x] 沒有 arbitrary Boolean、NOT、吉凶評分或 Ranking

### 基礎與 UX

- [x] 沒有修改 `src/engine/**`、`src/data/**` 或 engine snapshot fixture
- [x] 19 個 test files、131 tests 通過
- [x] TypeScript、production、PWA 及單檔 build 通過
- [x] 320px／390px production 實測無 horizontal overflow，主要 controls ≥ 44px
- [x] 空結果、loading、結果總數、長範圍／大量結果提示、一年上限及每批 200 筆顯示完成

## 80.2 仍然 Reserved／Deferred

以下內容沒有在本輪實作：

```text
D 最佳時窗 Ranking
吉凶評分與推薦
任意 Boolean Builder / NOT / 括號
節氣前後排除等 Future filters
任一宮／多宮／方向群搜尋
入中星搜尋
Search query URL serialization
recent search
```

`RankingEngine` 未來只能消費 deterministic `SearchMatch[]`；不得重算飛星，也不得把 score／權重反向塞進 `SearchEngine.match()`。
