/**
 * 唯一的時間來源層。
 *
 * 全 App 的「現在」與所有曆法判斷一律使用 UTC+8（東八區固定偏移，無夏令時）。
 * 內部一律以 JS `Date`（真正的時間點 / epoch 毫秒）傳遞；
 * 只有在需要「年月日時分」這種民用欄位時，才透過本檔案轉換成 UTC+8 欄位。
 *
 * 嚴禁在任何其他檔案使用 date.getFullYear() / getDate() / getHours()，
 * 因為那些會跟隨裝置時區。
 */

export const UTC8_OFFSET_MS = 8 * 60 * 60 * 1000;
export const MS_PER_DAY = 86_400_000;

export interface Utc8Parts {
  year: number;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
  /** 0–23 */
  hour: number;
  minute: number;
  second: number;
}

/** 測試用：可覆寫「現在」。生產環境維持 null。 */
let nowOverride: Date | null = null;
export function __setNowForTesting(d: Date | null): void {
  nowOverride = d;
}

/** 全 App 唯一的「現在」來源。 */
export function nowUtc8(): Date {
  return nowOverride ? new Date(nowOverride.getTime()) : new Date();
}

/** 將時間點拆成 UTC+8 民用欄位。 */
export function toUtc8Parts(d: Date): Utc8Parts {
  const s = new Date(d.getTime() + UTC8_OFFSET_MS);
  return {
    year: s.getUTCFullYear(),
    month: s.getUTCMonth() + 1,
    day: s.getUTCDate(),
    hour: s.getUTCHours(),
    minute: s.getUTCMinutes(),
    second: s.getUTCSeconds(),
  };
}

/** 由 UTC+8 民用欄位組回時間點。允許溢位值（如 month=13）自動進位。 */
export function fromUtc8(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - UTC8_OFFSET_MS);
}

/** 由 UTC+8 欄位物件組回時間點。 */
export function fromUtc8Parts(p: Utc8Parts): Date {
  return fromUtc8(p.year, p.month, p.day, p.hour, p.minute, p.second);
}

/** 解析 "2026-08-07T11:38" / "2026-08-07 11:38:00" 為 UTC+8 時間點。 */
export function parseUtc8(text: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(text.trim());
  if (!m) return null;
  return fromUtc8(+m[1]!, +m[2]!, +m[3]!, +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export function formatUtc8Date(d: Date): string {
  const p = toUtc8Parts(d);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function formatUtc8Time(d: Date, withSeconds = false): string {
  const p = toUtc8Parts(d);
  return withSeconds
    ? `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`
    : `${pad(p.hour)}:${pad(p.minute)}`;
}

export function formatUtc8(d: Date, withSeconds = false): string {
  return `${formatUtc8Date(d)} ${formatUtc8Time(d, withSeconds)}`;
}

/** UTC+8 當日 00:00:00 的時間點。 */
export function startOfUtc8Day(d: Date): Date {
  const p = toUtc8Parts(d);
  return fromUtc8(p.year, p.month, p.day, 0, 0, 0);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

export function addMinutes(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 60_000);
}

/**
 * UTC+8 民用日的 Julian Day Number（正午制整數）。
 * 供干支日換算使用；與時分秒無關。
 */
export function utc8JulianDayNumber(d: Date): number {
  const { year, month, day } = toUtc8Parts(d);
  return gregorianToJdn(year, month, day);
}

/** 標準 Gregorian → JDN（正午制）演算法（Fliegel & Van Flandern）。 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}
