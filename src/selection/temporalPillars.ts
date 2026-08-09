import { getYearGanzhi, resolveSolarYear, type YearBoundary } from '../engine/flyingStar/yearStar';
import { getChineseHour } from '../engine/time/chineseHour';
import { ganzhiFromIndex60, type Ganzhi } from '../engine/time/ganzhi';
import { getGanzhiDay, type DayChangeMode } from '../engine/time/ganzhiDay';
import { getSolarMonthByJieqi } from '../engine/time/solarTerms';

export interface TemporalPillars {
  year: Ganzhi;
  month: Ganzhi;
  day: Ganzhi;
  hour: Ganzhi;
}

export interface TemporalPillarOptions {
  dayChangeMode?: DayChangeMode;
  yearBoundary?: YearBoundary;
}

function ganzhiFromStemBranch(stemIndex: number, branchIndex: number): Ganzhi {
  for (let index60 = 0; index60 < 60; index60 += 1) {
    if (index60 % 10 === stemIndex && index60 % 12 === branchIndex) {
      return ganzhiFromIndex60(index60);
    }
  }
  throw new RangeError(`invalid Ganzhi pair: stem ${stemIndex}, branch ${branchIndex}`);
}

/**
 * 擇吉時間層唯一的年月日時四柱來源。
 * 年、月、日、時的 boundary 全部沿用既有正式 engine，不在 UI 重算。
 */
export function buildTemporalPillars(
  date: Date,
  options: TemporalPillarOptions = {},
): TemporalPillars {
  const year = getYearGanzhi(resolveSolarYear(date, options.yearBoundary ?? 'lichun'));
  const solarMonth = getSolarMonthByJieqi(date);
  const day = getGanzhiDay(date, options.dayChangeMode ?? 'midnight');
  const hourBranchIndex = getChineseHour(date).branchIndex;

  // 五虎遁：甲己年丙寅起；其後每個月建順推一干。
  const yinMonthStemIndex = ((year.stemIndex % 5) * 2 + 2) % 10;
  const monthOffset = (solarMonth.branchIndex - 2 + 12) % 12;
  const monthStemIndex = (yinMonthStemIndex + monthOffset) % 10;

  // 五鼠遁：甲己日甲子起；其後每個時支順推一干。
  const ziHourStemIndex = (day.stemIndex % 5) * 2;
  const hourStemIndex = (ziHourStemIndex + hourBranchIndex) % 10;

  return {
    year,
    month: ganzhiFromStemBranch(monthStemIndex, solarMonth.branchIndex),
    day,
    hour: ganzhiFromStemBranch(hourStemIndex, hourBranchIndex),
  };
}
