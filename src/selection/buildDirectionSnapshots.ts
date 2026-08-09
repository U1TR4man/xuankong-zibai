import type { FullChart } from '../engine/flyingStar';
import { PALACES } from '../engine/flyingStar/types';
import { asStarNumber } from '../overlay/types';
import type { DirectionCode, DirectionPalaceKey, DirectionSnapshot } from './types';

const DIRECTION_CODE: Record<DirectionPalaceKey, DirectionCode> = {
  qian: 'NW', dui: 'W', gen: 'NE', li: 'S', kan: 'N', kun: 'SW', zhen: 'E', xun: 'SE',
};

export function buildDirectionSnapshots(chart: FullChart): DirectionSnapshot[] {
  return PALACES.filter((palace): palace is typeof palace & { key: DirectionPalaceKey } => (
    palace.key !== 'center'
  )).map((palace) => ({
    direction: DIRECTION_CODE[palace.key],
    palace: palace.key,
    palaceNumber: palace.luoshu,
    name: palace.name.replace(/宮$/, ''),
    bearing: palace.bearing,
    row: palace.row,
    col: palace.col,
    yearStar: asStarNumber(chart.year.palaceStars[palace.key]),
    monthStar: asStarNumber(chart.month.palaceStars[palace.key]),
    dayStar: asStarNumber(chart.day.palaceStars[palace.key]),
    hourStar: asStarNumber(chart.hour.palaceStars[palace.key]),
    monthCenterStar: asStarNumber(chart.month.centerStar),
  }));
}
