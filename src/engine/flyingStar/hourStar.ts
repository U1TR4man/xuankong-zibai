/**
 * HourStarEngine — 流時紫白（規劃書 §13–14）。
 *
 * 兩個判斷維度：
 *   1. 陰陽遁：冬至→夏至 為陽遁（順）；夏至→冬至 為陰遁（逆）。
 *   2. 日支三分：孟（寅申巳亥）／仲（子午卯酉）／季（辰戌丑未）。
 *
 * 子時起星：
 *   陽遁 孟=七赤 仲=一白 季=四綠，之後順推
 *   陰遁 孟=三碧 仲=九紫 季=六白，之後逆推
 * 第 n 個時辰（子=0）：入中星 = 子時起星 ± n。
 */

import { getYinYangPeriod } from '../time/solarTerms';
import { getChineseHour } from '../time/chineseHour';
import { getGanzhiDay, type DayChangeMode, DEFAULT_DAY_CHANGE_MODE } from '../time/ganzhiDay';
import { branchGroup, BRANCH_GROUP_LABEL, BRANCHES, type BranchGroup } from '../time/ganzhi';
import { flyNineStars, stepStar } from './flyNineStars';
import { starName, DIRECTION_LABEL, type StarResult } from './types';

/** 子時起星表。 */
export const ZISHI_START_STAR: Record<'yang' | 'yin', Record<BranchGroup, number>> = {
  yang: { meng: 7, zhong: 1, ji: 4 },
  yin: { meng: 3, zhong: 9, ji: 6 },
};

export function getHourCenterStar(
  period: 'yang' | 'yin',
  group: BranchGroup,
  hourBranchIndex: number,
): number {
  const base = ZISHI_START_STAR[period][group];
  return stepStar(base, period === 'yang' ? 'forward' : 'reverse', hourBranchIndex);
}

export function computeHourStar(d: Date, mode: DayChangeMode = DEFAULT_DAY_CHANGE_MODE): StarResult {
  const yy = getYinYangPeriod(d);
  const gz = getGanzhiDay(d, mode);
  const group = branchGroup(gz.branchIndex);
  const ch = getChineseHour(d);
  const base = ZISHI_START_STAR[yy.kind][group];
  const centerStar = getHourCenterStar(yy.kind, group, ch.branchIndex);
  return {
    level: 'hour',
    centerStar,
    direction: yy.direction,
    palaceStars: flyNineStars(centerStar, yy.direction),
    sourceRule: '三元時紫白：陽遁孟七赤／仲一白／季四綠順推；陰遁孟三碧／仲九紫／季六白逆推',
    title: ch.name,
    subtitle: ch.rangeLabel,
    explain: [
      { label: '日支', value: `${BRANCHES[gz.branchIndex]!}日 → ${BRANCH_GROUP_LABEL[group]}日` },
      { label: '陰陽遁', value: yy.label },
      { label: '子時起星', value: `${yy.kind === 'yang' ? '陽遁' : '陰遁'}${BRANCH_GROUP_LABEL[group]}日，子時 ${starName(base)}` },
      { label: '時支', value: `${ch.name}（子起第 ${ch.branchIndex} 位）` },
      {
        label: '推算',
        value: `${starName(base)} ${yy.direction === 'forward' ? '順' : '逆'}推 ${ch.branchIndex} 位 → ${starName(centerStar)}`,
      },
      { label: '飛法', value: DIRECTION_LABEL[yy.direction] },
    ],
  };
}
