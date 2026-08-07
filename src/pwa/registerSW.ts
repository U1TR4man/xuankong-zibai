/// <reference types="vite-plugin-pwa/client" />
/**
 * PWA 註冊（規劃書 §29–30）。
 * 首次載入後，年月日時刻計算、節氣資料、九宮盤、歷史日期、設定全部離線可用；
 * 排盤不依賴任何 API、網絡時間或 Server。
 *
 * 單檔版（SINGLE_FILE=1）本身就是離線的，不需要 Service Worker。
 */

declare const __SINGLE_FILE__: boolean;

export function registerServiceWorker(): void {
  if (__SINGLE_FILE__) return;
  if (import.meta.env.DEV) return;
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => { /* 不支援 SW 時忽略，App 仍可正常運作 */ });
}
