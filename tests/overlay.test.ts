import { describe, expect, it } from 'vitest';
import { computeFullChart } from '../src/engine/flyingStar';
import { PALACES } from '../src/engine/flyingStar/types';
import { fromUtc8 } from '../src/engine/time/utc8';
import { buildPalaceOverlay, findPalaceOverlay } from '../src/overlay/buildPalaceOverlay';
import { asStarNumber, overlayLevelsThrough } from '../src/overlay/types';

const AT = fromUtc8(2026, 8, 7, 11, 38);

describe('Phase 1 疊盤資料模型', () => {
  const chart = computeFullChart(AT);
  const overlay = buildPalaceOverlay(chart);

  it('只組裝正式 Engine 的年月日時刻結果', () => {
    expect(overlay.datetime.getTime()).toBe(AT.getTime());
    expect(overlay.centerStars).toEqual({
      year: chart.year.centerStar,
      month: chart.month.centerStar,
      day: chart.day.centerStar,
      hour: chart.hour.centerStar,
      ke: chart.ke.centerStar,
    });
  });

  it('保留固定九宮 key、短名、方位與洛書 metadata', () => {
    expect(overlay.palaces).toHaveLength(9);
    expect(overlay.palaces.map((palace) => palace.key)).toEqual(PALACES.map((palace) => palace.key));
    expect(findPalaceOverlay(overlay, 'li')).toMatchObject({
      key: 'li', name: '離', bearing: '南', luoshu: 9,
    });
  });

  it('每宮五層值逐一等於同一 FullChart', () => {
    for (const palace of overlay.palaces) {
      expect(palace.stars).toEqual({
        year: chart.year.palaceStars[palace.key],
        month: chart.month.palaceStars[palace.key],
        day: chart.day.palaceStars[palace.key],
        hour: chart.hour.palaceStars[palace.key],
        ke: chart.ke.palaceStars[palace.key],
      });
    }
  });

  it('上層顯示規則固定為日 3 層、時 4 層、刻 5 層', () => {
    expect(overlayLevelsThrough('day')).toEqual(['year', 'month', 'day']);
    expect(overlayLevelsThrough('hour')).toEqual(['year', 'month', 'day', 'hour']);
    expect(overlayLevelsThrough('ke')).toEqual(['year', 'month', 'day', 'hour', 'ke']);
  });

  it('拒絕 1–9 以外的飛星值', () => {
    expect(asStarNumber(9)).toBe(9);
    expect(() => asStarNumber(0)).toThrow(RangeError);
    expect(() => asStarNumber(10)).toThrow(RangeError);
  });
});
