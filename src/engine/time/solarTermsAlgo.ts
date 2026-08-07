/**
 * 節氣 fallback 演算法（表外年份使用，規劃書 §11 / §31）。
 *
 * 太陽視黃經採截斷 VSOP87D 地球級數（src/data/vsop87Earth.data.ts），
 * 加 FK5 修正、章動 Δψ 與周年光行差，再以二分法求解「視黃經 = k×15°」。
 * ΔT（TT − UT）採 Espenak & Meeus (NASA) 分段多項式。
 *
 * 精度：1900–2100 與本專案精確節氣表比對，最大差 < 1 分鐘
 * （見 tests/solarTermsAlgo.test.ts）。表內年份一律走表，本檔僅在
 * 1900 年前 / 2100 年後生效，SolarTermEngine 會標記 source='algorithm'。
 */

import { VSOP87_B, VSOP87_L, VSOP87_R } from '../../data/vsop87Earth.data';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const J2000 = 2451545.0;
const ARCSEC = 1 / 3600;

/** UTC 時間點 → Julian Day（UT 尺度，含小數） */
export function dateToJdUt(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

export function jdUtToDate(jd: number): Date {
  return new Date(Math.round((jd - 2440587.5) * 86400000));
}

/** ΔT = TT − UT（秒）。Espenak & Meeus (NASA) 分段多項式。 */
export function deltaTSeconds(year: number, month = 6): number {
  const y = year + (month - 0.5) / 12;
  if (y < -500) { const u = (y - 1820) / 100; return -20 + 32 * u * u; }
  if (y < 500) { const u = y / 100;
    return 10583.6 - 1014.41 * u + 33.78311 * u ** 2 - 5.952053 * u ** 3
      - 0.1798452 * u ** 4 + 0.022174192 * u ** 5 + 0.0090316521 * u ** 6; }
  if (y < 1600) { const u = (y - 1000) / 100;
    return 1574.2 - 556.01 * u + 71.23472 * u ** 2 + 0.319781 * u ** 3
      - 0.8503463 * u ** 4 - 0.005050998 * u ** 5 + 0.0083572073 * u ** 6; }
  if (y < 1700) { const u = y - 1600;
    return 120 - 0.9808 * u - 0.01532 * u ** 2 + (u ** 3) / 7129; }
  if (y < 1800) { const u = y - 1700;
    return 8.83 + 0.1603 * u - 0.0059285 * u ** 2 + 0.00013336 * u ** 3 - (u ** 4) / 1174000; }
  if (y < 1860) { const u = y - 1800;
    return 13.72 - 0.332447 * u + 0.0068612 * u ** 2 + 0.0041116 * u ** 3 - 0.00037436 * u ** 4
      + 0.0000121272 * u ** 5 - 0.0000001699 * u ** 6 + 0.000000000875 * u ** 7; }
  if (y < 1900) { const u = y - 1860;
    return 7.62 + 0.5737 * u - 0.251754 * u ** 2 + 0.01680668 * u ** 3
      - 0.0004473624 * u ** 4 + (u ** 5) / 233174; }
  if (y < 1920) { const u = y - 1900;
    return -2.79 + 1.494119 * u - 0.0598939 * u ** 2 + 0.0061966 * u ** 3 - 0.000197 * u ** 4; }
  if (y < 1941) { const u = y - 1920;
    return 21.20 + 0.84493 * u - 0.076100 * u ** 2 + 0.0020936 * u ** 3; }
  if (y < 1961) { const u = y - 1950;
    return 29.07 + 0.407 * u - (u ** 2) / 233 + (u ** 3) / 2547; }
  if (y < 1986) { const u = y - 1975;
    return 45.45 + 1.067 * u - (u ** 2) / 260 - (u ** 3) / 718; }
  if (y < 2005) { const u = y - 2000;
    return 63.86 + 0.3345 * u - 0.060374 * u ** 2 + 0.0017275 * u ** 3
      + 0.000651814 * u ** 4 + 0.00002373599 * u ** 5; }
  if (y < 2050) { const u = y - 2000; return 62.92 + 0.32217 * u + 0.005589 * u ** 2; }
  if (y < 2150) return -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

function vsopSum(series: readonly (readonly (readonly [number, number, number])[])[], tau: number): number {
  let total = 0;
  let p = 1;
  for (const terms of series) {
    let s = 0;
    for (const [a, b, c] of terms) s += a * Math.cos(b + c * tau);
    total += s * p;
    p *= tau;
  }
  return total / 1e8;
}

/** 地球日心黃經 L（度）、黃緯 B（度）、日地距 R（AU），VSOP87D。 */
export function earthHeliocentric(jde: number): { L: number; B: number; R: number } {
  const tau = (jde - J2000) / 365250;
  return {
    L: (((vsopSum(VSOP87_L, tau) * DEG) % 360) + 360) % 360,
    B: vsopSum(VSOP87_B, tau) * DEG,
    R: vsopSum(VSOP87_R, tau),
  };
}

/** 章動黃經 Δψ（度）。Meeus 簡式，精度約 0.5"。 */
export function nutationInLongitude(T: number): number {
  const omega = (125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T ** 3) / 450000) * RAD;
  const Ls = (280.4665 + 36000.7698 * T) * RAD;
  const Lm = (218.3165 + 481267.8813 * T) * RAD;
  return (
    -17.20 * Math.sin(omega) -
    1.32 * Math.sin(2 * Ls) -
    0.23 * Math.sin(2 * Lm) +
    0.21 * Math.sin(2 * omega)
  ) * ARCSEC;
}

/**
 * 太陽視黃經（度，0–360）。
 * @param jde TT 尺度的 Julian Day
 */
export function apparentSolarLongitude(jde: number): number {
  const T = (jde - J2000) / 36525;
  const { L, B, R } = earthHeliocentric(jde);
  // 幾何日心 → 幾何地心
  let theta = L + 180;
  const beta = -B;
  // VSOP87 動力學黃道 → FK5
  const lp = (theta - 1.397 * T - 0.00031 * T * T) * RAD;
  theta += -0.09033 * ARCSEC + 0.03916 * ARCSEC * (Math.cos(lp) + Math.sin(lp)) * Math.tan(beta * RAD);
  // 章動 + 周年光行差
  const apparent = theta + nutationInLongitude(T) - (20.4898 * ARCSEC) / R;
  return ((apparent % 360) + 360) % 360;
}

/**
 * 求指定黃經（度）的節氣時刻。
 * @param targetDeg 目標黃經 0/15/30 …
 * @param guessJdUt 起始猜測（UT Julian Day），需在真值 ±10 天內
 * @returns UT Julian Day
 */
export function solveTermJdUt(targetDeg: number, guessJdUt: number): number {
  const year = 2000 + (guessJdUt - J2000) / 365.25;
  const dt = deltaTSeconds(Math.round(year)) / 86400;
  const f = (jdUt: number) => {
    const diff = apparentSolarLongitude(jdUt + dt) - targetDeg;
    return (((diff + 180) % 360) + 360) % 360 - 180;
  };
  let a = guessJdUt - 10;
  let b = guessJdUt + 10;
  if (f(a) > 0) a -= 10;
  for (let i = 0; i < 60 && b - a > 1e-7; i++) {
    const m = (a + b) / 2;
    if (f(m) >= 0) b = m;
    else a = m;
  }
  return (a + b) / 2;
}
