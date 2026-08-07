/** fallback 演算法精度驗證：與 1900–2100 精確表比對 */
import { describe, expect, it } from 'vitest';
import { getSolarTerms } from '../src/engine/time/solarTerms';
import { dateToJdUt, jdUtToDate, solveTermJdUt } from '../src/engine/time/solarTermsAlgo';

describe('solarTermsAlgo fallback', () => {
  it('與精確表相差在 ±1 分鐘內（抽樣 1900–2100）', () => {
    let worst = 0;
    let worstLabel = '';
    for (let y = 1900; y <= 2100; y += 7) {
      for (const t of getSolarTerms(y)) {
        const guess = dateToJdUt(t.date);
        const got = jdUtToDate(solveTermJdUt(t.longitude, guess));
        const diff = Math.abs(got.getTime() - t.date.getTime()) / 60000;
        if (diff > worst) { worst = diff; worstLabel = `${y} ${t.name}`; }
      }
    }
    expect(worst, `worst=${worst.toFixed(2)}min @ ${worstLabel}`).toBeLessThan(1);
  });
});
