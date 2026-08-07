/**
 * DayStarEngine — 流日紫白（規劃書 §10）。
 *
 * 依節氣精確時刻切成六段，各段甲子日起星與順逆：
 *   冬至→雨水  甲子=一白 順
 *   雨水→穀雨  甲子=七赤 順
 *   穀雨→夏至  甲子=四綠 順
 *   夏至→處暑  甲子=九紫 逆
 *   處暑→霜降  甲子=三碧 逆
 *   霜降→冬至  甲子=六白 逆
 *
 * 段內第 n 日（甲子為 0）：入中星 = 甲子起星 ± n。
 * 節氣判斷一律用時間點，不可只比日期。
 */

import { getDayStarSegment } from '../time/solarTerms';
import { getGanzhiDay, civilDayStart, type DayChangeMode, DEFAULT_DAY_CHANGE_MODE, DAY_CHANGE_LABEL } from '../time/ganzhiDay';
import { flyNineStars, stepStar } from './flyNineStars';
import { starName, DIRECTION_LABEL, type StarResult } from './types';
import { formatUtc8, formatUtc8Date } from '../time/utc8';

export function computeDayStar(d: Date, mode: DayChangeMode = DEFAULT_DAY_CHANGE_MODE): StarResult {
  const seg = getDayStarSegment(d);
  const gz = getGanzhiDay(d, mode);
  const centerStar = stepStar(seg.jiaziStar, seg.direction, gz.index60);
  return {
    level: 'day',
    centerStar,
    direction: seg.direction,
    palaceStars: flyNineStars(centerStar, seg.direction),
    sourceRule: '三元日紫白六段：冬至一白／雨水七赤／穀雨四綠（順），夏至九紫／處暑三碧／霜降六白（逆）',
    title: `${gz.text}日`,
    subtitle: formatUtc8Date(civilDayStart(d, mode)),
    explain: [
      { label: '節氣段', value: `${seg.label}（${formatUtc8(seg.start)} 起）` },
      { label: '段內起例', value: `甲子日 ${starName(seg.jiaziStar)}，${DIRECTION_LABEL[seg.direction]}` },
      { label: '日柱', value: `${gz.text}（六十甲子第 ${gz.index60 + 1} 位）` },
      { label: '換日規則', value: DAY_CHANGE_LABEL[mode] },
      {
        label: '推算',
        value: `${starName(seg.jiaziStar)} ${seg.direction === 'forward' ? '順' : '逆'}推 ${gz.index60} 位 → ${starName(centerStar)}`,
      },
    ],
  };
}
