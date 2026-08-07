/**
 * 疊盤是現有正式盤面的 information layer，不是另一套盤。
 * 本檔只把 computeFullChart() 的五個 StarResult 組成 UI view model，絕不重算飛星。
 */

import type { FullChart } from '../engine/flyingStar';
import { PALACES, type PalaceKey } from '../engine/flyingStar/types';
import {
  asStarNumber, type OverlayResult, type PalaceLayerStars, type PalaceOverlayViewModel,
} from './types';

function shortPalaceName(name: string): string {
  return name.replace(/宮$/, '');
}

function palaceStars(chart: FullChart, key: PalaceKey): PalaceLayerStars {
  return {
    year: asStarNumber(chart.year.palaceStars[key]),
    month: asStarNumber(chart.month.palaceStars[key]),
    day: asStarNumber(chart.day.palaceStars[key]),
    hour: asStarNumber(chart.hour.palaceStars[key]),
    ke: asStarNumber(chart.ke.palaceStars[key]),
  };
}

export function buildPalaceOverlay(chart: FullChart): OverlayResult {
  const palaces: PalaceOverlayViewModel[] = PALACES.map((palace) => ({
    key: palace.key,
    name: shortPalaceName(palace.name),
    bearing: palace.bearing,
    luoshu: palace.luoshu,
    row: palace.row,
    col: palace.col,
    stars: palaceStars(chart, palace.key),
  }));

  return {
    datetime: new Date(chart.datetime.getTime()),
    centerStars: {
      year: asStarNumber(chart.year.centerStar),
      month: asStarNumber(chart.month.centerStar),
      day: asStarNumber(chart.day.centerStar),
      hour: asStarNumber(chart.hour.centerStar),
      ke: asStarNumber(chart.ke.centerStar),
    },
    palaces,
  };
}

export function findPalaceOverlay(
  overlay: OverlayResult,
  key: PalaceKey,
): PalaceOverlayViewModel {
  const palace = overlay.palaces.find((item) => item.key === key);
  if (!palace) throw new RangeError(`找不到宮位：${key}`);
  return palace;
}
